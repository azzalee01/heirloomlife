'use client'

import type { BeneficiariesData, PersonBeneficiary, CharityBeneficiary } from '../_types'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

function emptyPerson(): PersonBeneficiary {
  return { id: crypto.randomUUID(), name: '', relationship: '', percentage: '' }
}

function emptyCharity(): CharityBeneficiary {
  return { id: crypto.randomUUID(), name: '', abn: '', percentage: '' }
}

function totalAllocated(data: BeneficiariesData): number {
  const people = data.people.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0)
  const charities = data.charities.reduce((s, c) => s + (parseFloat(c.percentage) || 0), 0)
  return people + charities
}

interface Props {
  data: BeneficiariesData
  onChange: (data: BeneficiariesData) => void
}

export default function StepBeneficiaries({ data, onChange }: Props) {
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
          Specify who inherits your estate and the percentage each receives.
        </p>
      </div>

      {/* Allocation indicator */}
      <div className="border border-[var(--line)] bg-[var(--paper-warm)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--neutral)]">
            Total Allocated
          </span>
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: total > 100 ? '#ef4444' : total === 100 ? 'var(--teal)' : 'var(--ink)' }}
          >
            {total.toFixed(1)}%
          </span>
        </div>
        <div className="h-px bg-[var(--line)] relative">
          <div
            className="h-px absolute top-0 left-0 transition-all"
            style={{
              width: `${Math.min(total, 100)}%`,
              backgroundColor: total > 100 ? '#ef4444' : 'var(--teal)',
            }}
          />
        </div>
        {total !== 100 && (
          <p className="text-xs text-[var(--neutral)] mt-2">
            {total > 100
              ? `Over-allocated by ${(total - 100).toFixed(1)}% — reduce to exactly 100%`
              : `${remaining.toFixed(1)}% remaining to allocate`}
          </p>
        )}
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
    </div>
  )
}
