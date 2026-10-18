'use server'

import { createHash, randomUUID } from 'crypto'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createWitnessingRoom, createMeetingToken, getRoomRecordings, getRecordingAccessLink } from '@/src/lib/daily'
import { sendWitnessInviteEmail } from '@/src/lib/email'
import { hasWillAccess, hasUsedIncludedSigning } from '@/src/lib/entitlements'
import { verifyDocumentIntegrity } from '@/app/will/new/_versioning'

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

// ─── Version capture ────────────────────────────────────────────────────────

interface VersionCapture {
  versionId: string
  contentHash: string
  documentText: string
}

/**
 * Fetches the latest will_version and the current document text for a will,
 * computes a SHA-256 hash of the document text, and stores an immutable copy
 * in the witnessing-booking-docs bucket.  Called at booking time so the exact
 * document presented to witnesses is locked before the Daily room is created.
 *
 * Throws if no version exists or if document_text has not yet been assembled —
 * both indicate the will is not ready to be witnessed.
 */
async function captureWillVersion(willId: string, sessionId: string): Promise<VersionCapture> {
  const [versionRes, willRes] = await Promise.all([
    supabaseAdmin
      .from('will_versions')
      .select('id')
      .eq('will_id', willId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('wills')
      .select('document_text')
      .eq('id', willId)
      .single(),
  ])

  if (!versionRes.data) {
    throw new Error('Your Will has no saved versions yet. Please complete and save your Will before booking a witnessing session.')
  }
  const documentText = willRes.data?.document_text as string | null
  if (!documentText) {
    throw new Error('Your Will document has not been assembled yet. Please complete your Will before booking a witnessing session.')
  }

  const contentHash = createHash('sha256').update(documentText, 'utf8').digest('hex')

  // Store an immutable snapshot of the document so witnesses and testator
  // sign the exact same text regardless of later edits.
  const { error: uploadError } = await supabaseAdmin.storage
    .from('witnessing-booking-docs')
    .upload(`sessions/${sessionId}/will.txt`, Buffer.from(documentText, 'utf8'), {
      contentType: 'text/plain; charset=utf-8',
      upsert: false,
    })
  if (uploadError) {
    throw new Error(
      `Could not lock the Will document for this signing session. Please try again. (${uploadError.message})`
    )
  }

  return { versionId: versionRes.data.id as string, contentHash, documentText }
}

// ─── Entitlement check ───────────────────────────────────────────────────────

// Server-side rules for booking a remote signing session (creating a room costs money, so the page gate is not enough):
// a paid Will, an NSW address, and only the one session included with the Will. Re-witnessing updates is coming soon.
async function assertMayScheduleSigning(userId: string, willId: string): Promise<void> {
  const [{ data: profile }, { data: testator }, { data: sessions }] = await Promise.all([
    supabaseAdmin.from('profiles').select('plan, plan_status, rewit_credits').eq('id', userId).single(),
    supabaseAdmin.from('testators').select('state').eq('will_id', willId).not('state', 'is', null).limit(1).maybeSingle(),
    supabaseAdmin.from('witnessing_sessions').select('status').eq('will_id', willId),
  ])
  if (!hasWillAccess(profile)) throw new Error('Unlock your Will to book a signing session.')
  if ((testator as { state: string | null } | null)?.state !== 'NSW') {
    throw new Error('Remote witnessing is currently available for NSW addresses only.')
  }
  const statuses = ((sessions ?? []) as { status: string }[]).map((r) => r.status)
  if (hasUsedIncludedSigning(statuses)) {
    const credits = (profile as { rewit_credits?: number } | null)?.rewit_credits ?? 0
    if (credits < 1) {
      throw new Error('Purchase a re-witnessing session to book another video signing.')
    }
    // Decrement the credit atomically before the room is created.
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ rewit_credits: credits - 1 })
      .eq('id', userId)
      .eq('rewit_credits', credits) // optimistic lock
    if (error) throw new Error('Could not claim re-witnessing credit. Please try again.')
  }
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
  await assertMayScheduleSigning(user.id, willId)
  const recordingEnabled = input.recordSession
  const testatorName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Your contact'

  // Capture the will version before creating the Daily room (costs money).
  // Throws if the will has no version or no assembled document text.
  const sessionId = randomUUID()
  const { versionId, contentHash } = await captureWillVersion(willId, sessionId)

  const room = await createWitnessingRoom(input.scheduledAt, recordingEnabled)

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .insert({
      id: sessionId,
      will_id: willId,
      scheduled_at: input.scheduledAt,
      status: 'scheduled',
      provider: 'daily',
      room_url: room.url,
      recording_enabled: recordingEnabled,
      recording_status: recordingEnabled ? 'none' : null,
      will_version_id: versionId,
      content_hash: contentHash,
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

  // Capture the will version before creating the Daily room.
  const sessionId = randomUUID()
  const { versionId, contentHash } = await captureWillVersion(willId, sessionId).catch(async (err) => {
    // Roll back the slot claim before surfacing the error.
    await supabase.from('heirloom_witness_slots').update({ is_booked: false }).eq('id', slotId)
    throw err
  })

  const room = await createWitnessingRoom(slot.scheduled_at as string, recordingEnabled)

  const { data: session, error } = await supabase
    .from('witnessing_sessions')
    .insert({
      id: sessionId,
      will_id: willId,
      scheduled_at: slot.scheduled_at,
      witness_source: 'heirloom_provided',
      status: 'scheduled',
      provider: 'daily',
      room_url: room.url,
      recording_enabled: recordingEnabled,
      recording_status: recordingEnabled ? 'none' : null,
      will_version_id: versionId,
      content_hash: contentHash,
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
    .select('id, room_url, will_id, status, will_version_id, content_hash, version_stale')
    .eq('id', sessionId)
    .eq('will_id', willId)
    .single()
  if (error || !session) throw new Error('Session not found')

  // Sessions booked before version locking shipped cannot be verified.
  if (!session.will_version_id) {
    throw new Error(
      'This session was booked before will-version locking was enabled. Please cancel and rebook to use the current signing flow.'
    )
  }

  // Version comparison is the authoritative integrity check.  Even if the
  // version_stale flag was not set (e.g. the flag update failed), a newer
  // version means the testator edited their Will after booking.
  const { data: latestVersion } = await supabaseAdmin
    .from('will_versions')
    .select('id')
    .eq('will_id', willId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestVersion || latestVersion.id !== session.will_version_id) {
    // Ensure the flag is set for the UI even if _versioning.ts missed it.
    await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .eq('id', sessionId)
    throw new Error(
      'Your Will was updated after this session was booked. Please cancel this session and rebook to sign your current Will.'
    )
  }

  // Belt-and-braces: also block if the flag was set by any other path.
  if (session.version_stale) {
    throw new Error(
      'Your Will was updated after this session was booked. Please cancel this session and rebook to sign your current Will.'
    )
  }

  // Verify the immutable locked document: fetch from Storage and re-hash.
  // A missing or modified document is a fatal integrity failure.
  if (!session.content_hash) {
    throw new Error('This session has no locked document hash. Please contact Heirloom support.')
  }
  const { data: lockedBlob, error: fetchError } = await supabaseAdmin.storage
    .from('witnessing-booking-docs')
    .download(`sessions/${sessionId}/will.txt`)
  if (fetchError || !lockedBlob) {
    throw new Error('The locked Will document for this session could not be retrieved. Please contact Heirloom support.')
  }
  const lockedContent = await lockedBlob.text()
  verifyDocumentIntegrity(lockedContent, session.content_hash as string)

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
    .select('session_id, witnessing_sessions(room_url, will_id, will_version_id, version_stale, content_hash)')
    .eq('access_token', accessToken)
    .single()
  if (error || !attestation) throw new Error('Invite not found')

  const sessionData = attestation.witnessing_sessions as unknown as {
    room_url: string
    will_id: string
    will_version_id: string | null
    version_stale: boolean
    content_hash: string | null
  }

  if (!sessionData.will_version_id) {
    throw new Error('This session was booked before will-version locking was enabled. Please ask the testator to cancel and rebook.')
  }

  // Witnesses must not be able to join a session for a stale will.
  const { data: latestVersion } = await supabaseAdmin
    .from('will_versions')
    .select('id')
    .eq('will_id', sessionData.will_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestVersion || latestVersion.id !== sessionData.will_version_id || sessionData.version_stale) {
    await supabaseAdmin
      .from('witnessing_sessions')
      .update({ version_stale: true })
      .eq('id', attestation.session_id)
    throw new Error('The testator updated their Will after this session was booked. The session must be rebooked before witnesses can join.')
  }

  // Verify the immutable locked document: fetch from Storage and re-hash.
  if (!sessionData.content_hash) {
    throw new Error('This session has no locked document hash. Please contact Heirloom support.')
  }
  const { data: lockedBlob, error: fetchError } = await supabaseAdmin.storage
    .from('witnessing-booking-docs')
    .download(`sessions/${attestation.session_id}/will.txt`)
  if (fetchError || !lockedBlob) {
    throw new Error('The locked Will document for this session could not be retrieved. Please contact Heirloom support.')
  }
  const lockedContent = await lockedBlob.text()
  verifyDocumentIntegrity(lockedContent, sessionData.content_hash)

  const roomName = new URL(sessionData.room_url).pathname.replace('/', '')
  const token = await createMeetingToken(roomName, displayName, false)

  return { roomUrl: sessionData.room_url, token }
}

// ─── Re-witnessing reminders ────────────────────────────────────────────────

export async function setRewitnessingReminder(
  months: 12 | 24 | 36 | null,
): Promise<{ ok: boolean; nextReminderAt: string | null }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const nextReminderAt = months
    ? new Date(Date.now() + months * 30.44 * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ rewit_reminder_months: months, rewit_next_reminder_at: nextReminderAt })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { ok: true, nextReminderAt }
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
