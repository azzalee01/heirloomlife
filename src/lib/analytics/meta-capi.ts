// Server-side Meta Conversions API. Fired from the Stripe webhook when a purchase completes, so the
// conversion is recorded even if the browser pixel is blocked or the redirect is lost. The client
// pixel sends the same event with the same eventId (the Stripe session id) so Meta de-duplicates them.
//
// No-op unless both NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are set. Never throws —
// analytics must not break payment processing.

import { createHash } from 'crypto'
import type { Attribution } from './utm'

const GRAPH_VERSION = 'v19.0'

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function sendMetaPurchase(params: {
  eventId: string
  value: number
  currency: string
  email?: string | null
  attribution?: Attribution
  eventSourceUrl?: string
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!pixelId || !token) return

  const userData: Record<string, unknown> = {}
  if (params.email) userData.em = [sha256(params.email)]
  if (params.attribution?.fbclid) {
    // Meta's fbc format: fb.1.<timestamp_ms>.<fbclid>. We don't have the original click timestamp
    // here, so send the raw fbclid under fbc — Meta still attempts a match.
    userData.fbc = params.attribution.fbclid
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: 'website',
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          value: params.value,
          currency: params.currency.toUpperCase(),
        },
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    if (!res.ok) {
      console.error('[meta-capi] purchase rejected', { status: res.status, body: await res.text() })
    }
  } catch (err) {
    console.error('[meta-capi] purchase send failed (non-fatal)', { error: (err as Error).message })
  }
}
