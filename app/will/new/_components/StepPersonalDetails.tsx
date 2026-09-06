'use client'

import type { PersonalDetails } from '../_types'
import ExtractedBadge from './ExtractedBadge'

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-3'

interface Props {
  data: PersonalDetails
  onChange: (data: PersonalDetails) => void
  extractedFields?: Set<string>
}

export default function StepPersonalDetails({ data, onChange, extractedFields }: Props) {
  function ex(field: string) { return extractedFields?.has(`personalDetails.${field}`) ?? false }
  function set(field: keyof PersonalDetails, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Personal Details</h2>
        <p className="text-sm text-[var(--neutral)] mt-1">Tell us about yourself</p>
      </div>

      {/* Name */}
      <section>
        <p className={eyebrow}>Full Name</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            {ex('firstName') && <ExtractedBadge />}
            <label className={lbl}>First name <span className="text-red-400">*</span></label>
            <input required className={inp} value={data.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div>
            {ex('middleName') && <ExtractedBadge />}
            <label className={lbl}>Middle name</label>
            <input className={inp} value={data.middleName} onChange={(e) => set('middleName', e.target.value)} />
          </div>
          <div>
            {ex('lastName') && <ExtractedBadge />}
            <label className={lbl}>Last name <span className="text-red-400">*</span></label>
            <input required className={inp} value={data.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Personal info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {ex('dateOfBirth') && <ExtractedBadge />}
          <label className={lbl}>Date of birth <span className="text-red-400">*</span></label>
          <input type="date" required className={inp} value={data.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Occupation <span className="text-red-400">*</span></label>
          <input required className={inp} placeholder="e.g. Software Engineer" value={data.occupation} onChange={(e) => set('occupation', e.target.value)} />
        </div>
      </div>

      {/* Contact */}
      <section>
        <p className={eyebrow}>Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Mobile <span className="text-red-400">*</span></label>
            <input type="tel" required className={inp} placeholder="04XX XXX XXX" value={data.phoneMobile} onChange={(e) => set('phoneMobile', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Email <span className="text-red-400">*</span></label>
            <input type="email" required className={inp} value={data.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <p className={eyebrow}>Address</p>
        <div className="space-y-3">
          <div>
            {ex('addressLine1') && <ExtractedBadge />}
            <label className={lbl}>Street address <span className="text-red-400">*</span></label>
            <input required className={inp} placeholder="123 Example Street" value={data.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              {ex('suburb') && <ExtractedBadge />}
              <label className={lbl}>Suburb <span className="text-red-400">*</span></label>
              <input required className={inp} value={data.suburb} onChange={(e) => set('suburb', e.target.value)} />
            </div>
            <div>
              {ex('state') && <ExtractedBadge />}
              <label className={lbl}>State <span className="text-red-400">*</span></label>
              <select required className={inp} value={data.state} onChange={(e) => set('state', e.target.value)}>
                <option value=""> - </option>
                {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              {ex('postcode') && <ExtractedBadge />}
              <label className={lbl}>Postcode <span className="text-red-400">*</span></label>
              <input required maxLength={4} className={inp} value={data.postcode} onChange={(e) => set('postcode', e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Marital status */}
      <div className="sm:max-w-xs">
        {ex('maritalStatus') && <ExtractedBadge />}
        <label className={lbl}>Marital status <span className="text-red-400">*</span></label>
        <select required className={inp} value={data.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
          <option value="">Select…</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="domestic_partner">Domestic Partner</option>
          <option value="divorced">Divorced</option>
          <option value="separated">Separated</option>
          <option value="widowed">Widowed</option>
        </select>
      </div>

      {/* Previous will */}
      <div>
        <p className="text-sm font-medium text-[var(--ink)] mb-3">
          Have you made a previous will? <span className="text-red-400">*</span>
        </p>
        <div className="flex gap-6">
          {(['yes', 'no'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="previousWill"
                value={v}
                checked={data.previousWill === v}
                onChange={() => set('previousWill', v)}
                className="w-4 h-4 accent-[var(--teal)]"
              />
              <span className="text-sm text-[var(--ink)]">{v === 'yes' ? 'Yes' : 'No'}</span>
            </label>
          ))}
        </div>
        {data.previousWill === 'yes' && (
          <div className="mt-3 sm:max-w-sm">
            <label className={lbl}>Where is it held?</label>
            <input
              className={inp}
              placeholder="e.g. Safety deposit box at ANZ Bank"
              value={data.previousWillLocation}
              onChange={(e) => set('previousWillLocation', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
