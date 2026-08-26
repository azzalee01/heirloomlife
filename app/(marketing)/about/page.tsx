import Link from 'next/link'

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 760, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <span style={SECTION_LABEL}>About</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: 0,
          }}>
            Built because the alternative is a form you fill in once and{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>forget</em>.
          </h1>
        </div>
      </section>

      {/* Manifesto */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <blockquote style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', lineHeight: 1.3, letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: '0 0 2.5rem' }}>
            &#8220;A Will isn&#8217;t paperwork. It&#8217;s the last conversation you get to have with the people you love. It deserves better than a template and a filing cabinet.&#8221;
          </blockquote>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '.95rem', lineHeight: 1.7, color: 'var(--mkt-stone)' }}>
            <p>
              Heirloom Life started with a simple observation: most estate planning tools are built for professionals who use them every day — not for the person whose name is on the Will. The result is a product that&#8217;s technically correct but practically unusable. Documents that sit in a drawer. Executors who don&#8217;t know they&#8217;re named. Estates that take years to settle because no one knew where to start.
            </p>
            <p>
              We&#8217;re building the estate command centre we wish had existed — where a Will isn&#8217;t a one-time filing event but a living document that stays in step with your life. Where your executor has a verified path from death certificate to access, not a guess. Where a solicitor is included when the stakes are high, not added as an upsell when you&#8217;ve already signed.
            </p>
            <p>
              Heirloom Life is based in Sydney, NSW. We&#8217;re building for Australians — available across all states and territories, with each Will drafted to the specific legal requirements of where you live.
            </p>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--mkt-line)' }}>
            <p style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--mkt-ink-text)', margin: 0 }}>Aaron Lee</p>
            <p style={{ marginTop: '.25rem', fontSize: '.85rem', color: 'var(--mkt-stone)' }}>Founder, Heirloom Life — Sydney, NSW</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10 md:flex-row md:items-center md:justify-between" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: 0 }}>
            See what we&#8217;re building
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/start" className="mkt-btn-ink-m">
              Try the Will builder
            </Link>
            <a href="mailto:hello@heirloomlife.com.au" className="mkt-btn-ghost-m">
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
