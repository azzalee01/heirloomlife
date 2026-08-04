export type MaritalStatus =
  | 'single'
  | 'married'
  | 'domestic_partner'
  | 'divorced'
  | 'separated'
  | 'widowed'

export type AssetType =
  | 'real_estate'
  | 'bank_account'
  | 'superannuation'
  | 'shares'
  | 'life_insurance'
  | 'vehicle'
  | 'other'

export interface PersonalDetails {
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  addressLine1: string
  suburb: string
  state: string
  postcode: string
  phoneMobile: string
  email: string
  occupation: string
  maritalStatus: MaritalStatus | ''
  previousWill: 'yes' | 'no' | ''
  previousWillLocation: string
}

export interface SpouseDetails {
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  addressLine1: string
  suburb: string
  state: string
  postcode: string
  phoneMobile: string
  email: string
  occupation: string
  previousWill: 'yes' | 'no' | ''
  previousWillLocation: string
}

export interface Child {
  id: string
  name: string
  dateOfBirth: string
  isDependent: boolean
}

export interface Guardian {
  firstName: string
  lastName: string
  relationship: string
  phone: string
  email: string
}

export interface ChildrenData {
  hasChildren: 'yes' | 'no' | ''
  children: Child[]
  guardian: Guardian
  // Age at which a minor/dependent beneficiary's share vests outright,
  // held on trust until then — the standard testamentary trust provision.
  ageOfVesting: string
}

export interface ExecutorPerson {
  firstName: string
  lastName: string
  relationship: string
  phone: string
  email: string
  address: string
}

export interface ExecutorsData {
  primary: ExecutorPerson
  hasAlternate: boolean
  alternate: ExecutorPerson
}

export interface Asset {
  id: string
  assetType: AssetType | ''
  ownershipType: 'sole' | 'joint_tenants' | 'tenants_in_common' | ''
  // real estate
  propertyAddress: string
  estimatedValue: string
  // bank account
  bankName: string
  bsb: string
  accountNumber: string
  // superannuation
  fundName: string
  memberNumber: string
  // shares
  companyName: string
  numberOfShares: string
  // life insurance
  insurerName: string
  policyNumber: string
  coverAmount: string
  // vehicle
  make: string
  model: string
  year: string
  rego: string
  // other
  description: string
  otherValue: string
  // superannuation / life insurance — these commonly pass outside the will
  // via a binding nomination with the provider, not via this document.
  hasDeathBenefitNomination: boolean
  deathBenefitNominees: string
  // overseas assets
  isOverseas: boolean
  overseasCountry: string
}

export interface PersonBeneficiary {
  id: string
  name: string
  relationship: string
  percentage: string
  // Who takes this share if this beneficiary doesn't survive the testator
  // by the survivorship period (see WillFormData.survivorshipDays).
  substituteBeneficiary: string
}

export interface CharityBeneficiary {
  id: string
  name: string
  abn: string
  percentage: string
  substituteBeneficiary: string
}

export interface BeneficiariesData {
  people: PersonBeneficiary[]
  charities: CharityBeneficiary[]
}

export interface SpecificGift {
  id: string
  type: 'item' | 'cash'
  description: string
  amount: string
  recipientName: string
  recipientRelationship: string
  substituteBeneficiary: string
}

export interface PetCareData {
  hasPets: 'yes' | 'no' | ''
  description: string
  caregiverName: string
  caregiverRelationship: string
  careFundAmount: string
}

export interface LifeInterestData {
  enabled: boolean
  propertyDescription: string
  lifeTenantName: string
  lifeTenantRelationship: string
  condition: 'death' | 'remarriage' | 'death_or_remarriage' | ''
  remainderBeneficiaryName: string
  remainderBeneficiaryRelationship: string
}

export interface WillFormData {
  willId: string | null
  personalDetails: PersonalDetails
  spouseDetails: SpouseDetails
  childrenData: ChildrenData
  executorsData: ExecutorsData
  assets: Asset[]
  beneficiariesData: BeneficiariesData
  specificGifts: SpecificGift[]
  // ── Wishes & Trusts ──────────────────────────────────────────────────────
  funeralWishes: string
  hasFuneralPlan: boolean
  funeralPlanDetails: string
  assetsOutsideAustralia: boolean
  otherJurisdictions: string // comma-separated countries
  importantDocumentsLocation: string
  survivorshipDays: string
  petCare: PetCareData
  lifeInterest: LifeInterestData
}

export const STEP_IDS = [
  'personal',
  'spouse',
  'children',
  'executors',
  'assets',
  'beneficiaries',
  'gifts',
  'wishes',
  'review',
] as const

export type StepId = (typeof STEP_IDS)[number]

export const STEP_LABELS: Record<StepId, string> = {
  personal: 'Personal Details',
  spouse: 'Spouse / Partner',
  children: 'Children',
  executors: 'Executors',
  assets: 'Assets',
  beneficiaries: 'Beneficiaries',
  gifts: 'Specific Gifts',
  wishes: 'Wishes & Trusts',
  review: 'Review',
}
