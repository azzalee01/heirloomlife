import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'The Will', href: '/the-will' },
      { label: 'Living Vault', href: '/living-vault' },
      { label: 'Life Changes', href: '/life-changes' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Learn', href: '/learn' },
      { label: 'Passing', href: '/passing' },
      { label: 'For advisers', href: '/for-advisers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
]

export default function MarketingFooter() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid var(--mkt-line)' }}>
      <div style={{ maxWidth: 1240, marginInline: 'auto', paddingInline: '2.5rem', paddingBlock: '3.5rem 2rem' }}>

        {/* Main row */}
        <div style={{ display: 'flex', gap: '4rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>

          {/* Brand */}
          <div style={{ flex: '0 0 auto', maxWidth: '22rem' }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: '1.2rem', color: 'var(--mkt-ink-text)' }}>
              Heirloom Life
            </span>
            <p style={{ marginTop: '1rem', fontSize: '.85rem', lineHeight: 1.65, color: 'var(--mkt-stone)' }}>
              An estate command centre for Australians  -  the Will, the Vault, and the folder, kept in one place.
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            {COLUMNS.map(col => (
              <div key={col.title}>
                <h4 style={{
                  margin: '0 0 1rem',
                  fontSize: '.72rem', fontWeight: 700,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  color: 'var(--mkt-ink-text)',
                }}>
                  {col.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  {col.links.map(l => (
                    <Link key={l.href} href={l.href} className="mkt-link" style={{ fontSize: '.875rem' }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: '3rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--mkt-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          fontSize: '.78rem', color: 'var(--mkt-stone)',
        }}>
          <p style={{ margin: 0 }}>© 2026 Heirloom Life Pty Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/terms" className="mkt-link" style={{ fontSize: '.78rem' }}>Terms</Link>
            <Link href="/privacy" className="mkt-link" style={{ fontSize: '.78rem' }}>Privacy</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
