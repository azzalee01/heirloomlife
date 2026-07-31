'use client'

import Link from 'next/link'

export interface WitnessingSessionSummary {
  id: string
  scheduledAt: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  recordingEnabled: boolean
  recordingStatus: string | null
  recordingUrl: string | null
  witnesses: { id: string; name: string; attested: boolean }[]
}

const STATUS_LABEL: Record<WitnessingSessionSummary['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function SessionList({ sessions }: { sessions: WitnessingSessionSummary[] }) {
  if (sessions.length === 0) {
    return (
      <div className="border-2 border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}>
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>No witnessing sessions scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const dt = s.scheduledAt ? new Date(s.scheduledAt) : null
        return (
          <Link
            key={s.id}
            href={`/witnessing/${s.id}`}
            className="block bg-white border border-[var(--line)] px-5 py-4 hover:bg-[var(--paper-warm)] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  {dt
                    ? dt.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Awaiting witness time'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                  {dt && dt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  {s.witnesses.length > 0 && ` · ${s.witnesses.map((w) => w.name).join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {s.recordingEnabled && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)' }} />
                    {s.recordingStatus === 'available' ? 'Recorded' : s.recordingStatus === 'processing' ? 'Processing' : 'Recording'}
                  </span>
                )}
                <span
                  className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: 'var(--paper-warm)', color: 'var(--neutral)' }}
                >
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
