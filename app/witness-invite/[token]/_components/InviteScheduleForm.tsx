'use client'

import { useEffect, useRef, useState } from 'react'
import DailyIframe, { type DailyCall } from '@daily-co/daily-js'
import { getWitnessJoinToken } from '@/app/witnessing/_actions'

interface Props {
  token: string
  scheduledAt: string | null
  status: string
}

export default function InviteScheduleForm({ token, scheduledAt, status }: Props) {
  const [name, setName] = useState('')
  const [inCall, setInCall] = useState(false)
  const [joining, setJoining] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const callRef = useRef<DailyCall | null>(null)

  useEffect(() => () => { callRef.current?.destroy() }, [])

  async function handleJoin() {
    setJoining(true)
    try {
      const { roomUrl, token: meetingToken } = await getWitnessJoinToken(token, name || 'Witness')
      if (!containerRef.current) return
      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        iframeStyle: { width: '100%', height: '100%', border: 'none' },
      })
      callRef.current = call
      await call.join({ url: roomUrl, token: meetingToken })
      setInCall(true)
    } finally {
      setJoining(false)
    }
  }

  if (status === 'completed') {
    return <p className="text-sm font-medium" style={{ color: 'var(--teal-deep)' }}>This session has already been completed. Thanks for witnessing.</p>
  }

  const dt = scheduledAt ? new Date(scheduledAt) : null

  return (
    <div className="space-y-4">
      {dt && (
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Scheduled for {dt.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
          {dt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {!inCall && (
        <div className="space-y-2">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining || !name.trim()}
            className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {joining ? 'Connecting…' : 'Join session'}
          </button>
        </div>
      )}

      <div ref={containerRef} className={inCall ? 'w-full aspect-video' : 'hidden'} />
    </div>
  )
}
