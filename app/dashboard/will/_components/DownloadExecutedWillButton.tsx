'use client'

import { useState } from 'react'
import { getExecutedWillDownloadUrl } from '@/src/lib/appointments/witnessing'

export default function DownloadExecutedWillButton({ willId }: { willId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const result = await getExecutedWillDownloadUrl(willId)
      if (!result.ok) { setError(result.error); return }
      window.open(result.url, '_blank', 'noopener')
    } catch {
      setError('Could not generate download link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {loading ? 'Preparing…' : 'Download executed Will'}
      </button>
      {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
    </div>
  )
}
