'use client'

import { useState } from 'react'
import { requestAccountDeletion } from '../_actions'

export default function DataPrivacy() {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onDelete() {
    setBusy(true)
    setMsg(null)
    const res = await requestAccountDeletion()
    setBusy(false)
    setConfirming(false)
    setMsg(
      res.ok
        ? { ok: true, text: 'Request received. Our team will be in touch to confirm before anything is removed.' }
        : { ok: false, text: res.error ?? 'Something went wrong.' }
    )
  }

  return (
    <div className="space-y-5">
      {/* Download */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>Download your data</p>
        <p className="text-xs mb-2.5" style={{ color: 'var(--neutral)' }}>
          A copy of your account and Will information as a JSON file.
        </p>
        <a
          href="/api/account/export"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
          style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download my data
        </a>
      </div>

      {/* Delete */}
      <div className="pt-5 border-t" style={{ borderColor: 'var(--line)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>Delete your account</p>
        <p className="text-xs mb-2.5" style={{ color: 'var(--neutral)' }}>
          A Will is a legal document, so we handle deletions by hand. Submit a request and our team will confirm with you before removing anything.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => { setConfirming(true); setMsg(null) }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
            style={{ background: '#fff', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            Request account deletion
          </button>
        ) : (
          <div className="rounded-lg p-3.5" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#991b1b' }}>
              Submit a deletion request for your account?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onDelete} disabled={busy} className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60" style={{ background: '#dc2626' }}>
                {busy ? 'Submitting…' : 'Yes, request deletion'}
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="px-4 py-2 text-sm font-semibold rounded-lg" style={{ background: '#fff', color: 'var(--ink)', border: '1px solid var(--line)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {msg && (
          <p className="text-xs mt-2.5" role="status" style={{ color: msg.ok ? 'var(--teal-deep)' : '#dc2626' }}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  )
}
