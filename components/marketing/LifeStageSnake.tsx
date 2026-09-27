'use client'

import { Fragment, useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Event = {
  n: string
  eyebrow: string
  title: string
  slug: string
  badge: string | null
}

const EVENTS: Event[] = [
  { n: '01', eyebrow: 'Relationships', title: 'Getting married',          slug: 'getting-married',           badge: 'Marriage voids most Wills' },
  { n: '02', eyebrow: 'Family',        title: 'A new child',              slug: 'new-child',                 badge: 'Update guardianship clause' },
  { n: '03', eyebrow: 'Property',      title: 'Property bought or sold',  slug: 'buying-selling-property',   badge: 'Estate value has changed' },
  { n: '04', eyebrow: 'Business',      title: 'A business change',        slug: 'starting-selling-business', badge: 'Review succession interests' },
  { n: '05', eyebrow: 'Assets',        title: 'Receiving an inheritance', slug: 'receiving-inheritance',     badge: 'New assets to distribute' },
  { n: '06', eyebrow: 'Health',        title: 'Serious illness',          slug: 'serious-illness',           badge: 'Review Power of Attorney' },
  { n: '07', eyebrow: 'Relationships', title: 'Separation or divorce',    slug: 'separation-divorce',        badge: 'Beneficiaries may need review' },
  { n: '08', eyebrow: 'Moving',        title: 'Moving jurisdiction',      slug: 'moving-interstate',         badge: 'Will rules vary by state' },
]

// 8-node smooth cubic-bezier sine wave
// viewBox 0 0 900 200 — top nodes y=50, bottom nodes y=150
// x centres: (i + 0.5) / 8 * 900 → 56, 169, 281, 394, 506, 619, 731, 844
const WAVE_PATH = [
  'M 56 50',
  'C 113 50 113 150 169 150',
  'C 225 150 225 50 281 50',
  'C 338 50 338 150 394 150',
  'C 450 150 450 50 506 50',
  'C 563 50 563 150 619 150',
  'C 675 150 675 50 731 50',
  'C 788 50 788 150 844 150',
].join(' ')

const CIRCLE_R = 26    // px radius
const LINE_DUR = 1400  // ms — stroke-dashoffset draw
const NODE_D0  = 150   // ms — first node entrance delay
const NODE_GAP = 200   // ms — stagger between nodes
const DASH     = 4000  // dasharray value, larger than any path length in viewBox coords

export default function LifeStageSnake({ inline = false }: { inline?: boolean }) {
  const [hovered,  setHovered]  = useState<number | null>(null)
  const [reduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [animated, setAnimated] = useState(reduced)
  const waveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return

    const el = waveRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setAnimated(true)
      return
    }

    // Trigger once when ≥15% of the desktop wave is visible; never re-triggers
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAnimated(true)
        io.disconnect()
      }
    }, { threshold: 0.15 })

    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const CONTAINER_H = inline ? 360 : 400
  const SVG_H       = inline ? 180 : 200
  const SVG_TOP     = (CONTAINER_H - SVG_H) / 2
  const TOP_Y_PCT   = ((SVG_TOP + 50  / 200 * SVG_H) / CONTAINER_H * 100).toFixed(2)
  const BOT_Y_PCT   = ((SVG_TOP + 150 / 200 * SVG_H) / CONTAINER_H * 100).toFixed(2)

  // doAnim: true when entrance should play with motion; false for reduced/static
  const doAnim = animated && !reduced

  const inner = (
    <div className="md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>

      <style>{`
        @keyframes snakeNodeIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes snakeLabelIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Header — standalone mode only */}
      {!inline && (
        <div style={{ maxWidth: '44rem', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block' }}>
            Your life stages
          </span>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.9rem, 3.2vw, 3.1rem)', lineHeight: 1.08, letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0 }}>
            Every chapter has its own{' '}
            <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>legal moment</em>.
          </h2>
          <p style={{ marginTop: '1.1rem', maxWidth: '34rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', marginBottom: 0 }}>
            Life doesn&apos;t follow a schedule. Heirloom is built for the moments that change what your estate plan needs to protect.
          </p>
        </div>
      )}

      {/* ── DESKTOP horizontal wave (md+) ──────────────────────────────────── */}
      <div ref={waveRef} className="hidden md:block" style={{ position: 'relative', height: CONTAINER_H }}>

        {/* SVG: wave line + ambient glow dot */}
        <svg
          viewBox="0 0 900 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, top: SVG_TOP,
            width: '100%', height: SVG_H, pointerEvents: 'none',
          }}
        >
          {/* Wave line — draws left-to-right via stroke-dashoffset on entrance */}
          <path
            d={WAVE_PATH}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="2"
            strokeOpacity=".22"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: DASH,
              strokeDashoffset: (animated || reduced) ? 0 : DASH,
              transition: doAnim
                ? `stroke-dashoffset ${LINE_DUR}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : 'none',
            }}
          />

        </svg>

        {/* Circles and labels */}
        {EVENTS.map((ev, i) => {
          const isTop      = i % 2 === 0
          const active     = hovered === i
          const leftPct    = `${(i + 0.5) / 8 * 100}%`
          const circleYPct = isTop ? `${TOP_Y_PCT}%` : `${BOT_Y_PCT}%`

          // Entrance timing: line reaches node i at approximately NODE_D0 + i * NODE_GAP ms
          const circleDelay = `${NODE_D0 + i * NODE_GAP}ms`
          const labelDelay  = `${NODE_D0 + i * NODE_GAP + 80}ms`

          return (
            <Fragment key={ev.slug}>

              {/* Circle — entrance: fade in + rise 10px; hover: colour swap */}
              <Link
                href={`/life-changes/${ev.slug}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'absolute',
                  left: leftPct,
                  top: circleYPct,
                  transform: 'translate(-50%, -50%)',
                  width: CIRCLE_R * 2,
                  height: CIRCLE_R * 2,
                  borderRadius: '50%',
                  background: active ? 'var(--teal)' : '#fff',
                  border: `2px solid ${active ? 'var(--teal)' : 'rgba(42,180,174,.45)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  letterSpacing: '-.01em',
                  color: active ? '#fff' : 'var(--teal)',
                  textDecoration: 'none',
                  // Hover transition only covers colour properties — not transform/opacity
                  // so it doesn't fight the entrance keyframe
                  transition: 'background .18s, border-color .18s, color .18s, box-shadow .18s',
                  boxShadow: active
                    ? '0 0 0 6px rgba(42,180,174,.12), 0 4px 16px rgba(42,180,174,.2)'
                    : '0 2px 8px rgba(0,0,0,.07)',
                  zIndex: 2,
                  flexShrink: 0,
                  // Animation state:
                  //   doAnim  → play entrance keyframe (fill-mode both handles pre/post opacity)
                  //   !animated (IO not yet fired) → hide until entrance starts
                  //   reduced + animated → show immediately, no animation
                  ...(doAnim
                    ? { animation: `snakeNodeIn 0.4s ease-out ${circleDelay} both` }
                    : !animated
                    ? { opacity: 0 }
                    : {}),
                }}
              >
                {ev.n}
              </Link>

              {/* Label — above circle for top nodes, below for bottom nodes */}
              <div
                style={{
                  position: 'absolute',
                  left: leftPct,
                  pointerEvents: 'none',
                  width: 108,
                  textAlign: 'center',
                  ...(isTop ? {
                    top: `calc(${circleYPct} - ${CIRCLE_R + 10}px)`,
                    transform: 'translate(-50%, -100%)',
                  } : {
                    top: `calc(${circleYPct} + ${CIRCLE_R + 10}px)`,
                    transform: 'translateX(-50%)',
                  }),
                  ...(doAnim
                    ? { animation: `snakeLabelIn 0.35s ease-out ${labelDelay} both` }
                    : !animated
                    ? { opacity: 0 }
                    : {}),
                }}
              >
                <p style={{ margin: '0 0 .2rem', fontSize: inline ? '.52rem' : '.58rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--mkt-stone-soft)' }}>
                  {ev.eyebrow}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: inline ? '.72rem' : '.78rem',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: hovered === i ? 'var(--teal-deep)' : 'var(--mkt-ink-text)',
                  transition: 'color .15s',
                }}>
                  {ev.title}
                </p>
                {active && ev.badge && (
                  <span style={{ display: 'inline-block', marginTop: '.35rem', fontSize: '.54rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.18rem .5rem', borderRadius: 99, background: 'rgba(42,180,174,.1)', color: 'var(--teal-deep)', border: '1px solid rgba(42,180,174,.3)' }}>
                    {ev.badge}
                  </span>
                )}
              </div>

            </Fragment>
          )
        })}
      </div>

      {/* ── MOBILE vertical spine — no animation, always visible ─────────── */}
      <div className="md:hidden" style={{ position: 'relative', paddingLeft: '3rem' }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: '.9rem', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, var(--teal) 4%, var(--teal) 96%, transparent)', opacity: .2, pointerEvents: 'none' }} />

        {EVENTS.map((ev, i) => {
          const active = hovered === i
          return (
            <div key={ev.slug} style={{ position: 'relative', marginBottom: i < EVENTS.length - 1 ? '1.5rem' : 0 }}>
              <div aria-hidden="true" style={{ position: 'absolute', left: '-2.3rem', top: '.65rem', width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: active ? 'var(--teal)' : '#fff', border: `2px solid ${active ? 'var(--teal)' : 'var(--mkt-line)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', fontWeight: 700, color: active ? '#fff' : 'var(--mkt-stone)', transition: 'all .15s', zIndex: 1 }}>
                {ev.n}
              </div>
              <Link
                href={`/life-changes/${ev.slug}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ display: 'block', background: '#fff', borderRadius: 10, border: `1px solid ${active ? 'var(--teal)' : 'var(--mkt-line)'}`, padding: '1rem 1.1rem', textDecoration: 'none', transition: 'border-color .15s' }}
              >
                <p style={{ margin: '0 0 .2rem', fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--mkt-stone-soft)' }}>{ev.eyebrow}</p>
                <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 600, color: 'var(--mkt-ink-text)', lineHeight: 1.3 }}>{ev.title}</p>
                {active && ev.badge && <span style={{ display: 'inline-block', marginTop: '.4rem', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.2rem .55rem', borderRadius: 99, background: 'rgba(42,180,174,.1)', color: 'var(--teal-deep)', border: '1px solid rgba(42,180,174,.3)' }}>{ev.badge}</span>}
              </Link>
            </div>
          )
        })}
      </div>

      {!inline && (
        <div style={{ marginTop: '2.5rem' }}>
          <Link href="/life-changes" style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--teal-deep)', textDecoration: 'underline' }}>
            Explore all life stages →
          </Link>
        </div>
      )}
    </div>
  )

  if (inline) return inner

  return (
    <section style={{ background: '#fff', borderBottom: '1px solid var(--mkt-line)', paddingBlock: '5.5rem' }}>
      {inner}
    </section>
  )
}
