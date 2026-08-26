'use client'

import Link from 'next/link'

const ELIGIBLE_STATES = ['NSW', 'VIC']

const AU_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
]

function ageFromDob(dob: string): number {
  if (!dob) return 0
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

interface Props {
  state: string
  dateOfBirth: string
  onStateChange: (state: string) => void
  onDobChange: (dob: string) => void
}

export default function StepEligibility({ state, dateOfBirth, onStateChange, onDobChange }: Props) {
  const inp = 'w-full px-3 py-2.5 border border-[var(--line)] text-sm text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
  const lbl = 'block text-sm font-medium text-[var(--ink)] mb-1.5'

  const isEligibleState = state ? ELIGIBLE_STATES.includes(state) : null
  const age = ageFromDob(dateOfBirth)
  const isEligibleAge = dateOfBirth ? age >= 18 : null
  const showIneligible = (isEligibleState === false) || (isEligibleAge === false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Before we begin
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
          Heirloom Wills are currently available in select Australian states. Let&apos;s confirm you&apos;re eligible to get started.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="eligibility-state" className={lbl}>Which state or territory do you live in?</label>
          <select
            id="eligibility-state"
            className={inp}
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <option value="">Select your state…</option>
            {AU_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="eligibility-dob" className={lbl}>Date of birth</label>
          <input
            id="eligibility-dob"
            type="date"
            className={inp}
            value={dateOfBirth}
            onChange={(e) => onDobChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--neutral)' }}>
            You must be 18 or over to make a Will.
          </p>
        </div>
      </div>

      {/* Ineligible state */}
      {state && isEligibleState === false && (
        <div className="border border-amber-200 bg-amber-50 px-5 py-4 space-y-2">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {state} isn&apos;t available yet
          </p>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            We&apos;re expanding state by state to make sure our Wills are properly localised and legally reviewed for each jurisdiction. Join the waitlist and we&apos;ll let you know when {state} launches.
          </p>
          <Link
            href="/waitlist"
            className="inline-block mt-1 text-sm font-semibold"
            style={{ color: 'var(--teal)' }}
          >
            Join the waitlist →
          </Link>
        </div>
      )}

      {/* Under 18 */}
      {dateOfBirth && isEligibleAge === false && (
        <div className="border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            You must be 18 or over
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
            Under Australian law, you need to be at least 18 to make a valid Will in most circumstances.
          </p>
        </div>
      )}

      {/* Eligible confirmation */}
      {state && dateOfBirth && isEligibleState === true && isEligibleAge === true && (
        <div className="border px-5 py-4" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.04)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>
            You&apos;re eligible — let&apos;s get started
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--neutral)' }}>
            We support Wills in {state}. Continue below to start building yours.
          </p>
        </div>
      )}

      {showIneligible && (
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium" style={{ color: 'var(--teal)' }}>
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}
