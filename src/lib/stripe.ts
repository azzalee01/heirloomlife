import Stripe from 'stripe'

export type Product = 'will' | 'vault'

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
  const id = product === 'will'
    ? process.env.STRIPE_PRICE_WILL
    : process.env.STRIPE_PRICE_VAULT_ANNUAL
  if (!id) throw new Error(`STRIPE_PRICE_${product.toUpperCase()} is not set`)
  return id
}
