'use client'

import { useState } from 'react'

/** Opens the Stripe Billing Portal where the customer can cancel unlimited updates or update their card. */
export default function ManageUpdatesButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Unable to open billing right now.')
      window.location.href = data.url
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <span className="shrink-0 text-right">
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="text-xs font-semibold cursor-pointer disabled:opacity-60"
        style={{ color: 'var(--teal-deep)', background: 'none', border: 'none' }}
      >
        {busy ? 'Opening…' : 'Manage or cancel'}
      </button>
      {error && <span className="block text-xs text-red-600 mt-1" role="alert">{error}</span>}
    </span>
  )
}
