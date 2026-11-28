import type { WillFormData } from './_types'
import { assessComplexityFlags } from './_complexity'

export const LIFE_INTEREST_REVIEW_REASON =
  'Life interest / right to reside — requires bespoke solicitor drafting (not included in the template Will).'

export const WA_MARRIAGE_REVOCATION_REVIEW_REASON =
  'WA: ending of marriage may revoke the whole Will'

// Every complexity-flag code → the stable review reason shown on the dashboard
// LegalReviewCallout. ALL review-worthy gates (SOLICITOR_REQUIRED and REVIEW_RECOMMENDED)
// set needs_review, so a launch-blocking trigger (entity-held asset, overseas asset, WA
// with a partner, …) can never silently pass as a complete, review-free Will.
export const FLAG_REVIEW_REASONS: Record<string, string> = {
  OVERSEAS_ASSETS: 'Overseas or non-Australian assets — a separate Will valid in that jurisdiction may be needed; solicitor review required.',
  ENTITY_HELD_ASSET: 'Asset held by a trust, company or SMSF — not owned personally and cannot be dealt with by this Will; solicitor review required.',
  BUSINESS_INTEREST: 'Business ownership, company shareholding or trust interest — business succession needs specialist advice.',
  BLENDED_FAMILY: 'Blended family or children from an earlier relationship — consider legal advice.',
  EXCLUSION_INTENT: 'Deliberate exclusion of a spouse, child or close family member — family-provision risk; solicitor review required.',
  VULNERABLE_BENEFICIARY: 'Beneficiary with a disability or impaired capacity — a Special Disability Trust or tailored structure may be appropriate.',
  BENEFICIARY_FINANCIAL_CHALLENGES: 'Beneficiary with money-management or addiction concerns — a protective or staged trust may be appropriate.',
  COMPLEX_TRUSTS: 'Testamentary trust beyond a standard minor-beneficiary trust — needs bespoke drafting.',
  LIFE_INTEREST: LIFE_INTEREST_REVIEW_REASON,
  WA_MARRIAGE_REVOCATION: WA_MARRIAGE_REVOCATION_REVIEW_REASON,
  NO_GUARDIAN_NAMED: 'Dependent children with no named guardian — strongly recommended to add one.',
}

// Recompute the review reasons for a will from its current form state. Flag-derived
// reasons are fully recomputed each save (added when the trigger is present, dropped when
// cleared); any OTHER reason already on the will — e.g. an admin- or amendment-added note
// — is preserved. needs_review is true iff at least one reason remains.
export function computeReviewReasons(
  formData: WillFormData,
  currentReasons: string[],
): { reasons: string[]; needsReview: boolean } {
  const active = assessComplexityFlags(formData)
    .map((f) => FLAG_REVIEW_REASONS[f.code])
    .filter((r): r is string => Boolean(r))
  const managed = new Set(Object.values(FLAG_REVIEW_REASONS))
  const preserved = currentReasons.filter((r) => !managed.has(r))
  const reasons = [...new Set([...preserved, ...active])]
  return { reasons, needsReview: reasons.length > 0 }
}

// Add or remove the life-interest review reason WITHOUT clobbering other reasons
// (e.g. an amendment-review or admin-added reason). needs_review stays true only
// if at least one reason remains.
export function applyLifeInterestReview(
  currentReasons: string[],
  lifeInterestEnabled: boolean
): { reasons: string[]; needsReview: boolean } {
  const without = currentReasons.filter((r) => r !== LIFE_INTEREST_REVIEW_REASON)
  const reasons = lifeInterestEnabled ? [...without, LIFE_INTEREST_REVIEW_REASON] : without
  return { reasons, needsReview: reasons.length > 0 }
}

// Add or remove the WA marriage-revocation review reason, same clobber-safe pattern.
// Triggered for a WA testator who has a spouse or partner — a review prompt only.
export function applyWaMarriageReview(
  currentReasons: string[],
  waMarriageRevocationApplies: boolean
): { reasons: string[]; needsReview: boolean } {
  const without = currentReasons.filter((r) => r !== WA_MARRIAGE_REVOCATION_REVIEW_REASON)
  const reasons = waMarriageRevocationApplies ? [...without, WA_MARRIAGE_REVOCATION_REVIEW_REASON] : without
  return { reasons, needsReview: reasons.length > 0 }
}
