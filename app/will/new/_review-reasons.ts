export const LIFE_INTEREST_REVIEW_REASON =
  'Life interest / right to reside — requires bespoke solicitor drafting (not included in the template Will).'

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
