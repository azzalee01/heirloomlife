'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// One pen line through eight life moments. Drag it, flick it, tap a moment, or use the arrow keys.
// Physics: critically damped spring (response 0.42s), momentum projection on release,
// rubber-banding past the ends, direction lock so vertical swipes still scroll the page.

const W = 1280
const H = 210
const NODE_X = (i: number) => 80 + 160 * i

type Ev = { cat: string; title: string; y: number; clause: number; slug: string; why: string }

const EV: Ev[] = [
  { cat: 'Relationships', title: 'Getting married', y: 150, clause: 2, slug: 'getting-married',
    why: 'Marriage can affect an existing Will. Check your beneficiaries, executor and guardians still reflect your new chapter.' },
  { cat: 'Family', title: 'A new child', y: 96, clause: 1, slug: 'new-child',
    why: 'May affect guardianship and equal-distribution clauses.' },
  { cat: 'Property', title: 'Property bought or sold', y: 178, clause: 2, slug: 'buying-selling-property',
    why: 'Updates the asset register; specific gifts may need revision.' },
  { cat: 'Business', title: 'A business change', y: 122, clause: 2, slug: 'starting-selling-business',
    why: 'Can significantly change your estate composition.' },
  { cat: 'Assets', title: 'Receiving an inheritance', y: 60, clause: 2, slug: 'receiving-inheritance',
    why: 'New assets to account for, and possibly new people to provide for.' },
  { cat: 'Health', title: 'Serious illness', y: 138, clause: 0, slug: 'serious-illness',
    why: 'A moment to confirm your executor and guardians are still the right people.' },
  { cat: 'Relationships', title: 'Separation or divorce', y: 88, clause: 0, slug: 'separation-divorce',
    why: 'Gifts and executor appointments to a former spouse may be affected.' },
  { cat: 'Moving', title: 'Moving jurisdiction', y: 40, clause: 2, slug: 'moving-interstate',
    why: 'Succession law is state-based. Your Will should be checked against where you now live.' },
]

const CLAUSES = [
  { n: '1', name: 'Appointment of Executor', desc: 'Names who carries out your wishes.' },
  { n: '2', name: 'Guardianship of Minor Children', desc: 'Who cares for your children if you cannot.' },
  { n: '3', name: 'Distribution of Residuary Estate', desc: 'Sets out how everything not otherwise gifted is divided.' },
]

// ── Geometry (computed once) ────────────────────────────────────────────────
type Geo = { d: string; xs: number[]; ys: number[]; cum: number[]; L: number }

function buildGeo(): Geo {
  const pts: [number, number][] = [[0, 196], [80, 150], [240, 96], [400, 178], [560, 122], [720, 60], [880, 138], [1040, 88], [1200, 40], [1280, 22]]
  const segs: [number, number][][] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)]
    segs.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ])
  }
  const f = (n: number) => Math.round(n * 10) / 10
  const d = `M${f(pts[0][0])} ${f(pts[0][1])}` + segs.map((s) =>
    ` C${f(s[1][0])} ${f(s[1][1])} ${f(s[2][0])} ${f(s[2][1])} ${f(s[3][0])} ${f(s[3][1])}`).join('')
  const xs = [pts[0][0]], ys = [pts[0][1]], cum = [0]
  let L = 0, lx = pts[0][0], ly = pts[0][1]
  segs.forEach((s) => {
    for (let k = 1; k <= 14; k++) {
      const t = k / 14, u = 1 - t
      const x = u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0]
      const y = u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]
      L += Math.hypot(x - lx, y - ly); lx = x; ly = y
      xs.push(x); ys.push(y); cum.push(L)
    }
  })
  return { d, xs, ys, cum, L }
}
const GEO = buildGeo()

function lookup(x: number) {
  const { xs, ys, cum, L } = GEO
  if (x <= xs[0]) return { p: 0, y: ys[0] }
  if (x >= xs[xs.length - 1]) return { p: 1, y: ys[ys.length - 1] }
  let lo = 0, hi = xs.length - 1
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (xs[m] <= x) lo = m; else hi = m }
  const t = (x - xs[lo]) / ((xs[hi] - xs[lo]) || 1)
  return { p: (cum[lo] + (cum[hi] - cum[lo]) * t) / L, y: ys[lo] + (ys[hi] - ys[lo]) * t }
}

const idxOf = (x: number) => Math.max(0, Math.min(7, Math.round((x - 80) / 160)))
const rubber = (over: number) => (over * 240 * 0.55) / (240 + 0.55 * Math.abs(over))
const SPRING_W = (2 * Math.PI) / 0.42

type Down = { x0: number; y0: number; px0: number; moved: boolean; el: HTMLElement; pid: number; s: { x: number; t: number }[] }

export default function JourneyLine() {
  const [px, setPx] = useState(0)
  const [drag, setDrag] = useState(false)
  const [sel, setSel] = useState(0) // small-screen list selection
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const pxRef = useRef(0)
  const vRef = useRef(0)
  const raf = useRef(0)
  const touched = useRef(false)
  const down = useRef<Down | null>(null)
  const stage = useRef<HTMLDivElement>(null)

  const setPos = (v: number) => { pxRef.current = v; setPx(v) }

  // Spring to a target. With no explicit velocity it inherits the live one, so re-targeting mid-flight is smooth.
  const springTo = useCallback((target: number, v0?: number) => {
    cancelAnimationFrame(raf.current)
    if (reduce) { vRef.current = 0; pxRef.current = target; setPx(target); setDrag(false); return }
    let x = pxRef.current, last = 0
    let v = v0 !== undefined ? v0 : vRef.current
    const z = v0 !== undefined && Math.abs(v0) > 300 ? 0.8 : 1 // a little bounce only when a flick carried momentum
    const step = (t: number) => {
      if (!last) last = t
      const dt = Math.min((t - last) / 1000, 1 / 30)
      last = t
      v += (SPRING_W * SPRING_W * (target - x) - 2 * z * SPRING_W * v) * dt
      x += v * dt
      vRef.current = v
      if (Math.abs(target - x) < 0.25 && Math.abs(v) < 3) {
        vRef.current = 0; pxRef.current = target; setPx(target); setDrag(false); return
      }
      pxRef.current = x; setPx(x)
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [reduce])

  // Once in view, the pen moves to the first moment so the interaction is discoverable.
  useEffect(() => {
    const el = stage.current
    let timer: ReturnType<typeof setTimeout> | undefined
    let io: IntersectionObserver | undefined
    const start = () => { timer = setTimeout(() => { if (!touched.current) springTo(NODE_X(1)) }, 500) }
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); start() } }, { threshold: 0.4 })
      io.observe(el)
    } else start()
    return () => { io?.disconnect(); if (timer) clearTimeout(timer); cancelAnimationFrame(raf.current) }
  }, [springTo])

  const local = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return (e.clientX - r.left) * (W / (r.width || W))
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(raf.current)
    vRef.current = 0
    touched.current = true
    const x = local(e)
    down.current = { x0: x, y0: e.clientY, px0: pxRef.current, moved: false, el: e.currentTarget, pid: e.pointerId, s: [{ x, t: e.timeStamp }] }
    setDrag(true)
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = down.current
    if (!d) return
    const x = local(e)
    d.s.push({ x, t: e.timeStamp })
    if (d.s.length > 8) d.s.shift()
    if (!d.moved) {
      const adx = Math.abs(x - d.x0), ady = Math.abs(e.clientY - d.y0)
      if (ady > 10 && ady > adx) { down.current = null; setDrag(false); return } // vertical intent: let the page scroll
      if (adx < 6) return
      d.moved = true
      try { d.el.setPointerCapture(d.pid) } catch { /* not capturable */ }
    }
    const raw = d.px0 + (x - d.x0)
    setPos(raw < 80 ? 80 + rubber(raw - 80) : raw > 1200 ? 1200 + rubber(raw - 1200) : raw)
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = down.current
    down.current = null
    if (!d) return
    if (!d.moved) { setDrag(false); springTo(NODE_X(idxOf(d.x0))); return }
    const recent = d.s.filter((q) => e.timeStamp - q.t < 100)
    let v = 0
    if (recent.length > 1) {
      const a = recent[0], b = recent[recent.length - 1]
      v = ((b.x - a.x) / Math.max(b.t - a.t, 1)) * 1000
      if (Math.abs(v) < 60) v = 0
    }
    setDrag(false)
    springTo(NODE_X(idxOf(pxRef.current + v * 0.001 * 99)), v)
  }
  const onCancel = () => { // the browser took the gesture: never a tap
    const d = down.current
    down.current = null
    setDrag(false)
    if (d && d.moved) springTo(NODE_X(idxOf(pxRef.current)))
  }
  const idx = idxOf(px)
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let n = idx
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(7, idx + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(0, idx - 1)
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = 7
    else return
    e.preventDefault()
    touched.current = true
    springTo(NODE_X(n))
  }

  const cur = EV[idx]
  const { p, y: nibY } = lookup(Math.max(0, Math.min(W, px)))
  // Panel content follows the pen: it fades and slides against the direction of travel as the pen leaves a moment.
  const frac = Math.max(-0.5, Math.min(0.5, (px - 80) / 160 - idx))
  const panelOp = Math.max(0, Math.min(1, 1 - 1.8 * Math.abs(frac)))
  const shift = reduce ? 0 : -frac * 56

  const label: React.CSSProperties = { fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600 }

  return (
    <div className="md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>
      <p style={{ ...label, textAlign: 'center', color: 'var(--mkt-stone)', margin: 0 }}>The moments that change a Will</p>

      {/* ── Desktop: the pen line ─────────────────────────────────────────── */}
      <div className="hidden md:block" style={{ marginTop: '2.25rem' }}>
        <div ref={stage} style={{ position: 'relative', width: '100%', aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="jl-base" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
                <stop offset="0" stopColor="#8F8D84" stopOpacity="0" />
                <stop offset="0.07" stopColor="#8F8D84" stopOpacity="0.7" />
                <stop offset="0.93" stopColor="#8F8D84" stopOpacity="0.7" />
                <stop offset="1" stopColor="#8F8D84" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="jl-ink" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
                <stop offset="0" stopColor="#2AB4AE" stopOpacity="0" />
                <stop offset="0.07" stopColor="#2AB4AE" stopOpacity="1" />
                <stop offset="1" stopColor="#2AB4AE" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d={GEO.d} stroke="url(#jl-base)" strokeWidth="1.5" strokeLinecap="round" />
            <path pathLength={1} d={GEO.d} stroke="url(#jl-ink)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 1" style={{ strokeDashoffset: 1 - p }} />
          </svg>

          {EV.map((e, i) => {
            const x = NODE_X(i)
            const done = px >= x - 0.5
            const isSel = i === idx
            return (
              <div key={e.slug} aria-hidden="true">
                <div style={{
                  position: 'absolute', left: `${(x / W) * 100}%`, top: `${((e.y + 18) / H) * 100}%`, bottom: 0, width: 0,
                  borderLeft: isSel ? '1px solid #2AB4AE' : done ? '1px solid rgba(42,180,174,0.45)' : '1px dashed #D5D3CC',
                }} />
                <span style={{
                  position: 'absolute', left: `${(x / W) * 100}%`, top: `${(e.y / H) * 100}%`, width: 10, height: 10, borderRadius: '50%',
                  transform: 'translate(-50%, -50%)', boxSizing: 'border-box',
                  background: done ? '#2AB4AE' : '#fff', border: `1.5px solid ${done ? '#2AB4AE' : '#1A1A18'}`,
                  transition: 'background 240ms ease, border-color 240ms ease',
                }} />
              </div>
            )
          })}

          <div aria-hidden="true" style={{
            position: 'absolute', left: `${(Math.max(0, Math.min(W, px)) / W) * 100}%`, top: `${(nibY / H) * 100}%`, width: 14, height: 14, borderRadius: '50%',
            background: '#0E0E0E', pointerEvents: 'none',
            transform: `translate(-50%, -50%) scale(${drag ? 1.18 : 1})`, transition: reduce ? 'none' : 'transform 140ms ease-out',
            boxShadow: '0 0 0 5px #fff, 0 0 0 6.5px #2AB4AE, 0 10px 22px -4px rgba(14,14,14,0.34)',
          }} />

          <div
            role="slider" tabIndex={0} aria-label="Life moments" aria-orientation="horizontal"
            aria-valuemin={1} aria-valuemax={8} aria-valuenow={idx + 1} aria-valuetext={cur.title}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel} onKeyDown={onKey}
            className="jl-scrub"
            style={{ position: 'absolute', inset: 0, touchAction: 'pan-y', cursor: drag ? 'grabbing' : 'grab' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {EV.map((e, i) => {
            const isSel = i === idx
            const done = px >= NODE_X(i) - 0.5
            return (
              <button
                key={e.slug} type="button" tabIndex={-1} aria-hidden="true"
                onClick={() => { touched.current = true; springTo(NODE_X(i)) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 6px 12px', textAlign: 'center', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
              >
                <span style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mkt-stone)' }}>{e.cat}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(1.05rem, 1.7vw, 1.5rem)', lineHeight: 1.08, letterSpacing: '-.01em',
                  color: isSel ? '#0E0E0E' : done ? '#2A2925' : 'var(--mkt-stone)', transition: 'color 260ms ease',
                }}>{e.title}</span>
              </button>
            )
          })}
        </div>
        <p style={{ margin: '.5rem 0 0', textAlign: 'center', fontSize: '.82rem', color: 'var(--mkt-stone)' }}>Drag the line, or select a moment.</p>

        <div className="lg:grid" style={{ marginTop: '4.5rem', gridTemplateColumns: '1fr 1.15fr', gap: '4rem', alignItems: 'start' }}>
          <div style={{ opacity: panelOp, transform: `translateX(${shift}px)`, pointerEvents: panelOp > 0.95 ? 'auto' : 'none' }}>
            <div style={{ ...label, color: 'var(--teal-deep)' }}>{cur.cat}</div>
            <h2 style={{ margin: '1rem 0 0', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(2.4rem, 4.6vw, 4.5rem)', lineHeight: 1, letterSpacing: '-.025em', color: 'var(--mkt-ink-text)' }}>{cur.title}</h2>
            <p style={{ margin: '1.5rem 0 0', maxWidth: '28rem', fontSize: '1.2rem', lineHeight: 1.55, color: 'var(--mkt-stone)' }}>{cur.why}</p>
            <Link href={`/life-changes/${cur.slug}`} style={{ display: 'inline-block', marginTop: '2rem', fontSize: '1rem', fontWeight: 500, color: 'var(--mkt-ink-text)', borderBottom: '1px solid var(--mkt-ink-text)', paddingBottom: 2, textDecoration: 'none' }}>
              What to review
            </Link>
          </div>

          <div className="mt-12 lg:mt-0" style={{ padding: '2rem 2.25rem .5rem', border: '1px solid var(--mkt-line)', borderRadius: 24, background: '#fff', boxShadow: '0 1px 2px rgba(14,14,14,0.04), 0 24px 48px -24px rgba(14,14,14,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ ...label, color: 'var(--mkt-stone)' }}>Example Will</span>
              <span style={{ fontSize: '.82rem', color: 'var(--mkt-stone)' }}>Version 4</span>
            </div>
            <div style={{ margin: '.85rem 0 1.4rem', fontFamily: 'var(--font-display)', fontSize: '1.9rem', letterSpacing: '-.01em', color: 'var(--mkt-ink-text)' }}>Last Will &amp; Testament</div>
            {CLAUSES.map((c, i) => (
              <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.3rem 0', borderTop: '1px solid var(--mkt-line)' }}>
                <span style={{ width: 24, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--mkt-stone)' }}>{c.n}</span>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--mkt-ink-text)' }}>{c.name}</div>
                  <div style={{ marginTop: 4, fontSize: '.88rem', lineHeight: 1.5, color: 'var(--mkt-stone)' }}>{c.desc}</div>
                </div>
                <span style={{ whiteSpace: 'nowrap', padding: '.35rem .75rem', border: '1px solid #2AB4AE', borderRadius: 999, fontSize: '.75rem', fontWeight: 500, color: 'var(--teal-deep)', opacity: i === cur.clause ? panelOp : 0 }}>
                  Review recommended
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Small screens: select a moment ────────────────────────────────── */}
      <div className="md:hidden" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--mkt-line)' }}>
        {EV.map((e, i) => {
          const open = i === sel
          return (
            <div key={e.slug} style={{ borderBottom: '1px solid var(--mkt-line)' }}>
              <button
                type="button" aria-expanded={open} onClick={() => setSel(i)}
                style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 4, padding: '1rem 0', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
              >
                <span style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: open ? 'var(--teal-deep)' : 'var(--mkt-stone)' }}>{e.cat}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', lineHeight: 1.05, color: open ? '#0E0E0E' : 'var(--mkt-stone)' }}>{e.title}</span>
              </button>
              {open && (
                <div style={{ paddingBottom: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.55, color: 'var(--mkt-stone)' }}>{e.why}</p>
                  <p style={{ margin: '.85rem 0 0', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--teal-deep)' }}>Review recommended</p>
                  <p style={{ margin: '.25rem 0 0', fontSize: '.95rem', fontWeight: 500, color: 'var(--mkt-ink-text)' }}>{CLAUSES[e.clause].name}</p>
                  <Link href={`/life-changes/${e.slug}`} style={{ display: 'inline-block', marginTop: '.75rem', fontSize: '.95rem', fontWeight: 500, color: 'var(--mkt-ink-text)', borderBottom: '1px solid var(--mkt-ink-text)', paddingBottom: 1, textDecoration: 'none' }}>
                    What to review
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`.jl-scrub:focus-visible{outline:2px solid var(--teal-deep);outline-offset:3px;border-radius:12px}`}</style>
    </div>
  )
}
