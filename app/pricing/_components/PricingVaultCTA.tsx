'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), { ssr: false })

export default function PricingVaultCTA() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowModal(true)} className="mkt-btn-ink-m">
        Join Heirloom  -  $99/year
      </button>
      {showModal && <CheckoutModal product="vault" onClose={() => setShowModal(false)} />}
    </>
  )
}
