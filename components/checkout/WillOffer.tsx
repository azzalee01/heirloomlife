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

function UpdatesUpsellModal({
  onAdd,
  onSkip,
}: {
  onAdd: () => void
  onSkip: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(14,21,20,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onSkip() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden',
      }}>
        {/* Teal top bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--teal-deep), var(--teal))' }} />

        <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
          <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--teal-deep)', marginBottom: '.6rem' }}>
            One more thing
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 .75rem' }}>
            Keep your Will current as life changes.
          </h2>
          <p style={{ fontSize: '.88rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: '0 0 1.25rem' }}>
            Add <strong>unlimited updates</strong> for just <strong>${UPDATES_PRICE}/year</strong>. Change beneficiaries, executors, gifts — as many times as you need, and download every new version. Cancel any time.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[
              'Update your Will whenever life changes',
              'Download every new version',
              'Cancel any time — your Will stays yours',
            ].map((f) => (
              <li key={f} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start', fontSize: '.82rem', color: 'var(--mkt-stone)' }}>
                <Tick />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={onAdd}
            style={{
              width: '100%', padding: '.75rem', marginBottom: '.6rem',
              background: 'var(--teal)', color: '#fff', border: 'none',
              borderRadius: 7, fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Yes — add unlimited updates (${UPDATES_PRICE}/year)
          </button>
          <button
            onClick={onSkip}
            style={{
              width: '100%', padding: '.65rem',
              background: 'transparent', color: 'var(--mkt-stone)',
              border: '1.5px solid var(--mkt-line)', borderRadius: 7,
              fontSize: '.85rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            No thanks — just the Will (${WILL_PRICE})
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WillOffer() {
  const [addUpdates, setAddUpdates] = useState(false)
  const [showUpsell, setShowUpsell] = useState(false)
  const [open, setOpen] = useState(false)

  const total = WILL_PRICE + (addUpdates ? UPDATES_PRICE : 0)
  const renewsOn = useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  }, [])

  function handlePayClick() {
    if (!addUpdates) {
      setShowUpsell(true)
    } else {
      setOpen(true)
    }
  }

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
            onClick={handlePayClick}
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

      {showUpsell && (
        <UpdatesUpsellModal
          onAdd={() => {
            setAddUpdates(true)
            setShowUpsell(false)
            setOpen(true)
          }}
          onSkip={() => {
            setShowUpsell(false)
            setOpen(true)
          }}
        />
      )}

      {open && <CheckoutModal product="will" addUpdates={addUpdates} onClose={() => setOpen(false)} />}
    </>
  )
}
