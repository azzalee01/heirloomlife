/**
 * AUTO-GENERATED from the live DB CHECK constraints on the tables the wizard writes to.
 * Do NOT edit by hand. Regenerate after any constraint migration:
 *
 *   SUPABASE_DB_URL=postgres://… npm run sync:db-contract
 *
 * (see scripts/sync-db-contract.mjs). db-contract.test.ts asserts every code/UI value
 * is present here, so a UI option added without a migration fails CI offline.
 *
 * Source: Sydney prod schema (copbetdvhkreyzvywmmr), catalog read only, 2026-11-28.
 */
export const DB_CHECK_ALLOWED: Record<string, readonly string[]> = {
  'assets.asset_type': [
    'real_estate', 'shares', 'superannuation', 'life_insurance', 'bank_account',
    'vehicle', 'business', 'personal_property', 'other', 'digital_asset',
  ],
  'assets.ownership_type': ['sole', 'joint_tenants', 'tenants_in_common', 'entity'],
  'beneficiaries.beneficiary_type': ['individual', 'charity', 'organisation'],
  'specific_gifts.gift_type': ['cash', 'real_estate', 'shares', 'personal_property', 'percentage', 'residuary'],
  'specific_gifts.recipient_type': ['individual', 'charity', 'organisation'],
  'testators.marital_status': ['single', 'married', 'domestic_partner', 'divorced', 'separated', 'widowed'],
  'personal_wishes.funeral_type': ['burial', 'cremation', 'donation', 'other'],
  'wills.status': ['draft', 'pending_review', 'approved', 'executed', 'superseded'],
  'wills.payment_status': ['unpaid', 'paid'],
  'wills.product_type': ['single', 'couple'],
  'wills.subscription_status': ['none', 'active'],
}
