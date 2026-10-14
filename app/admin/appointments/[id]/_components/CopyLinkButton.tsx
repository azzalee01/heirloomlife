'use client'

import { useState } from 'react'

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 space-y-1">
      <span className="text-xs font-medium" style={{ color: 'var(--neutral)' }}>Customer link</span>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 rounded border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)', color: 'var(--ink)' }}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          type="button"
          onClick={copy}
          className="btn btn-secondary text-xs"
          style={{ whiteSpace: 'nowrap' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary text-xs"
          style={{ whiteSpace: 'nowrap' }}
        >
          Open
        </a>
      </div>
      <p className="text-xs" style={{ color: 'var(--neutral)' }}>
        Open in an incognito window to test as a customer (signed-in users are redirected to their dashboard).
      </p>
    </div>
  )
}
