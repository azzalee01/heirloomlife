'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  scheduleWitnessingSession,
  getAvailableWitnessSlots,
  bookWitnessSlot,
  type WitnessInput,
  type WitnessSlot,
} from '../_actions'

type WitnessSource = 'own' | 'heirloom_provided'

const MIN_WITNESSES = 2

export default function ScheduleSessionForm() {
  const router = useRouter()
  const [witnessSource, setWitnessSource] = useState<WitnessSource>('own')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [witnesses, setWitnesses] = useState<WitnessInput[]>([
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [recordSession, setRecordSession] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')

  const [slots, setSlots] = useState<WitnessSlot[] | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  useEffect(() => {
    if (witnessSource === 'heirloom_provided' && slots === null) {
      getAvailableWitnessSlots().then(setSlots).catch(() => setSlots([]))
    }
  }, [witnessSource, slots])

  function updateWitness(i: number, field: keyof WitnessInput, value: string) {
    setWitnesses((ws) => ws.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)))
  }

  function removeWitness(i: number) {
    setWitnesses((ws) => (ws.length <= MIN_WITNESSES ? ws : ws.filter((_, idx) => idx !== i)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      if (witnessSource === 'heirloom_provided') {
        if (!selectedSlotId) throw new Error('Please pick a witness slot.')
        const { sessionId } = await bookWitnessSlot(selectedSlotId, recordSession)
        router.push(`/witnessing/${sessionId}`)
        router.refresh()
        return
      }

      const filledWitnesses = witnesses.filter((w) => w.name.trim())
      if (filledWitnesses.length < MIN_WITNESSES) {
        throw new Error(`NSW requires at least ${MIN_WITNESSES} witnesses for a will signing.`)
      }

      const scheduledAt = new Date(`${date}T${time}`).toISOString()
      const { sessionId } = await scheduleWitnessingSession({
        scheduledAt,
        witnesses: filledWitnesses,
        recordSession,
      })
      router.push(`/witnessing/${sessionId}`)
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[var(--line)] overflow-hidden">
      <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
      <div className="px-6 py-6 space-y-5">
        <h2 className="text-lg" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Schedule a witnessing session
        </h2>

        <div className="border px-3 py-2 text-xs" style={{ borderColor: 'rgba(42,180,174,0.35)', background: 'rgba(42,180,174,0.06)', color: 'var(--teal-deep)' }}>
          NSW law requires a minimum of <strong>2 witnesses</strong> for a will signing.
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
            Witnesses
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWitnessSource('own')}
              className="border px-3 py-2.5 text-left text-sm transition-colors"
              style={{
                borderColor: witnessSource === 'own' ? 'var(--teal)' : 'var(--line)',
                background: witnessSource === 'own' ? 'rgba(42,180,174,0.08)' : 'white',
                color: 'var(--ink)',
              }}
            >
              <span className="block font-semibold">Arrange our own witnesses</span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>You bring 2 witnesses</span>
            </button>
            <button
              type="button"
              onClick={() => setWitnessSource('heirloom_provided')}
              className="border px-3 py-2.5 text-left text-sm transition-colors"
              style={{
                borderColor: witnessSource === 'heirloom_provided' ? 'var(--teal)' : 'var(--line)',
                background: witnessSource === 'heirloom_provided' ? 'rgba(42,180,174,0.08)' : 'white',
                color: 'var(--ink)',
              }}
            >
              <span className="block font-semibold">Use Heirloom&apos;s witnesses</span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>Book an available slot</span>
            </button>
          </div>
        </div>

        {witnessSource === 'own' ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>Date</span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>Time</span>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </label>
            </div>

            <div>
              <div className="mt-2 space-y-2">
                {witnesses.map((w, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        placeholder={`Witness ${i + 1} name`}
                        value={w.name}
                        onChange={(e) => updateWitness(i, 'name', e.target.value)}
                        className="border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                      />
                      <input
                        placeholder="Witness email (optional)"
                        value={w.email}
                        onChange={(e) => updateWitness(i, 'email', e.target.value)}
                        className="border px-3 py-2 text-sm"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                      />
                    </div>
                    {witnesses.length > MIN_WITNESSES && (
                      <button
                        type="button"
                        onClick={() => removeWitness(i)}
                        className="text-xs px-2 py-2"
                        style={{ color: 'var(--neutral)' }}
                        aria-label="Remove witness"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setWitnesses((ws) => [...ws, { name: '', email: '' }])}
                className="mt-2 text-xs font-semibold"
                style={{ color: 'var(--teal-deep)' }}
              >
                + Add another witness
              </button>
              <p className="mt-2 text-xs" style={{ color: 'var(--neutral)' }}>
                If a witness has an email, we&apos;ll send them a link to join the call at the scheduled time.
              </p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--neutral)' }}>
              Pick an available slot — two Heirloom witnesses will already be on the call.
            </p>
            {slots === null && <p className="text-sm" style={{ color: 'var(--neutral)' }}>Loading availability…</p>}
            {slots?.length === 0 && <p className="text-sm" style={{ color: 'var(--neutral)' }}>No slots available right now — please check back soon.</p>}
            <div className="space-y-2">
              {slots?.map((slot) => {
                const dt = new Date(slot.scheduledAt)
                const selected = selectedSlotId === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className="w-full border px-4 py-3 text-left text-sm transition-colors"
                    style={{
                      borderColor: selected ? 'var(--teal)' : 'var(--line)',
                      background: selected ? 'rgba(42,180,174,0.08)' : 'white',
                      color: 'var(--ink)',
                    }}
                  >
                    <span className="block font-medium">
                      {dt.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="block text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                      {dt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} · Witnesses: {slot.witness1Name}, {slot.witness2Name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)' }}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={recordSession}
              onChange={(e) => setRecordSession(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                Record this session
              </span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                Not required by NSW law, but recommended: a stored recording is strong evidence of your identity,
                capacity, and intent if the will is ever challenged.
              </span>
            </span>
          </label>
        </div>

        {status === 'error' && (
          <p className="text-xs" style={{ color: 'var(--error, #dc2626)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {status === 'submitting' ? 'Scheduling…' : 'Schedule session'}
        </button>
      </div>
    </form>
  )
}
