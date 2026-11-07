// Attribution capture. On first landing we persist the campaign params + click IDs to a cookie so
// they survive the multi-step/anonymous → signed-in → checkout journey. The checkout route reads the
// same cookie server-side and stamps the values onto the Stripe session metadata, so a purchase can
// be tied back to the ad that drove it (and matched by Meta CAPI / Google offline conversions later).

export const ATTRIBUTION_COOKIE = 'hl_attribution'
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'] as const

export type Attribution = Partial<Record<(typeof PARAMS)[number], string>>

/** Client-only: read current URL params and, if any attribution is present, store it (first-touch wins). */
export function captureAttributionFromUrl() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const found: Attribution = {}
  for (const key of PARAMS) {
    const v = url.searchParams.get(key)
    if (v) found[key] = v.slice(0, 200)
  }
  if (Object.keys(found).length === 0) return
  // First-touch: don't overwrite an existing capture.
  if (document.cookie.includes(`${ATTRIBUTION_COOKIE}=`)) return
  const value = encodeURIComponent(JSON.stringify(found))
  document.cookie = `${ATTRIBUTION_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
}

/** Parse an attribution cookie value (URL-encoded JSON). Returns {} on any problem. */
export function parseAttributionCookie(raw: string | undefined): Attribution {
  if (!raw) return {}
  try {
    const obj = JSON.parse(decodeURIComponent(raw)) as Attribution
    const clean: Attribution = {}
    for (const key of PARAMS) if (typeof obj[key] === 'string') clean[key] = obj[key]
    return clean
  } catch {
    return {}
  }
}
