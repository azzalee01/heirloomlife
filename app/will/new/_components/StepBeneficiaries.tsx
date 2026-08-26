'use client'

import type { BeneficiariesData, PersonBeneficiary, CharityBeneficiary, TriageFlags } from '../_types'
import TriageFlag from './TriageFlag'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

function emptyPerson(): PersonBeneficiary {
  return { id: crypto.randomUUID(), name: '', relationship: '', percentage: '', substituteBeneficiary: '' }
}

function emptyCharity(): CharityBeneficiary {
  return { id: crypto.randomUUID(), name: '', abn: '', percentage: '', substituteBeneficiary: '' }
}

function totalAllocated(data: BeneficiariesData): number {
  const people = data.people.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0)
  const charities = data.charities.reduce((s, c) => s + (parseFloat(c.percentage) || 0), 0)
  return people + charities
}

interface Props {
  data: BeneficiariesData
  onChange: (data: BeneficiariesData) => void
  triageFlags: TriageFlags
  onTriageFlagsChange: (flags: TriageFlags) => void
}

export default function StepBeneficiaries({ data, onChange, triageFlags, onTriageFlagsChange }: Props) {
  const total = totalAllocated(data)
  const remaining = 100 - total

  function updatePerson(id: string, updates: Partial<PersonBeneficiary>) {
    onChange({ ...data, people: data.people.map((p) => (p.id === id ? { ...p, ...updates } : p)) })
  }

  function removePerson(id: string) {
    onChange({ ...data, people: data.people.filter((p) => p.id !== id) })
  }

  function updateCharity(id: string, updates: Partial<CharityBeneficiary>) {
    onChange({ ...data, charities: data.charities.map((c) => (c.id === id ? { ...c, ...updates } : c)) })
  }

  function removeCharity(id: string) {
    onChange({ ...data, charities: data.charities.filter((c) => c.id !== id) })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Beneficiaries</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          Specify who inherits your estate and the percentage each receives. This forms your{' '}
          <strong>residuary clause</strong> — it covers everything not given away as a specific gift, so it&apos;s
          the most important section of your will. Missing it means part of your estate could be distributed
          under intestacy rules instead of your wishes.
        </p>
      </div>

      {/* Live allocation counter — must reach 100% to continue */}
      <div
        className="border px-4 py-3.5"
        style={{
          borderColor: total > 100 ? '#ef4444' : total === 100 ? 'var(--teal)' : 'var(--line)',
          background: total === 100 ? 'rgba(42,180,174,0.04)' : 'var(--paper-warm)',
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
            Estate allocated
          </span>
          <span
            className="text-lg font-bold tabular-nums leading-none"
            style={{ color: total > 100 ? '#ef4444' : total === 100 ? 'var(--teal)' : 'var(--ink)' }}
          >
            {total % 1 === 0 ? total : total.toFixed(1)}%
          </span>
        </div>
        {/* Segmented track */}
        <div className="h-2 bg-[var(--line)] overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(total, 100)}%`,
              backgroundColor: total > 100 ? '#ef4444' : total === 100 ? 'var(--teal)' : 'var(--teal)',
              opacity: total === 100 ? 1 : 0.5,
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: total > 100 ? '#ef4444' : 'var(--neutral)' }}>
          {total === 100
            ? '✓ Estate fully allocated — ready to continue'
            : total > 100
            ? `Over by ${(total - 100).toFixed(1)}% — reduce allocations to exactly 100%`
            : `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)}% still to allocate — must reach 100% to continue`}
        </p>
      </div>

      {/* People */}
      <section className="space-y-4">
        <p className={eyebrow}>People</p>

        {data.people.length === 0 ? (
          <p className="text-sm text-[var(--neutral)]">No individual beneficiaries added.</p>
        ) : (
          data.people.map((person, i) => (
            <div key={person.id} className="p-4 border border-[var(--line)] bg-[var(--paper-warm)] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ink)]">Person {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removePerson(person.id)}
                  className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Full name <span className="text-red-400">*</span></label>
                  <input required className={inp} value={person.name} onChange={(e) => updatePerson(person.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Relationship <span className="text-red-400">*</span></label>
                  <input required className={inp} placeholder="e.g. Spouse, Child" value={person.relationship} onChange={(e) => updatePerson(person.id, { relationship: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Share (%) <span className="text-red-400">*</span></label>
                  <input
                    required type="number" min="0.1" max="100" step="0.1"
                    className={inp} value={person.percentage}
                    onChange={(e) => updatePerson(person.id, { percentage: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={lbl}>If they don&apos;t survive me, their share goes to (optional)</label>
                <input
                  className={inp}
                  placeholder="e.g. Their children equally, or a named person"
                  value={person.substituteBeneficiary}
                  onChange={(e) => updatePerson(person.id, { substituteBeneficiary: e.target.value })}
                />
              </div>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={() => onChange({ ...data, people: [...data.people, emptyPerson()] })}
          className="text-sm font-medium text-[var(--teal)] transition-colors"
        >
          + Add person
        </button>
      </section>

      {/* Charities */}
      <section className="space-y-4">
        <p className={eyebrow}>Charities</p>

        {data.charities.length === 0 ? (
          <p className="text-sm text-[var(--neutral)]">No charities added.</p>
        ) : (
          data.charities.map((charity, i) => (
            <div key={charity.id} className="p-4 border border-[var(--line)] bg-[var(--paper-warm)] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ink)]">Charity {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeCharity(charity.id)}
                  className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Charity name <span className="text-red-400">*</span></label>
                  <input required className={inp} placeholder="e.g. Red Cross Australia" value={charity.name} onChange={(e) => updateCharity(charity.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>ABN</label>
                  <input className={inp} placeholder="XX XXX XXX XXX" value={charity.abn} onChange={(e) => updateCharity(charity.id, { abn: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Share (%) <span className="text-red-400">*</span></label>
                  <input
                    required type="number" min="0.1" max="100" step="0.1"
                    className={inp} value={charity.percentage}
                    onChange={(e) => updateCharity(charity.id, { percentage: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={lbl}>If this charity no longer exists, their share goes to (optional)</label>
                <input
                  className={inp}
                  placeholder="e.g. Another named charity"
                  value={charity.substituteBeneficiary}
                  onChange={(e) => updateCharity(charity.id, { substituteBeneficiary: e.target.value })}
                />
              </div>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={() => onChange({ ...data, charities: [...data.charities, emptyCharity()] })}
          className="text-sm font-medium text-[var(--teal)] transition-colors"
        >
          + Add charity
        </button>
      </section>

      {/* Triage questions */}
      <section className="space-y-5 border-t border-[var(--line)] pt-6">
        <div>
          <p className={eyebrow}>A few more questions</p>
          <p className="text-sm text-[var(--neutral)]">
            These help us flag situations where a template Will may not be enough.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--ink)]">
            Do you intend to exclude a spouse, child, or close family member from your estate?
          </p>
          <div className="flex gap-6">
            {(['yes', 'no'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exclusionIntent"
                  checked={triageFlags.hasExclusionIntent === (v === 'yes')}
                  onChange={() => onTriageFlagsChange({ ...triageFlags, hasExclusionIntent: v === 'yes' })}
                  className="w-4 h-4 accent-[var(--teal)]"
                />
                <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
          {triageFlags.hasExclusionIntent && <TriageFlag />}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--ink)]">
            Does any beneficiary have a disability, special needs, or a condition affecting their mental capacity?
          </p>
          <div className="flex gap-6">
            {(['yes', 'no'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vulnerableBeneficiary"
                  checked={triageFlags.hasVulnerableBeneficiary === (v === 'yes')}
                  onChange={() => onTriageFlagsChange({ ...triageFlags, hasVulnerableBeneficiary: v === 'yes' })}
                  className="w-4 h-4 accent-[var(--teal)]"
                />
                <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
          {triageFlags.hasVulnerableBeneficiary && <TriageFlag />}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--ink)]">
            Does any beneficiary have difficulty managing money or financial challenges?
          </p>
          <div className="flex gap-6">
            {(['yes', 'no'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="beneficiaryFinancialChallenges"
                  checked={triageFlags.hasBeneficiaryFinancialChallenges === (v === 'yes')}
                  onChange={() => onTriageFlagsChange({ ...triageFlags, hasBeneficiaryFinancialChallenges: v === 'yes' })}
                  className="w-4 h-4 accent-[var(--teal)]"
                />
                <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
          {triageFlags.hasBeneficiaryFinancialChallenges && <TriageFlag />}
        </div>
      </section>
    </div>
  )
}
