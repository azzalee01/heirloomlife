'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { getJoinToken, completeSession, refreshRecordingStatus } from '../../_actions'

interface Props {
  sessionId: string
  status: string
  displayName: string
  recordingEnabled: boolean
  recordingStatus: string | null
  recordingUrl: string | null
}

export default function WitnessingRoom({ sessionId, status, displayName, recordingEnabled, recordingStatus, recordingUrl }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)
  const [inCall, setInCall] = useState(false)
  const [localStatus, setLocalStatus] = useState(status)
  const [joining, setJoining] = useState(false)
  const [ending, setEnding] = useState(false)
  const [checkingRecording, setCheckingRecording] = useState(false)
  const [localRecordingStatus, setLocalRecordingStatus] = useState(recordingStatus)
  const [localRecordingUrl, setLocalRecordingUrl] = useState(recordingUrl)
  // Only a call with more than one real participant present proves a witness
  // actually observed the signing  -  this is what gates completion.
  const [participantCount, setParticipantCount] = useState(1)

  useEffect(() => {
    return () => {
      callRef.current?.destroy()
    }
  }, [])

  async function handleJoin() {
    setJoining(true)
    try {
      const { roomUrl, token } = await getJoinToken(sessionId, displayName)
      if (!containerRef.current) return

      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        iframeStyle: { width: '100%', height: '100%', border: 'none' },
      })
      callRef.current = call

      const updateCount = () => {
        setParticipantCount(Object.keys(call.participants()).length)
      }
      call
        .on('joined-meeting', updateCount)
        .on('participant-joined', updateCount)
        .on('participant-left', updateCount)

      await call.join({ url: roomUrl, token })
      setInCall(true)
      router.refresh()
    } finally {
      setJoining(false)
    }
  }

  async function handleEnd() {
    setEnding(true)
    try {
      callRef.current?.leave()
      callRef.current?.destroy()
      callRef.current = null
      await completeSession(sessionId)
      setInCall(false)
      setLocalStatus('completed')
      router.refresh()
    } finally {
      setEnding(false)
    }
  }

  async function handleCheckRecording() {
    setCheckingRecording(true)
    try {
      const result = await refreshRecordingStatus(sessionId)
      setLocalRecordingStatus(result.status ?? null)
      if (result.url) setLocalRecordingUrl(result.url)
    } finally {
      setCheckingRecording(false)
    }
  }

  if (localStatus === 'completed') {
    return (
      <div className="bg-white border border-[var(--line)] overflow-hidden">
        <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
        <div className="px-6 py-8 text-center space-y-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Session completed</p>
          {recordingEnabled && (
            <div className="space-y-2">
              {localRecordingStatus === 'available' && localRecordingUrl ? (
                <a
                  href={localRecordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                >
                  View recording
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckRecording}
                  disabled={checkingRecording}
                  className="btn btn-glass inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                >
                  {checkingRecording ? 'Checking…' : 'Check recording status'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[var(--line)] overflow-hidden">
      <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />

      {!inCall && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--neutral)' }}>
            Ready when you are  -  your witness should join from the link sent to their email.
          </p>
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {joining ? 'Connecting…' : 'Join session'}
          </button>
        </div>
      )}

      <div ref={containerRef} className={inCall ? 'w-full aspect-video' : 'hidden'} />

      {inCall && (
        <div className="px-6 py-4 flex items-center justify-between">
          <span className="text-xs" style={{ color: participantCount > 1 ? 'var(--teal-deep)' : 'var(--neutral)' }}>
            {participantCount > 1
              ? `${participantCount} participants on the call`
              : 'Waiting for your witness to join…'}
          </span>
          <button
            type="button"
            onClick={handleEnd}
            disabled={ending || participantCount <= 1}
            title={participantCount <= 1 ? 'Your witness must join the call before you can mark this as witnessed' : undefined}
            className="text-sm font-semibold px-4 py-2 text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--ink)' }}
          >
            {ending ? 'Ending…' : 'End & mark witnessed'}
          </button>
        </div>
      )}
    </div>
  )
}
