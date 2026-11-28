/**
 * Property/invariant tests over a GENERATED combination matrix (section 4 of the
 * wizard safety-net spec). Rather than hand-writing each path, we build valid wills
 * across state × relationship × children × executors × extras and assert the invariants
 * that must hold for EVERY generated Will.
 *
 * Covers (offline, via renderWillText — the DB assembleWillDocument path is not unit-
 * testable without creds, same as the rest of the suite):
 *   - no unresolved {{var}}, "undefined", "null", "NaN" or "[object" in the output
 *   - contiguous clause numbering
 *   - every person entered appears by name
 *   - deterministic: same input twice → identical output
 *   - non-NSW output has no NSW statutory references; the always-on trust + trustee
 *     clauses and a vesting age are present
 *   - post-render validation passes
 *
 * Run:  npx vitest run app/will/new/__tests__/generation-invariants.test.ts
 */

import { describe, it, expect } from 'vitest'
import { renderWillText } from '../_render'
import { validateRenderedText } from '../_validate'
import { findNswStatuteCitations } from '../_jurisdiction'
import type { WillFormData } from '../_types'

// ── Dimensions ────────────────────────────────────────────────────────────────

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] as const
const RELATIONSHIPS = ['single', 'married'] as const // partner on/off (de facto = domestic_partner, same shape)
const CHILDREN = ['none', 'minor', 'adult'] as const
const EXECUTORS = ['sole', 'substitute'] as const
// Extras bundles: gifts, pets, overseas(off — SOLICITOR_REQUIRED blocks assembly but render still asserts), charity
const EXTRAS = ['plain', 'gifts', 'pets', 'charity'] as const

interface Combo {
  state: string
  relationship: (typeof RELATIONSHIPS)[number]
  children: (typeof CHILDREN)[number]
  executors: (typeof EXECUTORS)[number]
  extras: (typeof EXTRAS)[number]
}

function* matrix(): Generator<Combo> {
  for (const state of STATES)
    for (const relationship of RELATIONSHIPS)
      for (const children of CHILDREN)
        for (const executors of EXECUTORS)
          for (const extras of EXTRAS)
            yield { state, relationship, children, executors, extras }
}

// ── Build a valid will from a combo ─────────────────────────────────────────────

const NAMES = {
  testator: 'Jane Middle Smith',
  spouse: 'Mary Partner Smith',
  exec1: 'Robert Executor Smith',
  exec2: 'Sarah Substitute Jones',
  minorChild: 'Tom Child Smith',
  adultChild: 'Alice Adult Smith',
  guardian: 'Helen Guardian Jones',
  benefic: 'James Beneficiary Brown',
  giftRecipient: 'Nina Gift Lee',
  charity: 'Example Charity Ltd',
}

function makeWill(c: Combo): WillFormData {
  const married = c.relationship === 'married'
  const children =
    c.children === 'none'
      ? []
      : c.children === 'minor'
        ? [{ id: 'c1', firstName: 'Tom', middleName: 'Child', lastName: 'Smith', dateOfBirth: '2020-01-01', isDependent: true } as never]
        : [{ id: 'c1', firstName: 'Alice', middleName: 'Adult', lastName: 'Smith', dateOfBirth: '1998-01-01', isDependent: false } as never]

  // Beneficiaries total 100. Add a charity in the 'charity' extras bundle.
  const people = [{ id: 'b1', name: NAMES.benefic, relationship: 'Friend', percentage: c.extras === 'charity' ? '60' : '100', substituteBeneficiary: '' }]
  const charities = c.extras === 'charity'
    ? [{ id: 'ch1', name: NAMES.charity, abn: '', percentage: '40', substituteBeneficiary: '', charityPartnerId: null }]
    : []

  const specificGifts = c.extras === 'gifts'
    ? [
        { id: 'g1', type: 'item' as const, description: 'Gold watch', amount: '', recipientName: NAMES.giftRecipient, recipientRelationship: 'Niece', substituteBeneficiary: '' },
        { id: 'g2', type: 'cash' as const, description: '', amount: '5000', recipientName: NAMES.giftRecipient, recipientRelationship: 'Niece', substituteBeneficiary: '' },
      ]
    : []

  return {
    willId: null,
    personalDetails: {
      firstName: 'Jane', middleName: 'Middle', lastName: 'Smith', dateOfBirth: '1980-01-01',
      addressLine1: '42 Test St', suburb: 'Townsville', state: c.state, postcode: '2000',
      phoneMobile: '0400000000', email: 'jane@example.com', occupation: 'Teacher',
      maritalStatus: married ? 'married' : 'single', previousWill: 'no', previousWillLocation: '',
    },
    spouseDetails: married
      ? { firstName: 'Mary', middleName: 'Partner', lastName: 'Smith', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' }
      : { firstName: '', middleName: '', lastName: '', dateOfBirth: '', addressLine1: '', suburb: '', state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '' },
    childrenData: {
      hasChildren: c.children === 'none' ? 'no' : 'yes',
      children,
      guardian: c.children === 'minor'
        ? { firstName: 'Helen', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' }
        : { firstName: '', lastName: '', relationship: '', phone: '', email: '' },
      ageOfVesting: '25',
    },
    executorsData: {
      primary: { firstName: 'Robert', lastName: 'Smith', relationship: 'Sibling', phone: '', email: '', address: '' },
      hasAlternate: c.executors === 'substitute',
      alternate: c.executors === 'substitute'
        ? { firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend', phone: '', email: '', address: '' }
        : { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' },
    },
    assets: [],
    beneficiariesData: { people, charities },
    specificGifts,
    triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false },
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    survivorshipDays: '30',
    petCare: c.extras === 'pets'
      ? { hasPets: 'yes', petName: 'Goldie', petDescription: 'golden retriever', caregiverName: 'Catherine Brown', caregiverRelationship: 'Sister', careFundAmount: '2000' }
      : { hasPets: 'no', petName: '', petDescription: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    lifeInterest: { enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '', condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '' },
    personalWishes: { funeralType: '', funeralRestingPlace: '', funeralAdditionalWishes: '', hasFuneralPlan: false, funeralPlanDetails: '' },
  }
}

function clauseNumbers(text: string): number[] {
  return [...text.matchAll(/^(\d+)\.\s+[A-Z]/gm)].map((m) => parseInt(m[1], 10))
}

// ── Invariants across the whole matrix ──────────────────────────────────────────

describe('Will-generation invariants (generated matrix)', () => {
  const combos = [...matrix()]

  it(`matrix is non-trivial (${8 * 2 * 3 * 2 * 4} combinations)`, () => {
    expect(combos.length).toBe(8 * 2 * 3 * 2 * 4)
  })

  it('no output contains unresolved variables or junk tokens', () => {
    for (const c of combos) {
      const text = renderWillText(makeWill(c))
      const label = JSON.stringify(c)
      expect(text, label).not.toMatch(/\{\{/)
      expect(text, label).not.toContain('undefined')
      expect(text, label).not.toContain('NaN')
      expect(text, label).not.toContain('[object')
      expect(text, label).not.toMatch(/\bnull\b/)
      // No literal markdown emphasis markers in the issued Will text.
      expect(text, label).not.toContain('**')
    }
  })

  it('post-render validation passes for every combination', () => {
    for (const c of combos) {
      const result = validateRenderedText(renderWillText(makeWill(c)))
      expect(result.valid, `${JSON.stringify(c)} → ${result.errors.join('; ')}`).toBe(true)
    }
  })

  it('clause numbering is contiguous from 1 for every combination', () => {
    for (const c of combos) {
      const nums = clauseNumbers(renderWillText(makeWill(c)))
      expect(nums[0], JSON.stringify(c)).toBe(1)
      for (let i = 1; i < nums.length; i++) {
        expect(nums[i], `${JSON.stringify(c)} gap at index ${i}`).toBe(nums[i - 1] + 1)
      }
    }
  })

  it('every person entered appears by name', () => {
    for (const c of combos) {
      const fd = makeWill(c)
      const text = renderWillText(fd)
      const label = JSON.stringify(c)
      expect(text, label).toContain('Robert Smith') // primary executor
      if (c.executors === 'substitute') expect(text, label).toContain('Sarah Jones')
      // residuary beneficiary
      expect(text, label).toContain(NAMES.benefic)
      if (c.extras === 'charity') expect(text, label).toContain(NAMES.charity)
      if (c.extras === 'gifts') expect(text, label).toContain(NAMES.giftRecipient)
      if (c.children !== 'none') {
        const childName = c.children === 'minor' ? 'Tom Smith' : 'Alice Smith'
        expect(text, label).toContain(childName)
      }
      if (c.children === 'minor') expect(text, label).toContain('Helen Jones') // guardian
      if (c.relationship === 'married') expect(text, label).toContain('Mary Smith')
    }
  })

  it('non-NSW Wills contain no NSW statutory references; NSW Wills do', () => {
    for (const c of combos) {
      const text = renderWillText(makeWill(c))
      const leaks = findNswStatuteCitations(text)
      if (c.state === 'NSW') expect(leaks.length, JSON.stringify(c)).toBeGreaterThan(0)
      else expect(leaks, `${JSON.stringify(c)} leaked: ${leaks.join(', ')}`).toEqual([])
    }
  })

  it('every Will includes the (always-on) under-vesting-age trust + trustee clauses and a vesting age', () => {
    for (const c of combos) {
      const text = renderWillText(makeWill(c)).toUpperCase()
      const label = JSON.stringify(c)
      expect(text, label).toContain('TRUST FOR BENEFICIARIES UNDER THE VESTING AGE')
      expect(text, label).toContain('TRUSTEE POWERS')
      expect(text, label).toContain('ADVANCEMENT POWERS')
      expect(text, label).toMatch(/UNDER THE AGE OF \d+ YEARS/)
    }
  })

  it('generation is deterministic for every combination', () => {
    for (const c of combos) {
      const fd = makeWill(c)
      expect(renderWillText(fd), JSON.stringify(c)).toBe(renderWillText(fd))
    }
  })
})
