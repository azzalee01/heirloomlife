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
}

export interface PersonBeneficiary {
  id: string
  name: string
  relationship: string
  percentage: string
}

export interface CharityBeneficiary {
  id: string
  name: string
  abn: string
  percentage: string
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
}

export const STEP_IDS = [
  'personal',
  'spouse',
  'children',
  'executors',
  'assets',
  'beneficiaries',
  'gifts',
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
  review: 'Review',
}
