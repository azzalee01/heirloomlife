// Single source of truth for prices shown in the app and used in Stripe copy. AUD, GST inclusive.
// The Stripe Price objects themselves live in Stripe (STRIPE_PRICE_WILL, STRIPE_PRICE_UPDATES_ANNUAL);
// keep these amounts in step with them. Marketing pages should import from here, not hardcode strings.

export const PRICING = {
  willAud: 129,
  updatesAudPerYear: 25,
  partnerWillDiscountAud: 40,
} as const

export const WILL_PRICE_LABEL = `$${PRICING.willAud}`
export const UPDATES_PRICE_LABEL = `$${PRICING.updatesAudPerYear}/year`
export const PARTNER_WILL_PRICE_LABEL = `$${PRICING.willAud - PRICING.partnerWillDiscountAud}`
