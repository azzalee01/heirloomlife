// ── Document lifecycle types ──────────────────────────────────────────────────
// These types enforce a strict state machine over Will documents.
// Every downstream function must accept a DocumentPurpose and refuse to proceed
// if the purpose is incompatible with the operation (e.g. signing an INTERNAL draft).

/** The intended use of a generated document. Determines which validator runs and
 *  whether the document may be delivered to the testator for signature. */
export type DocumentPurpose = 'PREVIEW' | 'INTERNAL_SOLICITOR_DRAFT' | 'EXECUTABLE'

/** Lifecycle state of an assembled document. */
export type DocumentStatus =
  | 'ASSEMBLING'
  | 'ASSEMBLED'
  | 'VALIDATION_FAILED'
  | 'RELEASED_FOR_EXECUTION'

/** Whether this Will can be produced by the automated pipeline or requires a solicitor. */
export type WillPathway = 'STANDARD' | 'ESCALATION_REQUIRED'

/** Approval state of a single clause version.
 *  Only APPROVED clauses may appear in an EXECUTABLE document. */
export type ClauseApprovalStatus =
  | 'APPROVED'
  | 'DRAFT'
  | 'LEGAL_REVIEW_REQUIRED'
  | 'APPROVED_LEGAL_TEXT_REQUIRED'

/** Which packet document a clause belongs to.
 *  Doc A = Signing Instructions, B = Will Body, C = Estate Information,
 *  D = Wishes, E = Executor Information. */
export type DocumentClass =
  | 'WILL_BODY'
  | 'ESTATE_INFORMATION'
  | 'WISHES'
  | 'EXECUTOR_INFORMATION'
  | 'SIGNING_INSTRUCTIONS'

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
  | 'digital_asset'
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
  // digital asset (cryptocurrency)
  accessLocation: string
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
  petName: string         // e.g. "Maisie"
  petDescription: string  // e.g. "golden retriever"
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
    '__their_children__': "the beneficiary's children, equally", // fallback — prefer named form
    '__other_beneficiaries__': 'the remaining beneficiaries, in proportion to their existing shares',
    '__testator_children__': 'my children, equally',
}

// Resolves a stored substituteBeneficiary value into human-readable text for
// display in the live preview, the AI drafting prompt, and the final document.
// Custom names pass through unchanged.
// Pass primaryBeneficiaryName for __their_children__ to avoid ambiguous "their".
export function resolveSubstituteBeneficiaryText(value: string | null | undefined, primaryBeneficiaryName?: string): string {
    if (!value) return ''
    if (value === '__their_children__') {
        return primaryBeneficiaryName
            ? `${primaryBeneficiaryName}'s children, equally`
            : "the beneficiary's children, equally"
    }
    if (value === '__testator_children__') return 'my children, equally'
    return SUBSTITUTE_BENEFICIARY_LABELS[value] ?? value
}

/** Adds comma separators to a whole-dollar amount, e.g. "10000" → "10,000". No $ prefix. */
export function formatAmountDigits(amount: string | number): string {
    const n = Math.round(typeof amount === 'string' ? parseFloat(amount) || 0 : amount)
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** Formats a dollar amount with leading $ and comma separators, e.g. "10000" → "$10,000". */
export function formatCurrency(amount: string | number): string {
    return '$' + formatAmountDigits(amount)
}

// Relationship labels that indicate a CURRENT spousal/partner relationship.
// Case-insensitive matching is applied at validation time (toLowerCase before lookup).
export const SPOUSAL_RELATIONSHIP_LABELS = new Set([
    'spouse', 'husband', 'wife', 'partner', 'de facto', 'defacto',
    'de-facto', 'de facto partner', 'de-facto partner',
])

// Marital statuses where a spousal relationship label is contradictory.
// 'separated' is intentionally excluded — a separated person retains their legal spouse.
export const NON_SPOUSAL_STATUSES = new Set<string>(['single', 'divorced', 'widowed'])

/**
 * Returns true when the Will requires a delayed-vesting / minor beneficiary trust
 * (MIN-01 + MIN-02). True when any child is marked as a minor/dependent AND the
 * ageOfVesting field is set. This is the canonical trigger for the trust clauses —
 * use it in both _assembly.ts and _render.ts rather than re-deriving inline.
 *
 * The name is intentionally broader than "hasDependent": it captures the semantic
 * intent (a trust arises) rather than the triggering data (a child is dependent).
 */
export function computeRequiresDelayedVestingTrust(formData: WillFormData): boolean {
  return (
    formData.childrenData.hasChildren === 'yes' &&
    formData.childrenData.children.some((c) => c.isDependent)
  )
}
