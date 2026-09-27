'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })

const FEATURES = [
  'Change your Will as often as life changes',
  'Add or remove beneficiaries, gifts and executors',
  'Download every new version',
  'Cancel any time; your Will stays yours',
]

/** Post-purchase offer: unlimited updates for people who own a Will but skipped the add-on at checkout. */
export default function PlanCTA() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="border border-[var(--teal)] overflow-hidden">
      <div className="px-5 py-1.5 text-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--teal)' }}>
        Keep your Will current
      </div>

      <div className="px-5 py-5 space-y-4 bg-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
            $25/year · includes GST
          </p>
          <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            Unlimited updates
          </h3>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Marriage, a new child, a property purchase: update your Will whenever your life changes. Renews yearly until you cancel.
          </p>
        </div>

        <ul className="space-y-1.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink)' }}>
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <p className="text-xs" style={{ color: 'var(--neutral)' }}>
          Video re-witnessing of updated Wills: coming soon. Until then you print and sign updates.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2.5 text-sm font-semibold transition-opacity cursor-pointer text-white"
          style={{ backgroundColor: 'var(--teal)', border: 'none' }}
        >
          Add unlimited updates  -  $25/year
        </button>
      </div>

      {showModal && <CheckoutModal product="updates" onClose={() => setShowModal(false)} />}
    </div>
  )
}
