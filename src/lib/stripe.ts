import Stripe from 'stripe'

export type Product = 'will' | 'vault' | 'vault_monthly'

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
    product === 'will' ? process.env.STRIPE_PRICE_WILL :
    product === 'vault' ? process.env.STRIPE_PRICE_VAULT_ANNUAL :
    process.env.STRIPE_PRICE_VAULT_MONTHLY
  if (!id) throw new Error(`Price env var not set for product: ${product}`)
  return id
}

export function isSubscriptionProduct(product: Product): boolean {
  return product === 'vault' || product === 'vault_monthly'
}

/** Normalise vault_monthly → vault for the profiles.plan field */
export function planName(product: Product): string {
  return product === 'vault_monthly' ? 'vault' : product
}
