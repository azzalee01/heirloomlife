import { describe, it, expect } from 'vitest'
import { applyLifeInterestReview, LIFE_INTEREST_REVIEW_REASON } from '../_review-reasons'

const BIZ = 'Business ownership — specialist advice recommended'

describe('applyLifeInterestReview', () => {
  it('tick → untick clears the flag entirely', () => {
    const ticked = applyLifeInterestReview([], true)
    expect(ticked.needsReview).toBe(true)
    expect(ticked.reasons).toEqual([LIFE_INTEREST_REVIEW_REASON])

    const unticked = applyLifeInterestReview(ticked.reasons, false)
    expect(unticked.needsReview).toBe(false)
    expect(unticked.reasons).toEqual([])
  })

  it('un-ticking life interest keeps an unrelated (business) reason', () => {
    const both = applyLifeInterestReview([BIZ], true)
    expect(both.reasons).toEqual([BIZ, LIFE_INTEREST_REVIEW_REASON])
    expect(both.needsReview).toBe(true)

    const afterUntick = applyLifeInterestReview(both.reasons, false)
    expect(afterUntick.reasons).toEqual([BIZ])
    expect(afterUntick.needsReview).toBe(true)
  })

  it('does not duplicate the reason when saved while ticked more than once', () => {
    const once = applyLifeInterestReview([], true)
    const twice = applyLifeInterestReview(once.reasons, true)
    expect(twice.reasons).toEqual([LIFE_INTEREST_REVIEW_REASON])
  })
})
