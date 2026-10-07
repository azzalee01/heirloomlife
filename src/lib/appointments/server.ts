// Data access layer for guided appointments. Server-only: imports the service-role client. Never import
// this from a client component. Every server action re-authorizes through authorizeViewer / requireHost.

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { ensureAppointmentRoom } from '@/src/lib/daily'
import { generateSlots, type AvailabilityOverride, type AvailabilityRule, type Slot } from './slots'
import { parseAccessToken, verifyAccessSignature } from './links'
import {
  APPOINTMENT_TZ,
  BOOKING_HORIZON_DAYS,
  JOIN_CLOSES_MINUTES_AFTER_END,
  JOIN_OPENS_MINUTES_BEFORE,
  MIN_NOTICE_HOURS,
} from './constants'
import type { AppointmentView, EventType, ViewerAccess } from './types'

export interface AppointmentRow {
  id: string
  host_id: string
  user_id: string | null
  will_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  booked_by_name: string | null
  booked_by_email: string | null
  starts_at: string
  ends_at: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  token_version: number
  daily_room_name: string | null
  daily_room_url: string | null
  recording_consent_at: string | null
  recording_consent_version: string | null
  reminder_24h_sent_at: string | null
  reminder_1h_sent_at: string | null
  started_at: string | null
  ended_at: string | null
  escalated: boolean
  host_notes: string | null
  witnessing_status: string
  witness_1_id: string | null
  witness_2_id: string | null
  testator_signed_confirmed_at: string | null
  testator_upload_path: string | null
  executed_will_path: string | null
}

const NOT_FOUND = 'Appointment not found'
const minutes = (n: number) => n * 60_000

// ─── Host identity ──────────────────────────────────────────────────────────
// Hosts are Supabase auth user ids in APPOINTMENT_HOST_USER_IDS (comma-separated; the first is the default host
// that bookings are made against). Deliberately NOT profiles.email: signed-in users can write that column, so
// matching on it would let anyone impersonate or break the host lookup. (profiles also has no role column in
// either Supabase project, so the existing requireStaffAuth() cannot be reused.)

export function hostUserIds(): string[] {
  return (process.env.APPOINTMENT_HOST_USER_IDS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function getHostUser(): Promise<{ id: string; email: string } | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !hostUserIds().includes(user.id.toLowerCase())) return null
  return { id: user.id, email: user.email ?? '' }
}

export async function requireHost(): Promise<{ id: string; email: string }> {
  const host = await getHostUser()
  if (!host) throw new Error('Forbidden')
  return host
}

export function getDefaultHostId(): string {
  const id = hostUserIds()[0]
  if (!id) throw new Error('APPOINTMENT_HOST_USER_IDS is not configured')
  return id
}

// ─── Authorization ──────────────────────────────────────────────────────────

export async function loadAppointment(id: string): Promise<AppointmentRow | null> {
  const { data } = await supabaseAdmin.from('appointments').select('*').eq('id', id).maybeSingle()
  return (data as AppointmentRow | null) ?? null
}

// Resolves who may act on an appointment: either a signed link, or the signed-in owner. Every failure
// returns the same generic error so existence of an appointment is never revealed.
export async function authorizeViewer(access: ViewerAccess): Promise<AppointmentRow> {
  if ('token' in access) {
    const parsed = parseAccessToken(access.token)
    if (!parsed) throw new Error(NOT_FOUND)
    const appt = await loadAppointment(parsed.appointmentId)
    if (!appt || !verifyAccessSignature(appt.id, appt.token_version, parsed.signature)) throw new Error(NOT_FOUND)
    return appt
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error(NOT_FOUND)
  const appt = await loadAppointment(access.appointmentId)
  if (!appt) throw new Error(NOT_FOUND)
  const ownsIt = appt.user_id === user.id
  // Email match only counts when the email is confirmed, so an unconfirmed signup cannot claim someone else's booking.
  const emailMatch = Boolean(user.email_confirmed_at && user.email && user.email.toLowerCase() === appt.customer_email.toLowerCase())
  if (!ownsIt && !emailMatch) throw new Error(NOT_FOUND)
  return appt
}

export function joinWindow(appt: Pick<AppointmentRow, 'starts_at' | 'ends_at'>): { opensAt: Date; closesAt: Date } {
  return {
    opensAt: new Date(new Date(appt.starts_at).getTime() - minutes(JOIN_OPENS_MINUTES_BEFORE)),
    closesAt: new Date(new Date(appt.ends_at).getTime() + minutes(JOIN_CLOSES_MINUTES_AFTER_END)),
  }
}

export function toView(appt: AppointmentRow): AppointmentView {
  const w = joinWindow(appt)
  return {
    id: appt.id,
    startsAt: appt.starts_at,
    endsAt: appt.ends_at,
    status: appt.status,
    customerName: appt.customer_name,
    consentGiven: Boolean(appt.recording_consent_at),
    joinOpensAt: w.opensAt.toISOString(),
    joinClosesAt: w.closesAt.toISOString(),
    serverNow: new Date().toISOString(),
  }
}

// ─── Audit trail ────────────────────────────────────────────────────────────

// Returns whether the row was written. Callers that must fail closed (consent, recording access) check it.
export async function logEvent(
  appointmentId: string,
  eventType: EventType,
  actor: 'customer' | 'host' | 'system',
  extra: { offsetSeconds?: number | null; metadata?: Record<string, unknown> } = {}
): Promise<boolean> {
  const { error } = await supabaseAdmin.from('appointment_events').insert({
    appointment_id: appointmentId,
    event_type: eventType,
    actor,
    offset_seconds: extra.offsetSeconds ?? null,
    metadata: extra.metadata ?? {},
  })
  if (error) console.error(`appointment_events insert failed (${eventType}, ${appointmentId}):`, error.message)
  return !error
}

// ─── Slots ──────────────────────────────────────────────────────────────────

export async function getOpenSlotsInternal(now = new Date()): Promise<Slot[]> {
  const hostId = getDefaultHostId()
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10)

  const [{ data: rules }, { data: overrides }, { data: busy }] = await Promise.all([
    supabaseAdmin
      .from('staff_availability_rules')
      .select('weekday, start_time, end_time, slot_minutes, timezone')
      .eq('host_id', hostId)
      .eq('active', true),
    supabaseAdmin
      .from('staff_availability_overrides')
      .select('override_date, is_blocked, start_time, end_time')
      .eq('host_id', hostId)
      .gte('override_date', yesterday),
    supabaseAdmin
      .from('appointments')
      .select('starts_at, ends_at')
      .eq('host_id', hostId)
      .in('status', ['scheduled', 'in_progress'])
      .gt('ends_at', now.toISOString()),
  ])

  return generateSlots({
    rules: (rules ?? []) as AvailabilityRule[],
    overrides: (overrides ?? []) as AvailabilityOverride[],
    busy: (busy ?? []) as { starts_at: string; ends_at: string }[],
    now,
    days: BOOKING_HORIZON_DAYS,
    minNoticeHours: MIN_NOTICE_HOURS,
    timeZone: APPOINTMENT_TZ,
  })
}

// ─── Daily room ─────────────────────────────────────────────────────────────

export async function ensureRoomFor(appt: AppointmentRow): Promise<{ name: string; url: string }> {
  if (appt.daily_room_name && appt.daily_room_url) return { name: appt.daily_room_name, url: appt.daily_room_url }
  const room = await ensureAppointmentRoom(appt.id, appt.starts_at, appt.ends_at, appt.token_version)
  await supabaseAdmin
    .from('appointments')
    .update({ daily_room_name: room.name, daily_room_url: room.url })
    .eq('id', appt.id)
  return room
}

// ─── Listings ───────────────────────────────────────────────────────────────

export interface ListedAppointment {
  id: string
  starts_at: string
  ends_at: string
  status: string
  customer_name: string
}

// Bookings made while signed in, plus guest bookings made with this account's CONFIRMED email. Two separate
// queries (not an .or() string) so an unusual address can never alter the filter.
export async function listAppointmentsForUser(user: { id: string; email?: string | null; email_confirmed_at?: string | null }) {
  const cols = 'id, starts_at, ends_at, status, customer_name'
  const queries = [supabaseAdmin.from('appointments').select(cols).eq('user_id', user.id)]
  if (user.email && user.email_confirmed_at) {
    queries.push(supabaseAdmin.from('appointments').select(cols).eq('customer_email', user.email.toLowerCase()))
  }
  const results = await Promise.all(queries)
  const byId = new Map<string, ListedAppointment>()
  for (const r of results) for (const row of (r.data ?? []) as ListedAppointment[]) byId.set(row.id, row)
  const all = [...byId.values()].sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  const cutoff = Date.now() - JOIN_CLOSES_MINUTES_AFTER_END * 60_000
  const isLive = (r: ListedAppointment) =>
    (r.status === 'scheduled' || r.status === 'in_progress') && new Date(r.ends_at).getTime() > cutoff
  return { upcoming: all.filter(isLive), past: all.filter((r) => !isLive(r)).reverse() }
}

export interface HostListedAppointment {
  id: string
  customer_name: string
  customer_phone: string | null
  booked_by_name: string | null
  starts_at: string
  status: string
  escalated: boolean
  recording_consent_at: string | null
}

export async function listHostAppointments(hostId: string): Promise<HostListedAppointment[]> {
  const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, customer_name, customer_phone, booked_by_name, starts_at, status, escalated, recording_consent_at')
    .eq('host_id', hostId)
    .gte('starts_at', new Date(Date.now() - 14 * 86_400_000).toISOString())
    .order('starts_at', { ascending: true })
    .limit(200)
  return (data ?? []) as HostListedAppointment[]
}
