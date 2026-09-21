'use client'

import type { WillFormData } from '../_types'

interface Props {
  formData: WillFormData
  onViewWill: () => void
  saving?: boolean
}

function triggeredFlagLabels(formData: WillFormData): string[] {
  const labels: string[] = []
  if (formData.assetsOutsideAustralia || formData.assets.some((a) => a.isOverseas)) {
    labels.push('overseas assets or non-Australian tax residency')
  }
  if (formData.triageFlags.hasBusinessInterest) labels.push('business ownership or commercial interest')
  if (formData.triageFlags.hasBlendedFamily) labels.push('a blended family or children from different relationships')
  if (formData.triageFlags.hasExclusionIntent) labels.push('an intention to exclude a spouse, child, or close family member')
  if (formData.triageFlags.hasVulnerableBeneficiary) labels.push('a beneficiary with a disability or condition affecting mental capacity')
  if (formData.triageFlags.hasBeneficiaryFinancialChallenges) labels.push('a beneficiary with difficulty managing money')
  if (formData.triageFlags.hasComplexTrusts) labels.push('complex trust structures')
  return labels
}

function formatFlagList(flags: string[]): string {
  if (flags.length === 0) return ''
  if (flags.length === 1) return flags[0]
  return flags.slice(0, -1).join(', ') + ' and ' + flags[flags.length - 1]
}

export default function StepReview({ formData, onViewWill, saving }: Props) {
  const flags = triggeredFlagLabels(formData)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Your Will is complete</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          View your Will as a living document in your Vault — read it, download it, and keep it updated as life changes.
        </p>
      </div>

      {flags.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-amber-900">Some aspects of your estate may benefit from professional review</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            You told us you have {formatFlagList(flags)}. We&apos;ll flag these in your Vault with a recommendation for a more detailed bespoke solicitor review. Contact us through your Vault and we&apos;ll connect you with a partner lawyer.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onViewWill}
        disabled={saving}
        className="w-full py-3 text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--teal)' }}
      >
        {saving ? 'Saving…' : 'View my Will'}
      </button>

      <div className="border border-[var(--line)] bg-[var(--paper-warm)] px-4 py-3">
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>Note:</span> Heirloom Life is not a law firm and this is not legal advice. Your Will is prepared using established estate planning standards. Every Will issued through Heirloom Life is subject to a standard solicitor quality review before being finalised.
        </p>
      </div>
    </div>
  )
}
