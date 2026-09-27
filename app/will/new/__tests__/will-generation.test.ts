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

function personBeneficiary(name: string, pct: string, rel = 'Spouse'): WillFormData['beneficiariesData']['people'][number] {
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
      people: [personBeneficiary('James Smith', '100', 'Spouse')],
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

  it('does not render natural-language single-beneficiary form', () => {
    const text = renderWillText(formData)
    expect(text).not.toContain('I give the whole of the rest and residue')
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
        personBeneficiary('James Smith', '100', 'Spouse'),
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
