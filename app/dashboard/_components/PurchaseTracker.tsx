'use client'

// Fires the browser-side Purchase conversion once, when the customer lands on the post-checkout
// success page. Uses the Stripe session id as the event id so Meta de-duplicates this against the
// server-side Conversions API event (src/lib/analytics/meta-capi.ts). Guards on sessionStorage so a
// refresh of /dashboard?payment=success doesn't double-count.

import { useEffect } from 'react'
import { track } from '@/src/lib/analytics/events'
import { PRICING } from '@/src/lib/pricing'

export default function PurchaseTracker({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    if (!sessionId) return
    const key = `purchase_tracked_${sessionId}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* private mode — fall through and fire once per load */
    }
    track(
      'purchase',
      { value: PRICING.willAud, currency: 'AUD', transaction_id: sessionId },
      sessionId,
    )
  }, [sessionId])

  return null
}
