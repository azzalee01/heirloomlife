'use client'

import { useEffect, useRef, useState } from 'react'

// sx/sy = where fragment spawns (scatter); tx/ty = where it lands on the card face
// All values are pixel offsets from the centre of the card wrapper
const FRAGS = [
  { id: 0, text: 'I appoint',           sx: -290, sy: -165, tx:  -95, ty:  -88 },
  { id: 1, text: 'Executor',            sx:  280, sy: -190, tx:   52, ty:  -62 },
  { id: 2, text: 'Specific gifts',      sx: -295, sy:   58, tx:  -82, ty:   -8 },
  { id: 3, text: 'residuary estate',    sx:  255, sy:  118, tx:   48, ty:   22 },
  { id: 4, text: 'if they survive me',  sx: -200, sy:  178, tx:  -48, ty:   66 },
  { id: 5, text: 'signed by me',        sx:  225, sy:  -72, tx:  -72, ty:  110 },
  { id: 6, text: 'in the presence of',  sx: -138, sy: -208, tx:   44, ty:  116 },
] as const

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(n: number) { return Math.max(0, Math.min(1, n)) }
function norm(p: number, s: number, e: number) { return clamp01((p - s) / (e - s)) }

const CLAUSES = [
  { n: '1', title: 'Appointment of Executor',
    body: 'I appoint James Mitchell (Spouse) as my sole executor. Failing whom, Emily Grant (Sibling).' },
  { n: '2', title: 'Specific Gifts',
    body: 'My Rolex Datejust to Thomas Mitchell. $20,000 to the Royal Children\'s Hospital Foundation.' },
  { n: '3', title: 'Residuary Estate',
    body: 'The residue to those who survive me by 30 days, in equal shares.' },
  { n: '4', title: 'Attestation',
    body: 'Signed by the Testator in the presence of two witnesses, present at the same time.' },
]

const TRUST_ITEMS = [
  {
    d1: 'M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z',
    d2: 'M9 12l2 2 4-4',
    text: "Available in all Australian states and territories — drafted to your state's legal requirements",
  },
  {
    d1: 'M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z',
    d2: 'M12 7v5l3 2',
    text: 'A living document, amended as your life changes',
  },
  {
    d1: 'M4 10h16v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 21Z',
    d2: 'M8 10V7a4 4 0 0 1 8 0v3',
    text: 'Solicitor reviewed, securely stored',
  },
  {
    d1: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
    d2: null,
    text: 'Free to start — pay only when you download',
  },
]

export default function WillDraftingAnimation() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    const shouldSkip =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.innerWidth < 640
    if (shouldSkip) { setSkip(true); setP(1); return }

    let raf = 0
    const update = () => {
      const el = outerRef.current
      if (!el) return
      const { top } = el.getBoundingClientRect()
      // p=0 when section top is at 80% of viewport (card just coming into view)
      // p=1 after scrolling 1 full viewport height past that point
      setP(clamp01((window.innerHeight * 0.8 - top) / window.innerHeight))
    }
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  const fragIn    = norm(p, 0.10, 0.26)
  const fragOut   = norm(p, 0.42, 0.60)
  const fragAlpha = fragIn * (1 - fragOut) * 0.82
  const settleT   = norm(p, 0.10, 0.60)

  const badgeOpacity = norm(p, 0.62, 0.76)
  const peaceOpacity = norm(p, 0.80, 0.94)
  const peaceY       = lerp(8, 0, norm(p, 0.80, 0.94))

  return (
    <div
      ref={outerRef}
      style={{ maxWidth: 1240, marginInline: 'auto', padding: '7rem 1.5rem 7.5rem' }}
    >
      {/* Full-width heading */}
      <h2 style={{
        fontFamily: 'var(--font-display,serif)', fontStyle: 'italic',
        fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.06,
        letterSpacing: '-.02em', fontWeight: 400,
        color: 'var(--mkt-ink-text,#0f1e1c)', margin: '0 0 3.5rem',
      }}>
        Every clause in its right place.
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '5rem',
        alignItems: 'start',
      }}>

        {/* Left column: card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* Card + floating fragments */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
            <div style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid var(--mkt-line,#e5e5e3)',
              overflow: 'hidden',
            }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,#1A7D79,#2AB4AE)' }} />
              <div style={{ padding: '16px 22px 13px', textAlign: 'center', borderBottom: '1px solid var(--mkt-line,#e5e5e3)' }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '.18em',
                  textTransform: 'uppercase' as const, color: '#1A7D79',
                }}>
                  Last Will &amp; Testament
                </span>
                <p style={{
                  fontFamily: 'var(--font-display,serif)', fontStyle: 'italic',
                  fontSize: 20, color: '#0f1e1c', margin: '7px 0 2px',
                }}>
                  Sarah Mitchell
                </p>
                <p style={{ fontSize: 11, color: '#6b7b76', margin: 0 }}>
                  of Sydney, New South Wales
                </p>
              </div>
              <div style={{ padding: '0 22px 2px' }}>
                {CLAUSES.map((c, i) => (
                  <div key={c.n} style={{
                    padding: '10px 0',
                    borderBottom: i < CLAUSES.length - 1 ? '1px solid var(--mkt-line,#e5e5e3)' : 'none',
                  }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#0f1e1c' }}>
                      {c.n}. {c.title}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, lineHeight: 1.55, color: '#6b7b76' }}>
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{
                margin: '6px 22px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5,
                opacity: skip ? 1 : badgeOpacity,
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M2 5.5L4.5 8l4.5-5" stroke="#1A7D79" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.07em',
                  textTransform: 'uppercase' as const, color: '#1A7D79',
                }}>
                  Solicitor reviewed
                </span>
              </div>
            </div>

            {/* Clause fragments — fly from scatter positions into card */}
            {!skip && FRAGS.map((f) => (
              <span key={f.id} aria-hidden="true" style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(
                  calc(-50% + ${lerp(f.sx, f.tx, settleT)}px),
                  calc(-50% + ${lerp(f.sy, f.ty, settleT)}px)
                )`,
                opacity: fragAlpha,
                fontFamily: 'var(--font-body,system-ui,sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '.01em',
                color: 'var(--teal-deep,#1A7D79)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 10,
              }}>
                {f.text}
              </span>
            ))}
          </div>

        </div>

        {/* Right column: trust points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                style={{ flexShrink: 0, color: 'var(--teal-deep,#1A7D79)', marginTop: 2 }}
                aria-hidden="true"
              >
                <path d={item.d1} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                {item.d2 && <path d={item.d2} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
              <span style={{ fontSize: '.875rem', lineHeight: 1.6, color: 'var(--mkt-stone,#6b7b76)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Full-width peace coda */}
      <div style={{
        marginTop: '4rem',
        opacity: skip ? 1 : peaceOpacity,
        transform: skip ? 'none' : `translateY(${peaceY}px)`,
      }}>
        <p style={{
          fontFamily: 'var(--font-display,serif)', fontStyle: 'italic',
          fontSize: 22, color: '#0f1e1c', margin: 0,
        }}>
          Everything in order.
        </p>
        <p style={{ fontSize: 13, color: '#6b7b76', marginTop: 6, maxWidth: 320 }}>
          Fifteen minutes. Your Will, ready for the moments that matter most.
        </p>
      </div>

    </div>
  )
}
