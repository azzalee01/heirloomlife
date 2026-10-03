'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { cancelAppointment, getCustomerJoin, recordConsent, reportLeft } from '../_actions'
import { APPOINTMENT_TZ, RECORDING_CONSENT_TEXT } from '@/src/lib/appointments/constants'
import type { AppointmentView, ViewerAccess } from '@/src/lib/appointments/types'

type Stage = 'overview' | 'checking' | 'consent' | 'declined' | 'joining' | 'incall' | 'left' | 'cancelled'

const primaryBtn = { height: 64, fontSize: 20 } as const
const secondaryBtn = { height: 60, fontSize: 18 } as const

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, ...opts }).format(new Date(iso))
const longWhen = (iso: string) =>
  `${fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' })} at ${fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true })}`

interface Props {
  access: ViewerAccess
  initial: AppointmentView
  supportPhone?: string
  bookHref?: string
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="animate-spin"
      style={{ width: 22, height: 22, flexShrink: 0 }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function JoinPanel({ access, initial, supportPhone, bookHref = '/book' }: Props) {
  const [view, setView] = useState(initial)
  const [stage, setStage] = useState<Stage>(initial.status === 'cancelled' ? 'cancelled' : 'overview')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [participants, setParticipants] = useState(1)

  // Use the server's clock so a wrong device clock doesn't mislead the customer.
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
  const canJoin = (view.status === 'scheduled' || view.status === 'in_progress')
    ? now >= opensAt && now <= closesAt
    : false
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
        .on('joined-meeting', () => { setStage('incall'); count() })
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
      setError("We couldn't start the video. Please check your camera and microphone are allowed, then try again.")
      callRef.current?.destroy()
      callRef.current = null
      setStage('overview')
    } finally {
      setBusy(false)
    }
  }, [access])

  async function onJoinClick() {
    setStage('checking')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch {
      setError("We couldn't access your camera or microphone. Please allow access in your browser, then try again.")
      setStage('overview')
      return
    }
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
      {/* Video frame — always mounted so the call can attach to it */}
      <div
        className={inCallLayout ? 'block' : 'hidden'}
        style={{ height: 'min(78vh, 720px)', border: '1px solid var(--line)', background: '#000' }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {stage === 'incall' && participants < 2 && (
        <p className="text-xl" style={{ color: 'var(--ink)' }} role="status">
          You&rsquo;re in. We&rsquo;re just waiting for your guide to join you.
        </p>
      )}
      {stage === 'joining' && (
        <div className="flex items-center gap-3" role="status">
          <Spinner />
          <p className="text-xl" style={{ color: 'var(--ink)' }}>Opening your call&hellip;</p>
        </div>
      )}

      {/* Overview + device-check: same panel, button state changes during check */}
      {(stage === 'overview' || stage === 'checking') && (
        <section className="overflow-hidden border border-[var(--line)] bg-white">
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-5 px-6 py-8 sm:px-8">
            <h1
              className="text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              Your guided call
            </h1>

            <p className="text-2xl font-medium leading-snug" style={{ color: 'var(--ink)' }}>
              {longWhen(view.startsAt)}{' '}
              <span className="text-xl font-normal" style={{ color: 'var(--mkt-stone)' }}>
                ({fmt(view.startsAt, { timeZoneName: 'short' }).split(' ').pop()})
              </span>
            </p>

            {view.status === 'completed' && (
              <p className="text-xl" style={{ color: 'var(--ink)' }}>This call is finished. Thank you.</p>
            )}
            {view.status === 'no_show' && (
              <p className="text-xl" style={{ color: 'var(--ink)' }}>
                We missed you for this call. You can book a new time whenever suits.
              </p>
            )}

            {(view.status === 'scheduled' || view.status === 'in_progress') && (
              <>
                {tooEarly && (
                  <div
                    className="rounded-lg px-4 py-4"
                    style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-soft)' }}
                  >
                    <p className="text-xl" style={{ color: 'var(--teal-deep)' }}>
                      Your call opens at{' '}
                      <strong>{fmt(view.joinOpensAt, { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>.
                    </p>
                    <p className="mt-1 text-lg" style={{ color: 'var(--teal-deep)' }}>
                      Come back to this page then and tap &ldquo;Join your call&rdquo;.
                    </p>
                  </div>
                )}

                {passed && (
                  <p className="text-xl" style={{ color: 'var(--ink)' }}>
                    This call time has passed. You can book a new time below.
                  </p>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg px-4 py-4 space-y-2"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <p className="text-xl font-medium" style={{ color: '#b91c1c' }}>{error}</p>
                    {supportPhone && (
                      <p className="text-lg" style={{ color: '#7f1d1d' }}>
                        Need help? Call us on{' '}
                        <a
                          href={`tel:${supportPhone.replace(/\s/g, '')}`}
                          className="font-semibold underline"
                          style={{ color: '#7f1d1d' }}
                        >
                          {supportPhone}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* During device check: spinner + status message instead of a dead button */}
                {stage === 'checking' ? (
                  <div className="flex items-center gap-4 py-2" role="status">
                    <Spinner />
                    <p className="text-xl" style={{ color: 'var(--mkt-stone)' }}>
                      Checking your camera and microphone&hellip;
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    style={primaryBtn}
                    disabled={!canJoin || busy}
                    onClick={onJoinClick}
                  >
                    {busy ? 'Please wait…' : 'Join your call'}
                  </button>
                )}

                <p className="text-base leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
                  You&rsquo;ll need to allow camera and microphone access when prompted. Nothing to install.
                  {supportPhone && !error
                    ? <>{' '}Having trouble? Call us on{' '}
                        <a
                          href={`tel:${supportPhone.replace(/\s/g, '')}`}
                          className="underline"
                          style={{ color: 'var(--teal-deep)' }}
                        >
                          {supportPhone}
                        </a>.
                      </>
                    : null}
                </p>
              </>
            )}

            {view.status === 'scheduled' && !passed && (
              <div className="space-y-4 border-t pt-5" style={{ borderColor: 'var(--line)' }}>
                {'token' in access && (
                  <Link
                    href={`/appointments/reschedule/${(access as { token: string }).token}`}
                    className="text-lg underline block"
                    style={{ color: 'var(--mkt-stone)' }}
                  >
                    Need a different time? Reschedule
                  </Link>
                )}
                {!confirmCancel ? (
                  <button
                    type="button"
                    className="text-lg underline block"
                    style={{ color: 'var(--mkt-stone)' }}
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancel this booking
                  </button>
                ) : (
                  <div className="space-y-4" role="alertdialog" aria-label="Confirm cancel">
                    <p className="text-xl" style={{ color: 'var(--ink)' }}>
                      Are you sure you want to cancel?
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn btn-secondary flex-1"
                        style={secondaryBtn}
                        onClick={() => setConfirmCancel(false)}
                      >
                        Keep it
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary flex-1"
                        style={secondaryBtn}
                        disabled={busy}
                        onClick={onCancel}
                      >
                        Yes, cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {stage === 'consent' && (
        <section
          className="overflow-hidden border border-[var(--line)] bg-white"
          aria-labelledby="consent-h"
        >
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-5 px-6 py-8 sm:px-8">
            <h1
              id="consent-h"
              className="text-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              {RECORDING_CONSENT_TEXT.heading}
            </h1>
            {RECORDING_CONSENT_TEXT.body.map((p) => (
              <p key={p} className="text-xl leading-relaxed" style={{ color: 'var(--ink)' }}>{p}</p>
            ))}
            {error && (
              <p role="alert" className="text-xl" style={{ color: '#b91c1c' }}>{error}</p>
            )}
            <button
              type="button"
              className="btn btn-primary w-full"
              style={primaryBtn}
              disabled={busy}
              onClick={onAgree}
            >
              {busy ? 'Please wait…' : RECORDING_CONSENT_TEXT.agree}
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              style={secondaryBtn}
              disabled={busy}
              onClick={onDecline}
            >
              {RECORDING_CONSENT_TEXT.decline}
            </button>
          </div>
        </section>
      )}

      {stage === 'declined' && (
        <section className="overflow-hidden border border-[var(--line)] bg-white">
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-5 px-6 py-8 sm:px-8">
            <p className="text-xl leading-relaxed" style={{ color: 'var(--ink)' }}>
              {RECORDING_CONSENT_TEXT.declined}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                style={secondaryBtn}
                onClick={() => setStage('consent')}
              >
                Go back
              </button>
              {view.status === 'scheduled' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={secondaryBtn}
                  disabled={busy}
                  onClick={onCancel}
                >
                  Cancel this booking
                </button>
              )}
              <Link href="/start" className="btn btn-primary" style={secondaryBtn}>
                Do it myself online
              </Link>
            </div>
          </div>
        </section>
      )}

      {stage === 'left' && (
        <section className="overflow-hidden border border-[var(--line)] bg-white">
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-5 px-6 py-8 sm:px-8">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              You&rsquo;ve left the call.
            </h1>
            <p className="text-xl" style={{ color: 'var(--mkt-stone)' }}>
              If that was a mistake, you can rejoin straight away.
            </p>
            <button
              type="button"
              className="btn btn-primary w-full"
              style={primaryBtn}
              disabled={busy || !canJoin}
              onClick={startCall}
            >
              Rejoin the call
            </button>
          </div>
        </section>
      )}

      {stage === 'cancelled' && (
        <section className="overflow-hidden border border-[var(--line)] bg-white">
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-5 px-6 py-8 sm:px-8">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              This booking is cancelled.
            </h1>
            <p className="text-xl" style={{ color: 'var(--mkt-stone)' }}>
              You can book a new time whenever you&rsquo;re ready.
            </p>
            <Link href={bookHref} className="btn btn-primary inline-flex" style={primaryBtn}>
              Book a new time
            </Link>
          </div>
        </section>
      )}

      {stage === 'overview' && (passed || view.status === 'no_show') && (
        <Link href={bookHref} className="btn btn-secondary inline-flex" style={secondaryBtn}>
          Book a new time
        </Link>
      )}
    </div>
  )
}
