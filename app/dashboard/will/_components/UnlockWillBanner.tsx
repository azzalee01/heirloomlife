'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })

export default function UnlockWillBanner() {
  const [checkoutProduct, setCheckoutProduct] = useState<'will' | 'vault' | null>(null)

  return (
    <>
      <div className="bg-white border border-[var(--line)] overflow-hidden">
        <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-base font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              Unlock your Will
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
              Your Will is ready. Choose a plan to get your signed-ready document, a solicitor quality review, and the ability to keep it updated as life changes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-2 p-5 space-y-4 flex flex-col" style={{ borderColor: 'var(--teal)' }}>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: 'var(--teal-deep)', letterSpacing: '.1em' }}>The Will</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>$129</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>One payment · no subscription</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {['Solicitor-reviewed, signed-ready Will', 'Permanently downloadable', '3 months Living Vault included'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink)' }}>
                    <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setCheckoutProduct('will')}
                className="w-full py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--teal)', border: 'none' }}
              >
                Pay $129 · get your Will
              </button>
            </div>
            <div className="border p-5 space-y-4 flex flex-col" style={{ borderColor: 'var(--line)' }}>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: 'var(--teal-deep)', letterSpacing: '.1em' }}>Living Vault</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>$12/month</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>billed annually · Will included</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {['Will included and downloadable', 'Supported updates as life changes', 'Full platform access, renews annually'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--ink)' }}>
                    <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setCheckoutProduct('vault')}
                className="w-full py-2.5 text-sm font-semibold"
                style={{ border: '1.5px solid var(--teal-deep)', color: 'var(--teal-deep)', background: 'transparent' }}
              >
                Join · $12/month
              </button>
            </div>
          </div>
        </div>
      </div>
      {checkoutProduct && (
        <CheckoutModal product={checkoutProduct} onClose={() => setCheckoutProduct(null)} />
      )}
    </>
  )
}
