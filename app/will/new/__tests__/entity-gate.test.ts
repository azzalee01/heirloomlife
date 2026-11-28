// @vitest-environment jsdom
/**
 * Entity-held-asset gate — end to end across the three surfaces the spec asks about:
 *   1. the REAL <StepReview> component lists the entity asset in the review callout;
 *   2. computeReviewReasons sets needs_review with the ENTITY_HELD_ASSET reason
 *      (this is exactly what saveStep writes to wills.needs_review / needs_review_reasons
 *      and what the dashboard LegalReviewCallout renders);
 *   3. assembleWillDocument — the call completeWill uses to draft the Will — is BLOCKED
 *      for an entity asset, so no auto-issued document is produced.
 *
 * On main (pre-this-branch) (1) and (2) fail: the flag never reached the callout or
 * needs_review. This file is the regression guard.
 *
 * Run:  npx vitest run app/will/new/__tests__/entity-gate.test.ts
 */
import { describe, it, expect, afterEach } from 'vitest'
import { createElement } from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import StepReview from '../_components/StepReview'
import { computeReviewReasons, FLAG_REVIEW_REASONS } from '../_review-reasons'
import { assembleWillDocument } from '../_assembly'
import type { WillFormData } from '../_types'

afterEach(cleanup)

function baseWill(overrides: Partial<WillFormData> = {}): WillFormData {
  return {
    willId: null,
    personalDetails: {
      firstName: 'Jane', middleName: '', lastName: 'Smith', dateOfBirth: '1980-01-01',
      addressLine1: '1 Test St', suburb: 'Sydney', state: 'NSW', postcode: '2000',
      phoneMobile: '0400000000', email: 'jane@example.com', occupation: 'Teacher',
      maritalStatus: 'single', previousWill: 'no', previousWillLocation: '',
    },
    spouseDetails: { firstName: '', middleName: '', lastName: '', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' },
    childrenData: { hasChildren: 'no', children: [], guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' }, ageOfVesting: '18' },
    executorsData: {
      primary: { firstName: 'Rob', lastName: 'Smith', relationship: 'Sibling', phone: '', email: '', address: '' },
      hasAlternate: false,
      alternate: { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' },
    },
    assets: [],
    beneficiariesData: { people: [{ id: 'b1', name: 'James Brown', relationship: 'Friend', percentage: '100', substituteBeneficiary: '' }], charities: [] },
    specificGifts: [],
    triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false },
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

function withEntityAsset(fd: WillFormData): WillFormData {
  return {
    ...fd,
    assets: [{
      id: 'a1', assetType: 'real_estate', ownershipType: 'entity',
      propertyAddress: '12 Trust St', estimatedValue: '900000', bankName: '', bsb: '', accountNumber: '',
      fundName: '', memberNumber: '', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
      coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '',
      hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
    }],
  }
}

describe('1. real <StepReview> component surfaces the entity asset', () => {
  it('lists the trust/company/SMSF asset in the professional-review callout', () => {
    render(createElement(StepReview, { formData: withEntityAsset(baseWill()), onViewWill: () => {} }))
    expect(screen.getByText(/may benefit from professional review/i)).toBeDefined()
    expect(screen.getByText(/held by a trust, company or SMSF/i)).toBeDefined()
  })

  it('does not show the callout for a clean will (control)', () => {
    render(createElement(StepReview, { formData: baseWill(), onViewWill: () => {} }))
    expect(screen.queryByText(/held by a trust, company or SMSF/i)).toBeNull()
    expect(screen.queryByText(/may benefit from professional review/i)).toBeNull()
  })
})

describe('2. computeReviewReasons sets needs_review (what saveStep writes)', () => {
  it('entity asset → needs_review true with the ENTITY_HELD_ASSET reason', () => {
    const { needsReview, reasons } = computeReviewReasons(withEntityAsset(baseWill()), [])
    expect(needsReview).toBe(true)
    expect(reasons).toContain(FLAG_REVIEW_REASONS.ENTITY_HELD_ASSET)
  })
})

describe('3. assembleWillDocument (completeWill draft path) is blocked for an entity asset', () => {
  it('throws requiring a solicitor — no auto-issued document', async () => {
    await expect(assembleWillDocument(withEntityAsset(baseWill()))).rejects.toThrow(/ENTITY_HELD_ASSET|requires solicitor/i)
  })
})
