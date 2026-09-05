import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import InfoTooltip from './_components/InfoTooltip'

export const metadata = {
  title: 'Why Heirloom — How We Compare',
  description: 'See how Heirloom Life compares to Safewill and Willed on price, features, and ongoing value.',
}

const W: React.CSSProperties = { maxWidth: 1100, marginInline: 'auto', paddingInline: '1.5rem' }

const TOOLTIP_TEXT =
  'Covers standard solicitor review on every Will, ongoing platform security and maintenance, and Heirloom\'s witnessing coordination for NSW -- so your Will stays current and your data stays protected, not just stored.'

const PUBLISH_DATE = 'September 2026'

function Tick() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Yes" role="img">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function Cross() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3a0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="No" role="img">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function Dash() {
  return <span style={{ color: '#c5c7c3', fontSize: '1.1rem', lineHeight: 1 }} aria-label="Not confirmed">—</span>
}

const TD: React.CSSProperties = {
  padding: '1rem 1.25rem',
  fontSize: '.88rem',
  borderBottom: '1px solid var(--mkt-line)',
  verticalAlign: 'middle',
}

const TD_CENTER: React.CSSProperties = {
  ...TD,
  textAlign: 'center',
}

const TD_HEIRLOOM: React.CSSProperties = {
  ...TD_CENTER,
  background: 'rgba(42,180,174,0.04)',
}

type CellValue =
  | { kind: 'yes'; tooltip?: string }
  | { kind: 'no' }
  | { kind: 'dash' }
  | { kind: 'text'; lines: string[]; tooltip?: string }

const ROWS: { label: string; heirloom: CellValue; safewill: CellValue; willed: CellValue }[] = [
  {
    label: 'Upfront price',
    heirloom: { kind: 'text', lines: ['$129', 'includes solicitor review'] },
    safewill: { kind: 'text', lines: ['$160'] },
    willed:   { kind: 'text', lines: ['$159'] },
  },
  {
    label: 'Ongoing cost',
    heirloom: { kind: 'text', lines: ['$30 first year,', 'then $99/yr'], tooltip: TOOLTIP_TEXT },
    safewill: { kind: 'text', lines: ['$15/yr'] },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Solicitor review',
    heirloom: { kind: 'text', lines: ['Standard, included'] },
    safewill: { kind: 'text', lines: ['Standard, included'] },
    willed:   { kind: 'text', lines: ['"Vetted" by legal team'] },
  },
  {
    label: 'National coverage',
    heirloom: { kind: 'yes' },
    safewill: { kind: 'yes' },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Digital vault / storage',
    heirloom: { kind: 'yes' },
    safewill: { kind: 'dash' },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Life-event tracking & guided reviews',
    heirloom: { kind: 'yes' },
    safewill: { kind: 'no' },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Remote witnessing coordination (NSW)',
    heirloom: { kind: 'yes' },
    safewill: { kind: 'no' },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Opt-in renewal (no silent auto-charge)',
    heirloom: { kind: 'yes' },
    safewill: { kind: 'no' },
    willed:   { kind: 'dash' },
  },
  {
    label: 'Dedicated witnessing team (NSW only)',
    heirloom: { kind: 'yes', tooltip: 'Our dedicated NSW witnessing team guides you through the entire signing and witnessing process -- no need to find, coordinate, or explain the process to your own witnesses. We know the requirements and make sure it\'s done correctly, every time.' },
    safewill: { kind: 'no' },
    willed:   { kind: 'dash' },
  },
]

function CellContent({ cell }: { cell: CellValue }) {
  if (cell.kind === 'yes') return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Tick />
      {cell.tooltip && (
        <span style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 2 }}>
          <InfoTooltip text={cell.tooltip} />
        </span>
      )}
    </span>
  )
  if (cell.kind === 'no') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Cross />
    </span>
  )
  if (cell.kind === 'dash') return <Dash />
  return (
    <span>
      {cell.lines.map((line, i) => (
        <span key={i} style={{
          display: 'block',
          fontWeight: i === 0 ? 500 : 400,
          fontSize: i === 0 ? '.88rem' : '.75rem',
          color: i === 0 ? 'var(--mkt-ink-text)' : 'var(--mkt-stone)',
          lineHeight: 1.4,
        }}>
          {line}
          {i === cell.lines.length - 1 && cell.tooltip && (
            <InfoTooltip text={cell.tooltip} />
          )}
        </span>
      ))}
    </span>
  )
}

export default function WhyHeirloomPage() {
  return (
    <>
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 720 }}>
          <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block' }}>
            Why Heirloom
          </span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            How we compare.
          </h1>
          <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            We think the differences are worth knowing before you start. Here they are, plainly.
          </p>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '3rem 5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>

              {/* Header */}
              <thead>
                <tr>
                  <th style={{ ...TD, background: 'transparent', fontWeight: 400, color: 'transparent', borderBottom: '2px solid var(--mkt-line)' }} />
                  <th style={{ ...TD_HEIRLOOM, borderBottom: '2px solid var(--teal-deep)', borderTop: '3px solid var(--teal-deep)', fontWeight: 600, fontSize: '.88rem', color: 'var(--mkt-ink-text)', fontFamily: "var(--font-body)" }}>
                    Heirloom
                  </th>
                  <th style={{ ...TD_CENTER, borderBottom: '2px solid var(--mkt-line)', fontWeight: 500, fontSize: '.88rem', color: 'var(--mkt-stone)', fontFamily: "var(--font-body)" }}>
                    Safewill
                  </th>
                  <th style={{ ...TD_CENTER, borderBottom: '2px solid var(--mkt-line)', fontWeight: 500, fontSize: '.88rem', color: 'var(--mkt-stone)', fontFamily: "var(--font-body)" }}>
                    Willed
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label} style={{ background: i % 2 === 1 ? 'var(--mkt-surface)' : '#fff' }}>
                    <td style={{ ...TD, color: 'var(--mkt-ink-text)', fontWeight: 500, fontSize: '.86rem', lineHeight: 1.4 }}>
                      {row.label}
                    </td>
                    <td style={{ ...TD_HEIRLOOM, background: i % 2 === 1 ? 'rgba(42,180,174,0.06)' : 'rgba(42,180,174,0.04)' }}>
                      <CellContent cell={row.heirloom} />
                    </td>
                    <td style={i % 2 === 1 ? { ...TD_CENTER, background: 'var(--mkt-surface)' } : TD_CENTER}>
                      <CellContent cell={row.safewill} />
                    </td>
                    <td style={i % 2 === 1 ? { ...TD_CENTER, background: 'var(--mkt-surface)' } : TD_CENTER}>
                      <CellContent cell={row.willed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: 'var(--mkt-stone)' }}>
              <Tick /> Yes / included
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: 'var(--mkt-stone)' }}>
              <Cross /> No / not available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: 'var(--mkt-stone)' }}>
              <Dash /> Not confirmed from public sources
            </span>
          </div>

          {/* Footnote */}
          <p style={{ marginTop: '2rem', fontSize: '.72rem', lineHeight: 1.65, color: 'var(--mkt-stone-soft)', maxWidth: '52rem', borderTop: '1px solid var(--mkt-line)', paddingTop: '1.25rem' }}>
            Pricing and features accurate as of {PUBLISH_DATE}. Competitor pricing and feature information sourced from publicly available information and is subject to change without notice. Heirloom makes no warranty as to the accuracy of third-party information shown. Where information could not be confirmed from public sources, &ldquo;—&rdquo; is shown rather than an assumption.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: '5rem', background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 600, textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)' }}>
            Start for free. See for yourself.
          </h2>
          <p style={{ margin: '1rem 0 2rem', fontSize: '1rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            Draft your complete Will at no cost. Pay $129 only when you&apos;re ready to download.
          </p>
          <Link href="/start" className="mkt-btn-ink-l">Start your Will</Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}
