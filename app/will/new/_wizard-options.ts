/**
 * Single source of truth for the wizard's CHECK-constrained option values.
 *
 * Every value here is written to a Postgres column that has a CHECK constraint (or
 * would be, for the server-derived sets). `__tests__/db-contract.test.ts` asserts that
 * each value is allowed by the live DB — so adding an option here without a matching
 * migration fails CI instead of blowing up a user's save with "We couldn't save".
 *
 * UI components MUST render their dropdowns from these arrays (not inline <option>s), so
 * the contract test sees exactly what the user can pick. The server-derived sets mirror
 * the literal values `_actions.ts` writes for columns the UI doesn't map 1:1.
 */

export const ASSET_TYPE_OPTIONS = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'superannuation', label: 'Superannuation' },
  { value: 'shares', label: 'Shares / Investments' },
  { value: 'life_insurance', label: 'Life Insurance' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'digital_asset', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' },
] as const

export const OWNERSHIP_TYPE_OPTIONS = [
  { value: 'sole', label: 'Sole ownership' },
  { value: 'joint_tenants', label: 'Joint ownership (joint tenants)' },
  { value: 'tenants_in_common', label: 'Joint ownership (tenants in common)' },
  { value: 'entity', label: 'Held by a trust, company or SMSF' },
] as const

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic_partner', label: 'Domestic Partner' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
] as const

export const FUNERAL_TYPE_OPTIONS = [
  { value: 'burial', label: 'Burial' },
  { value: 'cremation', label: 'Cremation' },
  { value: 'donation', label: 'Body donation to medical science' },
  { value: 'other', label: 'Other / no preference' },
] as const

// Values the server actions WRITE to CHECK-constrained columns but which the UI does
// not offer 1:1 (they are derived in _actions.ts). Keep in sync with _actions.ts.
//   beneficiary_type: individuals → 'individual', charities → 'organisation'
//   gift_type:        'item' UI toggle → 'personal_property', else 'cash'
//   recipient_type:   always 'individual' today
//   wills.status:     server-managed ('draft' default, completeWill → 'pending_review')
export const SERVER_WRITTEN_VALUES: Record<string, readonly string[]> = {
  'beneficiaries.beneficiary_type': ['individual', 'organisation'],
  'specific_gifts.gift_type': ['cash', 'personal_property'],
  'specific_gifts.recipient_type': ['individual'],
  'wills.status': ['draft', 'pending_review'],
}

// Map of DB column → the code-side values that can reach it, for the contract test.
export const UI_OPTION_VALUES: Record<string, readonly string[]> = {
  'assets.asset_type': ASSET_TYPE_OPTIONS.map((o) => o.value),
  'assets.ownership_type': OWNERSHIP_TYPE_OPTIONS.map((o) => o.value),
  'testators.marital_status': MARITAL_STATUS_OPTIONS.map((o) => o.value),
  'personal_wishes.funeral_type': FUNERAL_TYPE_OPTIONS.map((o) => o.value),
}
