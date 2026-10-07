'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { promoteAmendment } from '../_actions'

export default function ApproveAmendmentButton({ versionId }: { versionId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setStatus('loading')
    setError(null)
    try {
      await promoteAmendment(versionId)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }

  return (
    <div className="shrink-0 space-y-1">
      <button
        onClick={handleApprove}
        disabled={status === 'loading'}
        className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {status === 'loading' ? 'Approving…' : 'Approve'}
      </button>
      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
    </div>
  )
}
