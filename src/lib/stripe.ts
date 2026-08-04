import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export type Product = 'will' | 'vault'

export function priceId(product: Product): string {
  const id = product === 'will'
    ? process.env.STRIPE_PRICE_WILL
    : process.env.STRIPE_PRICE_VAULT_ANNUAL
  if (!id) throw new Error(`STRIPE_PRICE_${product.toUpperCase()} is not set`)
  return id
}
