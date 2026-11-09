'use client'

import { useEffect, useMemo, useState } from 'react'
import type { BeneficiariesData, PersonBeneficiary, CharityBeneficiary, TriageFlags } from '../_types'
import { listActivePartners, type ActivePartner } from '../_partner-actions'
import TriageFlag from './TriageFlag'
import TermDef from './TermDef'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

function emptyPerson(): PersonBeneficiary {
  return { id: crypto.randomUUID(), name: '', relationship: '', percentage: '', substituteBeneficiary: '' }
}

function emptyCharity(): CharityBeneficiary {
  return { id: crypto.randomUUID(), name: '', abn: '', percentage: '', substituteBeneficiary: '', charityPartnerId: null }
}

function totalAllocated(data: BeneficiariesData): number {
  const people = data.people.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0)
  const charities = data.charities.reduce((s, c) => s + (parseFloat(c.percentage) || 0), 0)
  return people + charities
}

const PCT_CHIPS = [10, 25, 50, 100]

// ── Share control: preset chips + slider + "use remaining" ───────────────────
function ShareControl({
  value,
  remainingForRow,
  onChange,
}: {
  value: string
  remainingForRow: number
  onChange: (v: string) => void
}) {
  const num = parseFloat(value) || 0
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className={lbl + ' mb-0'}>Share of estate <span className="text-red-400">*</span></label>
        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--teal)' }}>
          {num % 1 === 0 ? num : num.toFixed(1)}%
        </span>
      </div>
      <input
        type="range" min={0} max={100} step={1}
        value={Math.min(num, 100)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-[var(--teal)] cursor-pointer"
        aria-label="Share of estate"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {PCT_CHIPS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(String(p))}
            className="px-2.5 py-1 text-xs font-medium border transition-colors"
            style={
              num === p
                ? { borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.08)', color: 'var(--teal-deep)' }
                : { borderColor: 'var(--line)', color: 'var(--neutral)' }
            }
          >
            {p}%
          </button>
        ))}
        {remainingForRow > 0 && num !== remainingForRow && (
          <button
            type="button"
            onClick={() => onChange(String(remainingForRow % 1 === 0 ? remainingForRow : remainingForRow.toFixed(1)))}
            className="px-2.5 py-1 text-xs font-medium border transition-colors"
            style={{ borderColor: 'var(--teal)', color: 'var(--teal-deep)' }}
          >
            Remaining ({remainingForRow % 1 === 0 ? remainingForRow : remainingForRow.toFixed(1)}%)
          </button>
        )}
        <input
          type="number" min="0" max="100" step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 ml-auto px-2 py-1 border border-[var(--line)] text-sm text-right tabular-nums outline-none focus:border-[var(--teal)] bg-white"
          aria-label="Exact share percentage"
        />
      </div>
    </div>
  )
}

// ── Partner selector: searchable list of active partner charities ────────────
function PartnerSelector({
  partners,
  loading,
  onSelect,
  onManual,
}: {
  partners: ActivePartner[]
  loading: boolean
  onSelect: (p: ActivePartner) => void
  onManual: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return partners
    return partners.filter((p) => p.name.toLowerCase().includes(q))
  }, [partners, query])

  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Choose a charity</label>
        <input
          className={inp}
          placeholder={loading ? 'Loading partner charities…' : 'Search charities…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>

      {!loading && partners.length === 0 && (
        <p className="text-sm text-[var(--neutral)]">No partner charities are available right now.</p>
      )}

      {partners.length > 0 && (
        <div className="max-h-64 overflow-y-auto border border-[var(--line)] divide-y" style={{ borderColor: 'var(--line)' }}>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--neutral)]">No matches for &ldquo;{query}&rdquo;.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--paper-warm)] transition-colors"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-white border"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: 'var(--neutral)' }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.name}</span>
                  <span className="block text-xs truncate" style={{ color: 'var(--neutral)' }}>ABN {p.abn}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Low-key manual fallback */}
      <button
        type="button"
        onClick={onManual}
        className="text-xs underline underline-offset-2"
        style={{ color: 'var(--neutral)' }}
      >
        Can&apos;t find your charity? Enter it manually
      </button>
    </div>
  )
}

interface Props {
  data: BeneficiariesData
  onChange: (data: BeneficiariesData) => void
  triageFlags: TriageFlags
  onTriageFlagsChange: (flags: TriageFlags) => void
  extractedFields?: Set<string>
}

export default function StepBeneficiaries({ data, onChange, triageFlags, onTriageFlagsChange, extractedFields }: Props) {
  const hasExtracted = extractedFields && extractedFields.has('beneficiariesData.people')
  const total = totalAllocated(data)
  const remaining = 100 - total

  const [partners, setPartners] = useState<ActivePartner[]>([])
  const [partnersLoading, setPartnersLoading] = useState(true)
  // Rows the user has explicitly switched to manual entry (keyed by charity id).
  const [manualRows, setManualRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    listActivePartners()
      .then((p) => { if (active) setPartners(p) })
      .finally(() => { if (active) setPartnersLoading(false) })
    return () => { active = false }
  }, [])

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

  // No active partners (e.g. before the first pilot is signed) → the picker has
  // nothing to show, so behave exactly like the old manual charity flow.
  const noPartners = !partnersLoading && partners.length === 0

  // A charity shows the partner card when it's linked; manual inputs when the
  // user chose manual entry, a legacy/manual charity (name, no partner) was
  // loaded, or there are no partners to pick; otherwise the searchable selector.
  function isManual(c: CharityBeneficiary): boolean {
    return (
      manualRows[c.id] === true ||
      (!c.charityPartnerId && c.name.trim() !== '') ||
      (noPartners && !c.charityPartnerId)
    )
  }

  function remainingForRow(c: CharityBeneficiary): number {
    const own = parseFloat(c.percentage) || 0
    return Math.max(0, Math.min(100, 100 - total + own))
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Beneficiaries</h2>
        {hasExtracted && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--teal-deep)' }}>Pre-filled from your uploaded Will — confirm or edit</p>
        )}
        <p className="text-sm text-[var(--neutral)] mt-1">
          Specify who inherits your estate and the percentage each receives. This forms your{' '}
          <strong><TermDef term="Residuary clause" definition="The clause that distributes everything remaining after debts, expenses, and specific gifts have been paid. Without it, the leftover assets fall outside your Will entirely." /></strong>
          {' '}— it covers everything not given away as a specific gift, so it&apos;s the most important section of your Will.
          Missing it means part of your estate could be distributed under{' '}
          <TermDef term="Intestacy rules" definition="The default NSW laws that apply when someone dies without a valid Will, or when a Will doesn't cover all their assets. The outcome is fixed by statute and may not reflect your wishes — only spouses, children, and certain relatives benefit." />
          {' '}instead of your wishes.
        </p>
      </div>

      {/* Live allocation counter  -  must reach 100% to continue */}
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
            ? '✓ Estate fully allocated  -  ready to continue'
            : total > 100
            ? `Over by ${(total - 100).toFixed(1)}%  -  reduce allocations to exactly 100%`
            : `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)}% still to allocate  -  must reach 100% to continue`}
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
          data.charities.map((charity, i) => {
            const linked = !!charity.charityPartnerId
            const manual = isManual(charity)
            return (
              <div key={charity.id} className="p-4 border border-[var(--line)] bg-[var(--paper-warm)] space-y-4">
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

                {linked ? (
                  // ── Selected partner charity (name + ABN read-only) ──────────
                  <div className="flex items-center gap-3 p-3 bg-white border" style={{ borderColor: 'var(--teal)' }}>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-white border"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      {partners.find((p) => p.id === charity.charityPartnerId)?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={partners.find((p) => p.id === charity.charityPartnerId)!.logoUrl!} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: 'var(--neutral)' }}>
                          {charity.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{charity.name}</span>
                        <span
                          className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
                        >
                          Partner
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--neutral)' }}>ABN {charity.abn} · verified</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManualRows((m) => ({ ...m, [charity.id]: false }))
                        updateCharity(charity.id, { charityPartnerId: null, name: '', abn: '' })
                      }}
                      className="shrink-0 text-xs font-medium"
                      style={{ color: 'var(--teal)' }}
                    >
                      Change
                    </button>
                  </div>
                ) : manual ? (
                  // ── Manual entry fallback ────────────────────────────────────
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Charity name <span className="text-red-400">*</span></label>
                        <input required className={inp} placeholder="e.g. Local Animal Rescue Inc." value={charity.name} onChange={(e) => updateCharity(charity.id, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className={lbl}>ABN</label>
                        <input className={inp} placeholder="XX XXX XXX XXX" value={charity.abn} onChange={(e) => updateCharity(charity.id, { abn: e.target.value })} />
                      </div>
                    </div>
                    {partners.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualRows((m) => ({ ...m, [charity.id]: false }))
                          updateCharity(charity.id, { name: '', abn: '' })
                        }}
                        className="text-xs underline underline-offset-2"
                        style={{ color: 'var(--neutral)' }}
                      >
                        ← Choose from our partner charities instead
                      </button>
                    )}
                  </div>
                ) : (
                  // ── Searchable partner selector ──────────────────────────────
                  <PartnerSelector
                    partners={partners}
                    loading={partnersLoading}
                    onSelect={(p) => updateCharity(charity.id, { charityPartnerId: p.id, name: p.name, abn: p.abn })}
                    onManual={() => setManualRows((m) => ({ ...m, [charity.id]: true }))}
                  />
                )}

                {/* Share control shows once a charity is chosen (partner or manual) */}
                {(linked || manual) && (
                  <ShareControl
                    value={charity.percentage}
                    remainingForRow={remainingForRow(charity)}
                    onChange={(v) => updateCharity(charity.id, { percentage: v })}
                  />
                )}

                {(linked || manual) && (
                  <div>
                    <label className={lbl}>If this charity no longer exists, their share goes to (optional)</label>
                    <input
                      className={inp}
                      placeholder="e.g. Another named charity"
                      value={charity.substituteBeneficiary}
                      onChange={(e) => updateCharity(charity.id, { substituteBeneficiary: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )
          })
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
