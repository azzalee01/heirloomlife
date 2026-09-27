'use client'

import WillOffer from '@/components/checkout/WillOffer'

export default function UnlockWillBanner() {
  return (
    <div className="bg-white border border-[var(--line)] overflow-hidden">
      <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
      <div className="px-6 py-5 space-y-5">
        <div>
          <p className="text-base font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            Unlock your Will
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
            Your Will is ready. Unlock it to download your document and sign it.
          </p>
        </div>
        <WillOffer />
      </div>
    </div>
  )
}
