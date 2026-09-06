'use client'

import type { ChildrenData, Child } from '../_types'
import ExtractedBadge from './ExtractedBadge'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

function emptyChild(): Child {
  return { id: crypto.randomUUID(), name: '', dateOfBirth: '', isDependent: false }
}

interface Props {
  data: ChildrenData
  onChange: (data: ChildrenData) => void
  extractedFields?: Set<string>
}

export default function StepChildren({ data, onChange, extractedFields }: Props) {
  const hasExtracted = extractedFields && (
    extractedFields.has('childrenData.children') ||
    extractedFields.has('childrenData.hasChildren') ||
    extractedFields.has('childrenData.guardian')
  )
  const hasMinors = data.children.some((c) => c.isDependent)

  function updateChild(id: string, updates: Partial<Child>) {
    onChange({ ...data, children: data.children.map((c) => (c.id === id ? { ...c, ...updates } : c)) })
  }

  function addChild() {
    onChange({ ...data, children: [...data.children, emptyChild()] })
  }

  function removeChild(id: string) {
    onChange({ ...data, children: data.children.filter((c) => c.id !== id) })
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Children</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">Tell us about your children</p>
        {hasExtracted && (
          <div className="mt-2 flex items-center gap-2">
            <ExtractedBadge />
            <span className="text-xs text-[var(--neutral)]">pre-filled from your uploaded Will — confirm or edit</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--ink)] mb-3">
          Do you have children? <span className="text-red-400">*</span>
        </p>
        <div className="flex gap-6">
          {(['yes', 'no'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasChildren"
                value={v}
                checked={data.hasChildren === v}
                onChange={() =>
                  onChange({
                    ...data,
                    hasChildren: v,
                    children: v === 'yes' && data.children.length === 0 ? [emptyChild()] : data.children,
                  })
                }
                className="w-4 h-4 accent-[var(--teal)]"
              />
              <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
            </label>
          ))}
        </div>
      </div>

      {data.hasChildren === 'yes' && (
        <div className="space-y-4">
          <p className={eyebrow}>Children</p>

          {data.children.map((child, i) => (
            <div key={child.id} className="relative p-4 border border-[var(--line)] bg-[var(--paper-warm)] space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-[var(--ink)]">Child {i + 1}</p>
                {data.children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Full name <span className="text-red-400">*</span></label>
                  <input required className={inp} value={child.name} onChange={(e) => updateChild(child.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>Date of birth</label>
                  <input type="date" className={inp} value={child.dateOfBirth} onChange={(e) => updateChild(child.id, { dateOfBirth: e.target.value })} />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={child.isDependent}
                  onChange={(e) => updateChild(child.id, { isDependent: e.target.checked })}
                  className="w-4 h-4 accent-[var(--teal)]"
                />
                <span className="text-sm text-[var(--ink)]">This child is a dependent (minor or financially dependent)</span>
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addChild}
            className="text-sm font-medium text-[var(--teal)] transition-colors"
          >
            + Add another child
          </button>
        </div>
      )}

      {data.hasChildren === 'yes' && hasMinors && (
        <section className="space-y-4 pt-2">
          <div>
            <p className={eyebrow}>Guardian for Minor Children</p>
            <p className="text-sm text-[var(--neutral)]">
              Who should care for your minor children if something happens to you?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>First name <span className="text-red-400">*</span></label>
              <input
                required
                className={inp}
                value={data.guardian.firstName}
                onChange={(e) => onChange({ ...data, guardian: { ...data.guardian, firstName: e.target.value } })}
              />
            </div>
            <div>
              <label className={lbl}>Last name <span className="text-red-400">*</span></label>
              <input
                required
                className={inp}
                value={data.guardian.lastName}
                onChange={(e) => onChange({ ...data, guardian: { ...data.guardian, lastName: e.target.value } })}
              />
            </div>
            <div>
              <label className={lbl}>Relationship <span className="text-red-400">*</span></label>
              <input
                required
                className={inp}
                placeholder="e.g. Aunt, Family friend"
                value={data.guardian.relationship}
                onChange={(e) => onChange({ ...data, guardian: { ...data.guardian, relationship: e.target.value } })}
              />
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input
                type="tel"
                className={inp}
                value={data.guardian.phone}
                onChange={(e) => onChange({ ...data, guardian: { ...data.guardian, phone: e.target.value } })}
              />
            </div>
            <div>
              <label className={lbl}>Email</label>
              <input
                type="email"
                className={inp}
                value={data.guardian.email}
                onChange={(e) => onChange({ ...data, guardian: { ...data.guardian, email: e.target.value } })}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
