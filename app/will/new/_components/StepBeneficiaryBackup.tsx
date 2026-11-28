'use client'

import { useState } from 'react'
import type { PersonBeneficiary } from '../_types'

interface Props {
  beneficiary: PersonBeneficiary
  otherBeneficiaries: PersonBeneficiary[]
  onChange: (substituteBeneficiary: string) => void
  onSkip?: () => void
}

const PRESET_OPTIONS = [
  { value: '__their_children__', label: 'Their children, equally' },
  { value: '__other_beneficiaries__', label: 'My other beneficiaries, pro-rata' },
  { value: '__custom__', label: 'Someone else (I\'ll name them)' },
]

function isPreset(value: string): boolean {
  return PRESET_OPTIONS.some((o) => o.value === value)
}

export default function StepBeneficiaryBackup({ beneficiary, onChange, onSkip }: Props) {
  const current = beneficiary.substituteBeneficiary
  // "Custom" (someone else) is sticky local state: selecting it must keep the
  // text input visible even while the typed name is still empty — otherwise the
  // radio deselects and the name can never be entered/stored. A stored value
  // that isn't a preset means we're already in custom mode.
  const storedCustom = current !== '' && !isPreset(current)
  const [customMode, setCustomMode] = useState(storedCustom)
  const showCustom = customMode || storedCustom
  const selected = showCustom ? '__custom__' : (isPreset(current) ? current : '')
  const customValue = isPreset(current) ? '' : current

  const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
          Backup for {beneficiary.name}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
          If {beneficiary.name} doesn&apos;t survive you (within the survivorship period), who should receive their{' '}
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>{beneficiary.percentage}% share</span> of your estate?
        </p>
      </div>

      <div className="space-y-2">
        {PRESET_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-start gap-3 px-4 py-3 border cursor-pointer transition-colors"
            style={{
              borderColor: selected === opt.value ? 'var(--teal)' : 'var(--line)',
              background: selected === opt.value ? 'rgba(42,180,174,0.04)' : 'white',
            }}
          >
            <input
              type="radio"
              name={`backup_${beneficiary.id}`}
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => {
                if (opt.value === '__custom__') {
                  setCustomMode(true)
                  if (isPreset(current)) onChange('') // clear a stale preset so the typed name is stored fresh
                } else {
                  setCustomMode(false)
                  onChange(opt.value)
                }
              }}
              className="mt-0.5 w-4 h-4 accent-[var(--teal)] shrink-0"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{opt.label}</p>
              {opt.value === '__their_children__' && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                  If they have no children, the share passes to your other beneficiaries pro-rata.
                </p>
              )}
              {opt.value === '__other_beneficiaries__' && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                  Their share is redistributed among your remaining beneficiaries in proportion to their existing shares.
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Custom name input */}
      {showCustom && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
            Name the backup beneficiary
          </label>
          <input
            type="text"
            className={inp}
            placeholder="Full name"
            value={customValue}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <p className="text-xs mt-1" style={{ color: 'var(--neutral)' }}>
            If their share would pass to a minor, it will be held on trust until the vesting age you set.
          </p>
        </div>
      )}

      {/* Skip: clear any selection AND advance (decide later). */}
      <button
        type="button"
        onClick={() => { onChange(''); onSkip?.() }}
        className="text-xs"
        style={{ color: 'var(--neutral)' }}
      >
        Skip  -  I&apos;ll decide later
      </button>
    </div>
  )
}
