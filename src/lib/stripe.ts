import Stripe from 'stripe'

// 'will'    = one-off Will purchase (A$129 incl. GST). Includes the first signing and permanent download.
// 'updates' = optional annual "unlimited updates" add-on (A$25/yr incl. GST). Bought alongside the Will
//             at checkout, or later from the dashboard. Never required to keep or download a paid Will.
export type Product = 'will' | 'updates'

let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

export function priceId(product: Product): string {
  const id =
    product === 'will' ? process.env.STRIPE_PRICE_WILL : process.env.STRIPE_PRICE_UPDATES_ANNUAL
  if (!id) throw new Error(`Price env var not set for product: ${product}`)
  return id
}

export function isSubscriptionProduct(product: Product): boolean {
  return product === 'updates'
}

export function isProduct(value: unknown): value is Product {
  return value === 'will' || value === 'updates'
}

/**
 * End of the subscription's current paid period. In recent Stripe API versions the period lives on the
 * subscription item; older versions carry it on the subscription itself, so read both.
 */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end
  const ts = item?.current_period_end ?? legacy
  return typeof ts === 'number' ? new Date(ts * 1000) : null
}
