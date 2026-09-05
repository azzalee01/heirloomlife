import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-full px-6 py-8"
      style={{ background: 'var(--mkt-surface)', color: 'var(--mkt-ink-text)' }}
    >
      <div style={{ maxWidth: 1240, marginInline: 'auto' }}>
        <Link
          href="/"
          style={{
            color: 'var(--mkt-ink-text)',
            fontFamily: "var(--font-display)",
            fontSize: '1.35rem',
            letterSpacing: '.01em',
            textDecoration: 'none',
          }}
        >
          Heirloom Life
        </Link>

        <section
          aria-labelledby="not-found-title"
          style={{
            minHeight: 'calc(100vh - 8rem)',
            display: 'grid',
            alignContent: 'center',
            justifyItems: 'start',
            paddingBlock: '5rem',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--teal-deep)',
              fontSize: '.72rem',
              fontWeight: 600,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
            }}
          >
            Page not found
          </p>
          <h1
            id="not-found-title"
            style={{
              maxWidth: '44rem',
              margin: '1.25rem 0 0',
              color: 'var(--mkt-ink-text)',
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              fontWeight: 400,
              letterSpacing: '-.02em',
              lineHeight: .95,
            }}
          >
            This page isn&apos;t here.
          </h1>
          <p
            style={{
              maxWidth: '34rem',
              margin: '1.5rem 0 0',
              color: 'var(--mkt-stone)',
              fontSize: '1.05rem',
              lineHeight: 1.65,
            }}
          >
            The link may be out of date, or the page may have moved. You can return home or sign in to continue with your estate plan.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.9rem', marginTop: '2rem' }}>
            <Link href="/" className="mkt-btn-ink-l">
              Return home
            </Link>
            <Link href="/auth/login" className="mkt-btn-ghost-l">
              Log in
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
