'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { promoteClause, retireClause } from '../_actions'

export default function ClauseStatusButton({
  versionId,
  currentStatus,
}: {
  versionId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle(action: 'promote' | 'retire') {
    setLoading(true)
    setError(null)
    try {
      if (action === 'promote') await promoteClause(versionId)
      else await retireClause(versionId)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'draft' && (
        <button
          onClick={() => handle('promote')}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
          style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)', border: '1px solid rgba(42,180,174,0.3)' }}
        >
          {loading ? '…' : 'Promote'}
        </button>
      )}
      {currentStatus === 'production' && (
        <button
          onClick={() => handle('retire')}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
          style={{ background: 'var(--paper-warm)', color: 'var(--neutral)', border: '1px solid var(--line)' }}
        >
          {loading ? '…' : 'Retire'}
        </button>
      )}
      {error && <span className="text-xs" style={{ color: '#b91c1c' }}>{error}</span>}
    </div>
  )
}
