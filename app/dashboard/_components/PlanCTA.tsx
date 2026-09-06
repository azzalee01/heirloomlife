'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })

const FEATURES = [
  'Unlimited will reviews and quick amendments',
  'Unlimited add/remove of beneficiaries, gifts, and executors',
  'NSW members only: access to Heirloom\'s team AV witness pool',
  'Solicitor referral for complex or bespoke cases',
]

export default function PlanCTA() {
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startCheckout() {
    setError(null)
    setShowModal(true)
  }

  return (
    <div className="border border-[var(--teal)] overflow-hidden">
      <div className="px-5 py-1.5 text-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--teal)' }}>
        Unlock amendments
      </div>

      <div className="px-5 py-5 space-y-4 bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
            $99 / year · Will included
          </p>
          <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            Living Vault
          </h3>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Keep your Will and estate record current as life changes, with supported amendments and ongoing Vault access.
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
          className="w-full py-2.5 text-sm font-semibold transition-opacity cursor-pointer text-white"
          style={{ backgroundColor: 'var(--teal)', border: 'none' }}
        >
          Join Heirloom  -  $99/year
        </button>
      </div>

      {showModal && <CheckoutModal product="vault" onClose={() => setShowModal(false)} />}
    </div>
  )
}
