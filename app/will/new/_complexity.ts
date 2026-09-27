/**
 * Complexity screening for NSW Will generation.
 *
 * assessComplexityFlags — derives structured flags from WillFormData.
 * maxSeverity           — highest severity across all active flags.
 *
 * Severity levels:
 *   LOW                 — standard pathway continues.
 *   REVIEW_RECOMMENDED  — allow continuation; display a prominent review notice.
 *   SOLICITOR_REQUIRED  — do not allow automated finalisation without explicit business approval.
 *
 * Flag codes are stable identifiers used for logging and analytics.
 * Do not expose them directly in customer-facing UI — use description instead.
 */

import type { WillFormData } from './_types'

export type ComplexitySeverity = 'LOW' | 'REVIEW_RECOMMENDED' | 'SOLICITOR_REQUIRED'

export interface ComplexityFlag {
  code: string
  description: string
  severity: ComplexitySeverity
  /** The data-model field/value that triggered this flag — for audit trail. */
  triggeredBy: string
}

export function assessComplexityFlags(formData: WillFormData): ComplexityFlag[] {
  const flags: ComplexityFlag[] = []
  const tf = formData.triageFlags

  // ── Overseas / multi-jurisdiction assets ─────────────────────────────────
  const overseasAsset = formData.assets.find((a) => a.isOverseas)
  if (formData.assetsOutsideAustralia || overseasAsset) {
    flags.push({
      code: 'OVERSEAS_ASSETS',
      description:
        'Overseas or non-Australian assets have been noted. A separate Will valid in that jurisdiction may be required.',
      severity: 'SOLICITOR_REQUIRED',
      triggeredBy: formData.assetsOutsideAustralia
        ? 'assetsOutsideAustralia=true'
        : `asset.isOverseas=true (${overseasAsset?.overseasCountry || 'country not specified'})`,
    })
  }

  // ── Business / company / trust ownership ─────────────────────────────────
  if (tf.hasBusinessInterest) {
    flags.push({
      code: 'BUSINESS_INTEREST',
      description:
        'Business ownership, company shareholding, or a trust interest has been noted. Business succession planning requires specialist advice.',
      severity: 'SOLICITOR_REQUIRED',
      triggeredBy: 'triageFlags.hasBusinessInterest=true',
    })
  }

  // ── Blended family / children from earlier relationships ─────────────────
  if (tf.hasBlendedFamily) {
    flags.push({
      code: 'BLENDED_FAMILY',
      description:
        'Blended family or children from an earlier relationship have been noted. Consider obtaining legal advice to confirm your estate plan meets obligations to all parties.',
      severity: 'REVIEW_RECOMMENDED',
      triggeredBy: 'triageFlags.hasBlendedFamily=true',
    })
  }

  // ── Deliberate exclusion of spouse, child, or close family member ─────────
  if (tf.hasExclusionIntent) {
    flags.push({
      code: 'EXCLUSION_INTENT',
      description:
        'You have indicated an intention to exclude a spouse, child, or close family member. This creates a material risk of a family provision claim under NSW law. Solicitor review is required.',
      severity: 'SOLICITOR_REQUIRED',
      triggeredBy: 'triageFlags.hasExclusionIntent=true',
    })
  }

  // ── Beneficiary with disability / impaired capacity ───────────────────────
  if (tf.hasVulnerableBeneficiary) {
    flags.push({
      code: 'VULNERABLE_BENEFICIARY',
      description:
        'A beneficiary with a disability, special need, or impaired decision-making capacity has been noted. A Special Disability Trust or tailored structure may be appropriate.',
      severity: 'SOLICITOR_REQUIRED',
      triggeredBy: 'triageFlags.hasVulnerableBeneficiary=true',
    })
  }

  // ── Beneficiary with money-management or addiction concerns ───────────────
  if (tf.hasBeneficiaryFinancialChallenges) {
    flags.push({
      code: 'BENEFICIARY_FINANCIAL_CHALLENGES',
      description:
        'A beneficiary with financial management concerns or addiction challenges has been noted. A protective trust or staged distribution may be appropriate.',
      severity: 'REVIEW_RECOMMENDED',
      triggeredBy: 'triageFlags.hasBeneficiaryFinancialChallenges=true',
    })
  }

  // ── Complex trust requirements ────────────────────────────────────────────
  if (tf.hasComplexTrusts) {
    flags.push({
      code: 'COMPLEX_TRUSTS',
      description:
        'A testamentary trust structure beyond a standard minor beneficiary trust has been noted. This requires bespoke drafting.',
      severity: 'SOLICITOR_REQUIRED',
      triggeredBy: 'triageFlags.hasComplexTrusts=true',
    })
  }

  // ── Life interest / right to reside ──────────────────────────────────────
  if (formData.lifeInterest.enabled) {
    flags.push({
      code: 'LIFE_INTEREST',
      description:
        'A life interest or right to reside has been included. These provisions can create disputes; review is recommended to confirm the drafting matches your intentions.',
      severity: 'REVIEW_RECOMMENDED',
      triggeredBy: 'lifeInterest.enabled=true',
    })
  }

  // ── Minor children with no named guardian ─────────────────────────────────
  const hasDependents =
    formData.childrenData.hasChildren === 'yes' &&
    formData.childrenData.children.some((c) => c.isDependent)
  if (hasDependents && !formData.childrenData.guardian.firstName.trim()) {
    flags.push({
      code: 'NO_GUARDIAN_NAMED',
      description:
        'You have dependent children but have not named a guardian. This is strongly recommended.',
      severity: 'REVIEW_RECOMMENDED',
      triggeredBy: 'childrenData.hasChildren=yes && guardian.firstName is empty',
    })
  }

  return flags
}

export function maxSeverity(flags: ComplexityFlag[]): ComplexitySeverity | null {
  if (flags.some((f) => f.severity === 'SOLICITOR_REQUIRED')) return 'SOLICITOR_REQUIRED'
  if (flags.some((f) => f.severity === 'REVIEW_RECOMMENDED')) return 'REVIEW_RECOMMENDED'
  if (flags.length > 0) return 'LOW'
  return null
}
