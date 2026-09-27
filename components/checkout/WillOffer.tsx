'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { PRICING } from '@/src/lib/pricing'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })

const WILL_PRICE = PRICING.willAud
const UPDATES_PRICE = PRICING.updatesAudPerYear

const INCLUDED = [
  'Your complete Will, ready to sign',
  'Standard solicitor quality review before it is issued',
  'Permanent download',
  'Guided signing: remote video witnessing in NSW, print-and-sign elsewhere',
]

function Tick() {
  return (
    <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/**
 * The single place a Will is sold: A$129 (GST inclusive) with an optional, unticked A$25/year
 * "unlimited updates" add-on. Used by the wizard's payment step and the dashboard unlock banner.
 */
export default function WillOffer() {
  const [addUpdates, setAddUpdates] = useState(false)
  const [open, setOpen] = useState(false)

  const total = WILL_PRICE + (addUpdates ? UPDATES_PRICE : 0)
  const renewsOn = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }, [])

  return (
    <>
      <div className="border-2 p-5 space-y-5" style={{ borderColor: 'var(--teal)', background: '#fff' }}>
        <div>
          <p className="text-xs font-semibold uppercase" style={{ color: 'var(--teal-deep)', letterSpacing: '.1em' }}>The Will</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>${WILL_PRICE}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>One payment · includes GST</p>
        </div>

        <ul className="space-y-1.5">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink)' }}>
              <Tick />
              {f}
            </li>
          ))}
        </ul>

        <label
          className="flex items-start gap-3 border p-4 cursor-pointer min-h-[44px]"
          style={{ borderColor: addUpdates ? 'var(--teal)' : 'var(--line)' }}
        >
          <input
            type="checkbox"
            checked={addUpdates}
            onChange={(e) => setAddUpdates(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ accentColor: 'var(--teal)' }}
          />
          <span className="space-y-1">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Add unlimited updates</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>${UPDATES_PRICE}/year</span>
            </span>
            <span className="block text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
              Change your Will whenever life changes, as often as you need, and download each new version.
              Renews yearly until you cancel. Optional, and you can add it later.
            </span>
            <span className="block text-xs" style={{ color: 'var(--neutral)' }}>
              Video re-witnessing of updated Wills: coming soon. Until then you print and sign updates.
            </span>
          </span>
        </label>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full py-3 text-sm font-semibold text-white transition-opacity"
            style={{ backgroundColor: 'var(--teal)', border: 'none' }}
          >
            {addUpdates ? `Pay $${total} today · get your Will` : `Pay $${WILL_PRICE} · get your Will`}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--neutral)' }} aria-live="polite">
            {addUpdates
              ? `Includes $${WILL_PRICE} for your Will and $${UPDATES_PRICE} for the first year of updates. Renews $${UPDATES_PRICE}/year from ${renewsOn} until you cancel.`
              : 'No subscription. Add unlimited updates any time from your dashboard.'}
          </p>
        </div>
      </div>

      {open && <CheckoutModal product="will" addUpdates={addUpdates} onClose={() => setOpen(false)} />}
    </>
  )
}
