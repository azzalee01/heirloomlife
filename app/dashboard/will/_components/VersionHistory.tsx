'use client'

import { useState } from 'react'
import { getVersionSnapshotText } from '../_actions'

export type VersionSummary = {
  id: string
  createdAt: string
  changeSummary: string
  needsReview: boolean
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function VersionHistory({ versions }: { versions: VersionSummary[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function toggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setText(null)
      return
    }
    setExpandedId(id)
    setText(null)
    setLoading(true)
    try {
      const result = await getVersionSnapshotText(id)
      setText(result.text)
    } catch {
      setText('Could not load this version.')
    } finally {
      setLoading(false)
    }
  }

  if (versions.length === 0) {
    return <p className="text-sm text-[var(--neutral)]">No changes recorded yet.</p>
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div key={v.id} className="border border-[var(--line)] bg-white">
          <button
            type="button"
            onClick={() => toggle(v.id)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--ink)] truncate">{v.changeSummary}</p>
              <p className="text-xs text-[var(--neutral)] mt-0.5">{formatDateTime(v.createdAt)}</p>
            </div>
            <span className="flex items-center gap-2 shrink-0">
              {v.needsReview && (
                <span className="text-xs font-semibold px-2 py-0.5" style={{ background: '#fffbeb', color: '#92400e' }}>
                  Flagged
                </span>
              )}
              <span className="text-xs text-[var(--teal)]">{expandedId === v.id ? 'Hide' : 'View'}</span>
            </span>
          </button>
          {expandedId === v.id && (
            <div className="px-4 pb-4 border-t border-[var(--line)] pt-3">
              {loading ? (
                <p className="text-sm text-[var(--neutral)]">Loading…</p>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--ink)] leading-relaxed">{text}</pre>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
