// Shared, non-action helpers for the auth confirm/callback flow.

// Only allow internal, single-slash paths as a redirect target (no open redirects).
export function sanitizeNext(raw: string | null | undefined): string {
  const s = typeof raw === 'string' ? raw : ''
  if (!s || !s.startsWith('/') || s.startsWith('//')) return '/dashboard'
  return s
}

// The intro-animation flag can't be set server-side, so carry it as a one-shot
// query param the dashboard consumes once (see IntroAnimation).
export function destFor(next: string): string {
  return next === '/dashboard' ? '/dashboard?welcome=1' : next
}
