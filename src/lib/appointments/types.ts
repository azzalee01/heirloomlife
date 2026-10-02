export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

// Client-safe view of an appointment (no host ids, no internal fields).
export interface AppointmentView {
  id: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  customerName: string
  consentGiven: boolean
  joinOpensAt: string
  joinClosesAt: string
  serverNow: string
}

export type ViewerAccess = { token: string } | { appointmentId: string }

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string }

export type EventType =
  | 'booked' | 'rescheduled' | 'cancelled' | 'reminder_sent'
  | 'consent_given' | 'consent_declined'
  | 'joined' | 'left' | 'recording_started' | 'recording_paused' | 'recording_stopped'
  | 'recording_start_failed' | 'recording_accessed'
  | 'payment_step_started' | 'payment_step_completed'
  | 'capacity_flag' | 'third_party_present' | 'escalated' | 'completed' | 'no_show'
