'use client'

import { useState } from 'react'

const FEATURES = [
  'Unlimited will reviews and quick amendments',
  'Unlimited add/remove of beneficiaries, gifts, and executors',
  'NSW members only: access to Heirloom\'s team AV witness pool',
  'Solicitor referral for complex or bespoke cases',
]

export default function PlanCTA() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'vault_monthly' }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed. Please try again.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="border border-[var(--teal)] overflow-hidden">
      <div className="px-5 py-1.5 text-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--teal)' }}>
        Unlock amendments
      </div>

      <div className="px-5 py-5 space-y-4 bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
            $8 / month · cancel anytime
          </p>
          <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Living Vault
          </h3>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Your first Will is free. To make amendments after downloading, upgrade to Living Vault.
          </p>
        </div>

        <ul className="space-y-1.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink)' }}>
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60 cursor-pointer text-white"
          style={{ backgroundColor: 'var(--teal)', border: 'none' }}
        >
          {loading ? 'Loading…' : 'Get Living Vault — $8/mo'}
        </button>
      </div>

      <p className="pb-3 text-xs text-center" style={{ color: 'var(--neutral)' }}>
        Test mode — use card <span className="font-mono font-semibold">4242 4242 4242 4242</span>, any future date, any CVC.
      </p>
    </div>
  )
}
