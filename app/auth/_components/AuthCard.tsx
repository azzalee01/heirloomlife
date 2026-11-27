import Link from 'next/link'

// Shared chrome for the interstitial auth pages (confirm / callback), matching
// the login/signup screen styling.
export default function AuthCard({
  heading,
  sub,
  children,
}: {
  heading: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--paper)]">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-2xl"
          style={{ color: 'var(--teal)', fontFamily: "var(--font-display)", fontStyle: 'italic', textDecoration: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginBottom: 2, flexShrink: 0 }}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Heirloom Life
        </Link>

        <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">{heading}</h1>
        {sub && <p className="mt-2 text-sm text-[var(--neutral)]">{sub}</p>}

        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
