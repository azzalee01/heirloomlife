'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { createAppointmentToken } from '@/src/lib/daily'
import { sendAppointmentConfirmationEmail } from '@/src/lib/email'
import { assertLinkSecret, buildAccessToken, joinUrl } from '@/src/lib/appointments/links'
import {
  authorizeViewer,
  ensureRoomFor,
  getDefaultHostId,
  getOpenSlotsInternal,
  joinWindow,
  logEvent,
  toView,
} from '@/src/lib/appointments/server'
import { MAX_ACTIVE_BOOKINGS_PER_EMAIL, RECORDING_CONSENT_VERSION } from '@/src/lib/appointments/constants'
import type { Slot } from '@/src/lib/appointments/slots'
import type { ActionResult, AppointmentView, ViewerAccess } from '@/src/lib/appointments/types'

// These actions are reachable by direct POST, so each one re-checks authorization itself and returns
// plain result objects (thrown messages are redacted in production builds).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[0-9+()\-\s]{6,20}$/

export async function getOpenSlots(): Promise<Slot[]> {
  try {
    return await getOpenSlotsInternal()
  } catch (err) {
    console.error('getOpenSlots failed:', err)
    return []
  }
}

export interface BookingInput {
  startsAt: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  bookedByName?: string
  bookedByEmail?: string
  website?: string // honeypot: real users never fill this
  turnstileToken?: string
}

export async function bookAppointment(input: BookingInput): Promise<ActionResult<{ emailed: boolean }>> {
  try {
    return await bookAppointmentInner(input)
  } catch (err) {
    console.error('bookAppointment failed:', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

// Runtime shape is untrusted (direct POSTs): coerce, don't assume.
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max + 1) : '')

async function bookAppointmentInner(input: BookingInput): Promise<ActionResult<{ emailed: boolean }>> {
  // Honeypot: pretend success so bots learn nothing.
  if (typeof input?.website === 'string' && input.website.trim()) return { ok: true, emailed: true }

  // Turnstile verification (only when TURNSTILE_SECRET_KEY is configured).
  const tsSecret = process.env.TURNSTILE_SECRET_KEY
  if (tsSecret) {
    const tsToken = typeof input?.turnstileToken === 'string' ? input.turnstileToken : ''
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: tsSecret, response: tsToken }).toString(),
    })
    const result = (await verification.json()) as { success: boolean }
    if (!result.success) return { ok: false, error: 'Please complete the security check and try again.' }
  }

  const name = str(input?.customerName, 120)
  const email = str(input?.customerEmail, 200).toLowerCase()
  const phone = str(input?.customerPhone, 20) || null
  const bookedByName = str(input?.bookedByName, 120) || null
  let bookedByEmail: string | null = str(input?.bookedByEmail, 200).toLowerCase() || null
  const startMs = typeof input?.startsAt === 'string' ? Date.parse(input.startsAt) : NaN

  if (name.length < 2 || name.length > 120) return { ok: false, error: 'Please enter your full name.' }
  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, error: 'Please enter a valid email address.' }
  if (phone && !PHONE_RE.test(phone)) return { ok: false, error: 'Please check your phone number.' }
  if (bookedByName && bookedByName.length > 120) return { ok: false, error: 'Please check the details of the person booking for you.' }
  if (bookedByEmail && (!EMAIL_RE.test(bookedByEmail) || bookedByEmail.length > 200)) {
    return { ok: false, error: 'Please check the email address of the person booking for you.' }
  }
  if (!bookedByName) bookedByEmail = null // an address with no named booker is never stored or emailed
  if (Number.isNaN(startMs)) return { ok: false, error: 'Please choose a time.' }

  // A missing link secret must fail BEFORE the insert, not after it has taken the slot.
  assertLinkSecret()

  // The slot must still be open right now: recompute server-side, never trust the client's slot list.
  const slots = await getOpenSlotsInternal()
  const slot = slots.find((s) => s.startsAt === new Date(startMs).toISOString())
  if (!slot) return { ok: false, error: 'That time has just been taken. Please choose another.' }

  const { count } = await supabaseAdmin
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', email)
    .eq('status', 'scheduled')
    .gt('starts_at', new Date().toISOString())
  if ((count ?? 0) >= MAX_ACTIVE_BOOKINGS_PER_EMAIL) {
    return { ok: false, error: 'You already have upcoming calls booked with this email. Cancel one to book another.' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: row, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      host_id: getDefaultHostId(),
      user_id: user?.id ?? null,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      booked_by_name: bookedByName,
      booked_by_email: bookedByEmail,
      starts_at: slot.startsAt,
      ends_at: slot.endsAt,
    })
    .select('id, token_version')
    .single()

  if (error || !row) {
    // 23P01 = exclusion violation: someone booked the same slot in the meantime.
    if (error?.code === '23P01') return { ok: false, error: 'That time has just been taken. Please choose another.' }
    console.error('bookAppointment insert failed:', error?.message)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  await logEvent(row.id as string, 'booked', 'customer', {
    metadata: { source: 'website', booked_for_someone_else: Boolean(bookedByName) },
  })

  const link = joinUrl(row.id as string, row.token_version as number)
  const base = { appointmentId: row.id as string, startsAt: slot.startsAt, endsAt: slot.endsAt, joinUrl: link }
  // The link goes to the customer's own email when they have one; the booker (family member) always gets a copy.
  // When the customer's address IS the booker's (the customer has no email), the wording is for the booker.
  const customerIsBooker = Boolean(bookedByName && bookedByEmail && bookedByEmail === email)
  const emailed = customerIsBooker
    ? await sendAppointmentConfirmationEmail({ ...base, to: email, name: bookedByName!, forCustomer: name })
    : await sendAppointmentConfirmationEmail({ ...base, to: email, name, bookedBy: bookedByName })
  if (bookedByName && bookedByEmail && bookedByEmail !== email) {
    await sendAppointmentConfirmationEmail({ ...base, to: bookedByEmail, name: bookedByName, forCustomer: name })
  }

  return { ok: true, emailed }
}

// ─── Joining ────────────────────────────────────────────────────────────────

async function guard(access: ViewerAccess) {
  try {
    return { appt: await authorizeViewer(access) }
  } catch {
    return { error: 'We couldn’t find this booking. Please use the link from your email.' }
  }
}

export async function getAppointmentView(access: ViewerAccess): Promise<ActionResult<{ view: AppointmentView }>> {
  const g = await guard(access)
  if ('error' in g) return { ok: false, error: g.error as string }
  return { ok: true, view: toView(g.appt!) }
}

export async function recordConsent(access: ViewerAccess, accepted: boolean): Promise<ActionResult<{ view: AppointmentView }>> {
  const g = await guard(access)
  if ('error' in g) return { ok: false, error: g.error as string }
  const appt = g.appt!
  if (appt.status !== 'scheduled' && appt.status !== 'in_progress') {
    return { ok: false, error: 'This booking is no longer active.' }
  }
  const fail = { ok: false, error: 'Something went wrong. Please try again.' } as const

  if (!accepted) {
    // Declining also withdraws any earlier agreement, so the column and the audit trail never contradict each other.
    const withdrew = Boolean(appt.recording_consent_at)
    // Audit first: if the event can't be written, nothing changes.
    if (!(await logEvent(appt.id, 'consent_declined', 'customer', { metadata: { consent_version: RECORDING_CONSENT_VERSION, withdrew } }))) return fail
    if (withdrew) {
      const { error } = await supabaseAdmin
        .from('appointments')
        .update({ recording_consent_at: null, recording_consent_version: null })
        .eq('id', appt.id)
      if (error) return fail
      appt.recording_consent_at = null
    }
    return { ok: true, view: toView(appt) }
  }

  if (!appt.recording_consent_at) {
    // Audit first, then the state change: consent never exists without its event.
    if (!(await logEvent(appt.id, 'consent_given', 'customer', { metadata: { consent_version: RECORDING_CONSENT_VERSION } }))) return fail
    const now = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ recording_consent_at: now, recording_consent_version: RECORDING_CONSENT_VERSION })
      .eq('id', appt.id)
      .is('recording_consent_at', null)
    if (error) return fail
    appt.recording_consent_at = now
  }
  return { ok: true, view: toView(appt) }
}

export async function getCustomerJoin(access: ViewerAccess): Promise<ActionResult<{ roomUrl: string; token: string }>> {
  const g = await guard(access)
  if ('error' in g) return { ok: false, error: g.error as string }
  const appt = g.appt!

  if (appt.status !== 'scheduled' && appt.status !== 'in_progress') {
    return { ok: false, error: 'This booking is no longer active.' }
  }
  // No token without recorded consent: this is what ties "recording starts" to "customer agreed".
  if (!appt.recording_consent_at) return { ok: false, error: 'Please agree to the recording first.' }

  const { opensAt, closesAt } = joinWindow(appt)
  const now = new Date()
  if (now < opensAt) return { ok: false, error: 'Your call isn’t open yet. You can join from 15 minutes before the start time.' }
  if (now > closesAt) return { ok: false, error: 'This call time has passed. Please book a new time.' }

  let claimedFirstJoin = false
  try {
    const room = await ensureRoomFor(appt)

    // Atomically claim the FIRST join (only one caller can flip started_at from null). Auto-start recording is
    // only ever attached to that first token. A rejoin must never restart recording by itself: the host may have
    // paused it for card entry, and the host console warns if nothing is recording.
    const { data: claimed } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'in_progress', started_at: now.toISOString() })
      .eq('id', appt.id)
      .is('started_at', null)
      .select('id')
    claimedFirstJoin = Boolean(claimed?.length)

    const base = { roomName: room.name, userName: appt.customer_name, isOwner: false, expiresAt: closesAt.toISOString() }
    let token: string
    let autoRecording = false
    if (claimedFirstJoin) {
      try {
        token = await createAppointmentToken({ ...base, startRecording: true })
        autoRecording = true
      } catch (err) {
        // Auto-start recording is a paid Daily feature. Fall back to a plain token; the host console shows a
        // loud banner when no recording is running so the host starts it manually.
        await logEvent(appt.id, 'recording_start_failed', 'system', {
          metadata: { reason: String(err instanceof Error ? err.message : err).slice(0, 200) },
        })
        token = await createAppointmentToken({ ...base, startRecording: false })
      }
    } else {
      token = await createAppointmentToken({ ...base, startRecording: false })
    }

    await logEvent(appt.id, 'joined', 'customer', { metadata: { phase: 'token_issued', first_join: claimedFirstJoin, auto_recording: autoRecording } })
    return { ok: true, roomUrl: room.url, token }
  } catch (err) {
    console.error('getCustomerJoin failed:', err)
    if (claimedFirstJoin) {
      // Nothing was handed out: release the claim so the retry is treated as the first join.
      await supabaseAdmin.from('appointments').update({ status: 'scheduled', started_at: null }).eq('id', appt.id).eq('status', 'in_progress')
    }
    return { ok: false, error: 'We couldn’t open the call. Please try again, or phone us.' }
  }
}

export async function reportLeft(access: ViewerAccess): Promise<void> {
  const g = await guard(access)
  if ('error' in g) return
  const appt = g.appt!
  // Only meaningful for a call that is actually under way; otherwise a link holder could pad the audit trail.
  if (appt.status !== 'in_progress' || !appt.recording_consent_at) return
  await logEvent(appt.id, 'left', 'customer')
}

export async function rescheduleAppointment(
  access: ViewerAccess,
  startsAt: string
): Promise<ActionResult<{ token: string }>> {
  try {
    assertLinkSecret()
    const g = await guard(access)
    if ('error' in g) return { ok: false, error: g.error as string }
    const appt = g.appt!

    if (appt.status !== 'scheduled') return { ok: false, error: "This booking can't be rescheduled." }
    if (new Date() >= new Date(appt.starts_at)) return { ok: false, error: 'This call has already started.' }

    const startMs = Date.parse(startsAt)
    if (Number.isNaN(startMs)) return { ok: false, error: 'Invalid time.' }

    // Re-validate server-side. The customer's current slot is still in the busy list,
    // so rescheduling to the same time correctly returns an error.
    const slots = await getOpenSlotsInternal()
    const slot = slots.find((s) => s.startsAt === new Date(startMs).toISOString())
    if (!slot) return { ok: false, error: 'That time is no longer available. Please choose another.' }

    const newVersion = appt.token_version + 1

    const { error } = await supabaseAdmin
      .from('appointments')
      .update({
        starts_at: slot.startsAt,
        ends_at: slot.endsAt,
        token_version: newVersion,
        // Clear the room so a new one is created with the correct nbf/exp for the new time.
        daily_room_name: null,
        daily_room_url: null,
        // Reset reminders so they fire again for the new time.
        reminder_24h_sent_at: null,
        reminder_1h_sent_at: null,
      })
      .eq('id', appt.id)
      .eq('status', 'scheduled')
      .eq('token_version', appt.token_version) // optimistic lock

    if (error) {
      if (error.code === '23P01') return { ok: false, error: 'That time was just taken. Please choose another.' }
      console.error('rescheduleAppointment update failed:', error.message)
      return { ok: false, error: 'Something went wrong. Please try again.' }
    }

    await logEvent(appt.id, 'rescheduled', 'customer', {
      metadata: { old_starts_at: appt.starts_at, new_starts_at: slot.startsAt },
    })

    const newToken = buildAccessToken(appt.id, newVersion)
    const link = joinUrl(appt.id, newVersion)

    // Best-effort emails — reschedule is committed regardless.
    const base = { appointmentId: appt.id, startsAt: slot.startsAt, endsAt: slot.endsAt, joinUrl: link, rescheduled: true }
    await sendAppointmentConfirmationEmail({ ...base, to: appt.customer_email, name: appt.customer_name, bookedBy: appt.booked_by_name })
    if (appt.booked_by_email && appt.booked_by_email !== appt.customer_email) {
      await sendAppointmentConfirmationEmail({ ...base, to: appt.booked_by_email, name: appt.booked_by_name ?? 'there', forCustomer: appt.customer_name })
    }

    return { ok: true, token: newToken }
  } catch (err) {
    console.error('rescheduleAppointment failed:', err)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function cancelAppointment(access: ViewerAccess): Promise<ActionResult> {
  const g = await guard(access)
  if ('error' in g) return { ok: false, error: g.error as string }
  const appt = g.appt!
  if (appt.status !== 'scheduled') return { ok: false, error: 'This booking can’t be cancelled.' }
  if (new Date() >= new Date(appt.starts_at)) return { ok: false, error: 'This call has already started.' }

  const { error } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', appt.id)
    .eq('status', 'scheduled')
  if (error) return { ok: false, error: 'Something went wrong. Please try again.' }
  await logEvent(appt.id, 'cancelled', 'customer')
  return { ok: true }
}
