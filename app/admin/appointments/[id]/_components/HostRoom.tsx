'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { completeAppointment, hostJoin, logHostEvent, markNoShow } from '../../_actions'
import type { EventType } from '@/src/lib/appointments/types'

interface Props {
  appointmentId: string
  consentGiven: boolean
  status: string
}

export default function HostRoom({ appointmentId, consentGiven, status }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)
  const segmentStartedAt = useRef<number | null>(null)
  const segmentIndex = useRef(0)
  const maxParticipants = useRef(0)
  const customerSeenAt = useRef<number | null>(null)
  const pausedRef = useRef(false)

  const [inCall, setInCall] = useState(false)
  const [joining, setJoining] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [recording, setRecording] = useState(false)
  const [paymentPaused, setPaymentPaused] = useState(false)
  const [noRecordingWarning, setNoRecordingWarning] = useState(false)
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => { callRef.current?.destroy() }, [])

  // The customer's token starts recording on join. If nothing is recording ten seconds after they arrive
  // (auto-start unavailable, or it failed), warn loudly so the host starts it by hand.
  useEffect(() => {
    if (!inCall) return
    const t = setInterval(() => {
      const arrived = customerSeenAt.current
      setNoRecordingWarning(Boolean(arrived && !recording && !paymentPaused && Date.now() - arrived > 10_000))
    }, 2_000)
    return () => clearInterval(t)
  }, [inCall, recording, paymentPaused])

  function offset(): number | null {
    return segmentStartedAt.current ? Math.floor((Date.now() - segmentStartedAt.current) / 1000) : null
  }

  async function record(type: EventType, meta: Record<string, unknown> = {}) {
    const r = await logHostEvent(appointmentId, type, offset(), { segment: segmentIndex.current, ...meta })
    if (!r.ok) setError(r.error)
    return r.ok
  }

  async function join() {
    setJoining(true)
    setError(null)
    const res = await hostJoin(appointmentId)
    if (!res.ok) {
      setError(res.error)
      setJoining(false)
      return
    }
    try {
      const call = DailyIframe.createFrame(containerRef.current!, {
        showLeaveButton: true,
        iframeStyle: { width: '100%', height: '100%', border: '0' },
      })
      callRef.current = call
      const count = () => {
        const parts = Object.values(call.participants())
        setParticipants(parts.length)
        if (parts.length >= 2 && !customerSeenAt.current) customerSeenAt.current = Date.now()
        // More than two people (host + will-maker + someone else) is an undue-influence flag: log it once per increase.
        if (parts.length > 2 && parts.length > maxParticipants.current) {
          void record('third_party_present', { auto: true, participants: parts.length })
        }
        maxParticipants.current = Math.max(maxParticipants.current, parts.length)
      }
      call
        .on('joined-meeting', () => { setInCall(true); count() })
        .on('participant-joined', count)
        .on('participant-left', count)
        .on('recording-started', () => {
          // Recording must never run while card details are being entered, whatever started it (e.g. a customer reconnect).
          if (pausedRef.current) {
            call.stopRecording()
            setError('Recording restarted while paused for payment, so it was stopped again. Check that no card details were shown during that moment.')
            void logHostEvent(appointmentId, 'recording_started', null, { unexpected_during_payment_pause: true })
            return
          }
          segmentStartedAt.current = Date.now()
          segmentIndex.current += 1
          setRecording(true)
          setNoRecordingWarning(false)
          void record('recording_started')
        })
        .on('recording-stopped', () => {
          void record('recording_stopped')
          segmentStartedAt.current = null
          setRecording(false)
        })
        .on('recording-error', () => setError('Recording error. Start it again before continuing.'))
        .on('left-meeting', () => {
          void logHostEvent(appointmentId, 'left', null, {})
          call.destroy()
          callRef.current = null
          setInCall(false)
          router.refresh()
        })
      await call.join({ url: res.roomUrl, token: res.token })
    } catch {
      setError('Could not start the video.')
    } finally {
      setJoining(false)
    }
  }

  async function startRecording() {
    setError(null)
    try { callRef.current?.startRecording({ type: 'cloud' }) } catch { setError('Could not start recording.') }
  }

  async function pauseForPayment() {
    setError(null)
    await record('payment_step_started')
    await record('recording_paused', { reason: 'payment_details' })
    pausedRef.current = true
    setPaymentPaused(true)
    callRef.current?.stopRecording()
  }

  async function resumeAfterPayment() {
    setError(null)
    pausedRef.current = false
    setPaymentPaused(false)
    await record('payment_step_completed')
    callRef.current?.startRecording({ type: 'cloud' })
  }

  async function flag(type: 'capacity_flag' | 'third_party_present' | 'escalated') {
    const ok = await record(type, { note: note.trim() || undefined })
    if (ok) {
      setFlash(type === 'escalated' ? 'Escalated and logged. Stop giving any guidance and involve the solicitor.' : 'Logged against the recording timestamp.')
      setNote('')
      setTimeout(() => setFlash(null), 6000)
      if (type === 'escalated') router.refresh()
    }
  }

  async function finish(kind: 'complete' | 'noshow') {
    const r = kind === 'complete' ? await completeAppointment(appointmentId) : await markNoShow(appointmentId)
    if (!r.ok) return setError(r.error)
    router.refresh()
  }

  const closed = status === 'completed' || status === 'cancelled' || status === 'no_show'

  return (
    <section className="space-y-4">
      {!consentGiven && !closed && (
        <p className="text-sm" style={{ color: '#92400e' }}>
          The customer hasn’t agreed to the recording yet. They can’t enter the call until they do.
        </p>
      )}

      <div className={inCall || joining ? 'block' : 'hidden'} style={{ height: 'min(70vh, 640px)', border: '1px solid var(--line)', background: '#000' }}>
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {!inCall && !closed && (
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>
          At the start, confirm out loud: the customer’s name, that the person on screen is the person making the Will,
          and that they’re happy to be recorded. The on-screen agreement can be clicked by anyone holding the link.
        </p>
      )}

      {!inCall && !closed && (
        <button type="button" className="btn btn-primary btn-lg" disabled={joining} onClick={join}>
          {joining ? 'Opening…' : 'Join as host'}
        </button>
      )}

      {inCall && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full px-3 py-1 font-medium" style={recording ? { background: '#fef2f2', color: '#b91c1c' } : { background: 'var(--paper-warm)', color: 'var(--neutral)' }}>
              {recording ? '● Recording' : paymentPaused ? 'Paused for payment' : 'Not recording'}
            </span>
            <span style={{ color: 'var(--neutral)' }}>{participants} on the call</span>
          </div>

          {noRecordingWarning && (
            <div role="alert" className="flex flex-wrap items-center gap-3 border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>
              <span className="font-medium">The call is NOT being recorded.</span>
              <button type="button" className="btn btn-primary" onClick={startRecording}>Start recording</button>
            </div>
          )}

          {participants > 2 && (
            <p role="alert" className="border px-4 py-3 text-sm" style={{ borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }}>
              More than two people are on the call. Ask who is with the customer, make sure the answers are theirs, and flag it below if you have any doubt.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {!paymentPaused ? (
              <button type="button" className="btn btn-secondary" disabled={!recording} onClick={pauseForPayment}>Pause recording: card details next</button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={resumeAfterPayment}>Card entered: resume recording</button>
            )}
          </div>

          <div className="space-y-2 border p-4" style={{ borderColor: 'var(--line)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Flag a concern (stamped to the recording)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="What did you notice? (optional)"
              className="w-full border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
              style={{ borderColor: 'var(--line)' }}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => flag('capacity_flag')}>Capacity concern</button>
              <button type="button" className="btn btn-secondary" onClick={() => flag('third_party_present')}>Someone else is prompting</button>
              <button type="button" className="btn btn-secondary" style={{ borderColor: '#fecaca', color: '#b91c1c' }} onClick={() => flag('escalated')}>Escalate: stop guidance</button>
            </div>
            {flash && <p role="status" className="text-sm" style={{ color: 'var(--teal-deep)' }}>{flash}</p>}
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>}

      {!inCall && !closed && (
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => finish('complete')}>Mark completed</button>
          <button type="button" className="btn btn-secondary" onClick={() => finish('noshow')}>Mark no-show</button>
        </div>
      )}
    </section>
  )
}
