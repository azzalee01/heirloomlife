'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setPartnerActive } from '../_actions'

export default function PartnerActiveToggle({
  partnerId,
  active,
}: {
  partnerId: string
  active: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      await setPartnerActive(partnerId, !active)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold disabled:opacity-60"
      style={
        active
          ? { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }
          : { background: 'var(--paper-warm)', color: 'var(--neutral)', border: '1px solid var(--line)' }
      }
    >
      {loading ? '…' : active ? 'Active' : 'Inactive'}
    </button>
  )
}
