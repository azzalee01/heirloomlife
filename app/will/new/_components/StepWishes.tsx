'use client'

import type { WillFormData, PetCareData, LifeInterestData } from '../_types'
import TriageFlag from './TriageFlag'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

interface Props {
  formData: WillFormData
  hasDependentChildren: boolean
  onChange: (updates: Partial<WillFormData>) => void
}

export default function StepWishes({ formData, hasDependentChildren, onChange }: Props) {
  const cd = formData.childrenData
  const pc = formData.petCare
  const li = formData.lifeInterest

  function setPetCare(updates: Partial<PetCareData>) {
    onChange({ petCare: { ...pc, ...updates } })
  }

  function setLifeInterest(updates: Partial<LifeInterestData>) {
    onChange({ lifeInterest: { ...li, ...updates } })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Wishes &amp; Trusts</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          A few standard provisions that protect your estate from common disputes and delays.
        </p>
      </div>

      {/* Survivorship period */}
      <section className="space-y-3">
        <p className={eyebrow}>Survivorship Period</p>
        <p className="text-sm text-[var(--neutral)]">
          A beneficiary must survive you by this many days to inherit  -  this avoids double-administration
          if you and a beneficiary die close together. 30 days is standard.
        </p>
        <div className="sm:max-w-xs">
          <label className={lbl}>Days</label>
          <input
            type="number" min="0" step="1"
            className={inp}
            value={formData.survivorshipDays}
            onChange={(e) => onChange({ survivorshipDays: e.target.value })}
          />
        </div>
      </section>

      {/* Testamentary trust / age of vesting */}
      {hasDependentChildren && (
        <section className="space-y-3">
          <p className={eyebrow}>Testamentary Trust</p>
          <p className="text-sm text-[var(--neutral)]">
            Since you have dependent children, their inheritance will be held on trust until they reach
            this age, rather than paid out as a lump sum while they&apos;re still minors.
          </p>
          <div className="sm:max-w-xs">
            <label className={lbl}>Age of vesting</label>
            <select
              className={inp}
              value={cd.ageOfVesting}
              onChange={(e) => onChange({ childrenData: { ...cd, ageOfVesting: e.target.value } })}
            >
              <option value="18">18</option>
              <option value="21">21</option>
              <option value="25">25</option>
            </select>
          </div>
        </section>
      )}

      {/* Pet care */}
      <section className="space-y-3">
        <p className={eyebrow}>Pet Care</p>
        <p className="text-sm font-medium text-[var(--ink)]">Do you have pets to provide for?</p>
        <div className="flex gap-6">
          {(['yes', 'no'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasPets"
                checked={pc.hasPets === v}
                onChange={() => setPetCare({ hasPets: v })}
                className="w-4 h-4 accent-[var(--teal)]"
              />
              <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
            </label>
          ))}
        </div>
        {pc.hasPets === 'yes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="sm:col-span-2">
              <label className={lbl}>Pet(s)</label>
              <input className={inp} placeholder="e.g. My dog Max and cat Willow" value={pc.description} onChange={(e) => setPetCare({ description: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Caregiver name</label>
              <input className={inp} value={pc.caregiverName} onChange={(e) => setPetCare({ caregiverName: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Relationship</label>
              <input className={inp} value={pc.caregiverRelationship} onChange={(e) => setPetCare({ caregiverRelationship: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Funds for their care (optional)</label>
              <input className={inp} placeholder="$0" value={pc.careFundAmount} onChange={(e) => setPetCare({ careFundAmount: e.target.value })} />
            </div>
          </div>
        )}
      </section>

      {/* Life interest / right to reside */}
      <section className="space-y-3">
        <p className={eyebrow}>Life Interest / Right to Reside</p>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={li.enabled}
            onChange={(e) => setLifeInterest({ enabled: e.target.checked })}
            className="w-4 h-4 accent-[var(--teal)]"
          />
          <span className="text-sm text-[var(--ink)]">
            Someone should have the right to live in a property before it passes to others
          </span>
        </label>
        <p className="text-xs text-[var(--neutral)]">
          Common for blended families  -  e.g. a partner can live in the house until they die or remarry, after
          which it passes to your children.
        </p>
        {li.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="sm:col-span-2">
              <label className={lbl}>Property</label>
              <input className={inp} placeholder="e.g. My home at 123 Example Street" value={li.propertyDescription} onChange={(e) => setLifeInterest({ propertyDescription: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Who has the right to reside</label>
              <input className={inp} value={li.lifeTenantName} onChange={(e) => setLifeInterest({ lifeTenantName: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Relationship</label>
              <input className={inp} value={li.lifeTenantRelationship} onChange={(e) => setLifeInterest({ lifeTenantRelationship: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Right ends when</label>
              <select className={inp} value={li.condition} onChange={(e) => setLifeInterest({ condition: e.target.value as LifeInterestData['condition'] })}>
                <option value="">Select…</option>
                <option value="death">They die</option>
                <option value="remarriage">They remarry / repartner</option>
                <option value="death_or_remarriage">They die, remarry, or repartner (whichever is first)</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Who the property passes to after</label>
              <input className={inp} value={li.remainderBeneficiaryName} onChange={(e) => setLifeInterest({ remainderBeneficiaryName: e.target.value })} />
            </div>
            <div>
              <label className={lbl}>Relationship</label>
              <input className={inp} value={li.remainderBeneficiaryRelationship} onChange={(e) => setLifeInterest({ remainderBeneficiaryRelationship: e.target.value })} />
            </div>
          </div>
        )}
      </section>

      {/* Overseas assets / jurisdictions */}
      <section className="space-y-3">
        <p className={eyebrow}>International Assets</p>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.assetsOutsideAustralia}
            onChange={(e) => onChange({ assetsOutsideAustralia: e.target.checked })}
            className="w-4 h-4 accent-[var(--teal)]"
          />
          <span className="text-sm text-[var(--ink)]">I own assets outside Australia</span>
        </label>
        {formData.assetsOutsideAustralia && (
          <div className="space-y-2">
            <div>
              <label className={lbl}>Which countries?</label>
              <input
                className={inp}
                placeholder="e.g. New Zealand, United Kingdom"
                value={formData.otherJurisdictions}
                onChange={(e) => onChange({ otherJurisdictions: e.target.value })}
              />
            </div>
            <TriageFlag />
          </div>
        )}
      </section>

      {/* Situation */}
      <section className="space-y-4">
        <p className={eyebrow}>Your situation</p>
        <p className="text-sm text-[var(--neutral)]">
          These help us flag situations where a template Will may not be enough.
        </p>

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.triageFlags.hasBusinessInterest}
              onChange={(e) => onChange({ triageFlags: { ...formData.triageFlags, hasBusinessInterest: e.target.checked } })}
              className="w-4 h-4 mt-0.5 accent-[var(--teal)]"
            />
            <span className="text-sm text-[var(--ink)]">I own or have an interest in a business or commercial property</span>
          </label>
          {formData.triageFlags.hasBusinessInterest && <TriageFlag />}
        </div>

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.triageFlags.hasBlendedFamily}
              onChange={(e) => onChange({ triageFlags: { ...formData.triageFlags, hasBlendedFamily: e.target.checked } })}
              className="w-4 h-4 mt-0.5 accent-[var(--teal)]"
            />
            <span className="text-sm text-[var(--ink)]">My estate involves a blended family or children from different relationships</span>
          </label>
          {formData.triageFlags.hasBlendedFamily && <TriageFlag />}
        </div>

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.triageFlags.hasComplexTrusts}
              onChange={(e) => onChange({ triageFlags: { ...formData.triageFlags, hasComplexTrusts: e.target.checked } })}
              className="w-4 h-4 mt-0.5 accent-[var(--teal)]"
            />
            <span className="text-sm text-[var(--ink)]">I need a testamentary trust structure beyond basic trusts for minor beneficiaries</span>
          </label>
          {formData.triageFlags.hasComplexTrusts && <TriageFlag />}
        </div>
      </section>

      {/* Important documents */}
      <section className="space-y-3">
        <p className={eyebrow}>Important Documents</p>
        <div>
          <label className={lbl}>Where can your executor find important documents? (optional)</label>
          <textarea
            className={inp}
            rows={2}
            placeholder="e.g. Original will and property deeds are in the safe at home"
            value={formData.importantDocumentsLocation}
            onChange={(e) => onChange({ importantDocumentsLocation: e.target.value })}
          />
        </div>
      </section>
    </div>
  )
}
