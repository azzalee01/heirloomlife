export const LIFE_INTEREST_REVIEW_REASON =
  'Life interest / right to reside — requires bespoke solicitor drafting (not included in the template Will).'

export const WA_MARRIAGE_REVOCATION_REVIEW_REASON =
  'WA: ending of marriage may revoke the whole Will'

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
