'use client'

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

// NSW supports remote AV witnessing; all other states complete via print-and-sign.
const AV_STATES = ['NSW']

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

  const age = ageFromDob(dateOfBirth)
  const isEligibleAge = dateOfBirth ? age >= 18 : null
  const isAVState = state ? AV_STATES.includes(state) : null
  const ready = state && isEligibleAge === true

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Before we begin
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
          Heirloom Wills are available across Australia. Let&apos;s confirm a couple of details first.
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

      {/* Under 18 block */}
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

      {/* Ready confirmation */}
      {ready && (
        <div className="border px-5 py-4 space-y-1" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.04)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>
            You&apos;re good to go
          </p>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            {isAVState
              ? `Your Will will be drafted for ${state}. Remote AV witnessing is available for your state.`
              : `Your Will will be drafted for ${state}. Once complete, you'll print and sign it with two witnesses  -  a straightforward process we'll guide you through.`}
          </p>
        </div>
      )}
    </div>
  )
}
