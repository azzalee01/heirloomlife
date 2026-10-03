'use client'

import { useEffect, useMemo, useState } from 'react'
import { bookAppointment, getOpenSlots } from '@/app/appointments/_actions'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import type { Slot } from '@/src/lib/appointments/slots'
import { TurnstileWidget } from '@/app/appointments/_components/TurnstileWidget'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

const inp =
  'w-full px-4 py-3 border border-[var(--line)] text-lg text-[var(--ink)] placeholder:text-[var(--neutral)] outline-none transition-[border-color,box-shadow] focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal)]/20 bg-white'
const primaryBtn = { height: 64, fontSize: 20 } as const
const tabBtn = { height: 60, fontSize: 18 } as const

const dateKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: APPOINTMENT_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso))
const longDay = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
const tzName = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, timeZoneName: 'short' }).formatToParts(new Date(iso)).find((p) => p.type === 'timeZoneName')?.value ?? ''

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
  const [website, setWebsite] = useState('') // honeypot

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ emailed: boolean; slot: Slot; email: string } | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState(false)

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!slot) return
    setSubmitting(true)
    setError(null)
    // The person on the call is the customer. A family member booking for them is recorded as the booker, and the
    // link goes to the customer's own email if they have one, otherwise to the booker.
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
      // The slot may be gone: refresh the list.
      getOpenSlots().then((s) => {
        setSlots(s)
        if (!s.some((x) => x.startsAt === slot.startsAt)) setSlot(null)
      })
      return
    }
    setDone({ emailed: res.emailed, slot, email: customerEmail })
  }

  if (done) {
    return (
      <div className="overflow-hidden border border-[var(--line)] bg-white" role="status">
        <div className="h-1" style={{ background: 'var(--teal)' }} />
        <div className="space-y-4 px-6 py-8 sm:px-8">
          <h2 className="text-4xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            You&rsquo;re booked.
          </h2>
          <p className="text-2xl font-medium" style={{ color: 'var(--ink)' }}>
            {longDay(done.slot.startsAt)} at {timeLabel(done.slot.startsAt)} ({tzName(done.slot.startsAt)})
          </p>
          {done.emailed ? (
            <p className="text-xl leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
              We&rsquo;ve emailed a link to <strong style={{ color: 'var(--ink)' }}>{done.email}</strong>. Open it at the time of your call and tap &ldquo;Join your call&rdquo;. We&rsquo;ll send a reminder the day before and an hour before.
            </p>
          ) : (
            <p className="text-xl leading-relaxed" style={{ color: '#92400e' }}>
              Your time is saved, but we couldn&rsquo;t send the confirmation email. Please contact us so we can send your link.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Step 1: Choose a time */}
      <section aria-labelledby="pick-time">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--teal-deep)' }}>
            Step 1 of 2
          </p>
          <h2 id="pick-time" className="mt-1 text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Choose a time
          </h2>
          <p className="mt-2 text-lg" style={{ color: 'var(--mkt-stone)' }}>
            Times are in Sydney time. Each call runs about an hour.
          </p>
        </div>

        {slots === null && (
          <p className="text-xl" style={{ color: 'var(--mkt-stone)' }}>Loading available times&hellip;</p>
        )}
        {slots !== null && days.length === 0 && (
          <p className="text-xl" style={{ color: 'var(--ink)' }}>
            There are no times available right now. Please check back soon.
          </p>
        )}

        {days.length > 0 && (
          <>
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
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          </>
        )}
      </section>

      {/* Step 2: Your details */}
      {slot && (
        <form onSubmit={submit} className="space-y-5" aria-labelledby="your-details">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--teal-deep)' }}>
                Step 2 of 2
              </p>
              <h2 id="your-details" className="mt-1 text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                Your details
              </h2>
            </div>
            <div
              className="rounded-lg px-4 py-4"
              style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-soft)' }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--teal-deep)' }}>
                Selected time
              </p>
              <p className="mt-1 text-xl font-medium" style={{ color: 'var(--teal-deep)' }}>
                {longDay(slot.startsAt)} at {timeLabel(slot.startsAt)} ({tzName(slot.startsAt)})
              </p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Full name of the person making the Will</span>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" maxLength={120} />
          </label>
          <label className="flex items-start gap-3 text-lg" style={{ color: 'var(--ink)' }}>
            <input
              type="checkbox"
              checked={forSomeoneElse}
              onChange={(e) => setForSomeoneElse(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
            <span>I&rsquo;m booking this for someone else (a parent or relative)</span>
          </label>

          {!forSomeoneElse ? (
            <>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Email (we&rsquo;ll send the link here)</span>
                <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Mobile (optional)</span>
                <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </label>
            </>
          ) : (
            <div className="space-y-5 border-l-2 pl-4" style={{ borderColor: 'var(--teal)' }}>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Your name</span>
                <input className={inp} value={bookerName} onChange={(e) => setBookerName(e.target.value)} required maxLength={120} autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Your email (we&rsquo;ll send the link here)</span>
                <input className={inp} type="email" value={bookerEmail} onChange={(e) => setBookerEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Their email (optional, if they have one)</span>
                <input className={inp} type="email" value={theirEmail} onChange={(e) => setTheirEmail(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-lg font-medium" style={{ color: 'var(--ink)' }}>Their mobile (optional)</span>
                <input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>
          )}

          {/* Honeypot: hidden from people, tempting to bots. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {TURNSTILE_SITE_KEY && (
            <div>
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onToken={(t) => { setTurnstileToken(t); setTurnstileError(false) }}
                onError={() => setTurnstileError(true)}
              />
              {turnstileError && (
                <p className="mt-1 text-sm" style={{ color: '#b91c1c' }}>
                  Security check failed. Please refresh and try again.
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-xl" style={{ color: '#b91c1c' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full" style={primaryBtn}>
            {submitting ? 'Booking…' : 'Book my call'}
          </button>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Heirloom Life is not a law firm and this is not legal advice. We&rsquo;ll use your details only to run your call and prepare your Will.
          </p>
        </form>
      )}
    </div>
  )
}
