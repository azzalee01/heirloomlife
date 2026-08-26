'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createWitnessingRoom, createMeetingToken, getRoomRecordings, getRecordingAccessLink } from '@/src/lib/daily'
import { sendWitnessInviteEmail } from '@/src/lib/email'

async function getOwnedWill() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const will = willRows?.[0] as { id: string } | undefined
  if (!will) throw new Error('No will found')

  return { supabase, user, willId: will.id }
}

export interface WitnessInput {
  name: string
  email: string
}

// NSW requires a minimum of two witnesses for a will signing (Succession Act
// 2006 (NSW) s 6)  -  enforced here regardless of what the client sends.
const MIN_WITNESSES = 2

export async function scheduleWitnessingSession(input: {
  scheduledAt: string
  witnesses: WitnessInput[]
  recordSession: boolean
}) {
  if (input.witnesses.filter((w) => w.name.trim()).length < MIN_WITNESSES) {
    throw new Error(`NSW requires at least ${MIN_WITNESSES} witnesses for a will signing.`)
  }

  const { supabase, user, willId } = await getOwnedWill()
  const recordingEnabled = input.recordSession
  const testatorName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Your contact'

  const room = await createWitnessingRoom(input.scheduledAt, recordingEnabled)

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .insert({
      will_id: willId,
      scheduled_at: input.scheduledAt,
      status: 'scheduled',
      provider: 'daily',
      room_url: room.url,
      recording_enabled: recordingEnabled,
      recording_status: recordingEnabled ? 'none' : null,
    })
    .select('id')
    .single()
  if (error || !session) throw new Error(error?.message ?? 'Failed to create session')

  if (input.witnesses.length > 0) {
    const { data: insertedWitnesses, error: witnessError } = await supabase
      .from('witness_attestations')
      .insert(
        input.witnesses.map((w) => ({
          session_id: session.id,
          witness_name: w.name,
          witness_email: w.email || null,
          witnessing_method: 'audio_visual_link',
        }))
      )
      .select('witness_name, witness_email, access_token')
    if (witnessError) throw new Error(witnessError.message)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await Promise.all(
      (insertedWitnesses ?? [])
        .filter((w) => w.witness_email)
        .map((w) =>
          sendWitnessInviteEmail({
            to: w.witness_email as string,
            witnessName: w.witness_name as string,
            testatorName,
            inviteUrl: `${appUrl}/witness-invite/${w.access_token}`,
            scheduledAt: input.scheduledAt,
          })
        )
    )
  }

  return { sessionId: session.id as string }
}

// ─── Heirloom-provided witnesses ────────────────────────────────────────────

export interface WitnessSlot {
  id: string
  scheduledAt: string
  witness1Name: string
  witness2Name: string
}

export async function getAvailableWitnessSlots(): Promise<WitnessSlot[]> {
  const { supabase } = await getOwnedWill()
  const { data, error } = await supabase
    .from('heirloom_witness_slots')
    .select('id, scheduled_at, witness_1_name, witness_2_name')
    .eq('is_booked', false)
    .order('scheduled_at', { ascending: true })
  if (error) throw new Error(error.message)

  return (data ?? []).map((s) => ({
    id: s.id as string,
    scheduledAt: s.scheduled_at as string,
    witness1Name: s.witness_1_name as string,
    witness2Name: s.witness_2_name as string,
  }))
}

export async function bookWitnessSlot(slotId: string, recordSession: boolean) {
  const { supabase, willId } = await getOwnedWill()
  const recordingEnabled = recordSession

  // Claim the slot first  -  the unbooked-only WHERE clause makes this atomic,
  // so two testators racing for the same slot can't both win it.
  const { data: slot, error: slotError } = await supabase
    .from('heirloom_witness_slots')
    .update({ is_booked: true })
    .eq('id', slotId)
    .eq('is_booked', false)
    .select('id, scheduled_at, witness_1_name, witness_1_email, witness_2_name, witness_2_email')
    .single()
  if (slotError || !slot) throw new Error('That slot is no longer available  -  please pick another.')

  const room = await createWitnessingRoom(slot.scheduled_at as string, recordingEnabled)

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .insert({
      will_id: willId,
      scheduled_at: slot.scheduled_at,
      witness_source: 'heirloom_provided',
      status: 'scheduled',
      provider: 'daily',
      room_url: room.url,
      recording_enabled: recordingEnabled,
      recording_status: recordingEnabled ? 'none' : null,
    })
    .select('id')
    .single()
  if (error || !session) {
    // Roll back the slot claim if session creation failed.
    await supabase.from('heirloom_witness_slots').update({ is_booked: false }).eq('id', slotId)
    throw new Error(error?.message ?? 'Failed to create session')
  }

  await supabase.from('heirloom_witness_slots').update({ session_id: session.id }).eq('id', slotId)

  await supabase.from('witness_attestations').insert([
    { session_id: session.id, witness_name: slot.witness_1_name, witness_email: slot.witness_1_email, witnessing_method: 'audio_visual_link' },
    { session_id: session.id, witness_name: slot.witness_2_name, witness_email: slot.witness_2_email, witnessing_method: 'audio_visual_link' },
  ])

  return { sessionId: session.id as string }
}

export async function getJoinToken(sessionId: string, displayName: string) {
  const { supabase, willId } = await getOwnedWill()

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .select('id, room_url, will_id, status')
    .eq('id', sessionId)
    .eq('will_id', willId)
    .single()
  if (error || !session) throw new Error('Session not found')

  const roomName = new URL(session.room_url as string).pathname.replace('/', '')
  const token = await createMeetingToken(roomName, displayName, true)

  if (session.status === 'scheduled') {
    await supabase.from('witnessing_sessions').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', sessionId)
  }

  return { roomUrl: session.room_url as string, token }
}

export async function completeSession(sessionId: string) {
  const { supabase, willId } = await getOwnedWill()

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .select('id, room_url, recording_enabled')
    .eq('id', sessionId)
    .eq('will_id', willId)
    .single()
  if (error || !session) throw new Error('Session not found')

  await supabase
    .from('witnessing_sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString(), recording_status: session.recording_enabled ? 'processing' : null })
    .eq('id', sessionId)

  await supabase
    .from('witness_attestations')
    .update({ attested_at: new Date().toISOString() })
    .eq('session_id', sessionId)
}

// ─── Witness invite (no auth  -  accessed via a shareable link) ──────────────

export async function getInviteDetails(accessToken: string) {
  const { data: attestation, error } = await supabaseAdmin
    .from('witness_attestations')
    .select('id, witness_name, session_id, witnessing_sessions(id, scheduled_at, status)')
    .eq('access_token', accessToken)
    .single()
  if (error || !attestation) throw new Error('Invite not found')

  const session = attestation.witnessing_sessions as unknown as {
    id: string
    scheduled_at: string | null
    status: string
  }

  return {
    witnessName: attestation.witness_name as string,
    sessionId: session.id,
    scheduledAt: session.scheduled_at,
    status: session.status,
  }
}

export async function getWitnessJoinToken(accessToken: string, displayName: string) {
  const { data: attestation, error } = await supabaseAdmin
    .from('witness_attestations')
    .select('session_id, witnessing_sessions(room_url)')
    .eq('access_token', accessToken)
    .single()
  if (error || !attestation) throw new Error('Invite not found')

  const roomUrl = (attestation.witnessing_sessions as unknown as { room_url: string }).room_url
  const roomName = new URL(roomUrl).pathname.replace('/', '')
  const token = await createMeetingToken(roomName, displayName, false)

  return { roomUrl, token }
}

export async function refreshRecordingStatus(sessionId: string) {
  const { supabase, willId } = await getOwnedWill()

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .select('id, room_url, recording_enabled, recording_status')
    .eq('id', sessionId)
    .eq('will_id', willId)
    .single()
  if (error || !session || !session.recording_enabled) return { status: session?.recording_status ?? null }

  const roomName = new URL(session.room_url as string).pathname.replace('/', '')
  const recordings = await getRoomRecordings(roomName)
  const latest = recordings[0]
  if (!latest) return { status: session.recording_status }

  if (latest.status === 'finished') {
    const link = await getRecordingAccessLink(latest.id)
    await supabase
      .from('witnessing_sessions')
      .update({ recording_status: 'available', recording_url: link })
      .eq('id', sessionId)
    return { status: 'available', url: link }
  }

  return { status: 'processing' }
}
