'use client'

import { useState } from 'react'
import { savePersonalWishes } from '../_actions'
import type { PersonalWishesData } from '../_types'

const FUNERAL_TYPES = [
  { value: 'burial', label: 'Burial' },
  { value: 'cremation', label: 'Cremation' },
  { value: 'donation', label: 'Body donation to medical science' },
  { value: 'other', label: 'Other / no preference' },
] as const

interface Props {
  willId: string | null
  initialData: PersonalWishesData
}

export default function PersonalWishes({ willId, initialData }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<PersonalWishesData>(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
  const lbl = 'block text-sm font-medium mb-1.5' as const

  function update(updates: Partial<PersonalWishesData>) {
    setData((prev) => ({ ...prev, ...updates }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePersonalWishes(willId, data)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const hasContent = data.funeralType || data.funeralRestingPlace || data.funeralAdditionalWishes

  return (
    <div className="border border-[var(--line)] bg-white">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--neutral)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Personal Wishes</p>
            <p className="text-xs" style={{ color: 'var(--neutral)' }}>
              {hasContent
                ? 'Your personal wishes are recorded'
                : 'Funeral wishes and other guidance for your family — optional'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && (
            <span className="text-xs font-medium px-2 py-0.5" style={{ color: 'var(--teal)', background: 'rgba(42,180,174,0.1)' }}>
              Added
            </span>
          )}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--neutral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--line)] px-5 py-5 space-y-6">
          {/* Intro — non-testamentary note */}
          <div className="px-4 py-3 border-l-2" style={{ borderColor: 'var(--neutral)', background: 'var(--paper-warm)' }}>
            <p className="text-xs" style={{ color: 'var(--neutral)' }}>
              <span className="font-semibold" style={{ color: 'var(--ink)' }}>Personal Wishes</span> — These aren&apos;t part of your signed Will, but they give your family clear guidance when it matters most. They are not legally binding and are stored separately from your Will document.
            </p>
          </div>

          {/* Funeral type */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
              Funeral preference
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FUNERAL_TYPES.map((ft) => (
                <label
                  key={ft.value}
                  className="flex items-center gap-2.5 px-3 py-2.5 border cursor-pointer transition-colors text-sm"
                  style={{
                    borderColor: data.funeralType === ft.value ? 'var(--teal)' : 'var(--line)',
                    background: data.funeralType === ft.value ? 'rgba(42,180,174,0.04)' : 'white',
                    color: 'var(--ink)',
                  }}
                >
                  <input
                    type="radio"
                    name="funeralType"
                    value={ft.value}
                    checked={data.funeralType === ft.value}
                    onChange={() => update({ funeralType: ft.value })}
                    className="w-4 h-4 accent-[var(--teal)] shrink-0"
                  />
                  {ft.label}
                </label>
              ))}
            </div>
          </section>

          {/* Resting place */}
          <section className="space-y-2">
            <label htmlFor="pw-resting" className={lbl} style={{ color: 'var(--ink)' }}>
              Final resting place (optional)
            </label>
            <input
              id="pw-resting"
              type="text"
              className={inp}
              placeholder="e.g. Family plot at Rookwood, or ashes scattered at Byron Bay"
              value={data.funeralRestingPlace}
              onChange={(e) => update({ funeralRestingPlace: e.target.value })}
            />
          </section>

          {/* Additional wishes */}
          <section className="space-y-2">
            <label htmlFor="pw-wishes" className={lbl} style={{ color: 'var(--ink)' }}>
              Additional wishes (optional)
            </label>
            <textarea
              id="pw-wishes"
              className={inp}
              rows={3}
              placeholder="e.g. A small private ceremony with family only, favourite music, charitable donations in lieu of flowers"
              value={data.funeralAdditionalWishes}
              onChange={(e) => update({ funeralAdditionalWishes: e.target.value })}
            />
          </section>

          {/* Pre-paid plan */}
          <section className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasFuneralPlan}
                onChange={(e) => update({ hasFuneralPlan: e.target.checked })}
                className="w-4 h-4 accent-[var(--teal)]"
              />
              <span className="text-sm" style={{ color: 'var(--ink)' }}>I have a pre-paid funeral plan</span>
            </label>
            {data.hasFuneralPlan && (
              <input
                className={inp}
                placeholder="Provider and plan/reference number"
                value={data.funeralPlanDetails}
                onChange={(e) => update({ funeralPlanDetails: e.target.value })}
              />
            )}
          </section>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              {saving ? 'Saving…' : 'Save wishes'}
            </button>
            {saved && (
              <span className="text-sm" style={{ color: 'var(--teal)' }}>✓ Saved</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
