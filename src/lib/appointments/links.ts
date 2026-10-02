import { createHmac, timingSafeEqual } from 'node:crypto'

// Signed, stateless join links. A link is `<appointmentId>.<signature>` where
// signature = base64url(HMAC-SHA256(secret, `${appointmentId}:${tokenVersion}`)).
// Nothing secret is stored in the database, and reminder emails can re-derive the same link.
// Bumping appointments.token_version invalidates every link issued for that appointment.

function secret(): string {
  const s = process.env.APPOINTMENT_LINK_SECRET
  if (!s || s.length < 32) throw new Error('APPOINTMENT_LINK_SECRET must be set (32+ characters)')
  return s
}

// Call before doing anything irreversible, so a missing secret can't leave an orphaned booking.
export function assertLinkSecret(): void {
  secret()
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sign(appointmentId: string, tokenVersion: number): string {
  return createHmac('sha256', secret()).update(`${appointmentId}:${tokenVersion}`).digest('base64url')
}

export function buildAccessToken(appointmentId: string, tokenVersion: number): string {
  return `${appointmentId}.${sign(appointmentId, tokenVersion)}`
}

export function parseAccessToken(token: string): { appointmentId: string; signature: string } | null {
  const dot = token.indexOf('.')
  if (dot < 0) return null
  const appointmentId = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!UUID_RE.test(appointmentId) || !signature || signature.length > 128) return null
  return { appointmentId, signature }
}

export function verifyAccessSignature(appointmentId: string, tokenVersion: number, signature: string): boolean {
  const expected = Buffer.from(sign(appointmentId, tokenVersion))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export function joinUrl(appointmentId: string, tokenVersion: number): string {
  return `${appBaseUrl()}/appointments/join/${buildAccessToken(appointmentId, tokenVersion)}`
}
