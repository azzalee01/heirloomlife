import { NextResponse } from 'next/server'
import { validateStep } from '@/app/will/new/_step-validate'
import { validateWillForGeneration, validateRenderedText } from '@/app/will/new/_validate'
import { renderWillText } from '@/app/will/new/_render'
import type { StepId, WillFormData } from '@/app/will/new/_types'

export const runtime = 'nodejs'

/**
 * GET /api/health/wizard — secret-gated dry-run of every wizard step.
 *
 * Runs the per-step required-field validation plus full Will generation against a
 * representative complete will, reporting pass/fail per step. This is a PURE dry-run
 * (no DB writes), so it is safe to hit against any environment including production.
 *
 * Auth:  Authorization: Bearer $WIZARD_HEALTH_SECRET
 *
 * NOTE: a deeper variant that performs a real throwaway-will save per step (to catch
 * DB CHECK/FK drift at runtime) must run against a Supabase BRANCH or local stack, never
 * prod — see scripts/smoke-wizard.mjs / the contract test, which cover that offline.
 */

const VALIDATED_STEPS: StepId[] = [
  'personal', 'spouse', 'children', 'executors', 'assets', 'gifts', 'beneficiaries',
]

function completeWill(): WillFormData {
  return {
    willId: null,
    personalDetails: {
      firstName: 'Health', middleName: '', lastName: 'Check', dateOfBirth: '1980-01-01',
      addressLine1: '1 Test St', suburb: 'Sydney', state: 'NSW', postcode: '2000',
      phoneMobile: '0400000000', email: 'health@example.com', occupation: 'Tester',
      maritalStatus: 'married', previousWill: 'no', previousWillLocation: '',
    },
    spouseDetails: {
      firstName: 'Pat', middleName: '', lastName: 'Check', dateOfBirth: '', addressLine1: '', suburb: '',
      state: '', postcode: '', phoneMobile: '', email: '', occupation: '', previousWill: '', previousWillLocation: '',
    },
    childrenData: {
      hasChildren: 'yes',
      children: [{ id: 'c1', firstName: 'Kid', lastName: 'Check', dateOfBirth: '2020-01-01', isDependent: true }],
      guardian: { firstName: 'Guard', lastName: 'Ian', relationship: 'Aunt', phone: '', email: '' },
      ageOfVesting: '25',
    },
    executorsData: {
      primary: { firstName: 'Ex', lastName: 'Ecutor', relationship: 'Sibling', phone: '', email: '', address: '' },
      hasAlternate: true,
      alternate: { firstName: 'Alt', lastName: 'Ernate', relationship: 'Friend', phone: '', email: '', address: '' },
    },
    assets: [{
      id: 'a1', assetType: 'real_estate', ownershipType: 'sole',
      propertyAddress: '1 Test St', estimatedValue: '500000', bankName: '', bsb: '', accountNumber: '',
      fundName: '', memberNumber: '', companyName: '', numberOfShares: '', insurerName: '', policyNumber: '',
      coverAmount: '', make: '', model: '', year: '', rego: '', accessLocation: '', description: '', otherValue: '',
      hasDeathBenefitNomination: false, deathBenefitNominees: '', isOverseas: false, overseasCountry: '',
    }],
    beneficiariesData: { people: [{ id: 'b1', name: 'Ben Eficiary', relationship: 'Spouse', percentage: '100', substituteBeneficiary: '' }], charities: [] },
    specificGifts: [{ id: 'g1', type: 'cash', description: '', amount: '1000', recipientName: 'Gift Ee', recipientRelationship: 'Niece', substituteBeneficiary: '' }],
    triageFlags: { hasBusinessInterest: false, hasBlendedFamily: false, hasExclusionIntent: false, hasVulnerableBeneficiary: false, hasBeneficiaryFinancialChallenges: false, hasComplexTrusts: false },
    assetsOutsideAustralia: false,
    otherJurisdictions: '',
    importantDocumentsLocation: '',
    survivorshipDays: '30',
    petCare: { hasPets: 'no', petName: '', petDescription: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
    lifeInterest: { enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '', condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '' },
    personalWishes: { funeralType: 'burial', funeralRestingPlace: '', funeralAdditionalWishes: '', hasFuneralPlan: false, funeralPlanDetails: '' },
  }
}

export async function GET(req: Request) {
  const secret = process.env.WIZARD_HEALTH_SECRET
  if (!secret) return NextResponse.json({ error: 'WIZARD_HEALTH_SECRET not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = completeWill()
  const checks: { step: string; pass: boolean; detail: string }[] = []

  for (const step of VALIDATED_STEPS) {
    try {
      const fieldErrors = validateStep(step, form)
      const keys = Object.keys(fieldErrors)
      checks.push({ step, pass: keys.length === 0, detail: keys.length === 0 ? 'ok' : `field errors: ${keys.join(', ')}` })
    } catch (e) {
      checks.push({ step, pass: false, detail: e instanceof Error ? e.message : String(e) })
    }
  }

  // Full generation dry-run (the "reach Review + generate the Will" path).
  try {
    const pre = validateWillForGeneration(form)
    const text = renderWillText(form)
    const post = validateRenderedText(text)
    checks.push({ step: 'generate', pass: pre.valid && post.valid, detail: pre.valid && post.valid ? 'ok' : [...pre.errors, ...post.errors].join('; ') })
  } catch (e) {
    checks.push({ step: 'generate', pass: false, detail: e instanceof Error ? e.message : String(e) })
  }

  const ok = checks.every((c) => c.pass)
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 500 })
}
