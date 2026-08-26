'use client'

import { useState } from 'react'
import { requestLawyerReview } from '../_actions'

interface Props {
  reasons: string[]
  subscriptionStatus: string
}

export default function LegalReviewCallout({ reasons, subscriptionStatus }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')
  const isSubscriber = subscriptionStatus === 'active'

  async function handleRequest() {
    setStatus('submitting')
    try {
      await requestLawyerReview()
      setStatus('submitted')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="border px-5 py-4" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
      <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
        Our AI review suggests a solicitor should look at your will
      </p>
      {reasons.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm" style={{ color: '#92400e' }}>
          {reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      )}

      {status === 'submitted' ? (
        <p className="mt-3 text-sm font-medium" style={{ color: '#92400e' }}>
          ✓ Review requested  -  we&apos;ll be in touch.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleRequest}
          disabled={status === 'submitting'}
          className="mt-3 text-sm font-semibold px-4 py-2 text-white disabled:opacity-60"
          style={{ backgroundColor: '#92400e' }}
        >
          {status === 'submitting'
            ? 'Requesting…'
            : isSubscriber
            ? 'Request Lawyer Review  -  Free with your plan'
            : 'Request Lawyer Review  -  $49'}
        </button>
      )}
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-700">Something went wrong  -  please try again.</p>
      )}
    </div>
  )
}
