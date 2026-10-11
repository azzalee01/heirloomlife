// Single source of truth for prices shown in the app and used in Stripe copy. AUD, GST inclusive.
// The Stripe Price objects themselves live in Stripe (STRIPE_PRICE_WILL, STRIPE_PRICE_UPDATES_ANNUAL);
// keep these amounts in step with them. Marketing pages should import from here, not hardcode strings.

export const PRICING = {
  willAud: 149,
  updatesAudPerYear: 25,
  partnerWillDiscountAud: 40,
  rewitAud: 79,
} as const

// Derived label strings — use these in UI rather than hardcoding "$149" etc.
export const WILL_PRICE_LABEL = `$${PRICING.willAud}`
export const UPDATES_PRICE_LABEL = `$${PRICING.updatesAudPerYear}/year`
export const PARTNER_WILL_PRICE_LABEL = `$${PRICING.willAud - PRICING.partnerWillDiscountAud}`

// Review messaging — single source used across marketing pages and the dashboard.
// Actual process: Aaron (paralegal / final-year law student) reviews every Will against
// a solicitor-written checklist before it is issued. Do not claim solicitor review.
export const REVIEW_COPY = {
  standardShort: 'reviewed before issue',
  standardLong: 'Every Will is reviewed by our team against a solicitor-written checklist before being issued.',
  complexLong: 'For more complex situations — business succession, blended families, overseas assets, testamentary trusts — your Vault will flag the specific areas of concern, and you can communicate directly with our partner lawyers through your Vault for a more detailed bespoke engagement.',
  notLegalAdvice: 'Heirloom Life is not a law firm and does not provide legal advice. Using Heirloom Life does not create a solicitor-client relationship.',
} as const
