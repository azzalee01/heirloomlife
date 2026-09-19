import Link from 'next/link'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const W: React.CSSProperties = { maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

export default function WaitlistPage() {
  return (
    <>
      <MarketingNav />

      <section style={{ paddingTop: '8rem', paddingBottom: '6rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ ...W, maxWidth: 640 }}>
          <span style={SECTION_LABEL}>Now open</span>
          <h1 style={{
            fontFamily: "var(--font-body)",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.1,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.25rem',
          }}>
            Heirloom Life is now available{' '}
            <em style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>nationwide</em>.
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--mkt-stone)', marginBottom: '2.5rem', maxWidth: '30rem' }}>
            We now support all Australian states and territories. Your Will is drafted to the specific legal requirements of your state — free to start, $129 to download with solicitor review included.
          </p>

          <Link href="/start" className="mkt-btn-ink-m">
            Start your Will now
          </Link>

          <p style={{ marginTop: '1.25rem', fontSize: '.82rem', color: 'var(--mkt-stone-soft)' }}>
            Free to begin. No subscription required.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </>
  )
}
