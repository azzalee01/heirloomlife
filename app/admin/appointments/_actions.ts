'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createAppointmentToken, getRecordingAccessLink, listAppointmentRecordings } from '@/src/lib/daily'
import { ensureRoomFor, loadAppointment, logEvent, requireHost } from '@/src/lib/appointments/server'
import { HOST_JOIN_CLOSES_MINUTES_AFTER_END, HOST_JOIN_OPENS_MINUTES_BEFORE } from '@/src/lib/appointments/constants'
import type { ActionResult, EventType } from '@/src/lib/appointments/types'

// Host-only. Each action re-verifies the host (page-level checks do not extend to server actions).

async function hostAppointment(id: string) {
  const host = await requireHost()
  const appt = await loadAppointment(id)
  if (!appt) throw new Error('Not found')
  return { host, appt }
}

export async function hostJoin(appointmentId: string): Promise<ActionResult<{ roomUrl: string; token: string; hostName: string }>> {
  try {
    const { host, appt } = await hostAppointment(appointmentId)
    const start = new Date(appt.starts_at).getTime()
    const end = new Date(appt.ends_at).getTime()
    const now = Date.now()
    if (now < start - HOST_JOIN_OPENS_MINUTES_BEFORE * 60_000 || now > end + HOST_JOIN_CLOSES_MINUTES_AFTER_END * 60_000) {
      return { ok: false, error: 'Outside the call window.' }
    }
    if (appt.status === 'cancelled') return { ok: false, error: 'This booking was cancelled.' }
    const room = await ensureRoomFor(appt)
    const hostName = 'Heirloom guide'
    const token = await createAppointmentToken({
      roomName: room.name,
      userName: hostName,
      isOwner: true,
      expiresAt: new Date(end + HOST_JOIN_CLOSES_MINUTES_AFTER_END * 60_000).toISOString(),
    })
    await logEvent(appt.id, 'joined', 'host', { metadata: { host_id: host.id } })
    return { ok: true, roomUrl: room.url, token, hostName }
  } catch (err) {
    console.error('hostJoin failed:', err)
    return { ok: false, error: 'Could not open the call.' }
  }
}

const HOST_EVENTS: readonly EventType[] = [
  'recording_started', 'recording_paused', 'recording_stopped',
  'payment_step_started', 'payment_step_completed',
  'capacity_flag', 'third_party_present', 'escalated', 'left',
]

export async function logHostEvent(
  appointmentId: string,
  eventType: EventType,
  offsetSeconds: number | null,
  metadata: Record<string, unknown> = {}
): Promise<ActionResult> {
  try {
    const { appt } = await hostAppointment(appointmentId)
    if (!HOST_EVENTS.includes(eventType)) return { ok: false, error: 'Unsupported event.' }
    const clean: Record<string, unknown> = { ...metadata }
    if (typeof clean.note === 'string') clean.note = clean.note.slice(0, 1000)
    await logEvent(appt.id, eventType, 'host', { offsetSeconds, metadata: clean })
    if (eventType === 'escalated') {
      await supabaseAdmin.from('appointments').update({ escalated: true }).eq('id', appt.id)
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not record that.' }
  }
}

async function finish(appointmentId: string, status: 'completed' | 'no_show'): Promise<ActionResult> {
  try {
    const { appt } = await hostAppointment(appointmentId)
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ status, ended_at: new Date().toISOString() })
      .eq('id', appt.id)
      .in('status', ['scheduled', 'in_progress'])
    if (error) return { ok: false, error: 'Could not update the booking.' }
    await logEvent(appt.id, status === 'completed' ? 'completed' : 'no_show', 'host')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not update the booking.' }
  }
}

export async function completeAppointment(appointmentId: string) {
  return finish(appointmentId, 'completed')
}
export async function markNoShow(appointmentId: string) {
  return finish(appointmentId, 'no_show')
}

export async function saveHostNotes(appointmentId: string, notes: string): Promise<ActionResult> {
  try {
    const { appt } = await hostAppointment(appointmentId)
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ host_notes: notes.slice(0, 5000) })
      .eq('id', appt.id)
    if (error) return { ok: false, error: 'Could not save notes.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save notes.' }
  }
}

// Syncs Daily's recordings for this room into appointment_recordings (one row per segment, in start order).
export async function refreshRecordings(appointmentId: string): Promise<ActionResult<{ count: number }>> {
  try {
    const { appt } = await hostAppointment(appointmentId)
    if (!appt.daily_room_name) return { ok: true, count: 0 }
    const recs = (await listAppointmentRecordings(appt.daily_room_name)).sort((a, b) => (a.start_ts ?? 0) - (b.start_ts ?? 0))
    for (const [i, r] of recs.entries()) {
      const status = r.status === 'finished' ? 'available' : r.status === 'in-progress' ? 'recording' : r.status === 'failed' ? 'failed' : 'processing'
      await supabaseAdmin.from('appointment_recordings').upsert(
        {
          appointment_id: appt.id,
          segment_index: i,
          provider_recording_id: r.id,
          status,
          started_at: r.start_ts ? new Date(r.start_ts * 1000).toISOString() : new Date().toISOString(),
          duration_seconds: r.duration ?? null,
        },
        { onConflict: 'appointment_id,segment_index' }
      )
    }
    return { ok: true, count: recs.length }
  } catch (err) {
    console.error('refreshRecordings failed:', err)
    return { ok: false, error: 'Could not refresh recordings.' }
  }
}

// Short-lived signed link (Daily caps these; ~1 hour on custom buckets). Every access is logged.
export async function getRecordingLink(recordingRowId: string): Promise<ActionResult<{ url: string }>> {
  try {
    const host = await requireHost()
    const { data: rec } = await supabaseAdmin
      .from('appointment_recordings')
      .select('id, appointment_id, provider_recording_id')
      .eq('id', recordingRowId)
      .maybeSingle()
    if (!rec?.provider_recording_id) return { ok: false, error: 'Recording not found.' }
    const appt = await loadAppointment(rec.appointment_id as string)
    if (!appt || appt.host_id !== host.id) return { ok: false, error: 'Recording not found.' }
    // Fail closed: no audit row, no link.
    if (!(await logEvent(appt.id, 'recording_accessed', 'host', { metadata: { recording_id: rec.id, host_id: host.id } }))) {
      return { ok: false, error: 'Could not record this access, so the recording was not opened.' }
    }
    const url = await getRecordingAccessLink(rec.provider_recording_id as string)
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'Could not get the recording.' }
  }
}
