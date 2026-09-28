// Single source of truth for prices shown in the app and used in Stripe copy. AUD, GST inclusive.
// The Stripe Price objects themselves live in Stripe (STRIPE_PRICE_WILL, STRIPE_PRICE_UPDATES_ANNUAL);
// keep these amounts in step with them. Marketing pages should import from here, not hardcode strings.

export const PRICING = {
  willAud: 129,
  updatesAudPerYear: 25,
  partnerWillDiscountAud: 40,
} as const

// Derived label strings — use these in UI rather than hardcoding "$129" etc.
export const WILL_PRICE_LABEL = `$${PRICING.willAud}`
export const UPDATES_PRICE_LABEL = `$${PRICING.updatesAudPerYear}/year`
export const PARTNER_WILL_PRICE_LABEL = `$${PRICING.willAud - PRICING.partnerWillDiscountAud}`

// Solicitor review messaging — single source used across marketing pages and the dashboard.
// "standard solicitor quality review" = the baseline review every issued Will receives.
// "bespoke review" = additional engagement available for complex situations.
// Do not strengthen these claims beyond what appears below without owner confirmation.
export const REVIEW_COPY = {
  standardShort: 'solicitor-reviewed',
  standardLong: 'Every Will issued through Heirloom Life is subject to a standard solicitor quality review before being issued.',
  complexLong: 'For more complex situations — business succession, blended families, overseas assets, testamentary trusts — your Vault will flag the specific areas of concern, and you can communicate directly with our partner lawyers through your Vault for a more detailed bespoke engagement.',
  notLegalAdvice: 'Heirloom Life is not a law firm and does not provide legal advice. Using Heirloom Life does not create a solicitor-client relationship.',
} as const
