'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { cancelAppointment, getCustomerJoin, recordConsent, reportLeft } from '../_actions'
import { APPOINTMENT_TZ, RECORDING_CONSENT_TEXT } from '@/src/lib/appointments/constants'
import type { AppointmentView, ViewerAccess } from '@/src/lib/appointments/types'

type Stage = 'overview' | 'consent' | 'declined' | 'joining' | 'incall' | 'left' | 'cancelled'

const bigBtn = { height: 56, fontSize: 18 } as const

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, ...opts }).format(new Date(iso))
const longWhen = (iso: string) => `${fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' })} at ${fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true })}`

interface Props {
  access: ViewerAccess
  initial: AppointmentView
  supportPhone?: string
  bookHref?: string
}

export default function JoinPanel({ access, initial, supportPhone, bookHref = '/book' }: Props) {
  const [view, setView] = useState(initial)
  const [stage, setStage] = useState<Stage>(initial.status === 'cancelled' ? 'cancelled' : 'overview')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [participants, setParticipants] = useState(1)

  // Use the server's clock as the reference so a wrong device clock doesn't mislead the customer.
  const skew = useRef(0)
  const [now, setNow] = useState(() => new Date(initial.serverNow).getTime())
  useEffect(() => {
    skew.current = new Date(initial.serverNow).getTime() - Date.now()
    const t = setInterval(() => setNow(Date.now() + skew.current), 15_000)
    return () => clearInterval(t)
  }, [initial.serverNow])

  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)
  useEffect(() => () => { callRef.current?.destroy() }, [])

  const opensAt = new Date(view.joinOpensAt).getTime()
  const closesAt = new Date(view.joinClosesAt).getTime()
  const canJoin = view.status === 'scheduled' || view.status === 'in_progress' ? now >= opensAt && now <= closesAt : false
  const tooEarly = (view.status === 'scheduled' || view.status === 'in_progress') && now < opensAt
  const passed = (view.status === 'scheduled' || view.status === 'in_progress') && now > closesAt

  const startCall = useCallback(async () => {
    setBusy(true)
    setError(null)
    const res = await getCustomerJoin(access)
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
      setStage('overview')
      return
    }
    try {
      if (!containerRef.current) throw new Error('no container')
      setStage('joining')
      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: { width: '100%', height: '100%', border: '0' },
      })
      callRef.current = call
      const count = () => setParticipants(Object.keys(call.participants()).length)
      call
        .on('joined-meeting', () => {
          setStage('incall')
          count()
        })
        .on('participant-joined', count)
        .on('participant-left', count)
        .on('left-meeting', () => {
          void reportLeft(access)
          call.destroy()
          callRef.current = null
          setStage('left')
        })
      await call.join({ url: res.roomUrl, token: res.token })
    } catch {
      setError('We couldn’t start the video. Please check your camera and microphone are allowed, then try again.')
      callRef.current?.destroy()
      callRef.current = null
      setStage('overview')
    } finally {
      setBusy(false)
    }
  }, [access])

  async function onJoinClick() {
    if (view.consentGiven) return startCall()
    setStage('consent')
  }

  async function onAgree() {
    setBusy(true)
    setError(null)
    const res = await recordConsent(access, true)
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
      return
    }
    setView(res.view)
    setBusy(false)
    await startCall()
  }

  async function onDecline() {
    await recordConsent(access, false)
    setStage('declined')
  }

  async function onCancel() {
    setBusy(true)
    const res = await cancelAppointment(access)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      setConfirmCancel(false)
      return
    }
    setStage('cancelled')
  }

  const inCallLayout = stage === 'joining' || stage === 'incall'

  return (
    <div className="space-y-6">
      {/* The frame container is always mounted so the call can attach to it. */}
      <div
        className={inCallLayout ? 'block' : 'hidden'}
        style={{ height: 'min(78vh, 720px)', border: '1px solid var(--line)', background: '#000' }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {stage === 'incall' && participants < 2 && (
        <p className="text-lg" style={{ color: 'var(--ink)' }} role="status">
          You’re in. We’re just waiting for your guide to join you.
        </p>
      )}
      {stage === 'joining' && (
        <p className="text-lg" style={{ color: 'var(--ink)' }} role="status">
          Opening your call…
        </p>
      )}

      {stage === 'overview' && (
        <section className="border border-[var(--line)] bg-white">
          <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
          <div className="space-y-4 px-6 py-7">
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Your guided call
            </h1>
            <p className="text-xl" style={{ color: 'var(--ink)' }}>
              {longWhen(view.startsAt)}{' '}
              <span style={{ color: 'var(--mkt-stone)' }}>({fmt(view.startsAt, { timeZoneName: 'short' }).split(' ').pop()})</span>
            </p>

            {view.status === 'completed' && (
              <p className="text-lg" style={{ color: 'var(--ink)' }}>This call is finished. Thank you.</p>
            )}
            {view.status === 'no_show' && (
              <p className="text-lg" style={{ color: 'var(--ink)' }}>We missed you for this call. You can book a new time whenever suits.</p>
            )}

            {(view.status === 'scheduled' || view.status === 'in_progress') && (
              <>
                {tooEarly && (
                  <p className="text-lg" style={{ color: 'var(--mkt-stone)' }}>
                    Your call opens at {fmt(view.joinOpensAt, { hour: 'numeric', minute: '2-digit', hour12: true })}. Come back to this
                    page then and tap “Join”.
                  </p>
                )}
                {passed && (
                  <p className="text-lg" style={{ color: 'var(--ink)' }}>
                    This call time has passed. You can book a new time below.
                  </p>
                )}
                {error && (
                  <p role="alert" className="text-lg" style={{ color: '#b91c1c' }}>{error}</p>
                )}
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  style={bigBtn}
                  disabled={!canJoin || busy}
                  onClick={onJoinClick}
                >
                  {busy ? 'Please wait…' : 'Join your call'}
                </button>
                <p className="text-base" style={{ color: 'var(--mkt-stone)' }}>
                  You’ll be asked to allow your camera and microphone. Nothing to install.
                  {supportPhone ? <> Having trouble? Call us on <a href={`tel:${supportPhone.replace(/\s/g, '')}`} className="underline" style={{ color: 'var(--teal-deep)' }}>{supportPhone}</a>.</> : null}
                </p>
              </>
            )}

            {(view.status === 'scheduled') && !passed && (
              <div className="pt-2">
                {!confirmCancel ? (
                  <button type="button" className="text-base underline" style={{ color: 'var(--mkt-stone)' }} onClick={() => setConfirmCancel(true)}>
                    Cancel this booking
                  </button>
                ) : (
                  <div className="space-y-3" role="alertdialog" aria-label="Confirm cancel">
                    <p className="text-lg" style={{ color: 'var(--ink)' }}>Cancel this booking?</p>
                    <div className="flex gap-3">
                      <button type="button" className="btn btn-secondary" style={bigBtn} onClick={() => setConfirmCancel(false)}>Keep it</button>
                      <button type="button" className="btn btn-secondary" style={bigBtn} disabled={busy} onClick={onCancel}>Yes, cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {stage === 'consent' && (
        <section className="border border-[var(--line)] bg-white" aria-labelledby="consent-h">
          <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
          <div className="space-y-4 px-6 py-7">
            <h1 id="consent-h" className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {RECORDING_CONSENT_TEXT.heading}
            </h1>
            {RECORDING_CONSENT_TEXT.body.map((p) => (
              <p key={p} className="text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>{p}</p>
            ))}
            {error && <p role="alert" className="text-lg" style={{ color: '#b91c1c' }}>{error}</p>}
            <button type="button" className="btn btn-primary w-full" style={bigBtn} disabled={busy} onClick={onAgree}>
              {busy ? 'Please wait…' : RECORDING_CONSENT_TEXT.agree}
            </button>
            <button type="button" className="btn btn-secondary w-full" style={bigBtn} disabled={busy} onClick={onDecline}>
              {RECORDING_CONSENT_TEXT.decline}
            </button>
          </div>
        </section>
      )}

      {stage === 'declined' && (
        <section className="space-y-4 border border-[var(--line)] bg-white px-6 py-7">
          <p className="text-lg leading-relaxed" style={{ color: 'var(--ink)' }}>{RECORDING_CONSENT_TEXT.declined}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" style={bigBtn} onClick={() => setStage('consent')}>Go back</button>
            {view.status === 'scheduled' && (
              <button type="button" className="btn btn-secondary" style={bigBtn} disabled={busy} onClick={onCancel}>Cancel this booking</button>
            )}
            <Link href="/start" className="btn btn-primary" style={bigBtn}>Do it myself online</Link>
          </div>
        </section>
      )}

      {stage === 'left' && (
        <section className="space-y-4 border border-[var(--line)] bg-white px-6 py-7">
          <p className="text-xl" style={{ color: 'var(--ink)' }}>You’ve left the call.</p>
          <p className="text-lg" style={{ color: 'var(--mkt-stone)' }}>If that was a mistake, you can rejoin straight away.</p>
          <button type="button" className="btn btn-primary w-full" style={bigBtn} disabled={busy || !canJoin} onClick={startCall}>
            Rejoin the call
          </button>
        </section>
      )}

      {stage === 'cancelled' && (
        <section className="space-y-4 border border-[var(--line)] bg-white px-6 py-7">
          <p className="text-xl" style={{ color: 'var(--ink)' }}>This booking is cancelled.</p>
          <Link href={bookHref} className="btn btn-primary" style={bigBtn}>Book a new time</Link>
        </section>
      )}

      {(stage === 'overview' && (passed || view.status === 'no_show')) && (
        <Link href={bookHref} className="btn btn-secondary" style={bigBtn}>Book a new time</Link>
      )}
    </div>
  )
}
