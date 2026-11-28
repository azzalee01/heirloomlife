// @vitest-environment jsdom
/**
 * A SOLICITOR_REQUIRED Will (e.g. a trust/company/SMSF-held asset) must never be sold or
 * auto-issued. This covers the three surfaces:
 *   - CHECKOUT GATE: willRequiresSolicitor() — the predicate /api/stripe/checkout uses to
 *     refuse the purchase (403). REVIEW_RECOMMENDED flags must NOT block.
 *   - PAYWALL: the dashboard shows <SolicitorReviewNotice> (request a solicitor review)
 *     instead of the checkout banner, and offers no "pay/unlock" action.
 *   - ISSUE PATH: assembleWillDocument — what completeWill calls — throws, so no document
 *     is produced.
 *
 * Run:  npx vitest run app/dashboard/will/__tests__/solicitor-required-gate.test.ts
 */
import { describe, it, expect, afterEach } from 'vitest'
import { createElement } from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { willRequiresSolicitor } from '@/app/will/new/_complexity'
import { assembleWillDocument } from '@/app/will/new/_assembly'
import SolicitorReviewNotice from '../_components/SolicitorReviewNotice'
import type { WillFormData } from '@/app/will/new/_types'

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

function entityAsset() {
  return {
    id: 'a1', assetType: 'real_estate' as const, ownershipType: 'entity' as const,
    propertyAddress: '12 Trust St', estimatedValue: '900000', bankName: '', bsb: '', accountNumber: '',
    fundName: '', memberNumber: '', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
    coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '',
    hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
  }
}

describe('checkout gate: willRequiresSolicitor', () => {
  it('blocks (true) for an entity-held asset', () => {
    expect(willRequiresSolicitor(baseWill({ assets: [entityAsset()] }))).toBe(true)
  })
  it('blocks (true) for overseas assets', () => {
    expect(willRequiresSolicitor(baseWill({ assetsOutsideAustralia: true }))).toBe(true)
  })
  it('blocks (true) for a business interest', () => {
    expect(willRequiresSolicitor(baseWill({ triageFlags: { ...baseWill().triageFlags, hasBusinessInterest: true } }))).toBe(true)
  })
  it('does NOT block a plain will', () => {
    expect(willRequiresSolicitor(baseWill())).toBe(false)
  })
  it('does NOT block a REVIEW_RECOMMENDED-only will (blended family) — it still issues', () => {
    expect(willRequiresSolicitor(baseWill({ triageFlags: { ...baseWill().triageFlags, hasBlendedFamily: true } }))).toBe(false)
  })
})

describe('paywall: the review notice replaces checkout', () => {
  it('offers "request a solicitor review" and no pay/unlock action', () => {
    render(createElement(SolicitorReviewNotice))
    expect(screen.getByText(/needs a solicitor review before it can be issued/i)).toBeDefined()
    const cta = screen.getByText(/request a solicitor review/i)
    expect(cta).toBeDefined()
    // Primary action is a solicitor-review request, never a checkout/pay button.
    expect(screen.queryByText(/\$149|unlock your will|pay/i)).toBeNull()
    expect(screen.getByText(/don’t charge for a Will we can’t deliver/i)).toBeDefined()
  })
})

describe('issue path: completeWill cannot auto-issue a flagged will', () => {
  it('assembleWillDocument throws for an entity asset (no document produced)', async () => {
    await expect(assembleWillDocument(baseWill({ assets: [entityAsset()] }))).rejects.toThrow(/ENTITY_HELD_ASSET|requires solicitor/i)
  })
})
