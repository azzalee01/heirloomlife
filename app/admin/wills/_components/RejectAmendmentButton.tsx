'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rejectAmendment } from '../_actions'

export default function RejectAmendmentButton({ versionId }: { versionId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleReject() {
    if (!reason.trim()) return
    setStatus('loading')
    setError(null)
    try {
      await rejectAmendment(versionId, reason.trim())
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold"
        style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
      >
        Reject
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason (shown to customer)…"
        rows={2}
        className="w-full rounded border px-3 py-2 text-sm outline-none"
        style={{ borderColor: '#fecaca', color: 'var(--ink)' }}
      />
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={status === 'loading' || !reason.trim()}
          className="inline-flex items-center px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          style={{ background: '#b91c1c', color: 'white' }}
        >
          {status === 'loading' ? 'Rejecting…' : 'Confirm rejection'}
        </button>
        <button
          onClick={() => { setOpen(false); setReason('') }}
          className="inline-flex items-center px-4 py-2 rounded text-sm"
          style={{ color: 'var(--neutral)' }}
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
    </div>
  )
}
