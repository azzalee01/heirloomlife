import Link from 'next/link'

export default function TryItPage() {
  return (
    <section style={{ paddingTop: '4rem', paddingBottom: '8rem', background: 'var(--mkt-surface)' }}>
      <div className="md:px-10" style={{ maxWidth: 640, marginInline: 'auto', paddingInline: '1.5rem' }}>
        <span style={{ fontSize: '.72rem', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--teal-deep)', marginBottom: '1.1rem', display: 'block' }}>
          Try it
        </span>
        <h1 style={{
          fontFamily: "var(--font-body)",
          fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08,
          letterSpacing: '-.02em', fontWeight: 500,
          color: 'var(--mkt-ink-text)', margin: 0,
        }}>
          Start your Will  -  it takes about 30 minutes.
        </h1>
        <p style={{ marginTop: '1.1rem', fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
          Answer seven guided questions about your estate. You&#8217;ll need an account to save your progress  -  creating one is free and takes less than a minute.
        </p>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/start" className="mkt-btn-ink-l">
            Start your Will
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#2ab4ae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/how-it-works" className="mkt-btn-ghost-l">
            How it works first
          </Link>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--mkt-line)' }}>
          <p style={{ fontSize: '.82rem', color: 'var(--mkt-stone-soft)', lineHeight: 1.6, margin: 0 }}>
            Creating an account is free. Your Will costs $129 when you&apos;re ready to download — one payment, no subscription required.{' '}
            <Link href="/pricing" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>See pricing →</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
