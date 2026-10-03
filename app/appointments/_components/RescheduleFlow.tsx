'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOpenSlots, rescheduleAppointment } from '../_actions'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import type { Slot } from '@/src/lib/appointments/slots'
import type { ViewerAccess } from '@/src/lib/appointments/types'

const bigBtn = { height: 52, fontSize: 17 } as const

const dateKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso))
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
const longWhen = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', {
    timeZone: APPOINTMENT_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(new Date(iso))

interface Props {
  access: ViewerAccess
  currentStartsAt: string
}

export default function RescheduleFlow({ access, currentStartsAt }: Props) {
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOpenSlots().then(setSlots)
  }, [])

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of slots ?? []) {
      const k = dateKey(s.startsAt)
      map.set(k, [...(map.get(k) ?? []), s])
    }
    return [...map.entries()]
  }, [slots])

  const activeDay = day ?? days[0]?.[0] ?? null
  const daySlots = days.find(([k]) => k === activeDay)?.[1] ?? []

  async function submit() {
    if (!slot) return
    setSubmitting(true)
    setError(null)
    const res = await rescheduleAppointment(access, slot.startsAt)
    if (!res.ok) {
      setError(res.error)
      // Slot may have just gone: refresh.
      getOpenSlots().then((s) => {
        setSlots(s)
        if (!s.some((x) => x.startsAt === slot.startsAt)) setSlot(null)
      })
      setSubmitting(false)
      return
    }
    router.push(`/appointments/join/${res.token}`)
  }

  return (
    <div className="space-y-8">
      <div className="border border-[var(--line)] bg-white">
        <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
        <div className="px-6 py-6 space-y-2">
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Reschedule your call
          </h1>
          <p className="text-base" style={{ color: 'var(--mkt-stone)' }}>
            Current time: <strong>{longWhen(currentStartsAt)}</strong>
          </p>
          <p className="text-sm" style={{ color: 'var(--mkt-stone)' }}>
            Choose a new time below. Your current booking stays until you confirm the change.
          </p>
        </div>
      </div>

      {/* Day tabs */}
      {slots === null && (
        <p className="text-base" style={{ color: 'var(--mkt-stone)' }}>Loading available times…</p>
      )}
      {slots !== null && days.length === 0 && (
        <p className="text-base" style={{ color: 'var(--ink)' }}>
          There are no other times available right now. Please check back soon.
        </p>
      )}

      {days.length > 0 && (
        <section aria-labelledby="pick-new-time" className="space-y-4">
          <h2 id="pick-new-time" className="text-lg font-medium" style={{ color: 'var(--ink)' }}>
            Choose a new time
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Day">
            {days.map(([k, list]) => {
              const selected = k === activeDay
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => { setDay(k); setSlot(null) }}
                  className={`btn shrink-0 ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  style={bigBtn}
                >
                  {dayLabel(list[0].startsAt)}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {daySlots.map((s) => {
              const selected = slot?.startsAt === s.startsAt
              return (
                <button
                  key={s.startsAt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSlot(s)}
                  className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  style={bigBtn}
                >
                  {timeLabel(s.startsAt)}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {slot && (
        <div className="space-y-3">
          <p className="text-base font-medium" style={{ color: 'var(--ink)' }}>
            New time: {longWhen(slot.startsAt)}
          </p>
          {error && (
            <p role="alert" className="text-base" style={{ color: '#b91c1c' }}>{error}</p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn btn-primary w-full"
            style={bigBtn}
          >
            {submitting ? 'Saving…' : 'Confirm reschedule'}
          </button>
          <p className="text-xs" style={{ color: 'var(--neutral)' }}>
            We&rsquo;ll send a new confirmation email with your updated call link.
          </p>
        </div>
      )}
    </div>
  )
}
