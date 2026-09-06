'use client'

import { useState } from 'react'

interface Props {
  code: string
  product: 'will' | 'vault'
  discountCents: number
  expiresAt: string
  usedAt: string | null
}

export default function PartnerShareCard({ code, product, discountCents, expiresAt, usedAt }: Props) {
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://heirloomlife.com.au'
  const link = `${baseUrl}/start?partner=${code}`
  const discountLabel = `$${discountCents / 100} off`
  const productLabel = product === 'will' ? 'Will' : 'Heirloom Vault'
  const expiry = new Date(expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: 'var(--line)',
        background: '#fff',
        padding: '1.25rem 1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)', marginBottom: '.2rem' }}>
            Share with your partner
          </p>
          <p className="text-xs" style={{ color: 'var(--neutral)', lineHeight: 1.5 }}>
            Your partner gets {discountLabel} on their {productLabel}.
            {!usedAt && (
              <> Link expires {expiry}.</>
            )}
          </p>
        </div>

        {usedAt ? (
          <span
            className="text-xs font-medium"
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              borderRadius: 6,
              padding: '4px 10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Redeemed
          </span>
        ) : (
          <button
            onClick={handleCopy}
            className="text-xs font-medium"
            style={{
              background: copied ? '#ecfdf5' : 'var(--teal-deep)',
              color: copied ? '#065f46' : '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              cursor: 'pointer',
              transition: 'background 200ms, color 200ms',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        )}
      </div>

      {!usedAt && (
        <div
          className="text-xs font-mono"
          style={{
            marginTop: '.85rem',
            background: 'var(--paper-warm)',
            borderRadius: 6,
            padding: '8px 12px',
            color: 'var(--ink)',
            letterSpacing: '.04em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {link}
        </div>
      )}
    </div>
  )
}
