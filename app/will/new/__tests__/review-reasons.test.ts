import { describe, it, expect } from 'vitest'
import {
  applyLifeInterestReview,
  computeReviewReasons,
  FLAG_REVIEW_REASONS,
  LIFE_INTEREST_REVIEW_REASON,
  WA_MARRIAGE_REVOCATION_REVIEW_REASON,
} from '../_review-reasons'
import type { WillFormData } from '../_types'

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

// ── Unified gate → needs_review (entity, overseas, WA, business, …) ───────────

function rrFormData(overrides: Partial<WillFormData> = {}): WillFormData {
  return {
    willId: null,
    personalDetails: {
      firstName: 'Jane', middleName: '', lastName: 'Smith', dateOfBirth: '1980-01-01',
      addressLine1: '1 Test St', suburb: 'Sydney', state: 'NSW', postcode: '2000',
      phoneMobile: '', email: '', occupation: '', maritalStatus: 'single',
      previousWill: 'no', previousWillLocation: '',
    },
    spouseDetails: {
      firstName: '', middleName: '', lastName: '', dateOfBirth: '', addressLine1: '', suburb: '',
      state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '',
    },
    childrenData: { hasChildren: 'no', children: [], guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' }, ageOfVesting: '18' },
    executorsData: {
      primary: { firstName: 'Rob', lastName: 'Smith', relationship: 'Sibling', phone: '', email: '', address: '' },
      hasAlternate: false,
      alternate: { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' },
    },
    assets: [],
    beneficiariesData: { people: [{ id: '1', name: 'James Smith', relationship: 'Friend', percentage: '100', substituteBeneficiary: '' }], charities: [] },
    specificGifts: [],
    triageFlags: {
      hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false,
      hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false,
    },
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    survivorshipDays: '30',
    petCare: { hasPets: 'no', petName: '', petDescription: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    lifeInterest: { enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '', condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '' },
    personalWishes: { funeralType: '', funeralRestingPlace: '', funeralAdditionalWishes: '', hasFuneralPlan: false, funeralPlanDetails: '' },
    ...overrides,
  }
}

function entityAsset(): WillFormData['assets'][number] {
  return {
    id: '1', assetType: 'real_estate', ownershipType: 'entity',
    propertyAddress: '12 Trust St', estimatedValue: '900000', bankName: '', bsb: '', accountNumber: '',
    fundName: '', memberNumber: '', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
    coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '',
    hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
  }
}

describe('computeReviewReasons — solicitor gates set needs_review', () => {
  it('a clean simple will needs no review', () => {
    const { reasons, needsReview } = computeReviewReasons(rrFormData(), [])
    expect(needsReview).toBe(false)
    expect(reasons).toEqual([])
  })

  it('entity-held asset sets needs_review with the ENTITY_HELD_ASSET reason', () => {
    const { reasons, needsReview } = computeReviewReasons(rrFormData({ assets: [entityAsset()] }), [])
    expect(needsReview).toBe(true)
    expect(reasons).toContain(FLAG_REVIEW_REASONS.ENTITY_HELD_ASSET)
  })

  it('overseas assets set needs_review', () => {
    const { reasons, needsReview } = computeReviewReasons(rrFormData({ assetsOutsideAustralia: true }), [])
    expect(needsReview).toBe(true)
    expect(reasons).toContain(FLAG_REVIEW_REASONS.OVERSEAS_ASSETS)
  })

  it('WA testator with a partner sets the WA marriage-revocation reason', () => {
    const fd = rrFormData({ personalDetails: { ...rrFormData().personalDetails, state: 'WA', maritalStatus: 'married' } })
    const { reasons, needsReview } = computeReviewReasons(fd, [])
    expect(needsReview).toBe(true)
    expect(reasons).toContain(WA_MARRIAGE_REVOCATION_REVIEW_REASON)
  })

  it('business interest sets needs_review', () => {
    const fd = rrFormData({ triageFlags: { ...rrFormData().triageFlags, hasBusinessInterest: true } })
    expect(computeReviewReasons(fd, []).reasons).toContain(FLAG_REVIEW_REASONS.BUSINESS_INTEREST)
  })

  it('preserves an admin/amendment reason not managed by the flags', () => {
    const adminReason = 'Manual review requested by admin'
    const { reasons } = computeReviewReasons(rrFormData({ assets: [entityAsset()] }), [adminReason])
    expect(reasons).toContain(adminReason)
    expect(reasons).toContain(FLAG_REVIEW_REASONS.ENTITY_HELD_ASSET)
  })

  it('drops a flag reason once its trigger is cleared', () => {
    const prior = [FLAG_REVIEW_REASONS.ENTITY_HELD_ASSET]
    const { reasons, needsReview } = computeReviewReasons(rrFormData(), prior)
    expect(reasons).not.toContain(FLAG_REVIEW_REASONS.ENTITY_HELD_ASSET)
    expect(needsReview).toBe(false)
  })

  it('is idempotent — recomputing does not duplicate reasons', () => {
    const fd = rrFormData({ assets: [entityAsset()], assetsOutsideAustralia: true })
    const once = computeReviewReasons(fd, []).reasons
    const twice = computeReviewReasons(fd, once).reasons
    expect(twice).toEqual(once)
  })
})
