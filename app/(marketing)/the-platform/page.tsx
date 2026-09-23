import Link from 'next/link'
import PlatformPreview from '@/components/marketing/PlatformPreview'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

export const metadata = {
  title: 'The Platform  -  Heirloom Life',
  description: 'One place for your Will, asset register, and executor instructions — all current, all connected.',
}

export default function ThePlatformPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: '7rem', paddingBottom: '4rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '44rem' }}>
            <span style={SECTION_LABEL}>The platform</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 5vw, 4.6rem)', lineHeight: 1.04,
              letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              One place for everything your estate needs to keep{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-deep)' }}>working</em>.
            </h1>
            <p style={{ marginTop: '1.5rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
              Your Will, asset register, and executor instructions — all current, all connected, and ready when the people you&apos;ve named need them most.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '.9rem', flexWrap: 'wrap' }}>
              <Link href="/start?path=retail" className="mkt-btn-ink-l">
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/how-it-works" className="mkt-btn-ghost-l">How it works</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform demo ─────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface)', paddingBottom: '5.5rem' }}>
        <div className="md:px-10" style={{ ...W, paddingInline: 'clamp(.75rem, 2vw, 2rem)' }}>
          <PlatformPreview />
        </div>
      </section>

      {/* ── What's included ───────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--mkt-line)', paddingBlock: '5.5rem' }}>
        <div className="md:px-10" style={W}>
          <div style={{ maxWidth: '38rem', marginBottom: '3.5rem' }}>
            <span style={SECTION_LABEL}>What&apos;s included</span>
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1.9rem, 3.2vw, 3.1rem)', lineHeight: 1.08,
              letterSpacing: '-.02em', fontWeight: 500, color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              Everything in one{' '}
              <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>place</em>.
            </h2>
          </div>
          <div className="md:grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {[
              {
                title: 'Your Will',
                body: 'Drafted to your state\'s requirements, written in plain English, and versioned every time your life moves forward. A solicitor quality review is included before your Will is issued.',
                href: '/the-will',
                cta: 'About the Will',
              },
              {
                title: 'Living Vault',
                body: 'Your asset register, life events, and executor instructions — all in one place. The Vault tracks what\'s changed and surfaces updates before a gap becomes a problem.',
                href: '/living-vault',
                cta: 'About the Vault',
              },
              {
                title: 'How it works',
                body: 'Ten guided steps from first login to a complete, structured Will. No legal training required. Start for free and download when you\'re ready.',
                href: '/how-it-works',
                cta: 'See the process',
              },
            ].map(card => (
              <div key={card.title} style={{ padding: '2rem', borderRadius: 12, border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface-2)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 .75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--mkt-ink-text)' }}>{card.title}</h3>
                <p style={{ margin: '0 0 1.5rem', fontSize: '.9rem', lineHeight: 1.65, color: 'var(--mkt-stone)', flex: 1 }}>{card.body}</p>
                <Link href={card.href} style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                  {card.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--mkt-surface-2)', borderTop: '1px solid var(--mkt-line)', paddingBlock: '4rem' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 500, color: 'var(--mkt-ink-text)' }}>
            Ready to get started?
          </h2>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--mkt-stone)' }}>Free to start. Your Will in 15 minutes.</p>
          <Link href="/start?path=retail" className="mkt-btn-teal-l" style={{ marginTop: '.5rem' }}>Start for free</Link>
        </div>
      </section>
    </>
  )
}
