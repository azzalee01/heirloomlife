'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRecordingLink, refreshRecordings } from '../../_actions'

interface Rec { id: string; segment_index: number; status: string; started_at: string; duration_seconds: number | null }

export default function RecordingsPanel({ appointmentId, recordings }: { appointmentId: string; recordings: Rec[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function refresh() {
    setBusy(true)
    setMsg(null)
    const r = await refreshRecordings(appointmentId)
    setBusy(false)
    if (!r.ok) return setMsg(r.error)
    router.refresh()
  }

  async function open(id: string) {
    setMsg(null)
    const r = await getRecordingLink(id)
    if (!r.ok) return setMsg(r.error)
    window.open(r.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y border text-sm" style={{ borderColor: 'var(--line)' }}>
        {recordings.length === 0 && <li className="px-4 py-3" style={{ color: 'var(--neutral)' }}>No recordings synced yet. Press refresh after the call ends.</li>}
        {recordings.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2">
            <span style={{ color: 'var(--ink)' }}>
              Segment {r.segment_index + 1} · {r.status}
              {r.duration_seconds != null && ` · ${Math.floor(r.duration_seconds / 60)} min`}
            </span>
            <button type="button" className="btn btn-secondary" disabled={r.status !== 'available'} onClick={() => open(r.id)}>
              Open (link expires in ~1 hour)
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={refresh}>{busy ? 'Refreshing…' : 'Refresh recordings'}</button>
        {msg && <span className="text-sm" style={{ color: '#b91c1c' }}>{msg}</span>}
      </div>
      <p className="text-xs" style={{ color: 'var(--neutral)' }}>Every recording you open is logged in the audit trail.</p>
    </div>
  )
}
