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
  const id =
    product === 'will' ? process.env.STRIPE_PRICE_WILL : process.env.STRIPE_PRICE_VAULT_ANNUAL
  if (!id) throw new Error(`Price env var not set for product: ${product}`)
  return id
}

export function isSubscriptionProduct(product: Product): boolean {
  return product === 'vault'
}

export function planName(product: Product): string {
  return product
}

export function isProduct(value: unknown): value is Product {
  return value === 'will' || value === 'vault'
}
