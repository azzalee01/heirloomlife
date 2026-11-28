/**
 * Jurisdiction-neutral clause tests.
 *
 * The clause library serves NSW testators the original NSW clauses and every other
 * State/Territory the solicitor-approved generic (jurisdiction-neutral) clauses.
 *
 * Coverage (per the implementation spec):
 *   (a) NSW output is byte-identical to the pre-generic behaviour  — snapshot regression.
 *   (b) VIC/QLD/WA/SA/TAS/ACT/NT output contains no NSW statutory references.
 *   (c) Variables (vesting_age, survivorship_days, residuary_*) render in a generic Will.
 *   (d) Assembling the same Will twice is identical (idempotence).
 *
 * The DB-backed assembleWillDocument path is not unit-testable here (no DB creds in the
 * suite — same constraint as the rest of will-generation.test.ts), so these tests exercise
 * renderWillText, the shared selector logic, and the statute safety net directly. The
 * assembly path reuses the same clauseJurisdictionForState()/findNswStatuteCitations()
 * helpers and additionally fails loudly on any NSW leak (verified against the live DB).
 *
 * Run:  npx vitest run app/will/new/__tests__/jurisdiction.test.ts
 */

import { describe, it, expect } from 'vitest'
import { renderWillText } from '../_render'
import {
  clauseJurisdictionForState,
  isNswState,
  findNswStatuteCitations,
  hasNswStatuteCitation,
} from '../_jurisdiction'
import { assessComplexityFlags, maxSeverity } from '../_complexity'
import { applyWaMarriageReview, WA_MARRIAGE_REVOCATION_REVIEW_REASON } from '../_review-reasons'
import type { WillFormData } from '../_types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function basePerson(overrides: Partial<WillFormData['personalDetails']> = {}): WillFormData['personalDetails'] {
  return {
    firstName: 'Jane', middleName: '', lastName: 'Smith', dateOfBirth: '1980-01-01',
    addressLine1: '42 Test Street', suburb: 'Townsville', state: 'NSW', postcode: '2000',
    phoneMobile: '0400000000', email: 'jane@example.com', occupation: 'Teacher',
    maritalStatus: 'single', previousWill: 'no', previousWillLocation: '',
    ...overrides,
  }
}

function baseExecutor(overrides: Partial<WillFormData['executorsData']['primary']> = {}) {
  return { firstName: 'Robert', lastName: 'Smith', relationship: 'Sibling', phone: '', email: '', address: '', ...overrides }
}
function emptyExecutor() {
  return { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' }
}
function personBeneficiary(name: string, pct: string, rel = 'Friend'): WillFormData['beneficiariesData']['people'][number] {
  return { id: '1', name, relationship: rel, percentage: pct, substituteBeneficiary: '' }
}
function baseTriageFlags(): WillFormData['triageFlags'] {
  return {
    hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false,
    hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false,
  }
}
function emptyChildren(): WillFormData['childrenData'] {
  return { hasChildren: 'no', children: [], guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' }, ageOfVesting: '18' }
}

function baseFormData(overrides: Partial<WillFormData> = {}): WillFormData {
  return {
    willId: null,
    personalDetails: basePerson(),
    spouseDetails: {
      firstName: '', middleName: '', lastName: '', dateOfBirth: '',
      addressLine1: '', suburb: '', state: '', postcode: '',
      phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '',
    },
    childrenData: emptyChildren(),
    executorsData: { primary: baseExecutor(), hasAlternate: false, alternate: emptyExecutor() },
    assets: [],
    beneficiariesData: { people: [], charities: [] },
    specificGifts: [],
    triageFlags: baseTriageFlags(),
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    survivorshipDays: '30',
    petCare: { hasPets: 'no', petName: '', petDescription: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    lifeInterest: {
      enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '',
      condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '',
    },
    personalWishes: { funeralType: '', funeralRestingPlace: '', funeralAdditionalWishes: '', hasFuneralPlan: false, funeralPlanDetails: '' },
    ...overrides,
  }
}

// Five representative shapes used for the NSW byte-identical regression AND, with the
// state swapped, the non-NSW statute-free assertions.
function fixtureSimple(state: string): WillFormData {
  return baseFormData({ personalDetails: basePerson({ state }) , beneficiariesData: { people: [personBeneficiary('James Smith', '100', 'Friend')], charities: [] } })
}
function fixtureSpouse(state: string): WillFormData {
  return baseFormData({
    personalDetails: basePerson({ state, maritalStatus: 'married' }),
    spouseDetails: { firstName: 'Mary', middleName: '', lastName: 'Smith', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' },
    beneficiariesData: { people: [personBeneficiary('Mary Smith', '100', 'Spouse')], charities: [] },
  })
}
function fixtureMinorTrust(state: string): WillFormData {
  return baseFormData({
    personalDetails: basePerson({ state }),
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: '1', firstName: 'Tom', lastName: 'Smith', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    beneficiariesData: { people: [personBeneficiary('Tom Smith', '100', 'Child')], charities: [] },
  })
}
function fixtureMultiResidue(state: string): WillFormData {
  return baseFormData({
    personalDetails: basePerson({ state }),
    survivorshipDays: '45',
    beneficiariesData: {
      people: [
        personBeneficiary('Alice Brown', '40', 'Child'),
        personBeneficiary('Bob Brown', '30', 'Child'),
        personBeneficiary('Carol Brown', '30', 'Child'),
      ],
      charities: [],
    },
  })
}
function fixtureFullFeature(state: string): WillFormData {
  return baseFormData({
    personalDetails: basePerson({ state, maritalStatus: 'married' }),
    spouseDetails: { firstName: 'Sarah', middleName: '', lastName: 'Smith', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' },
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: '1', firstName: 'Tom', lastName: 'Smith', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Helen', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    executorsData: { primary: baseExecutor(), hasAlternate: true, alternate: baseExecutor({ firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend' }) },
    specificGifts: [
      { id: '1', type: 'item', description: 'Gold watch', amount: '', recipientName: 'Alice Brown', recipientRelationship: 'Niece', substituteBeneficiary: '' },
      { id: '2', type: 'cash', description: '', amount: '10000', recipientName: 'Bob Brown', recipientRelationship: 'Brother', substituteBeneficiary: '' },
    ],
    beneficiariesData: { people: [personBeneficiary('Tom Smith', '100', 'Child')], charities: [] },
    petCare: { hasPets: 'yes', petName: '', petDescription: 'cat', caregiverName: 'Helen Jones', caregiverRelationship: 'Aunt', careFundAmount: '1000' },
    assets: [{
      id: '1', assetType: 'digital_asset', ownershipType: 'sole',
      propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '',
      fundName: '', memberNumber: '', companyName: '', numberOfShares: '',
      insurerName: '', policyNumber: '', coverAmount: '',
      make: '', model: '', year: '', rego: '',
      accessLocation: 'password manager', description: 'Bitcoin wallet', otherValue: '',
      hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
    }],
  })
}

const FIXTURES: Record<string, (state: string) => WillFormData> = {
  simple: fixtureSimple,
  spouse: fixtureSpouse,
  'minor-trust': fixtureMinorTrust,
  'multi-residue': fixtureMultiResidue,
  'full-feature': fixtureFullFeature,
}

const NON_NSW_STATES = ['VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']

// ── Helper unit tests ─────────────────────────────────────────────────────────

describe('clauseJurisdictionForState', () => {
  it('maps NSW (any case) to the nsw clause set', () => {
    expect(clauseJurisdictionForState('NSW')).toBe('nsw')
    expect(clauseJurisdictionForState('nsw')).toBe('nsw')
    expect(isNswState('NSW')).toBe(true)
  })
  it('maps every other State/Territory to the generic clause set', () => {
    for (const s of NON_NSW_STATES) expect(clauseJurisdictionForState(s)).toBe('generic')
  })
  it('falls back to NSW for empty/unknown state (in-progress drafts)', () => {
    expect(clauseJurisdictionForState('')).toBe('nsw')
    expect(clauseJurisdictionForState(null)).toBe('nsw')
    expect(clauseJurisdictionForState(undefined)).toBe('nsw')
  })
})

describe('findNswStatuteCitations (safety-net detector)', () => {
  it('detects each NSW statutory reference', () => {
    expect(findNswStatuteCitations('under the Trustee Act 1925 (NSW)')).toEqual(expect.arrayContaining(['(NSW)', 'Trustee Act']))
    expect(hasNswStatuteCitation('the law of New South Wales')).toBe(true)
    expect(hasNswStatuteCitation('Succession Act 2006')).toBe(true)
    expect(hasNswStatuteCitation('Status of Children Act 1996')).toBe(true)
    expect(hasNswStatuteCitation('Probate and Administration Act 1898')).toBe(true)
  })
  it('passes jurisdiction-neutral text', () => {
    expect(hasNswStatuteCitation('construed in accordance with the law applying to my estate')).toBe(false)
    expect(findNswStatuteCitations('distributed in accordance with the intestacy rules')).toEqual([])
  })
})

// ── (a) NSW byte-identical regression ─────────────────────────────────────────
// Snapshots are generated from the CURRENT renderWillText before the generic wiring
// lands, then must remain unchanged after it. Any drift in NSW output fails here.

describe('(a) NSW output is byte-identical (snapshot regression)', () => {
  for (const [name, make] of Object.entries(FIXTURES)) {
    it(`NSW ${name} Will is unchanged`, () => {
      const text = renderWillText(make('NSW'))
      expect(text).toMatchSnapshot()
    })
    it(`NSW ${name} Will still carries its NSW statutory references`, () => {
      const text = renderWillText(make('NSW'))
      // NSW Wills SHOULD keep the NSW statutes — proves the nsw path was not neutralised.
      expect(hasNswStatuteCitation(text)).toBe(true)
    })
  }
})

// ── (b) Non-NSW Wills contain no NSW statutory references ─────────────────────

describe('(b) non-NSW Wills contain no NSW statutory references', () => {
  for (const state of NON_NSW_STATES) {
    for (const [name, make] of Object.entries(FIXTURES)) {
      it(`${state} ${name} Will has no NSW statute leak`, () => {
        const text = renderWillText(make(state))
        const found = findNswStatuteCitations(text)
        expect(found, `leaked: ${found.join(', ')}`).toEqual([])
      })
    }
  }
})

// ── (c) Variables render correctly in a generic Will ──────────────────────────

describe('(c) variables render in a generic-clause Will', () => {
  it('vesting age, survivorship days, and residuary shares all substitute', () => {
    const form = baseFormData({
      personalDetails: basePerson({ state: 'VIC' }),
      survivorshipDays: '45',
      childrenData: {
        hasChildren: 'yes',
        children: [{ id: '1', firstName: 'Tom', lastName: 'Smith', dateOfBirth: '2020-01-01', isDependent: true }],
        guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
        ageOfVesting: '25',
      },
      beneficiariesData: {
        people: [personBeneficiary('Tom Smith', '60', 'Child'), personBeneficiary('Amy Smith', '40', 'Child')],
        charities: [],
      },
    })
    const text = renderWillText(form)
    expect(text).not.toContain('{{') // no unresolved template variables
    expect(text).toContain('age of 25 years') // vesting_age
    expect(text).toContain('survive me by at least 45 days') // survivorship_days
    expect(text).toContain('60% to Tom Smith') // residuary share
    expect(text).toContain('40% to Amy Smith')
  })
})

// ── WA: ending of marriage may revoke the whole Will (review-only) ────────────

describe('WA marriage-revocation review flag', () => {
  const waMarried = baseFormData({
    personalDetails: basePerson({ state: 'WA', maritalStatus: 'married' }),
    spouseDetails: { firstName: 'Mary', middleName: '', lastName: 'Smith', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' },
    beneficiariesData: { people: [personBeneficiary('Mary Smith', '100', 'Spouse')], charities: [] },
  })

  it('flags WA_MARRIAGE_REVOCATION at REVIEW_RECOMMENDED (does not block generation)', () => {
    const flags = assessComplexityFlags(waMarried)
    const flag = flags.find((f) => f.code === 'WA_MARRIAGE_REVOCATION')
    expect(flag?.severity).toBe('REVIEW_RECOMMENDED')
    // REVIEW_RECOMMENDED must NOT escalate to SOLICITOR_REQUIRED (which would block assembly).
    expect(maxSeverity(flags)).not.toBe('SOLICITOR_REQUIRED')
  })

  it('does not flag a WA single testator', () => {
    const waSingle = baseFormData({ personalDetails: basePerson({ state: 'WA', maritalStatus: 'single' }), beneficiariesData: { people: [personBeneficiary('James Smith', '100', 'Friend')], charities: [] } })
    expect(assessComplexityFlags(waSingle).some((f) => f.code === 'WA_MARRIAGE_REVOCATION')).toBe(false)
  })

  it('does not flag a married testator outside WA', () => {
    const vicMarried = baseFormData({ personalDetails: basePerson({ state: 'VIC', maritalStatus: 'married' }), beneficiariesData: { people: [personBeneficiary('Mary Smith', '100', 'Spouse')], charities: [] } })
    expect(assessComplexityFlags(vicMarried).some((f) => f.code === 'WA_MARRIAGE_REVOCATION')).toBe(false)
  })

  it('applyWaMarriageReview adds/removes the reason without clobbering others', () => {
    const other = 'some other review reason'
    const added = applyWaMarriageReview([other], true)
    expect(added.reasons).toContain(WA_MARRIAGE_REVOCATION_REVIEW_REASON)
    expect(added.reasons).toContain(other)
    expect(added.needsReview).toBe(true)

    const removed = applyWaMarriageReview(added.reasons, false)
    expect(removed.reasons).not.toContain(WA_MARRIAGE_REVOCATION_REVIEW_REASON)
    expect(removed.reasons).toContain(other)

    // Idempotent: applying twice does not duplicate the reason.
    const twice = applyWaMarriageReview(added.reasons, true)
    expect(twice.reasons.filter((r) => r === WA_MARRIAGE_REVOCATION_REVIEW_REASON)).toHaveLength(1)
  })
})

// ── (d) Idempotence ───────────────────────────────────────────────────────────

describe('(d) rendering the same Will twice is identical', () => {
  for (const state of ['NSW', ...NON_NSW_STATES]) {
    it(`${state} full-feature Will is idempotent`, () => {
      const form = fixtureFullFeature(state)
      expect(renderWillText(form)).toBe(renderWillText(form))
    })
  }
})
