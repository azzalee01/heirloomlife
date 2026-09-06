'use client'

import type { ExecutorsData, ExecutorPerson } from '../_types'
import ExtractedBadge from './ExtractedBadge'

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)]'

interface ExecutorFormProps {
  label: string
  data: ExecutorPerson
  onChange: (data: ExecutorPerson) => void
}

function ExecutorForm({ label, data, onChange }: ExecutorFormProps) {
  function set(field: keyof ExecutorPerson, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="p-5 border border-[var(--line)] bg-[var(--paper-warm)] space-y-4">
      <p className="text-sm font-semibold text-[var(--ink)]">{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>First name <span className="text-red-400">*</span></label>
          <input required className={inp} value={data.firstName} onChange={(e) => set('firstName', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Last name <span className="text-red-400">*</span></label>
          <input required className={inp} value={data.lastName} onChange={(e) => set('lastName', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Relationship <span className="text-red-400">*</span></label>
          <input required className={inp} placeholder="e.g. Spouse, Sibling, Solicitor" value={data.relationship} onChange={(e) => set('relationship', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Phone</label>
          <input type="tel" className={inp} value={data.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input type="email" className={inp} value={data.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={lbl}>Address</label>
        <input className={inp} placeholder="Street address, suburb, state, postcode" value={data.address} onChange={(e) => set('address', e.target.value)} />
      </div>
    </div>
  )
}

interface Props {
  data: ExecutorsData
  onChange: (data: ExecutorsData) => void
  extractedFields?: Set<string>
}

export default function StepExecutors({ data, onChange, extractedFields }: Props) {
  const hasExtracted = extractedFields && (
    extractedFields.has('executorsData.primary.firstName') ||
    extractedFields.has('executorsData.primary.lastName')
  )
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Executors</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">
          An executor administers your estate and carries out the instructions in your will.
        </p>
        {hasExtracted && (
          <div className="mt-2 flex items-center gap-2">
            <ExtractedBadge />
            <span className="text-xs text-[var(--neutral)]">pre-filled from your uploaded Will — confirm or edit</span>
          </div>
        )}
      </div>

      <ExecutorForm
        label="Primary Executor"
        data={data.primary}
        onChange={(primary) => onChange({ ...data, primary })}
      />

      {!data.hasAlternate ? (
        <button
          type="button"
          className="text-sm font-medium text-[var(--teal)] transition-colors"
          onClick={() => onChange({ ...data, hasAlternate: true })}
        >
          + Add alternate executor
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={eyebrow}>Alternate Executor</p>
            <button
              type="button"
              className="text-xs text-[var(--neutral)] hover:text-red-500 transition-colors"
              onClick={() =>
                onChange({
                  ...data,
                  hasAlternate: false,
                  alternate: { firstName: '', lastName: '', relationship: '', phone: '', email: '', address: '' },
                })
              }
            >
              Remove
            </button>
          </div>
          <ExecutorForm
            label="Alternate Executor"
            data={data.alternate}
            onChange={(alternate) => onChange({ ...data, alternate })}
          />
        </div>
      )}

      <div className="border border-[var(--line)] bg-[var(--paper-warm)] px-4 py-3">
        <p className="text-xs text-[var(--neutral)]">
          <span className="font-semibold text-[var(--ink)]">Tip:</span> An alternate executor steps in if your
          primary executor is unable or unwilling to act. This is strongly recommended.
        </p>
      </div>
    </div>
  )
}
