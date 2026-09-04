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
  hasDeathBenefitNomination: boolean
  deathBenefitNominees: string
  isOverseas: boolean
  overseasCountry: string
}

export interface PersonBeneficiary {
  id: string
  name: string
  relationship: string
  percentage: string
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

export interface TriageFlags {
  hasBusinessInterest: boolean
  hasBlendedFamily: boolean
  hasExclusionIntent: boolean
  hasVulnerableBeneficiary: boolean
  hasBeneficiaryFinancialChallenges: boolean
  hasComplexTrusts: boolean
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

// Stored in the personal_wishes table  -  not part of the signed/witnessed Will document.
export interface PersonalWishesData {
  funeralType: 'burial' | 'cremation' | 'donation' | 'other' | ''
  funeralRestingPlace: string
  funeralAdditionalWishes: string
  hasFuneralPlan: boolean
  funeralPlanDetails: string
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
  triageFlags: TriageFlags
  // Wishes & Trusts (legal  -  included in the signed Will document)
  assetsOutsideAustralia: boolean
  otherJurisdictions: string
  importantDocumentsLocation: string
  survivorshipDays: string
  petCare: PetCareData
  lifeInterest: LifeInterestData
  // Personal Wishes (non-testamentary  -  stored separately, NOT in the signed Will)
  personalWishes: PersonalWishesData
}

export const STEP_IDS = [
  'eligibility',
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

// Backup steps are dynamically injected per-beneficiary between 'beneficiaries' and 'gifts'.
// They are not in STEP_IDS; the wizard renders them as `backup_${n}`.
export type WizardStepId = StepId | `backup_${number}`

export const STEP_LABELS: Record<StepId, string> = {
  eligibility: 'Eligibility',
  personal: 'About You',
  spouse: 'Your Partner',
  children: 'Children',
  executors: 'Executors',
  assets: 'Your Assets',
  beneficiaries: 'Beneficiaries',
  gifts: 'Specific Gifts',
  wishes: 'Wishes & Trusts',
  review: 'Review',
}

// Sentinel values used by StepBeneficiaryBackup.tsx for the two preset backup options.
// Any other non-empty value is a literal custom name typed by the user.
export const SUBSTITUTE_BENEFICIARY_LABELS: Record<string, string> = {
    '__their_children__': 'their children, equally',
    '__other_beneficiaries__': 'the remaining beneficiaries, in proportion to their existing shares',
}

// Resolves a stored substituteBeneficiary value into human-readable text for
// display in the live preview, the AI drafting prompt, and the final document.
// Custom names pass through unchanged.
export function resolveSubstituteBeneficiaryText(value: string | null | undefined): string {
    if (!value) return ''
    return SUBSTITUTE_BENEFICIARY_LABELS[value] ?? value
}
