import Link from 'next/link'

export default function MarketingFooter() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
          <div className="max-w-xs">
            <p
              className="text-xl font-semibold"
              style={{
                color: 'var(--teal-deep)',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Heirloom Life
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--neutral)' }}>
              Estate planning for Australians who care about the people they leave behind.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Product
              </p>
              <div className="space-y-2.5">
                <Link href="/pricing" className="block" style={{ color: 'var(--ink)' }}>Pricing</Link>
                <Link href="/auth/signup" className="block" style={{ color: 'var(--ink)' }}>Get started</Link>
                <Link href="/auth/login" className="block" style={{ color: 'var(--ink)' }}>Log in</Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Legal
              </p>
              <div className="space-y-2.5">
                <Link href="/privacy" className="block" style={{ color: 'var(--ink)' }}>Privacy policy</Link>
                <Link href="/terms" className="block" style={{ color: 'var(--ink)' }}>Terms of service</Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--line)', color: 'var(--neutral)' }}
        >
          <p>© {new Date().getFullYear()} Heirloom Life. All rights reserved.</p>
          <p>Australian estate planning services</p>
        </div>
      </div>
    </footer>
  )
}
