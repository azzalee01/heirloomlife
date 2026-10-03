'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOpenSlots, rescheduleAppointment } from '../_actions'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import type { Slot } from '@/src/lib/appointments/slots'
import type { ViewerAccess } from '@/src/lib/appointments/types'

const primaryBtn = { height: 64, fontSize: 20 } as const
const tabBtn = { height: 60, fontSize: 18 } as const

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
      {/* Current booking summary */}
      <div className="overflow-hidden border border-[var(--line)] bg-white">
        <div className="h-1" style={{ background: 'var(--teal)' }} />
        <div className="space-y-3 px-6 py-7 sm:px-8">
          <h1
            className="text-4xl leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            Reschedule your call
          </h1>
          <div>
            <p className="text-base font-medium uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
              Current time
            </p>
            <p className="mt-1 text-xl font-medium" style={{ color: 'var(--ink)' }}>
              {longWhen(currentStartsAt)}
            </p>
          </div>
          <p className="text-lg" style={{ color: 'var(--mkt-stone)' }}>
            Your current booking stays until you confirm the change.
          </p>
        </div>
      </div>

      {/* Slot picker */}
      {slots === null && (
        <p className="text-xl" style={{ color: 'var(--mkt-stone)' }}>Loading available times&hellip;</p>
      )}
      {slots !== null && days.length === 0 && (
        <div className="overflow-hidden border border-[var(--line)] bg-white px-6 py-7 sm:px-8">
          <p className="text-xl" style={{ color: 'var(--ink)' }}>
            There are no other times available right now. Please check back soon.
          </p>
        </div>
      )}

      {days.length > 0 && (
        <section aria-labelledby="pick-new-time" className="space-y-5">
          <h2
            id="pick-new-time"
            className="text-2xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
          >
            Choose a new time
          </h2>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Day">
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
                  style={tabBtn}
                >
                  {dayLabel(list[0].startsAt)}
                </button>
              )
            })}
          </div>

          {/* Time slots */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {daySlots.map((s) => {
              const selected = slot?.startsAt === s.startsAt
              return (
                <button
                  key={s.startsAt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSlot(s)}
                  className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`}
                  style={tabBtn}
                >
                  {timeLabel(s.startsAt)}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Confirm selection */}
      {slot && (
        <div className="space-y-4">
          <div
            className="rounded-lg px-4 py-4"
            style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-soft)' }}
          >
            <p className="text-base font-semibold uppercase tracking-wide" style={{ color: 'var(--teal-deep)' }}>
              New time
            </p>
            <p className="mt-1 text-xl font-medium" style={{ color: 'var(--teal-deep)' }}>
              {longWhen(slot.startsAt)}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-xl" style={{ color: '#b91c1c' }}>{error}</p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn btn-primary w-full"
            style={primaryBtn}
          >
            {submitting ? 'Saving…' : 'Confirm new time'}
          </button>

          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            We&rsquo;ll email a new confirmation with your updated join link.
          </p>
        </div>
      )}

      {/* Escape hatch */}
      {'token' in access && (
        <p className="text-base" style={{ color: 'var(--mkt-stone)' }}>
          Want to cancel instead?{' '}
          <Link
            href={`/appointments/join/${(access as { token: string }).token}`}
            className="underline"
            style={{ color: 'var(--mkt-stone)' }}
          >
            Go back to your booking
          </Link>
        </p>
      )}
    </div>
  )
}
