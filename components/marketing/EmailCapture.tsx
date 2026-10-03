'use client'

import { useState } from 'react'

interface Props {
  source: 'homepage' | 'pricing'
  heading?: string
  subtext?: string
}

export default function EmailCapture({
  source,
  heading = 'Get the Australian estate planning checklist.',
  subtext = 'A plain-English guide to what you actually need  -  and what happens if you don\'t have it.',
}: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (res.ok) {
        setState('success')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div style={{ padding: '1.5rem 2rem', background: '#f0fdf9', border: '1px solid rgba(42,180,174,0.25)', borderRadius: 10 }}>
        <p style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 .25rem' }}>
          You&apos;re on the list.
        </p>
        <p style={{ fontSize: '.85rem', color: 'var(--mkt-stone)', margin: 0 }}>
          Check your inbox  -  the checklist is on its way.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', background: '#fff', border: '1px solid var(--mkt-line)', borderRadius: 10 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--mkt-ink-text)', margin: '0 0 .5rem', lineHeight: 1.25 }}>
        {heading}
      </p>
      <p style={{ fontSize: '.88rem', color: 'var(--mkt-stone)', margin: '0 0 1.25rem', lineHeight: 1.55 }}>
        {subtext}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '.65rem .9rem',
            fontSize: '.88rem',
            border: '1px solid var(--mkt-line)',
            borderRadius: 6,
            outline: 'none',
            color: 'var(--mkt-ink-text)',
            background: 'var(--mkt-surface)',
          }}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="mkt-btn-ink-m"
          style={{ flexShrink: 0 }}
        >
          {state === 'loading' ? 'Sending…' : 'Send me the checklist'}
        </button>
      </form>
      {state === 'error' && (
        <p style={{ marginTop: '.75rem', fontSize: '.82rem', color: '#b91c1c' }}>
          Something went wrong  -  try again or email us at hello@heirloomlife.com.au
        </p>
      )}
      <p style={{ marginTop: '.75rem', fontSize: '.75rem', color: 'var(--mkt-stone-soft)', margin: '.75rem 0 0' }}>
        No spam. Unsubscribe any time.
      </p>
    </div>
  )
}
