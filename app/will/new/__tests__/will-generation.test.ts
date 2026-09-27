/**
 * Automated tests for NSW Will generation — validation, rendering, and complexity screening.
 *
 * Covers the 8 required test cases (A–H) plus regression tests for the
 * specific defects fixed in this release.
 *
 * Run:  npx vitest run app/will/new/__tests__/will-generation.test.ts
 */

import { describe, it, expect } from 'vitest'
import { validateWillForGeneration, validateRenderedText } from '../_validate'
import { renderWillText } from '../_render'
import { assessComplexityFlags, maxSeverity } from '../_complexity'
import { resolveSubstituteBeneficiaryText } from '../_types'
import type { WillFormData } from '../_types'

// ── Base fixture helpers ──────────────────────────────────────────────────────

function basePerson(overrides: Partial<WillFormData['personalDetails']> = {}): WillFormData['personalDetails'] {
  return {
    firstName: 'Jane',
    middleName: '',
    lastName: 'Smith',
    dateOfBirth: '1980-01-01',
    addressLine1: '42 Test Street',
    suburb: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    phoneMobile: '0400000000',
    email: 'jane@example.com',
    occupation: 'Teacher',
    maritalStatus: 'single',
    previousWill: 'no',
    previousWillLocation: '',
    ...overrides,
  }
}

function baseExecutor(overrides: Partial<WillFormData['executorsData']['primary']> = {}): WillFormData['executorsData']['primary'] {
  return {
    firstName: 'Robert',
    lastName: 'Smith',
    relationship: 'Sibling',
    phone: '',
    email: '',
    address: '',
    ...overrides,
  }
}

function emptyExecutor() {
  return { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' }
}

function personBeneficiary(name: string, pct: string, rel = 'Friend'): WillFormData['beneficiariesData']['people'][number] {
  return { id: '1', name, relationship: rel, percentage: pct, substituteBeneficiary: '' }
}

function baseTriageFlags(): WillFormData['triageFlags'] {
  return {
    hasBusinessInterest: false,
    hasBlendedFamily: false,
    hasExclusionIntent: false,
    hasVulnerableBeneficiary: false,
    hasBeneficiaryFinancialChallenges: false,
    hasComplexTrusts: false,
  }
}

function emptyChildren(): WillFormData['childrenData'] {
  return {
    hasChildren: 'no',
    children: [],
    guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' },
    ageOfVesting: '18',
  }
}

function baseFormData(overrides: Partial<WillFormData> = {}): WillFormData {
  return {
    willId: null,
    personalDetails: basePerson(),
    spouseDetails: {
      firstName: '', middleName: '', lastName: '', dateOfBirth: '',
      addressLine1: '', suburb: '', state: '', postcode: '',
      phoneMobile: '', email: '', occupation: '',
      previousWill: '', previousWillLocation: '',
    },
    childrenData: emptyChildren(),
    executorsData: {
      primary: baseExecutor(),
      hasAlternate: false,
      alternate: emptyExecutor(),
    },
    assets: [],
    beneficiariesData: { people: [], charities: [] },
    specificGifts: [],
    triageFlags: baseTriageFlags(),
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    survivorshipDays: '30',
    petCare: { hasPets: 'no', description: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    lifeInterest: {
      enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '',
      condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '',
    },
    personalWishes: {
      funeralType: '', funeralRestingPlace: '', funeralAdditionalWishes: '',
      hasFuneralPlan: false, funeralPlanDetails: '',
    },
    ...overrides,
  }
}

// ── CASE A: Simple Will ──────────────────────────────────────────────────────

describe('Case A — Simple Will (1 executor, 1 backup, 100% to one beneficiary)', () => {
  const formData = baseFormData({
    executorsData: {
      primary: baseExecutor(),
      hasAlternate: true,
      alternate: baseExecutor({ firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend' }),
    },
    beneficiariesData: {
      people: [personBeneficiary('James Smith', '100', 'Friend')],
      charities: [],
    },
  })

  it('passes pre-render validation', () => {
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('renders without 0% output or empty bullets', () => {
    const text = renderWillText(formData)
    expect(text).not.toMatch(/0% to/)
    expect(text).not.toMatch(/- 0%/)
    expect(text).not.toMatch(/^- $/m)
    expect(text).not.toContain('undefined')
  })

  it('renders natural language for single 100% beneficiary (no percentage list)', () => {
    const text = renderWillText(formData)
    expect(text).toContain('I give the whole of the rest and residue')
    expect(text).toContain('James Smith')
    expect(text).not.toMatch(/100% to/)
  })

  it('passes post-render text validation', () => {
    const text = renderWillText(formData)
    const result = validateRenderedText(text)
    expect(result.valid).toBe(true)
  })

  it('includes no complexity flags', () => {
    const flags = assessComplexityFlags(formData)
    expect(flags).toHaveLength(0)
    expect(maxSeverity(flags)).toBeNull()
  })
})

// ── CASE B: Multiple residuary beneficiaries ─────────────────────────────────

describe('Case B — Multiple beneficiaries (40/30/30)', () => {
  const formData = baseFormData({
    beneficiariesData: {
      people: [
        personBeneficiary('Alice Brown', '40', 'Child'),
        personBeneficiary('Bob Brown', '30', 'Child'),
        personBeneficiary('Carol Brown', '30', 'Child'),
      ],
      charities: [],
    },
  })

  it('passes pre-render validation', () => {
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
  })

  it('renders all three beneficiaries', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Alice Brown')
    expect(text).toContain('Bob Brown')
    expect(text).toContain('Carol Brown')
  })

  it('retains percentage structure for multiple beneficiaries', () => {
    const text = renderWillText(formData)
    expect(text).toContain('40%')
    expect(text).toContain('30%')
  })

  it('renders a percentage list (not name-only natural language) for multiple beneficiaries', () => {
    const text = renderWillText(formData)
    // Multiple beneficiaries produce a percentage list
    expect(text).toContain('40%')
    expect(text).toContain('30%')
    // Single-beneficiary natural-language branch uses "absolutely" without a list
    // — for multiple beneficiaries the text should NOT have "to Alice Brown absolutely"
    expect(text).not.toContain('to Alice Brown absolutely')
  })
})

// ── CASE C: Invalid total ────────────────────────────────────────────────────

describe('Case C — Invalid total (40+30+20 = 90%)', () => {
  const formData = baseFormData({
    beneficiariesData: {
      people: [
        personBeneficiary('Alice', '40'),
        personBeneficiary('Bob', '30'),
        personBeneficiary('Carol', '20'),
      ],
      charities: [],
    },
  })

  it('fails pre-render validation with correct error message', () => {
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('90.0%'))).toBe(true)
    expect(result.errors.some((e) => e.includes('100%'))).toBe(true)
  })
})

// ── CASE D: Empty beneficiary slots ─────────────────────────────────────────

describe('Case D — One active beneficiary + empty slots', () => {
  const formData = baseFormData({
    beneficiariesData: {
      people: [
        personBeneficiary('James Smith', '100', 'Friend'),
        // Empty slots simulating unfilled rows
        { id: '2', name: '', relationship: '', percentage: '', substituteBeneficiary: '' },
        { id: '3', name: '', relationship: '', percentage: '0', substituteBeneficiary: '' },
        { id: '4', name: '  ', relationship: '', percentage: '0', substituteBeneficiary: '' },
      ],
      charities: [],
    },
  })

  it('passes pre-render validation (empty slots are non-active)', () => {
    // Empty slots with no name AND no percentage are not active — no error
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
  })

  it('renders only the named beneficiary — empty slots absent', () => {
    const text = renderWillText(formData)
    expect(text).toContain('James Smith')
    expect(text).not.toMatch(/0% to/)
    expect(text).not.toMatch(/% to\s*\(/)
    expect(text).not.toMatch(/% to\s*\./)
    // Count beneficiary lines
    const matches = (text.match(/- \d+% to /g) || []).length
    expect(matches).toBe(0) // single beneficiary uses natural language, not a list
  })

  it('passes post-render text validation', () => {
    const text = renderWillText(formData)
    const result = validateRenderedText(text)
    expect(result.valid).toBe(true)
  })
})

// ── CASE E: Executor fallback ─────────────────────────────────────────────────

describe('Case E — Primary + backup executor', () => {
  const formData = baseFormData({
    executorsData: {
      primary: baseExecutor({ firstName: 'Robert', lastName: 'Smith' }),
      hasAlternate: true,
      alternate: baseExecutor({ firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend' }),
    },
    beneficiariesData: {
      people: [personBeneficiary('James Smith', '100')],
      charities: [],
    },
  })

  it('passes validation with both executors', () => {
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
  })

  it('renders primary executor appointment', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Robert Smith')
    expect(text.toLowerCase()).toContain('executor')
  })

  it('renders alternate executor as fallback', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Sarah Jones')
    expect(text.toLowerCase()).toContain('alternate')
  })
})

// ── CASE F: Complexity flag — overseas property ───────────────────────────────

describe('Case F — Complexity flag (overseas asset)', () => {
  const formData = baseFormData({
    assetsOutsideAustralia: true,
    otherJurisdictions: 'United Kingdom',
    beneficiariesData: {
      people: [personBeneficiary('James Smith', '100')],
      charities: [],
    },
  })

  it('generates OVERSEAS_ASSETS flag at SOLICITOR_REQUIRED severity', () => {
    const flags = assessComplexityFlags(formData)
    const flag = flags.find((f) => f.code === 'OVERSEAS_ASSETS')
    expect(flag).toBeDefined()
    expect(flag?.severity).toBe('SOLICITOR_REQUIRED')
  })

  it('maxSeverity returns SOLICITOR_REQUIRED', () => {
    const flags = assessComplexityFlags(formData)
    expect(maxSeverity(flags)).toBe('SOLICITOR_REQUIRED')
  })

  it('validation still passes (generation is allowed with the flag present)', () => {
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
  })
})

// ── CASE H: Unused module (no specific gifts, no pets, no children) ───────────

describe('Case H — Unused modules omitted', () => {
  const formData = baseFormData({
    beneficiariesData: {
      people: [personBeneficiary('James Smith', '100')],
      charities: [],
    },
    specificGifts: [],
    petCare: { hasPets: 'no', description: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
  })

  it('does not render specific gifts section when no gifts', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('SPECIFIC GIFTS')
  })

  it('does not render pet care section when hasPets=no', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('CARE OF PETS')
  })

  it('does not render children section when hasChildren=no', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('TESTAMENTARY TRUST')
  })

  it('passes post-render validation', () => {
    const text = renderWillText(formData)
    const result = validateRenderedText(text)
    expect(result.valid).toBe(true)
  })
})

// ── Regression: named 0% beneficiary should be blocked ───────────────────────

describe('Regression — named beneficiary with 0% share', () => {
  it('fails validation when a named beneficiary has 0% share', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [
          personBeneficiary('James Smith', '100'),
          personBeneficiary('Ghost Person', '0'),
        ],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Ghost Person'))).toBe(true)
  })
})

// ── Regression: template variable leak detection ─────────────────────────────

describe('Regression — post-render validation catches artefacts', () => {
  it('flags unresolved {{variable}} in rendered text', () => {
    const result = validateRenderedText('I give my estate to {{beneficiary_name}} absolutely.')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('{{'))).toBe(true)
  })

  it('flags 0% beneficiary lines in rendered text', () => {
    const result = validateRenderedText('- 0% to James Smith.')
    expect(result.valid).toBe(false)
  })

  it('flags "undefined" in rendered text', () => {
    const result = validateRenderedText('I give my estate to undefined.')
    expect(result.valid).toBe(false)
  })

  it('passes clean text', () => {
    const result = validateRenderedText('I give the whole of my estate to James Smith absolutely.')
    expect(result.valid).toBe(true)
  })
})

// ── Validation edge cases ─────────────────────────────────────────────────────

describe('Validation — missing executor', () => {
  it('fails when primary executor has no name', () => {
    const formData = baseFormData({
      executorsData: {
        primary: emptyExecutor(),
        hasAlternate: false,
        alternate: emptyExecutor(),
      },
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100')],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('executor'))).toBe(true)
  })
})

describe('Validation — no beneficiaries', () => {
  it('fails when no active beneficiaries exist', () => {
    const formData = baseFormData({
      beneficiariesData: { people: [], charities: [] },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('beneficiary'))).toBe(true)
  })
})

// ── Complexity — blended family ───────────────────────────────────────────────

describe('Complexity — blended family flag', () => {
  it('generates BLENDED_FAMILY at REVIEW_RECOMMENDED severity', () => {
    const formData = baseFormData({
      triageFlags: { ...baseTriageFlags(), hasBlendedFamily: true },
      beneficiariesData: { people: [personBeneficiary('James', '100')], charities: [] },
    })
    const flags = assessComplexityFlags(formData)
    const flag = flags.find((f) => f.code === 'BLENDED_FAMILY')
    expect(flag?.severity).toBe('REVIEW_RECOMMENDED')
    expect(maxSeverity(flags)).toBe('REVIEW_RECOMMENDED')
  })
})

// ── Phase 14 test cases ───────────────────────────────────────────────────────

// TEST 1 — Basic single beneficiary
describe('Phase 14 Test 1 — Basic single beneficiary', () => {
  const formData = baseFormData({
    personalDetails: basePerson({ maritalStatus: 'married' }),
    executorsData: {
      primary: baseExecutor(),
      hasAlternate: true,
      alternate: baseExecutor({ firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend' }),
    },
    beneficiariesData: { people: [personBeneficiary('James Smith', '100', 'Spouse')], charities: [] },
  })

  it('passes validation', () => {
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })

  it('renders natural language residue (no percentage list)', () => {
    const text = renderWillText(formData)
    expect(text).toContain('I give the whole of the rest and residue')
    expect(text).not.toMatch(/100% to/)
  })

  it('includes executor powers', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('EXECUTOR POWERS')
  })

  it('does not render trustee powers when no trust arises', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('TRUSTEE POWERS')
    expect(text.toUpperCase()).not.toContain('TRUSTEE APPOINTMENT')
  })

  it('does not render digital assets definition when no digital assets', () => {
    const text = renderWillText(formData)
    // Approved DEFN-01 does not include "Digital Assets" definition
    expect(text).not.toMatch(/Digital Assets.*means/)
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 2 — Specific property gift
describe('Phase 14 Test 2 — Specific property gift', () => {
  const formData = baseFormData({
    specificGifts: [
      { id: '1', type: 'item', description: 'Gold ring', amount: '', recipientName: 'Alice Brown', recipientRelationship: 'Niece', substituteBeneficiary: '' },
    ],
    beneficiariesData: { people: [personBeneficiary('James Smith', '100', 'Friend')], charities: [] },
  })

  it('renders the specific gift', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Gold ring')
    expect(text).toContain('Alice Brown')
  })

  it('includes common gift/survivorship clause', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('SURVIVORSHIP AND GIFT RULES')
  })

  it('lapsed gifts fall into residue per common gift rules', () => {
    const text = renderWillText(formData)
    expect(text).toContain('lapsed gift shall fall into the residue')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 3 — Pecuniary gift
describe('Phase 14 Test 3 — Pecuniary gift', () => {
  const formData = baseFormData({
    specificGifts: [
      { id: '1', type: 'cash', description: '', amount: '5000', recipientName: 'Bob Brown', recipientRelationship: 'Sibling', substituteBeneficiary: '' },
    ],
    beneficiariesData: { people: [personBeneficiary('James Smith', '100', 'Friend')], charities: [] },
  })

  it('renders the cash gift with formatted amount', () => {
    const text = renderWillText(formData)
    expect(text).toContain('$5,000')
    expect(text).toContain('Bob Brown')
  })

  it('includes common gift provisions', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('SURVIVORSHIP AND GIFT RULES')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 4 — Minor beneficiary / age 25 trust
describe('Phase 14 Test 4 — Minor beneficiary / vesting age 25', () => {
  const formData = baseFormData({
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: '1', name: 'Tom Smith', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    beneficiariesData: { people: [personBeneficiary('Tom Smith', '100', 'Child')], charities: [] },
  })

  it('renders testamentary trust', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('MINOR BENEFICIARY TRUST')
  })

  it('renders advancement powers', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('ADVANCEMENT POWERS')
  })

  it('renders trustee powers when trust arises', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('TRUSTEE POWERS')
    expect(text.toUpperCase()).toContain('TRUSTEE APPOINTMENT')
  })

  it('trust clause includes vesting-age failure path', () => {
    const text = renderWillText(formData)
    expect(text).toContain('dies before attaining the vesting age')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 5 — Pet with care provision
describe('Phase 14 Test 5 — Pet with care provision', () => {
  const formData = baseFormData({
    petCare: { hasPets: 'yes', description: 'Golden Retriever', caregiverName: 'Catherine Brown', caregiverRelationship: 'Sister', careFundAmount: '2000' },
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('renders pet clause with approved mechanism', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Catherine Brown')
    expect(text).toContain('$2,000')
  })

  it('includes fallback if carer cannot accept', () => {
    const text = renderWillText(formData)
    expect(text).toContain('unwilling or unable to accept custody')
  })

  it('does not use ambiguous "set aside" language without mechanism', () => {
    const text = renderWillText(formData)
    // The approved PET-01 gives money directly to carer, not "sets it aside"
    expect(text).not.toMatch(/set aside.*for.*care/i)
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 6 — No pet
describe('Phase 14 Test 6 — No pet', () => {
  const formData = baseFormData({
    petCare: { hasPets: 'no', description: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('renders no pet clause', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('CARE OF PETS')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 7 — Digital assets enabled
describe('Phase 14 Test 7 — Digital assets enabled', () => {
  const formData = baseFormData({
    assets: [
      {
        id: '1', assetType: 'digital_asset', ownershipType: 'sole',
        propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '',
        fundName: '', memberNumber: '', companyName: '', numberOfShares: '',
        insurerName: '', policyNumber: '', coverAmount: '',
        make: '', model: '', year: '', rego: '',
        accessLocation: 'password manager on laptop',
        description: 'Crypto wallet', otherValue: '',
        hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
      },
    ],
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('renders digital assets clause', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('DIGITAL ASSETS')
  })

  it('does not include access location in Will body', () => {
    const text = renderWillText(formData)
    expect(text).not.toContain('password manager on laptop')
    expect(text).not.toContain('passwords and access credentials')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 8 — Digital assets not enabled
describe('Phase 14 Test 8 — Digital assets not enabled', () => {
  const formData = baseFormData({
    assets: [],
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('does not render digital assets clause', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('DIGITAL ASSETS')
  })

  it('does not render digital assets definition', () => {
    const text = renderWillText(formData)
    // Approved DEFN-01 does not include a "Digital Assets" definition
    expect(text).not.toMatch(/[""]Digital [Aa]ssets[""].*means/)
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 9 — Important document location NOT in Will body
describe('Phase 14 Test 9 — Important documents not in Will', () => {
  const formData = baseFormData({
    importantDocumentsLocation: 'Safe at home, Mosman',
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('does not render important documents as a Will clause', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).not.toContain('IMPORTANT DOCUMENTS')
    expect(text).not.toContain('Safe at home')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 10 — Multiple residuary beneficiaries (40/30/30)
describe('Phase 14 Test 10 — Multiple residuary beneficiaries', () => {
  const formData = baseFormData({
    beneficiariesData: {
      people: [
        personBeneficiary('Alice Brown', '40', 'Child'),
        personBeneficiary('Bob Brown', '30', 'Child'),
        personBeneficiary('Carol Brown', '30', 'Child'),
      ],
      charities: [],
    },
  })

  it('passes validation', () => {
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })

  it('renders all three beneficiaries', () => {
    const text = renderWillText(formData)
    expect(text).toContain('Alice Brown')
    expect(text).toContain('Bob Brown')
    expect(text).toContain('Carol Brown')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 11 — Failed residuary total (40/30/20 = 90%)
describe('Phase 14 Test 11 — Failed residuary total', () => {
  it('blocks generation when total is 90%', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [
          personBeneficiary('Alice', '40'),
          personBeneficiary('Bob', '30'),
          personBeneficiary('Carol', '20'),
        ],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('90.0%'))).toBe(true)
  })
})

// TEST 12 — Complexity flag for overseas assets
describe('Phase 14 Test 12 — Complexity flag (overseas)', () => {
  it('generates OVERSEAS_ASSETS at SOLICITOR_REQUIRED', () => {
    const formData = baseFormData({
      assetsOutsideAustralia: true,
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const flags = assessComplexityFlags(formData)
    expect(flags.find((f) => f.code === 'OVERSEAS_ASSETS')?.severity).toBe('SOLICITOR_REQUIRED')
  })
})

// TEST 13 — Long / full-feature Will
describe('Phase 14 Test 13 — Long full-feature Will', () => {
  const formData = baseFormData({
    personalDetails: basePerson({ maritalStatus: 'married' }),
    spouseDetails: {
      firstName: 'Sarah', middleName: '', lastName: 'Smith', dateOfBirth: '',
      addressLine1: '', suburb: '', state: '', postcode: '',
      phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '',
    },
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: '1', name: 'Tom Smith', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Helen', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    executorsData: {
      primary: baseExecutor(),
      hasAlternate: true,
      alternate: baseExecutor({ firstName: 'Sarah', lastName: 'Jones', relationship: 'Friend' }),
    },
    specificGifts: [
      { id: '1', type: 'item', description: 'Gold watch', amount: '', recipientName: 'Alice Brown', recipientRelationship: 'Niece', substituteBeneficiary: '' },
      { id: '2', type: 'cash', description: '', amount: '10000', recipientName: 'Bob Brown', recipientRelationship: 'Brother', substituteBeneficiary: '' },
    ],
    beneficiariesData: {
      people: [personBeneficiary('Tom Smith', '100', 'Child')],
      charities: [],
    },
    petCare: { hasPets: 'yes', description: 'cat', caregiverName: 'Helen Jones', caregiverRelationship: 'Aunt', careFundAmount: '1000' },
    assets: [
      {
        id: '1', assetType: 'digital_asset', ownershipType: 'sole',
        propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '',
        fundName: '', memberNumber: '', companyName: '', numberOfShares: '',
        insurerName: '', policyNumber: '', coverAmount: '',
        make: '', model: '', year: '', rego: '',
        accessLocation: 'password manager',
        description: 'Bitcoin wallet', otherValue: '',
        hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
      },
    ],
    survivorshipDays: '30',
  })

  it('passes validation', () => {
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })

  it('includes all expected clauses', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('SPOUSE / PARTNER')
    expect(text.toUpperCase()).toContain('EXECUTORS')
    expect(text.toUpperCase()).toContain('CHILDREN')
    expect(text.toUpperCase()).toContain('DEBTS AND EXPENSES')
    expect(text.toUpperCase()).toContain('SPECIFIC GIFTS')
    expect(text.toUpperCase()).toContain('RESIDUARY ESTATE')
    expect(text.toUpperCase()).toContain('SURVIVORSHIP AND GIFT RULES')
    expect(text.toUpperCase()).toContain('MINOR BENEFICIARY TRUST')
    expect(text.toUpperCase()).toContain('ADVANCEMENT POWERS')
    expect(text.toUpperCase()).toContain('CARE OF PETS')
    expect(text.toUpperCase()).toContain('DIGITAL ASSETS')
    expect(text.toUpperCase()).toContain('EXECUTOR POWERS')
    expect(text.toUpperCase()).toContain('TRUSTEE POWERS')
    expect(text.toUpperCase()).toContain('TRUSTEE APPOINTMENT')
    expect(text.toUpperCase()).toContain('APPROPRIATION POWER')
    expect(text.toUpperCase()).toContain('DELEGATION POWER')
    expect(text.toUpperCase()).toContain('EXECUTOR INDEMNITY')
    expect(text.toUpperCase()).toContain('DEFINITIONS')
    expect(text.toUpperCase()).toContain('INTERPRETATION')
  })

  it('dynamic numbering produces no duplicate clause numbers', () => {
    const text = renderWillText(formData)
    const clauseNums = [...text.matchAll(/^(\d+)\. [A-Z]/gm)].map((m) => parseInt(m[1]))
    const unique = new Set(clauseNums)
    expect(clauseNums.length).toBe(unique.size)
  })

  it('clause numbers are sequential with no gaps', () => {
    const text = renderWillText(formData)
    const clauseNums = [...text.matchAll(/^(\d+)\. [A-Z]/gm)].map((m) => parseInt(m[1]))
    for (let i = 1; i < clauseNums.length; i++) {
      expect(clauseNums[i]).toBe(clauseNums[i - 1] + 1)
    }
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST 14 — Clause removal closes numbering gaps
describe('Phase 14 Test 14 — Clause removal renumbers correctly', () => {
  const withPets = baseFormData({
    petCare: { hasPets: 'yes', description: 'dog', caregiverName: 'Mary', caregiverRelationship: '', careFundAmount: '500' },
    beneficiariesData: { people: [personBeneficiary('James', '100')], charities: [] },
  })
  const withoutPets = baseFormData({
    petCare: { hasPets: 'no', description: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    beneficiariesData: { people: [personBeneficiary('James', '100')], charities: [] },
  })

  it('without pets: no gaps in clause numbering', () => {
    const text = renderWillText(withoutPets)
    const nums = [...text.matchAll(/^(\d+)\. [A-Z]/gm)].map((m) => parseInt(m[1]))
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBe(nums[i - 1] + 1)
    }
  })

  it('with pets: no gaps in clause numbering', () => {
    const text = renderWillText(withPets)
    const nums = [...text.matchAll(/^(\d+)\. [A-Z]/gm)].map((m) => parseInt(m[1]))
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBe(nums[i - 1] + 1)
    }
  })

  it('pet clause adds exactly one extra numbered clause', () => {
    const withText = renderWillText(withPets)
    const withoutText = renderWillText(withoutPets)
    const withNums = [...withText.matchAll(/^(\d+)\. [A-Z]/gm)]
    const withoutNums = [...withoutText.matchAll(/^(\d+)\. [A-Z]/gm)]
    expect(withNums.length).toBe(withoutNums.length + 1)
  })

  it('passes post-render validation in both cases', () => {
    expect(validateRenderedText(renderWillText(withPets)).valid).toBe(true)
    expect(validateRenderedText(renderWillText(withoutPets)).valid).toBe(true)
  })
})

// ── Tests A–L: QA/Fix pass ────────────────────────────────────────────────────

// TEST A — Substitute beneficiary __testator_children__
describe('Test A — Substitute beneficiary __testator_children__', () => {
  it('resolves to "my children, equally"', () => {
    expect(resolveSubstituteBeneficiaryText('__testator_children__')).toBe('my children, equally')
  })

  it('renders in Will as "my children, equally"', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{ ...personBeneficiary('Michael Smith', '100', 'Friend'), substituteBeneficiary: '__testator_children__' }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('my children, equally')
    expect(validateRenderedText(text).valid).toBe(true)
  })
})

// TEST B — Substitute beneficiary __their_children__ with name context
describe('Test B — Substitute beneficiary __their_children__ with name context', () => {
  it('resolves to named-possessive form when beneficiary name is provided', () => {
    expect(resolveSubstituteBeneficiaryText('__their_children__', 'Michael Smith')).toBe("Michael Smith's children, equally")
  })

  it('falls back to generic form when no name is provided', () => {
    expect(resolveSubstituteBeneficiaryText('__their_children__')).toBe("the beneficiary's children, equally")
  })

  it('renders "Michael Smith\'s children, equally" in Will — not the ambiguous "their children" form', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{ ...personBeneficiary('Michael Smith', '100', 'Friend'), substituteBeneficiary: '__their_children__' }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain("Michael Smith's children, equally")
    expect(text).not.toContain('their children, equally')
    expect(validateRenderedText(text).valid).toBe(true)
  })
})

// TEST C — Substitute beneficiary __other_beneficiaries__
describe('Test C — Substitute beneficiary __other_beneficiaries__', () => {
  it('resolves to remaining-beneficiaries text', () => {
    expect(resolveSubstituteBeneficiaryText('__other_beneficiaries__')).toContain('remaining beneficiaries')
  })

  it('renders in Will with remaining-beneficiaries wording', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [
          { ...personBeneficiary('Alice', '60', 'Child'), substituteBeneficiary: '__other_beneficiaries__' },
          personBeneficiary('Bob', '40', 'Child'),
        ],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('remaining beneficiaries')
    expect(validateRenderedText(text).valid).toBe(true)
  })
})

// TEST D — Custom substitute beneficiary name passes through unchanged
describe('Test D — Custom substitute beneficiary name', () => {
  it('passes a custom name unchanged', () => {
    expect(resolveSubstituteBeneficiaryText('David Smith')).toBe('David Smith')
  })

  it('renders custom substitute name in Will body', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{ ...personBeneficiary('Michael Smith', '100', 'Friend'), substituteBeneficiary: 'David Smith (Brother)' }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('David Smith (Brother)')
    expect(validateRenderedText(text).valid).toBe(true)
  })
})

// TEST E — Credential/access location must not appear in Will body
describe('Test E — Credential location removed from Will body', () => {
  const formData = baseFormData({
    assets: [{
      id: '1', assetType: 'digital_asset', ownershipType: 'sole',
      propertyAddress: '', estimatedValue: '', bankName: '', bsb: '', accountNumber: '',
      fundName: '', memberNumber: '', companyName: '', numberOfShares: '',
      insurerName: '', policyNumber: '', coverAmount: '',
      make: '', model: '', year: '', rego: '',
      accessLocation: 'password manager on my laptop',
      description: 'Crypto wallet', otherValue: '',
      hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
    }],
    beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
  })

  it('does not include access location in rendered Will body', () => {
    const text = renderWillText(formData)
    expect(text).not.toContain('password manager on my laptop')
    expect(text).not.toContain('passwords and access credentials')
  })

  it('digital assets clause still renders', () => {
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('DIGITAL ASSETS')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST F — "intestacy rules" orphan definition must not appear
describe('Test F — No orphan "intestacy rules" definition', () => {
  it('does not include "intestacy rules" in definitions (no operative clause uses this term)', () => {
    const formData = baseFormData({
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).not.toMatch(/["""]intestacy rules["""]/)
  })
})

// TEST G — Conditional definitions: vesting age and minor
describe('Test G — Conditional definitions render only when relevant clauses render', () => {
  it('includes "vesting age" and "minor" definitions when there are dependent children', () => {
    const formData = baseFormData({
      childrenData: {
        hasChildren: 'yes',
        children: [{ id: '1', name: 'Tom', dateOfBirth: '2020-01-01', isDependent: true }],
        guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
        ageOfVesting: '25',
      },
      beneficiariesData: { people: [personBeneficiary('Tom', '100', 'Child')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).toContain('"vesting age"')
    expect(text).toContain('"minor"')
  })

  it('omits "vesting age" and "minor" definitions when there are no dependent children', () => {
    const formData = baseFormData({
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).not.toContain('"vesting age"')
    expect(text).not.toContain('"minor"')
  })
})

// TEST H — Money formatting with comma separators
describe('Test H — Money formatting', () => {
  it('formats $10,000 cash gift with commas', () => {
    const formData = baseFormData({
      specificGifts: [{
        id: '1', type: 'cash', description: '', amount: '10000',
        recipientName: 'Bob Brown', recipientRelationship: 'Sibling', substituteBeneficiary: '',
      }],
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).toContain('$10,000')
    expect(text).not.toContain('$10000')
  })

  it('formats $2,000 pet care fund with commas', () => {
    const formData = baseFormData({
      petCare: { hasPets: 'yes', description: 'dog', caregiverName: 'Mary', caregiverRelationship: '', careFundAmount: '2000' },
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).toContain('$2,000')
    expect(text).not.toContain('$2000')
  })

  it('renders three-digit amounts without spurious commas', () => {
    const formData = baseFormData({
      specificGifts: [{
        id: '1', type: 'cash', description: '', amount: '500',
        recipientName: 'Bob Brown', recipientRelationship: '', substituteBeneficiary: '',
      }],
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).toContain('$500')
    expect(text).not.toContain('$500,')
  })
})

// TEST I — Guardian relationship label context
describe('Test I — Guardian relationship label context', () => {
  it('renders guardian relationship as the testator-relative label', () => {
    const formData = baseFormData({
      childrenData: {
        hasChildren: 'yes',
        children: [{ id: '1', name: 'Tom', dateOfBirth: '2020-01-01', isDependent: true }],
        guardian: { firstName: 'Catherine', lastName: 'Brown', relationship: 'Sister', phone: '', email: '' },
        ageOfVesting: '25',
      },
      beneficiariesData: { people: [personBeneficiary('Tom', '100', 'Child')], charities: [] },
    })
    const text = renderWillText(formData)
    expect(text).toContain('Catherine Brown (Sister)')
  })
})

// TEST J — Survivorship and trust interaction
describe('Test J — Survivorship and trust interaction', () => {
  const formData = baseFormData({
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: '1', name: 'Tom Smith', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    beneficiariesData: { people: [personBeneficiary('Tom Smith', '100', 'Child')], charities: [] },
  })

  it('trust clause holds property for minor beneficiary until vesting age', () => {
    const text = renderWillText(formData)
    expect(text).toContain("hold that beneficiary's entitlement")
    expect(text).toContain('until they attain the vesting age')
  })

  it('survivorship condition also applies to trust beneficiaries', () => {
    const text = renderWillText(formData)
    expect(text).toContain('survive me by at least 30 days')
  })

  it('trust clause includes fallback if minor dies before vesting age', () => {
    const text = renderWillText(formData)
    expect(text).toContain('dies before attaining the vesting age')
  })

  it('passes post-render validation', () => {
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// TEST K — Pet clause internal inconsistency documented
describe('Test K — Pet clause request/direction inconsistency (pending legal review)', () => {
  it('current PET-01 contains both precatory request and imperative direction language', () => {
    const formData = baseFormData({
      petCare: { hasPets: 'yes', description: 'Golden Retriever', caregiverName: 'Catherine Brown', caregiverRelationship: 'Sister', careFundAmount: '2000' },
      beneficiariesData: { people: [personBeneficiary('James Smith', '100')], charities: [] },
    })
    const text = renderWillText(formData)
    // Both phrases coexist — known inconsistency flagged APPROVED_LEGAL_TEXT_REQUIRED — PET_TRANSFER_MECHANICS
    expect(text).toContain('request (but do not legally require)')
    expect(text).toContain('I direct my Executor to transfer custody')
  })
})

// TEST L — Validator blocks credential location in Will body
describe('Test L — Validator catches credential location in Will body', () => {
  it('validateRenderedText rejects text containing credential location sentence', () => {
    const text = 'I have recorded the location of my passwords and access credentials in a separate document held at my safe.'
    const result = validateRenderedText(text)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('credential'))).toBe(true)
  })

  it('validateRenderedText passes Will text that does not contain credential location', () => {
    const text = 'I give my Executor the authority to access and manage all of my digital assets following my death.'
    const result = validateRenderedText(text)
    expect(result.valid).toBe(true)
  })
})

// ── QA Tests 1–12 ─────────────────────────────────────────────────────────────

// QA TEST 1 — Contradictory status: single testator with spouse beneficiary is blocked
describe('QA Test 1 — Single testator + spouse beneficiary is blocked', () => {
  it('blocks generation when maritalStatus=single and beneficiary relationship=Spouse', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [{ id: '1', name: 'James Smith', relationship: 'Spouse', percentage: '100', substituteBeneficiary: '' }],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.structured?.some((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')).toBe(true)
    expect(result.errors.some((e) => e.includes('James Smith'))).toBe(true)
  })

  it('error message names the person and explains the contradiction', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [{ id: '1', name: 'Alice Brown', relationship: 'Wife', percentage: '100', substituteBeneficiary: '' }],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    const err = result.structured?.find((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')
    expect(err?.message).toContain('single')
    expect(err?.message).toContain('Alice Brown')
    expect(err?.fieldPaths).toContain('personalDetails.maritalStatus')
  })
})

// QA TEST 2 — Valid: single testator with non-spousal beneficiary
describe('QA Test 2 — Single testator + friend beneficiary is valid', () => {
  it('allows generation when maritalStatus=single and beneficiary relationship=Friend', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })

  it('allows generation when maritalStatus=single and beneficiary relationship=Child', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [personBeneficiary('Tom Smith', '100', 'Child')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })
})

// QA TEST 3 — Valid: married testator with spouse beneficiary
describe('QA Test 3 — Married testator + spouse beneficiary is valid', () => {
  it('allows generation when maritalStatus=married and beneficiary relationship=Spouse', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'married' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Spouse')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })

  it('allows generation when maritalStatus=domestic_partner and beneficiary relationship=Partner', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'domestic_partner' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Partner')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })
})

// QA TEST 4 — Stale data: divorced testator retains old spouse label
describe('QA Test 4 — Divorced testator + stale spouse label is blocked', () => {
  it('blocks generation when maritalStatus=divorced and beneficiary relationship=Spouse', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'divorced' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Spouse')],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.structured?.some((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')).toBe(true)
  })

  it('blocks generation when maritalStatus=widowed and beneficiary relationship=Husband', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'widowed' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Husband')],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.structured?.some((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')).toBe(true)
  })

  it('allows separated testator to retain Spouse label (legal marriage still exists)', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'separated' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Spouse')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })
})

// QA TEST 5 — COMMON_GIFT_01 retained as approved universal module
describe('QA Test 5 — COMMON_GIFT_01 retained as approved universal module', () => {
  it('includes all four sub-sections even in a simple Will with no explicit class gifts', () => {
    // COMMON_GIFT_01 is an indivisible solicitor-approved module.
    // Intentionally retained as a universal clause even when no active class gift is present.
    const formData = baseFormData({
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text.toUpperCase()).toContain('SURVIVORSHIP AND GIFT RULES')
    expect(text).toContain('Survivorship')
    expect(text).toContain('Lapse of gifts')
    expect(text).toContain('Class gifts')
    expect(text).toContain('Uncertain order of death')
  })
})

// QA TEST 6 — "child"/"children" definition omitted when not referenced by any active clause
describe('QA Test 6 — "child"/"children" definition omitted when not referenced', () => {
  it('omits child/children definition in simple Will with no dependents and no children-sentinel', () => {
    // Unique anchor: the Status of Children Act reference only appears in the child/children definition.
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).not.toContain('Status of Children Act 1996')
  })
})

// QA TEST 7 — "child"/"children" definition included when active clause requires it
describe('QA Test 7 — "child"/"children" definition included when referenced', () => {
  it('includes child/children definition when Will has dependent children', () => {
    const formData = baseFormData({
      childrenData: {
        hasChildren: 'yes',
        children: [{ id: '1', name: 'Tom Smith', dateOfBirth: '2020-01-01', isDependent: true }],
        guardian: { firstName: 'Sarah', lastName: 'Jones', relationship: 'Sibling', phone: '', email: '' },
        ageOfVesting: '25',
      },
      beneficiariesData: {
        people: [personBeneficiary('Tom Smith', '100', 'Child')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('Status of Children Act 1996')
  })

  it('includes child/children definition when substitute beneficiary uses __testator_children__', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{ ...personBeneficiary('James Smith', '100', 'Friend'), substituteBeneficiary: '__testator_children__' }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('Status of Children Act 1996')
  })

  it('includes child/children definition when substitute beneficiary uses __their_children__', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{ ...personBeneficiary('James Smith', '100', 'Friend'), substituteBeneficiary: '__their_children__' }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('Status of Children Act 1996')
  })
})

// QA TEST 8 — No backup beneficiary is an explicitly valid state
describe('QA Test 8 — No backup beneficiary is valid', () => {
  it('generates successfully when substituteBeneficiary is empty', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(true)
    expect(validateRenderedText(renderWillText(formData)).valid).toBe(true)
  })
})

// QA TEST 9 — Named backup beneficiary renders in Will text
describe('QA Test 9 — Named backup beneficiary appears in Will fallback wording', () => {
  it('renders the named backup beneficiary in the residue clause', () => {
    const formData = baseFormData({
      beneficiariesData: {
        people: [{
          ...personBeneficiary('James Smith', '100', 'Friend'),
          substituteBeneficiary: 'Sarah Brown',
        }],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('Sarah Brown')
    expect(validateRenderedText(text).valid).toBe(true)
  })
})

// QA TEST 10 — Relationship consistency check covers executors, not just beneficiaries
describe('QA Test 10 — Relationship consistency check covers executors', () => {
  it('blocks generation when executor relationship is Spouse and testator is single', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      executorsData: {
        primary: baseExecutor({ relationship: 'Spouse' }),
        hasAlternate: false,
        alternate: emptyExecutor(),
      },
      beneficiariesData: {
        people: [personBeneficiary('Alice Brown', '100', 'Friend')],
        charities: [],
      },
    })
    const result = validateWillForGeneration(formData)
    expect(result.valid).toBe(false)
    expect(result.structured?.some((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')).toBe(true)
  })

  it('allows generation when executor relationship is Friend and testator is single', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      executorsData: {
        primary: baseExecutor({ relationship: 'Friend' }),
        hasAlternate: false,
        alternate: emptyExecutor(),
      },
      beneficiariesData: {
        people: [personBeneficiary('Alice Brown', '100', 'Friend')],
        charities: [],
      },
    })
    expect(validateWillForGeneration(formData).valid).toBe(true)
  })
})

// QA TEST 11 — Signing instructions do not instruct drawing a line through unused spaces
describe('QA Test 11 — "draw a line through unused space" instruction removed', () => {
  it('rendered Will text does not contain the removed draw-a-line instruction', () => {
    // The signing recommendation in DownloadWillButton.tsx no longer includes
    // "(3) do not leave any signature space blank — draw a line through any space you do not use".
    // Every signature field in the Will is required; there are no unused spaces.
    const formData = baseFormData({
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).not.toMatch(/draw a line through/i)
    expect(text).not.toMatch(/line through any.*unused.*space/i)
  })
})

// QA TEST 12 — Final token QA: rendered Will contains no forbidden tokens
describe('QA Test 12 — Final token QA: all Will variants pass post-render validation', () => {
  it('simple single Will (friend beneficiary) passes validateRenderedText', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Friend')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    const result = validateRenderedText(text)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('married Will (spouse beneficiary) passes validateRenderedText and contains correct preamble', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'married' }),
      beneficiariesData: {
        people: [personBeneficiary('James Smith', '100', 'Spouse')],
        charities: [],
      },
    })
    const text = renderWillText(formData)
    expect(text).toContain('being married')
    expect(validateRenderedText(text).valid).toBe(true)
  })

  it('relationship/status contradiction is caught before render, not after', () => {
    const formData = baseFormData({
      personalDetails: basePerson({ maritalStatus: 'single' }),
      beneficiariesData: {
        people: [{ id: '1', name: 'James Smith', relationship: 'Spouse', percentage: '100', substituteBeneficiary: '' }],
        charities: [],
      },
    })
    const preResult = validateWillForGeneration(formData)
    expect(preResult.valid).toBe(false)
    expect(preResult.structured?.some((e) => e.code === 'RELATIONSHIP_STATUS_CONFLICT')).toBe(true)
  })
})
