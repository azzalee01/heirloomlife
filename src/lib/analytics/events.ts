// Client-side event fan-out: one track() call dispatches to PostHog, the Meta Pixel (fbq),
// and Google (gtag). Every call is a no-op when the corresponding tag isn't loaded, so this
// is safe to call unconditionally. Pixel/tag scripts are injected by app/_components/AdPixels.tsx.

type Props = Record<string, unknown>

// Map our internal event names to Meta standard event names. Anything not listed is sent to
// Meta as a custom (trackCustom) event.
const META_STANDARD: Record<string, string> = {
  lead: 'Lead',
  start_will: 'StartTrial',
  will_completed: 'CompleteRegistration',
  initiate_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

function toPostHog(event: string, props?: Props) {
  if (typeof window === 'undefined') return
  // posthog-js attaches itself to window.posthog once initialised.
  const ph = (window as unknown as { posthog?: { capture: (e: string, p?: Props) => void } }).posthog
  ph?.capture(event, props)
}

function toMeta(event: string, props?: Props, eventId?: string) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  const standard = META_STANDARD[event]
  const opts = eventId ? { eventID: eventId } : undefined
  if (standard) window.fbq('track', standard, props, opts)
  else window.fbq('trackCustom', event, props, opts)
}

function toGoogleAds(event: string, props?: Props) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  // Only the purchase maps to a Google Ads conversion action; other events are sent as plain
  // GA/gtag events for funnel analysis.
  if (event === 'purchase') {
    const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL
    if (id && label) {
      window.gtag('event', 'conversion', {
        send_to: `${id}/${label}`,
        value: props?.value,
        currency: props?.currency ?? 'AUD',
        transaction_id: props?.transaction_id,
      })
      return
    }
  }
  window.gtag('event', event, props)
}

/** Fire an event to every configured analytics/ads destination. Safe to call anywhere client-side. */
export function track(event: string, props?: Props, eventId?: string) {
  toPostHog(event, props)
  toMeta(event, props, eventId)
  toGoogleAds(event, props)
}
