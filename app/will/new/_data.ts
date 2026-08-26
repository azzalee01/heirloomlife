import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import type {
  WillFormData,
  PersonalDetails,
  SpouseDetails,
  ChildrenData,
  Child,
  Guardian,
  ExecutorsData,
  ExecutorPerson,
  Asset,
  AssetType,
  BeneficiariesData,
  PersonBeneficiary,
  CharityBeneficiary,
  SpecificGift,
  MaritalStatus,
  PetCareData,
  LifeInterestData,
  TriageFlags,
  PersonalWishesData,
} from './_types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// ─── DB row shapes (matches columns written in _actions.ts) ───────────────────

type TestatorRow = {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  date_of_birth: string | null
  address_line_1: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  phone_mobile: string | null
  email: string | null
  occupation: string | null
  marital_status: string | null
  has_previous_will: boolean | null
  previous_will_location: string | null
  has_funeral_plan: boolean | null
  funeral_plan_details: string | null
  funeral_wishes: string | null
  assets_outside_australia: boolean | null
  other_jurisdictions: string[] | null
  important_documents_location: string | null
}

type WillRow = {
  survivorship_days: number | null
  pet_care: Record<string, unknown> | null
  life_interest: Record<string, unknown> | null
  triage_flags: Record<string, unknown> | null
}

type ChildRow = { id: string; first_name: string | null; date_of_birth: string | null; is_dependent: boolean; distribution_age: number | null }
type GuardianRow = { first_name: string | null; last_name: string | null; relationship: string | null; phone: string | null; email: string | null }
type ExecutorRow = { first_name: string | null; last_name: string | null; relationship: string | null; phone: string | null; email: string | null; address_line_1: string | null; is_primary: boolean }

type AssetRow = {
  id: string
  asset_type: string | null
  ownership_type: string | null
  description: string | null
  estimated_value: number | string | null
  property_address_line_1: string | null
  institution_name: string | null
  account_number: string | null
  policy_number: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: string | null
  vehicle_rego: string | null
  has_death_benefit_nomination: boolean | null
  death_benefit_nominees: string | null
  is_overseas: boolean | null
  overseas_country: string | null
}

type BeneficiaryRow = {
  id: string
  beneficiary_type: string
  first_name: string | null
  organisation_name: string | null
  abn: string | null
  relationship: string | null
  share_percentage: number | null
  lapse_fallback: string | null
}

type GiftRow = {
  id: string
  gift_type: string | null
  description: string | null
  cash_amount: number | string | null
  recipient_first_name: string | null
  recipient_relationship: string | null
  lapse_fallback: string | null
}

// ─── Defaults (used for any section with no saved rows) ──────────────────────

const EMPTY_EXECUTOR: ExecutorPerson = { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' }

const EMPTY_TRIAGE_FLAGS: TriageFlags = {
  hasBusinessInterest: false,
  hasBlendedFamily: false,
  hasExclusionIntent: false,
  hasVulnerableBeneficiary: false,
  hasBeneficiaryFinancialChallenges: false,
  hasComplexTrusts: false,
}

const EMPTY_PERSONAL_WISHES: PersonalWishesData = {
  funeralType: '',
  funeralRestingPlace: '',
  funeralAdditionalWishes: '',
  hasFuneralPlan: false,
  funeralPlanDetails: '',
}

export const EMPTY_WILL_FORM_DATA: WillFormData = {
  willId: null,
  personalDetails: {
    firstName: '', middleName: '', lastName: '', dateOfBirth: '',
    addressLine1: '', suburb: '', state: '', postcode: '',
    phoneMobile: '', email: '', occupation: '',
    maritalStatus: '', previousWill: '', previousWillLocation: '',
  },
  spouseDetails: {
    firstName: '', middleName: '', lastName: '', dateOfBirth: '',
    addressLine1: '', suburb: '', state: '', postcode: '',
    phoneMobile: '', email: '', occupation: '',
    previousWill: '', previousWillLocation: '',
  },
  childrenData: {
    hasChildren: '', children: [],
    guardian: { firstName: '', lastName: '', relationship: '', phone: '', email: '' },
    ageOfVesting: '18',
  },
  executorsData: {
    primary: { ...EMPTY_EXECUTOR },
    hasAlternate: false,
    alternate: { ...EMPTY_EXECUTOR },
  },
  assets: [],
  beneficiariesData: { people: [], charities: [] },
  specificGifts: [],
  triageFlags: { ...EMPTY_TRIAGE_FLAGS },
  assetsOutsideAustralia: false,
  otherJurisdictions: '',
  importantDocumentsLocation: '',
  survivorshipDays: '30',
  petCare: { hasPets: '', description: '', caregiverName: '', caregiverRelationship: '', careFundAmount: '' },
  lifeInterest: {
    enabled: false, propertyDescription: '', lifeTenantName: '', lifeTenantRelationship: '',
    condition: '', remainderBeneficiaryName: '', remainderBeneficiaryRelationship: '',
  },
  personalWishes: { ...EMPTY_PERSONAL_WISHES },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const str = (v: string | null | undefined): string => v ?? ''
const numStr = (v: number | string | null | undefined): string => (v == null ? '' : String(v))

function mapTestatorBase(t: TestatorRow) {
  return {
    firstName: str(t.first_name),
    middleName: str(t.middle_name),
    lastName: str(t.last_name),
    dateOfBirth: str(t.date_of_birth),
    addressLine1: str(t.address_line_1),
    suburb: str(t.suburb),
    state: str(t.state),
    postcode: str(t.postcode),
    phoneMobile: str(t.phone_mobile),
    email: str(t.email),
    occupation: str(t.occupation),
    previousWill: (t.has_previous_will === true ? 'yes' : t.has_previous_will === false ? 'no' : '') as 'yes' | 'no' | '',
    previousWillLocation: str(t.previous_will_location),
  }
}

function mapExecutor(e: ExecutorRow | null): ExecutorPerson {
  if (!e) return { ...EMPTY_EXECUTOR }
  return {
    firstName: str(e.first_name),
    lastName: str(e.last_name),
    relationship: str(e.relationship),
    phone: str(e.phone),
    email: str(e.email),
    address: str(e.address_line_1),
  }
}

// bank_account / shares descriptions are packed as "BSB: xxx" / "N shares"  -  see _actions.ts
function parseBsb(description: string | null): string {
  return (description ?? '').match(/^BSB:\s*([^ - ]*)/)?.[1]?.trim() ?? ''
}
function parseShareCount(description: string | null): string {
  return (description ?? '').match(/^(\d+)\s+shares/)?.[1] ?? ''
}

function mapAsset(a: AssetRow): Asset {
  const base: Asset = {
    id: a.id,
    assetType: (a.asset_type ?? '') as AssetType | '',
    ownershipType: (a.ownership_type ?? '') as Asset['ownershipType'],
    propertyAddress: '', estimatedValue: '',
    bankName: '', bsb: '', accountNumber: '',
    fundName: '', memberNumber: '',
    companyName: '', numberOfShares: '',
    insurerName: '', policyNumber: '', coverAmount: '',
    make: '', model: '', year: '', rego: '',
    description: '', otherValue: '',
    hasDeathBenefitNomination: !!a.has_death_benefit_nomination,
    deathBenefitNominees: str(a.death_benefit_nominees),
    isOverseas: !!a.is_overseas,
    overseasCountry: str(a.overseas_country),
  }

  switch (a.asset_type) {
    case 'real_estate':
      return { ...base, propertyAddress: str(a.property_address_line_1), estimatedValue: numStr(a.estimated_value) }
    case 'bank_account':
      return { ...base, bankName: str(a.institution_name), bsb: parseBsb(a.description), accountNumber: str(a.account_number) }
    case 'superannuation':
      return { ...base, fundName: str(a.institution_name), memberNumber: str(a.account_number) }
    case 'shares':
      return { ...base, companyName: str(a.institution_name), numberOfShares: parseShareCount(a.description) }
    case 'life_insurance':
      return { ...base, insurerName: str(a.institution_name), policyNumber: str(a.policy_number), coverAmount: numStr(a.estimated_value) }
    case 'vehicle':
      return { ...base, make: str(a.vehicle_make), model: str(a.vehicle_model), year: str(a.vehicle_year), rego: str(a.vehicle_rego) }
    default:
      return { ...base, description: str(a.description), otherValue: numStr(a.estimated_value) }
  }
}

function mapPetCare(v: WillRow['pet_care']): PetCareData {
  if (!v) return { ...EMPTY_WILL_FORM_DATA.petCare }
  return {
    hasPets: (v.hasPets as PetCareData['hasPets']) ?? '',
    description: str(v.description as string | undefined),
    caregiverName: str(v.caregiverName as string | undefined),
    caregiverRelationship: str(v.caregiverRelationship as string | undefined),
    careFundAmount: str(v.careFundAmount as string | undefined),
  }
}

function mapTriageFlags(v: WillRow['triage_flags']): TriageFlags {
  if (!v) return { ...EMPTY_TRIAGE_FLAGS }
  return {
    hasBusinessInterest: !!v.hasBusinessInterest,
    hasBlendedFamily: !!v.hasBlendedFamily,
    hasExclusionIntent: !!v.hasExclusionIntent,
    hasVulnerableBeneficiary: !!v.hasVulnerableBeneficiary,
    hasBeneficiaryFinancialChallenges: !!v.hasBeneficiaryFinancialChallenges,
    hasComplexTrusts: !!v.hasComplexTrusts,
  }
}

function mapLifeInterest(v: WillRow['life_interest']): LifeInterestData {
  if (!v) return { ...EMPTY_WILL_FORM_DATA.lifeInterest }
  return {
    enabled: !!v.enabled,
    propertyDescription: str(v.propertyDescription as string | undefined),
    lifeTenantName: str(v.lifeTenantName as string | undefined),
    lifeTenantRelationship: str(v.lifeTenantRelationship as string | undefined),
    condition: (v.condition as LifeInterestData['condition']) ?? '',
    remainderBeneficiaryName: str(v.remainderBeneficiaryName as string | undefined),
    remainderBeneficiaryRelationship: str(v.remainderBeneficiaryRelationship as string | undefined),
  }
}

// ─── Main loader ───────────────────────────────────────────────────────────────

export async function loadWillFormData(
  supabase: SupabaseClient,
  userId: string,
  willIdParam?: string
): Promise<{ willId: string | null; formData: WillFormData }> {
  const baseQuery = supabase.from('wills').select('id, survivorship_days, pet_care, life_interest, triage_flags').eq('user_id', userId)
  const { data: willRows } = willIdParam
    ? await baseQuery.eq('id', willIdParam).limit(1)
    : await baseQuery.order('created_at', { ascending: false }).limit(1)

  const willRow = willRows?.[0] as (WillRow & { id: string }) | undefined
  const willId = willRow?.id
  if (!willId) return { willId: null, formData: EMPTY_WILL_FORM_DATA }

  const [testatorRes, childrenRes, guardianRes, executorRes, assetRes, beneficiaryRes, giftRes] = await Promise.all([
    supabase.from('testators').select('*').eq('will_id', willId),
    supabase.from('children').select('*').eq('will_id', willId),
    supabase.from('guardians').select('*').eq('will_id', willId).order('order_index').limit(1),
    supabase.from('executors').select('*').eq('will_id', willId).order('order_index'),
    supabase.from('assets').select('*').eq('will_id', willId),
    supabase.from('beneficiaries').select('*').eq('will_id', willId).order('order_index'),
    supabase.from('specific_gifts').select('*').eq('will_id', willId).order('order_index'),
  ])

  const testators = (testatorRes.data ?? []) as TestatorRow[]
  const primary = testators.find((t) => t.marital_status !== null) ?? testators[0] ?? null
  const spouse = testators.find((t) => t.marital_status === null) ?? null

  const personalDetails: PersonalDetails = primary
    ? { ...mapTestatorBase(primary), maritalStatus: (primary.marital_status ?? '') as MaritalStatus | '' }
    : EMPTY_WILL_FORM_DATA.personalDetails

  const spouseDetails: SpouseDetails = spouse ? mapTestatorBase(spouse) : EMPTY_WILL_FORM_DATA.spouseDetails

  const childRows = (childrenRes.data ?? []) as ChildRow[]
  const children: Child[] = childRows.map((c) => ({
    id: c.id,
    name: str(c.first_name),
    dateOfBirth: str(c.date_of_birth),
    isDependent: !!c.is_dependent,
  }))
  const firstDistributionAge = childRows.find((c) => c.distribution_age != null)?.distribution_age
  const guardianRow = ((guardianRes.data ?? [])[0] as GuardianRow | undefined) ?? null
  const guardian: Guardian = guardianRow
    ? {
        firstName: str(guardianRow.first_name),
        lastName: str(guardianRow.last_name),
        relationship: str(guardianRow.relationship),
        phone: str(guardianRow.phone),
        email: str(guardianRow.email),
      }
    : EMPTY_WILL_FORM_DATA.childrenData.guardian

  const childrenData: ChildrenData = {
    hasChildren: children.length > 0 ? 'yes' : '',
    children,
    guardian,
    ageOfVesting: firstDistributionAge != null ? String(firstDistributionAge) : EMPTY_WILL_FORM_DATA.childrenData.ageOfVesting,
  }

  const executorRows = (executorRes.data ?? []) as ExecutorRow[]
  const primaryExecutor = executorRows.find((e) => e.is_primary) ?? null
  const alternateExecutor = executorRows.find((e) => !e.is_primary) ?? null
  const executorsData: ExecutorsData = {
    primary: mapExecutor(primaryExecutor),
    hasAlternate: !!alternateExecutor,
    alternate: mapExecutor(alternateExecutor),
  }

  const assets: Asset[] = ((assetRes.data ?? []) as AssetRow[]).map(mapAsset)

  const beneficiaryRows = (beneficiaryRes.data ?? []) as BeneficiaryRow[]
  const people: PersonBeneficiary[] = beneficiaryRows
    .filter((b) => b.beneficiary_type !== 'organisation')
    .map((b) => ({ id: b.id, name: str(b.first_name), relationship: str(b.relationship), percentage: numStr(b.share_percentage), substituteBeneficiary: str(b.lapse_fallback) }))
  const charities: CharityBeneficiary[] = beneficiaryRows
    .filter((b) => b.beneficiary_type === 'organisation')
    .map((b) => ({ id: b.id, name: str(b.organisation_name), abn: str(b.abn), percentage: numStr(b.share_percentage), substituteBeneficiary: str(b.lapse_fallback) }))
  const beneficiariesData: BeneficiariesData = { people, charities }

  const specificGifts: SpecificGift[] = ((giftRes.data ?? []) as GiftRow[]).map((g) => ({
    id: g.id,
    type: (g.gift_type === 'cash' ? 'cash' : 'item') as 'item' | 'cash',
    description: str(g.description),
    amount: numStr(g.cash_amount),
    recipientName: str(g.recipient_first_name),
    recipientRelationship: str(g.recipient_relationship),
    substituteBeneficiary: str(g.lapse_fallback),
  }))

  const primaryTestatorFull = testators.find((t) => t.marital_status !== null) ?? testators[0] ?? null

  // Load personal wishes from the personal_wishes table (non-testamentary, stored separately).
  // Fall back to legacy funeral fields on testators for records predating the migration.
  const { data: pwRow } = await supabase
    .from('personal_wishes')
    .select('funeral_type, funeral_resting_place, funeral_additional_wishes, has_funeral_plan, funeral_plan_details')
    .eq('will_id', willId)
    .maybeSingle()

  const personalWishes: PersonalWishesData = pwRow
    ? {
        funeralType: (pwRow.funeral_type ?? '') as PersonalWishesData['funeralType'],
        funeralRestingPlace: str(pwRow.funeral_resting_place as string | null),
        funeralAdditionalWishes: str(pwRow.funeral_additional_wishes as string | null),
        hasFuneralPlan: !!(pwRow.has_funeral_plan),
        funeralPlanDetails: str(pwRow.funeral_plan_details as string | null),
      }
    : {
        funeralType: '',
        funeralRestingPlace: '',
        // Migrate legacy free-text field for existing records
        funeralAdditionalWishes: str(primaryTestatorFull?.funeral_wishes),
        hasFuneralPlan: !!primaryTestatorFull?.has_funeral_plan,
        funeralPlanDetails: str(primaryTestatorFull?.funeral_plan_details),
      }

  return {
    willId,
    formData: {
      willId,
      personalDetails,
      spouseDetails,
      childrenData,
      executorsData,
      assets,
      beneficiariesData,
      specificGifts,
      assetsOutsideAustralia: !!primaryTestatorFull?.assets_outside_australia,
      otherJurisdictions: (primaryTestatorFull?.other_jurisdictions ?? []).join(', '),
      importantDocumentsLocation: str(primaryTestatorFull?.important_documents_location),
      triageFlags: mapTriageFlags(willRow?.triage_flags ?? null),
      survivorshipDays: willRow?.survivorship_days != null ? String(willRow.survivorship_days) : EMPTY_WILL_FORM_DATA.survivorshipDays,
      petCare: mapPetCare(willRow?.pet_care ?? null),
      lifeInterest: mapLifeInterest(willRow?.life_interest ?? null),
      personalWishes,
    },
  }
}

// Load form data for an anonymous session (returns raw JSONB, merged with empty defaults).
export async function loadAnonSessionFormData(
  supabase: SupabaseClient,
  sessionId: string
): Promise<WillFormData> {
  const { data } = await supabase
    .from('anonymous_will_sessions')
    .select('form_data')
    .eq('id', sessionId)
    .single()
  if (!data?.form_data) return { ...EMPTY_WILL_FORM_DATA }
  // Merge with empty defaults so new fields added after session creation are present.
  return { ...EMPTY_WILL_FORM_DATA, ...(data.form_data as Partial<WillFormData>), willId: sessionId }
}
