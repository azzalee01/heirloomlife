'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'The Will', href: '/the-will' },
  { label: 'Living Vault', href: '/living-vault' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Learn', href: '/learn' },
  { label: 'Passing', href: '/passing' },
  { label: 'Pricing', href: '/pricing' },
]

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        left: 0, right: 0, top: 0,
        zIndex: 50,
        transition: 'background .4s ease, border-color .4s ease, box-shadow .3s ease',
        borderBottom: '1px solid',
        borderColor: scrolled ? 'var(--mkt-line)' : 'transparent',
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 var(--mkt-line)' : 'none',
      }}
    >
      <div
        className="md:px-10"
        style={{
          maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76,
        }}
      >
        {/* Brand mark */}
        <Link href="/" style={{ color: 'var(--mkt-ink-text)', textDecoration: 'none', fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.35rem', letterSpacing: '.01em' }}>
          Heirloom Life
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center" style={{ gap: '2.4rem' }} aria-label="Main">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="mkt-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/auth/login" className="hidden lg:block mkt-nav-link">
            Log in
          </Link>
          <Link href="/start" className="mkt-nav-cta">
            Start your Will
          </Link>
        </div>
      </div>
    </header>
  )
}
