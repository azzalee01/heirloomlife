import Link from 'next/link'

export default function MarketingNav() {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight shrink-0"
          style={{
            color: 'var(--teal-deep)',
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
          }}
        >
          Heirloom Life
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/pricing"
            className="px-4 py-2 text-sm font-medium transition-colors rounded"
            style={{ color: 'var(--neutral)' }}
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--ink)' }}
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="btn btn-primary btn-sm ml-2"
          >
            Get started
          </Link>
        </nav>

        {/* Mobile */}
        <Link
          href="/auth/signup"
          className="sm:hidden btn btn-primary btn-sm"
        >
          Get started
        </Link>
      </div>
    </header>
  )
}
