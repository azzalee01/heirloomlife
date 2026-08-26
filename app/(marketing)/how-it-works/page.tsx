import Link from 'next/link'

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const STEPS = [
  {
    num: '01',
    title: 'Answer guided questions',
    body: 'A seven-step questionnaire covers the essentials: your assets, your beneficiaries, your executor, and any guardianship arrangements. No legal training required — every question comes with a plain-English explanation.',
  },
  {
    num: '02',
    title: 'Review your draft',
    body: 'Your answers are turned into a structured Will draft. Review it clause by clause. If anything looks wrong, change your answers and the draft updates immediately.',
  },
  {
    num: '03',
    title: 'Download and sign your Will',
    body: 'Download your completed Will and sign it in the presence of two independent witnesses. Complex situations — business succession, blended families, overseas assets — are flagged in your Vault with the option to add a solicitor review for around $150.',
  },
  {
    num: '04',
    title: 'Sign and witness',
    body: 'Your Will is only valid once signed in the presence of two independent witnesses. We walk you through exactly what this requires in your state — remote AV witnessing is available for NSW members, all other states complete with a straightforward print-and-sign process.',
  },
  {
    num: '05',
    title: 'Store and update',
    body: 'Your signed Will lives in your Vault alongside your asset register and executor access instructions. Every time your life changes, you can update your Will from the same place.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '5.5rem', background: 'var(--mkt-surface)' }}>
        <div className="md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div style={{ maxWidth: '38rem' }}>
            <span style={SECTION_LABEL}>How it works</span>
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
              letterSpacing: '-.02em', fontWeight: 500,
              color: 'var(--mkt-ink-text)', margin: 0,
            }}>
              From first login to a{' '}
              <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>complete estate plan</em>{' '}
              — what happens and when.
            </h1>
            <p style={{ marginTop: '1.1rem', maxWidth: '34rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              We&#8217;ve broken the process into five stages. Most people complete the first three in a single session.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ paddingBlock: '5.5rem', background: '#fff' }}>
        <div className="md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 720 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.5rem',
                  paddingBlock: '2.5rem',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--mkt-line)' : 'none',
                }}
              >
                <div style={{ paddingTop: '.1rem' }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.4rem', color: 'var(--teal)', fontStyle: 'italic' }}>
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--mkt-ink-text)', margin: 0 }}>
                    {step.title}
                  </h3>
                  <p style={{ marginTop: '.75rem', fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State note */}
      <section style={{ paddingBlock: '4rem', background: 'var(--mkt-surface-2)' }}>
        <div className="md:px-10" style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 1rem', letterSpacing: '-.01em' }}>
            A note on state-specific requirements
          </h2>
          <p style={{ fontSize: '.95rem', lineHeight: 1.65, color: 'var(--mkt-stone)', margin: 0 }}>
            Australian succession law is largely state-based. Heirloom Life is available across all states and territories, accounting for each state&#8217;s specific requirements throughout the drafting and review process.
          </p>
          <p style={{ marginTop: '1rem', fontSize: '.85rem', color: 'var(--mkt-stone-soft)' }}>
            Complex situations are flagged in your Vault after you complete your Will. A solicitor review add-on is available from your Vault for around $150 — the same price point as Safewill and similar services.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock: '5.5rem' }}>
        <div className="md:px-10" style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 500, letterSpacing: '-.02em', color: 'var(--mkt-ink-text)', margin: '0 0 1.5rem' }}>
            Ready to start?
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/start" className="mkt-btn-ink-l">
              Start your Will
            </Link>
            <Link href="/pricing" className="mkt-btn-ghost-l">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
