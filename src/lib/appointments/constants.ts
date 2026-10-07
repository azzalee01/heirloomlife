// Safe to import from client components (no secrets, no I/O).

export const APPOINTMENT_TZ = 'Australia/Sydney'

export const BOOKING_HORIZON_DAYS = 28
export const MIN_NOTICE_HOURS = 12
export const MAX_ACTIVE_BOOKINGS_PER_EMAIL = 2

// Customers may join from 15 minutes before the start until 30 minutes after the scheduled end.
export const JOIN_OPENS_MINUTES_BEFORE = 15
export const JOIN_CLOSES_MINUTES_AFTER_END = 30
// The host may enter earlier and later (setup, overruns).
export const HOST_JOIN_OPENS_MINUTES_BEFORE = 60
export const HOST_JOIN_CLOSES_MINUTES_AFTER_END = 120

// Bump the version whenever the wording changes, so each consent row records exactly what was agreed to.
export const RECORDING_CONSENT_VERSION = '2026-10-v1'

// DRAFT WORDING: needs solicitor review, and /privacy must describe the recording and its retention before launch.
export const RECORDING_CONSENT_TEXT = {
  heading: 'Before we start: this call is recorded',
  body: [
    'We record this session (video, audio and anything shown on screen) so there is an accurate record of how your Will was prepared.',
    'Your guide reads the questions aloud and helps you enter your answers. They cannot give legal advice, and the choices are always yours.',
    'We pause the recording while you enter payment details.',
  ],
  agree: 'I agree. Start my session.',
  decline: 'I don’t agree',
  declined:
    'No problem. We can’t run a guided call without a recording, so nothing has been recorded and the session has not started. You can still complete your Will yourself on the website, or cancel this booking below.',
} as const

export function buildAvStatement(witness1Name: string, witness2Name: string, date: string, platform: string): string {
  const d = new Intl.DateTimeFormat('en-AU', {
    timeZone: APPOINTMENT_TZ, day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
  const block = (name: string) =>
    `I, ${name}, witnessed the will-maker sign this Will by audio visual link on ${d} using ${platform}. ` +
    `I observed the will-maker sign in real time. I have signed a counterpart of this document and am ` +
    `reasonably satisfied it is the same document, or a copy of the document, that I observed the will-maker sign. ` +
    `This document was witnessed in accordance with section 14G of the Electronic Transactions Act 2000 (NSW).`
  return `${block(witness1Name)}\n\n${block(witness2Name)}`
}
