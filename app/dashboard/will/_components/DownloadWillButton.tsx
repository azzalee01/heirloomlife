'use client'

import { useState } from 'react'
import { markWillDownloaded } from '../_actions'

interface Props {
  willId: string
  documentText: string
  hasDownloaded: boolean
}

export default function DownloadWillButton({ willId, documentText, hasDownloaded }: Props) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await markWillDownloaded(willId)
      const blob = new Blob([documentText], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-will.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {downloading ? 'Downloading…' : 'Download Will'}
      </button>
      {hasDownloaded && (
        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          Previously downloaded. To amend this Will, an active Living Vault membership is required.
        </p>
      )}
    </div>
  )
}
