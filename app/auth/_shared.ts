// Shared, non-action helpers for the auth confirm/callback flow.

// Same-origin relative paths only — defends against open redirects.
// Requires a single leading slash, and rejects:
//   - protocol-relative "//evil.com"
//   - backslash tricks "/\evil.com" / "/\/evil.com" (browsers treat \ as /)
//   - schemes "https://…", "javascript:…" (no leading slash → rejected)
export function sanitizeNext(raw: string | null | undefined): string {
  const s = typeof raw === 'string' ? raw : ''
  if (!s.startsWith('/')) return '/dashboard'
  if (s.startsWith('//')) return '/dashboard'
  if (s.includes('\\')) return '/dashboard'
  return s
}

// The intro-animation flag can't be set server-side, so carry it as a one-shot
// query param the dashboard consumes once (see IntroAnimation).
export function destFor(next: string): string {
  return next === '/dashboard' ? '/dashboard?welcome=1' : next
}
