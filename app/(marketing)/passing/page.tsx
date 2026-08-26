import Link from 'next/link'

const LABEL: React.CSSProperties = {
  fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase',
  fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block',
}

const ARTICLES = [
  {
    href: '/passing/estate-administration',
    eyebrow: 'After a death',
    title: 'What happens to an estate after someone dies',
    summary: 'The eight stages of estate administration — from registering the death to distributing assets to beneficiaries. What the executor does, what probate involves, and how long it takes.',
  },
]

export default function PassingIndexPage() {
  return (
    <>
      <section style={{ paddingTop: '4rem', paddingBottom: '5rem', background: 'var(--mkt-surface)' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <span style={LABEL}>Passing</span>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.08,
            letterSpacing: '-.02em', fontWeight: 500,
            color: 'var(--mkt-ink-text)', margin: '0 0 1.1rem',
          }}>
            What happens{' '}
            <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-deep)' }}>
              after
            </em>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)', maxWidth: '34rem' }}>
            Guides for executors, families, and anyone navigating what comes after a death. Clear, practical, and specific to Australian law.
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: '4rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, marginInline: 'auto', paddingInline: '1.5rem' }} className="md:px-10">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ARTICLES.map((article, i) => (
              <Link
                key={article.href}
                href={article.href}
                style={{
                  display: 'block', textDecoration: 'none',
                  paddingBlock: '2rem',
                  borderBottom: '1px solid var(--mkt-line)',
                }}
              >
                <span style={{ fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', display: 'block', marginBottom: '.5rem' }}>
                  {article.eyebrow}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--mkt-ink-text)', margin: '0 0 .6rem', letterSpacing: '-.01em' }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--mkt-stone)', margin: '0 0 .75rem' }}>
                  {article.summary}
                </p>
                <span style={{ fontSize: '.88rem', color: 'var(--teal-deep)', fontWeight: 500 }}>
                  Read →
                </span>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '3rem', padding: '1.75rem', border: '1px solid var(--mkt-line)', background: 'var(--mkt-surface)' }}>
            <p style={{ fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', margin: '0 0 .5rem' }}>
              More guides
            </p>
            <p style={{ fontSize: '.88rem', color: 'var(--mkt-stone)', margin: '0 0 1rem' }}>
              Planning ahead is covered in the Learn section — Will fundamentals, choosing an executor, superannuation, and life-stage readiness.
            </p>
            <Link href="/learn" style={{ fontSize: '.9rem', color: 'var(--teal-deep)', textDecoration: 'none', fontWeight: 500 }}>
              Browse the Learn guides →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
