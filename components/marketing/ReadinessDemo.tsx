'use client'
import { useEffect, useState } from 'react'

const SCORE = 78

const TICKS = [
  { text: 'Marriage automatically revokes a prior Will in most Australian states', badge: 'Action needed', type: 'amber' },
  { text: 'New asset added: Investment property, Bondi', badge: 'Synced', type: 'teal' },
  { text: 'Guardianship clause flagged for review after second child', badge: 'Review', type: 'amber' },
  { text: 'Executor access configured for nominated executor', badge: 'Active', type: 'teal' },
  { text: 'Will Version 4  -  Solicitor reviewed 12 Jun 2026', badge: 'Current', type: 'teal' },
]

export default function ReadinessDemo() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false)
      const swap = setTimeout(() => {
        setIdx(i => (i + 1) % TICKS.length)
        setFade(true)
      }, 280)
      return () => clearTimeout(swap)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - SCORE / 100)
  const tick = TICKS[idx]

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid var(--mkt-line)',
        padding: '2rem',
        width: 300,
        boxShadow: '0 20px 60px rgba(18,32,29,0.08)',
        flexShrink: 0,
      }}
      aria-label="Estate readiness demo panel"
    >
      {/* Readiness ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 128, height: 128 }}>
          <svg
            width="128" height="128" viewBox="0 0 128 128"
            aria-hidden="true"
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
          >
            <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(18,32,29,0.07)" strokeWidth="10"/>
            <circle
              cx="64" cy="64" r={r} fill="none" stroke="#2ab4ae" strokeWidth="10"
              strokeDasharray={String(circ)}
              strokeDashoffset={String(offset)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.4rem', lineHeight: 1, color: 'var(--mkt-ink-text)' }}>
              {SCORE}
            </span>
            <span style={{ fontSize: '.6rem', color: 'var(--mkt-stone-soft)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 4 }}>
              of 100
            </span>
          </div>
        </div>
        <p style={{ marginTop: '.75rem', fontSize: '.72rem', fontWeight: 600, color: 'var(--mkt-ink-text)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Estate Readiness
        </p>
      </div>

      {/* Live ticker */}
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--mkt-line)', paddingTop: '1.1rem' }}>
        <p style={{ fontSize: '.6rem', fontWeight: 600, color: 'var(--mkt-stone-soft)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.65rem' }}>
          Live updates
        </p>
        <div
          style={{ opacity: fade ? 1 : 0, transition: 'opacity .28s ease', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem' }}
          aria-live="polite"
          aria-atomic="true"
        >
          <span style={{ fontSize: '.82rem', color: 'var(--mkt-stone)', lineHeight: 1.5, flex: 1 }}>
            {tick.text}
          </span>
          <span style={{
            flexShrink: 0,
            fontSize: '.65rem', fontWeight: 600,
            padding: '.3rem .7rem',
            borderRadius: 99,
            border: `1px solid ${tick.type === 'amber' ? 'var(--mkt-ink-text)' : 'var(--teal)'}`,
            color: 'var(--mkt-ink-text)',
            whiteSpace: 'nowrap',
          }}>
            {tick.badge}
          </span>
        </div>
      </div>
    </div>
  )
}
