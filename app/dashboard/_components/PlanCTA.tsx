'use client'

import { useState } from 'react'
import type { Product } from '@/src/lib/stripe'

const PLANS: {
  id: Product
  name: string
  tagline: string
  description: string
  features: string[]
  highlight: boolean
  cta: string
}[] = [
  {
    id: 'will',
    name: 'Will Document',
    tagline: 'One-off purchase',
    description: 'Your AI-drafted will reviewed by a qualified solicitor and finalised — yours permanently.',
    features: [
      'AI-drafted legal will',
      'Solicitor review included',
      'Downloadable PDF',
      'Currently available in NSW and VIC',
    ],
    highlight: false,
    cta: 'Get your Will',
  },
  {
    id: 'vault',
    name: 'Living Vault',
    tagline: 'Annual subscription',
    description: 'Everything in Will, plus a secure digital vault — keep your estate plan current as life changes.',
    features: [
      'Everything in Will',
      'Secure document vault',
      'Unlimited will updates',
      'Remote witnessing sessions',
    ],
    highlight: true,
    cta: 'Start Living Vault',
  },
]

export default function PlanCTA() {
  const [loading, setLoading] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(product: Product) {
    setLoading(product)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed. Please try again.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
          Finalise your estate plan
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--ink)' }}>
          Your will is complete — choose how you want to secure it.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg border overflow-hidden"
            style={{
              borderColor: plan.highlight ? 'var(--teal)' : 'var(--line)',
              background: 'white',
            }}
          >
            {plan.highlight ? (
              <div
                className="px-5 py-1.5 text-center text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--teal)' }}
              >
                Most popular
              </div>
            ) : (
              <div className="h-[3px]" style={{ backgroundColor: 'var(--line)' }} />
            )}

            <div className="px-5 py-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
                  {plan.tagline}
                </p>
                <h3
                  className="text-base font-bold mt-0.5"
                  style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--neutral)' }}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink)' }}>
                    <svg
                      className="shrink-0 mt-0.5"
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="var(--teal)" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan.id)}
                disabled={loading !== null}
                className="w-full py-2.5 text-sm font-semibold transition-opacity rounded disabled:opacity-60 cursor-pointer"
                style={
                  plan.highlight
                    ? { backgroundColor: 'var(--teal)', color: 'white', border: 'none' }
                    : { backgroundColor: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }
                }
              >
                {loading === plan.id ? 'Loading…' : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-center" style={{ color: 'var(--neutral)' }}>
        Test mode — use card <span className="font-mono font-semibold">4242 4242 4242 4242</span>, any future date, any CVC.
      </p>
    </div>
  )
}
