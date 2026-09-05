'use client'

import { useState } from 'react'

export default function PricingVaultCTA() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'vault' }),
      })
      if (res.status === 401) {
        window.location.href = '/auth/signup?next=/pricing'
        return
      }
      const data = await res.json() as { url?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mkt-btn-ink-m"
    >
      {loading ? 'Loading…' : 'Join Heirloom  -  $99/year'}
    </button>
  )
}
