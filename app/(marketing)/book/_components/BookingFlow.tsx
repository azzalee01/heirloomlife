'use client'

import { useEffect, useMemo, useState } from 'react'
import { bookAppointment, getOpenSlots } from '@/app/appointments/_actions'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import type { Slot } from '@/src/lib/appointments/slots'
import { TurnstileWidget } from '@/app/appointments/_components/TurnstileWidget'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

// ── Date helpers ──────────────────────────────────────────────────────────────

const dateKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

const longDay = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))

const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))

const tzName = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, timeZoneName: 'short' })
    .formatToParts(new Date(iso)).find((p) => p.type === 'timeZoneName')?.value ?? ''

const todayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TZ }).format(new Date())

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_HDRS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function calCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(first).fill(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function Calendar({
  availableDays,
  selectedDay,
  onSelect,
}: {
  availableDays: Set<string>
  selectedDay: string | null
  onSelect: (key: string) => void
}) {
  const today = todayKey()
  const firstAvail = [...availableDays].sort()[0]
  const seed = firstAvail ? new Date(firstAvail + 'T12:00:00') : new Date()
  const [vy, setVy] = useState(seed.getFullYear())
  const [vm, setVm] = useState(seed.getMonth())

  const now = new Date()
  const canPrev = vy > now.getFullYear() || (vy === now.getFullYear() && vm > now.getMonth())
  const ny = vm === 11 ? vy + 1 : vy
  const nm = vm === 11 ? 0 : vm + 1
  const canNext = [...availableDays].some(d => {
    const [y, m] = d.split('-').map(Number)
    return y === ny && m - 1 === nm
  })

  function prev() { if (vm === 0) { setVy(y => y - 1); setVm(11) } else setVm(m => m - 1) }
  function next() { if (vm === 11) { setVy(y => y + 1); setVm(0) } else setVm(m => m + 1) }

  return (
    <div>
      {/* Month nav */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button" onClick={prev} disabled={!canPrev} aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl transition-colors hover:bg-[var(--paper-warm)] disabled:opacity-20 disabled:cursor-default"
          style={{ color: 'var(--ink)' }}
        >
          ‹
        </button>
        <span className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          {MONTHS[vm]} {vy}
        </span>
        <button
          type="button" onClick={next} disabled={!canNext} aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-xl transition-colors hover:bg-[var(--paper-warm)] disabled:opacity-20 disabled:cursor-default"
          style={{ color: 'var(--ink)' }}
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_HDRS.map(d => (
          <div key={d} className="py-1 text-center text-xs font-medium" style={{ color: 'var(--neutral)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {calCells(vy, vm).map((day, i) => {
          if (!day) return <div key={i} />
          const k = dayKey(vy, vm, day)
          const avail = availableDays.has(k) && k >= today
          const sel = selectedDay === k
          const isToday = k === today
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                disabled={!avail}
                onClick={() => onSelect(k)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors
                  ${sel ? 'font-semibold text-white' : ''}
                  ${avail && !sel ? 'hover:bg-[var(--teal-light)] cursor-pointer' : ''}
                  ${!avail ? 'cursor-default opacity-25' : ''}
                `}
                style={{
                  background: sel ? 'var(--teal)' : 'transparent',
                  color: sel ? '#fff' : 'var(--ink)',
                  outline: isToday && !sel ? '1.5px solid var(--teal)' : 'none',
                  outlineOffset: '-1px',
                  fontWeight: sel ? 600 : isToday ? 500 : 400,
                }}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Input style ───────────────────────────────────────────────────────────────

const inp = 'w-full px-4 py-3 border border-[var(--line)] rounded-xl text-base text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'

// ── Main component ────────────────────────────────────────────────────────────

export default function BookingFlow() {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [forSomeoneElse, setForSomeoneElse] = useState(false)
  const [bookerName, setBookerName] = useState('')
  const [bookerEmail, setBookerEmail] = useState('')
  const [theirEmail, setTheirEmail] = useState('')
  const [website, setWebsite] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ emailed: boolean; slot: Slot; email: string } | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState(false)

  useEffect(() => { getOpenSlots().then(setSlots) }, [])

  const { availableDays, slotsByDay } = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of slots ?? []) {
      const k = dateKey(s.startsAt)
      map.set(k, [...(map.get(k) ?? []), s])
    }
    return { availableDays: new Set(map.keys()), slotsByDay: map }
  }, [slots])

  const activeDay = day ?? [...availableDays].sort()[0] ?? null
  const daySlots = activeDay ? (slotsByDay.get(activeDay) ?? []) : []

  function selectDay(k: string) { setDay(k); setSlot(null) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!slot) return
    setSubmitting(true)
    setError(null)
    const customerEmail = forSomeoneElse ? theirEmail.trim() || bookerEmail.trim() : email.trim()
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the security check.')
      setSubmitting(false)
      return
    }
    const res = await bookAppointment({
      startsAt: slot.startsAt,
      customerName: name,
      customerEmail,
      customerPhone: phone || undefined,
      bookedByName: forSomeoneElse ? bookerName : undefined,
      bookedByEmail: forSomeoneElse ? bookerEmail : undefined,
      website,
      turnstileToken: TURNSTILE_SITE_KEY ? turnstileToken : undefined,
    })
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      getOpenSlots().then((s) => {
        setSlots(s)
        if (!s.some((x) => x.startsAt === slot.startsAt)) setSlot(null)
      })
      return
    }
    setDone({ emailed: res.emailed, slot, email: customerEmail })
  }

  // ── Confirmation ────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="py-8 text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'var(--teal-light)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          You&rsquo;re booked.
        </h2>
        <p className="mt-2 text-xl font-medium" style={{ color: 'var(--ink)' }}>
          {longDay(done.slot.startsAt)} &middot; {timeLabel(done.slot.startsAt)} {tzName(done.slot.startsAt)}
        </p>
        {done.emailed ? (
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
            We&rsquo;ve emailed a link to <strong style={{ color: 'var(--ink)' }}>{done.email}</strong>. Open it at call time and tap &ldquo;Join your call&rdquo;. We&rsquo;ll send reminders the day before and an hour before.
          </p>
        ) : (
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed" style={{ color: '#92400e' }}>
            Your time is saved, but we couldn&rsquo;t send the confirmation email. Please contact us.
          </p>
        )}
      </div>
    )
  }

  // ── Booking UI ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Loading */}
      {slots === null && (
        <p className="py-8 text-center text-base" style={{ color: 'var(--neutral)' }}>
          Loading available times&hellip;
        </p>
      )}

      {/* No slots */}
      {slots !== null && availableDays.size === 0 && (
        <p className="py-8 text-center text-base" style={{ color: 'var(--ink)' }}>
          No times available right now. Please check back soon.
        </p>
      )}

      {/* Calendar + times */}
      {availableDays.size > 0 && (
        <div className="space-y-6">
          <Calendar availableDays={availableDays} selectedDay={activeDay} onSelect={selectDay} />

          {/* Time slots */}
          {activeDay && (
            <div>
              <p className="mb-3 text-sm font-medium" style={{ color: 'var(--neutral)' }}>
                {longDay(daySlots[0]?.startsAt ?? activeDay + 'T00:00:00')} &middot; Sydney time
              </p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => {
                  const sel = slot?.startsAt === s.startsAt
                  return (
                    <button
                      key={s.startsAt}
                      type="button"
                      onClick={() => setSlot(sel ? null : s)}
                      className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: sel ? 'var(--teal)' : 'var(--teal-light)',
                        color: sel ? '#fff' : 'var(--teal-deep)',
                        border: 'none',
                      }}
                    >
                      {timeLabel(s.startsAt)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Details form — slides in when a time is selected */}
          {slot && (
            <form onSubmit={submit} className="space-y-4 border-t pt-6" style={{ borderColor: 'var(--line)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>
                  {longDay(slot.startsAt)} &middot; {timeLabel(slot.startsAt)}
                </p>
                <p className="mt-0.5 text-xl font-medium" style={{ color: 'var(--ink)' }}>
                  Your details
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  Full name of the person making the Will
                </span>
                <input className={inp} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" maxLength={120} placeholder="e.g. Jane Smith" />
              </label>

              <label className="flex items-start gap-3 text-sm" style={{ color: 'var(--ink)' }}>
                <input type="checkbox" checked={forSomeoneElse} onChange={(e) => setForSomeoneElse(e.target.checked)} className="mt-0.5 h-4 w-4" />
                <span>I&rsquo;m booking this for someone else (a parent or relative)</span>
              </label>

              {!forSomeoneElse ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Email — we&rsquo;ll send the join link here</span>
                    <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Mobile <span style={{ color: 'var(--neutral)', fontWeight: 400 }}>(optional)</span></span>
                    <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="04xx xxx xxx" />
                  </label>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl p-4" style={{ background: 'var(--paper-warm)' }}>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Your name</span>
                    <input className={inp} value={bookerName} onChange={(e) => setBookerName(e.target.value)} required maxLength={120} autoComplete="name" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Your email — we&rsquo;ll send the join link here</span>
                    <input className={inp} type="email" value={bookerEmail} onChange={(e) => setBookerEmail(e.target.value)} required autoComplete="email" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Their email <span style={{ color: 'var(--neutral)', fontWeight: 400 }}>(optional)</span></span>
                    <input className={inp} type="email" value={theirEmail} onChange={(e) => setTheirEmail(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--ink)' }}>Their mobile <span style={{ color: 'var(--neutral)', fontWeight: 400 }}>(optional)</span></span>
                    <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </label>
                </div>
              )}

              {/* Honeypot */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              </div>

              {TURNSTILE_SITE_KEY && (
                <div>
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={(t) => { setTurnstileToken(t); setTurnstileError(false) }}
                    onError={() => setTurnstileError(true)}
                  />
                  {turnstileError && <p className="mt-1 text-sm" style={{ color: '#b91c1c' }}>Security check failed. Please refresh and try again.</p>}
                </div>
              )}

              {error && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: 'var(--teal)' }}
              >
                {submitting ? 'Booking…' : 'Confirm booking'}
              </button>
              <p className="text-center text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
                Heirloom Life is not a law firm. We&rsquo;ll use your details only to run your call and prepare your Will.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
