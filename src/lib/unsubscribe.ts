import crypto from 'node:crypto'

// Stateless unsubscribe tokens: HMAC(userId) with a server secret. No DB token
// column needed; the link is unguessable and verifiable. Reuses CRON_SECRET so
// no new env var is required.
function secret(): string {
  return process.env.CRON_SECRET ?? ''
}

export function unsubscribeToken(userId: string): string {
  return crypto.createHmac('sha256', secret()).update(userId).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  if (!userId || !token) return false
  const expected = unsubscribeToken(userId)
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function unsubscribeUrl(appUrl: string, userId: string): string {
  const base = appUrl.replace(/\/$/, '')
  return `${base}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`
}
