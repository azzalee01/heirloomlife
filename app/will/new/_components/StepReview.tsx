'use client'

import type { WillFormData, StepId, AssetType } from '../_types'
import { STEP_LABELS } from '../_types'

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  real_estate: 'Real Estate',
  bank_account: 'Bank Account',
  superannuation: 'Superannuation',
  shares: 'Shares / Investments',
  life_insurance: 'Life Insurance',
  vehicle: 'Vehicle',
  other: 'Other',
}

interface Props {
  formData: WillFormData
  activeSteps: StepId[]
  onJumpToStep: (stepId: StepId) => void
}

function Section({
  title,
  stepId,
  activeSteps,
  onEdit,
  children,
}: {
  title: string
  stepId: StepId
  activeSteps: StepId[]
  onEdit: () => void
  children: React.ReactNode
}) {
  if (!activeSteps.includes(stepId)) return null
  return (
    <div className="border border-[var(--line)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-[var(--paper-warm)] border-b border-[var(--line)]">
        <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-[var(--teal)] transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[var(--neutral)] w-36 shrink-0">{label}</span>
      <span className="text-[var(--ink)]">{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-[var(--line)] my-3" />
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

export default function StepReview({ formData, activeSteps, onJumpToStep }: Props) {
  const { personalDetails: pd, spouseDetails: sd, childrenData: cd, executorsData: ed, assets, beneficiariesData: bd, specificGifts, petCare: pc, lifeInterest: li } = formData

  const maritalLabel: Record<string, string> = {
    single: 'Single', married: 'Married', domestic_partner: 'Domestic Partner',
    divorced: 'Divorced', separated: 'Separated', widowed: 'Widowed',
  }

  const totalPct = [...bd.people, ...bd.charities].reduce(
    (s, b) => s + (parseFloat(b.percentage) || 0), 0
  )

  function edit(stepId: StepId) {
    return () => onJumpToStep(stepId)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Review Your Will</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          Please review all details below before completing your will.
        </p>
      </div>

      {/* Personal Details */}
      <Section title={STEP_LABELS.personal} stepId="personal" activeSteps={activeSteps} onEdit={edit('personal')}>
        <Row label="Name" value={[pd.firstName, pd.middleName, pd.lastName].filter(Boolean).join(' ')} />
        <Row label="Date of birth" value={pd.dateOfBirth} />
        <Row label="Occupation" value={pd.occupation} />
        <Row label="Mobile" value={pd.phoneMobile} />
        <Row label="Email" value={pd.email} />
        <Row label="Address" value={[pd.addressLine1, pd.suburb, pd.state, pd.postcode].filter(Boolean).join(', ')} />
        <Row label="Marital status" value={maritalLabel[pd.maritalStatus] ?? ''} />
        <Row label="Previous will" value={pd.previousWill === 'yes' ? `Yes  -  ${pd.previousWillLocation || 'location not specified'}` : pd.previousWill === 'no' ? 'No' : ''} />
      </Section>

      {/* Spouse */}
      <Section title={STEP_LABELS.spouse} stepId="spouse" activeSteps={activeSteps} onEdit={edit('spouse')}>
        <Row label="Name" value={[sd.firstName, sd.middleName, sd.lastName].filter(Boolean).join(' ')} />
        <Row label="Date of birth" value={sd.dateOfBirth} />
        <Row label="Occupation" value={sd.occupation} />
        <Row label="Mobile" value={sd.phoneMobile} />
        <Row label="Email" value={sd.email} />
        <Row label="Address" value={[sd.addressLine1, sd.suburb, sd.state, sd.postcode].filter(Boolean).join(', ')} />
        <Row label="Previous will" value={sd.previousWill === 'yes' ? `Yes  -  ${sd.previousWillLocation || 'location not specified'}` : sd.previousWill === 'no' ? 'No' : ''} />
      </Section>

      {/* Children */}
      <Section title={STEP_LABELS.children} stepId="children" activeSteps={activeSteps} onEdit={edit('children')}>
        {cd.hasChildren === 'no' && <p className="text-sm text-[var(--neutral)]">No children</p>}
        {cd.hasChildren === 'yes' && cd.children.length === 0 && (
          <p className="text-sm text-[var(--neutral)]">No children listed</p>
        )}
        {cd.hasChildren === 'yes' && cd.children.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <Divider />}
            <Row label="Name" value={c.name} />
            <Row label="Date of birth" value={c.dateOfBirth} />
            <Row label="Dependent" value={c.isDependent ? 'Yes' : 'No'} />
          </div>
        ))}
        {cd.hasChildren === 'yes' && cd.children.some(c => c.isDependent) && cd.guardian.firstName && (
          <>
            <Divider />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral)] mb-2">Guardian</p>
            <Row label="Name" value={[cd.guardian.firstName, cd.guardian.lastName].filter(Boolean).join(' ')} />
            <Row label="Relationship" value={cd.guardian.relationship} />
            <Row label="Phone" value={cd.guardian.phone} />
            <Row label="Email" value={cd.guardian.email} />
          </>
        )}
      </Section>

      {/* Executors */}
      <Section title={STEP_LABELS.executors} stepId="executors" activeSteps={activeSteps} onEdit={edit('executors')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral)] mb-2">Primary</p>
        <Row label="Name" value={[ed.primary.firstName, ed.primary.lastName].filter(Boolean).join(' ')} />
        <Row label="Relationship" value={ed.primary.relationship} />
        <Row label="Phone" value={ed.primary.phone} />
        <Row label="Email" value={ed.primary.email} />
        <Row label="Address" value={ed.primary.address} />
        {ed.hasAlternate && ed.alternate.firstName && (
          <>
            <Divider />
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral)] mb-2">Alternate</p>
            <Row label="Name" value={[ed.alternate.firstName, ed.alternate.lastName].filter(Boolean).join(' ')} />
            <Row label="Relationship" value={ed.alternate.relationship} />
            <Row label="Phone" value={ed.alternate.phone} />
            <Row label="Email" value={ed.alternate.email} />
            <Row label="Address" value={ed.alternate.address} />
          </>
        )}
      </Section>

      {/* Assets */}
      <Section title={STEP_LABELS.assets} stepId="assets" activeSteps={activeSteps} onEdit={edit('assets')}>
        {assets.length === 0 && <p className="text-sm text-[var(--neutral)]">No assets added</p>}
        {assets.map((a, i) => (
          <div key={a.id}>
            {i > 0 && <Divider />}
            <Row label="Type" value={a.assetType ? ASSET_TYPE_LABELS[a.assetType as AssetType] : ''} />
            <Row label="Ownership" value={a.ownershipType === 'sole' ? 'Sole ownership' : a.ownershipType === 'joint_tenants' ? 'Joint ownership (joint tenants)' : a.ownershipType === 'tenants_in_common' ? 'Joint ownership (tenants in common)' : ''} />
            {a.assetType === 'real_estate' && <Row label="Address" value={a.propertyAddress} />}
            {a.assetType === 'real_estate' && <Row label="Est. value" value={a.estimatedValue} />}
            {a.assetType === 'bank_account' && <Row label="Description" value={a.description} />}
            {a.assetType === 'superannuation' && <Row label="Fund" value={a.fundName} />}
            {a.assetType === 'superannuation' && <Row label="Member no." value={a.memberNumber} />}
            {a.assetType === 'shares' && <Row label="Company" value={a.companyName} />}
            {a.assetType === 'shares' && <Row label="Shares" value={a.numberOfShares} />}
            {a.assetType === 'life_insurance' && <Row label="Insurer" value={a.insurerName} />}
            {a.assetType === 'life_insurance' && <Row label="Policy" value={a.policyNumber} />}
            {a.assetType === 'life_insurance' && <Row label="Cover" value={a.coverAmount} />}
            {a.assetType === 'vehicle' && <Row label="Vehicle" value={[a.year, a.make, a.model].filter(Boolean).join(' ')} />}
            {a.assetType === 'vehicle' && <Row label="Rego" value={a.rego} />}
            {a.assetType === 'other' && <Row label="Description" value={a.description} />}
            {a.assetType === 'other' && <Row label="Value" value={a.otherValue} />}
          </div>
        ))}
      </Section>

      {/* Beneficiaries */}
      <Section title={STEP_LABELS.beneficiaries} stepId="beneficiaries" activeSteps={activeSteps} onEdit={edit('beneficiaries')}>
        {bd.people.length === 0 && bd.charities.length === 0 && (
          <p className="text-sm text-[var(--neutral)]">No beneficiaries added</p>
        )}
        {bd.people.map((p, i) => (
          <div key={p.id}>
            {i > 0 && <Divider />}
            <Row label="Name" value={p.name} />
            <Row label="Relationship" value={p.relationship} />
            <Row label="Share" value={p.percentage ? `${p.percentage}%` : ''} />
          </div>
        ))}
        {bd.charities.length > 0 && (bd.people.length > 0 ? <Divider /> : null)}
        {bd.charities.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <Divider />}
            <Row label="Charity" value={c.name} />
            <Row label="ABN" value={c.abn} />
            <Row label="Share" value={c.percentage ? `${c.percentage}%` : ''} />
          </div>
        ))}
        {(bd.people.length > 0 || bd.charities.length > 0) && (
          <>
            <Divider />
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[var(--neutral)]">Total</span>
              <span style={{ color: Math.abs(totalPct - 100) < 0.01 ? 'var(--teal)' : '#d97706' }}>
                {totalPct.toFixed(totalPct % 1 === 0 ? 0 : 2)}%
              </span>
            </div>
          </>
        )}
      </Section>

      {/* Specific Gifts */}
      <Section title={STEP_LABELS.gifts} stepId="gifts" activeSteps={activeSteps} onEdit={edit('gifts')}>
        {specificGifts.length === 0 && <p className="text-sm text-[var(--neutral)]">No specific gifts</p>}
        {specificGifts.map((g, i) => (
          <div key={g.id}>
            {i > 0 && <Divider />}
            <Row label="Type" value={g.type === 'cash' ? 'Cash' : 'Item / Property'} />
            {g.type === 'cash' && <Row label="Amount" value={g.amount} />}
            {g.description && <Row label="Description" value={g.description} />}
            <Row label="Recipient" value={g.recipientName} />
            <Row label="Relationship" value={g.recipientRelationship} />
          </div>
        ))}
      </Section>

      {/* Wishes & Trusts */}
      <Section title={STEP_LABELS.wishes} stepId="wishes" activeSteps={activeSteps} onEdit={edit('wishes')}>
        <Row label="Survivorship" value={`${formData.survivorshipDays} days`} />
        {cd.hasChildren === 'yes' && cd.children.some((c) => c.isDependent) && (
          <Row label="Age of vesting" value={cd.ageOfVesting} />
        )}
        {/* Funeral wishes now live in Personal Wishes (non-testamentary)  -  not shown here */}
        <Row label="Pets" value={pc.hasPets === 'yes' ? pc.description || 'Yes' : ''} />
        {pc.hasPets === 'yes' && <Row label="Pet caregiver" value={[pc.caregiverName, pc.caregiverRelationship].filter(Boolean).join('  -  ')} />}
        <Row label="Life interest" value={li.enabled ? `${li.propertyDescription || 'Property'}  -  ${li.lifeTenantName || 'unnamed'}` : ''} />
        <Row label="Overseas assets" value={formData.assetsOutsideAustralia ? formData.otherJurisdictions || 'Yes' : ''} />
        <Row label="Document location" value={formData.importantDocumentsLocation} />
      </Section>

      {triggeredFlagLabels(formData).length > 0 && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-amber-900">Some aspects of your estate may benefit from professional review</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            You told us you have {formatFlagList(triggeredFlagLabels(formData))}. Complete your Will below  -  we&apos;ll flag these in your Vault with a recommendation to add a solicitor review. A review add-on is available from your Vault for around $150.
          </p>
        </div>
      )}

      <div className="border border-[var(--line)] bg-[var(--paper-warm)] px-4 py-3">
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>Note:</span> Heirloom Life is not a law firm and this is not legal advice. Your Will is prepared using established estate planning standards. It is not reviewed by a solicitor unless you purchase the review add-on from your Vault.
        </p>
      </div>
    </div>
  )
}
