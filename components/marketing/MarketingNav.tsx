'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { label: string; href: string }
type NavTab =
  | { id: string; label: string; href: string; items?: undefined }
  | { id: string; label: string; href?: undefined; items: NavItem[]; cols: 1 | 2 | 3 }

const TABS: NavTab[] = [
  {
    id: 'estate-planning',
    label: 'Estate Planning',
    items: [
      { label: 'The Will', href: '/the-will' },
      { label: 'Living Vault', href: '/living-vault' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
    ],
    cols: 2,
  },
  {
    id: 'why-heirloom',
    label: 'Why Heirloom',
    href: '/why-heirloom',
  },
  {
    id: 'life-events',
    label: 'Life Events',
    items: [
      { label: 'Life Changes', href: '/life-changes' },
      { label: 'After a Death', href: '/passing' },
      { label: 'Estate Administration', href: '/passing/estate-administration' },
      { label: 'Guidance Notes', href: '/guidance-notes' },
    ],
    cols: 2,
  },
  {
    id: 'learn',
    label: 'Learn',
    items: [
      { label: 'Learn', href: '/learn' },
      { label: 'Your Will', href: '/learn/your-will' },
      { label: 'Beneficiaries', href: '/learn/beneficiaries' },
      { label: 'Choosing an Executor', href: '/learn/choosing-an-executor' },
      { label: 'Guardians', href: '/learn/guardians' },
      { label: 'Superannuation', href: '/learn/superannuation' },
      { label: 'When to Update', href: '/learn/when-to-update' },
      { label: 'Intestacy', href: '/learn/intestacy' },
      { label: 'FAQ', href: '/faq' },
    ],
    cols: 3,
  },
  {
    id: 'company',
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Security & Trust', href: '/security-trust' },
    ],
    cols: 1,
  },
  {
    id: 'partners',
    label: 'Partners',
    items: [
      { label: 'For Advisers', href: '/for-advisers' },
      { label: 'For Charities', href: '/for-charities' },
    ],
    cols: 1,
  },
]

const NAV_H = 76
const W: React.CSSProperties = {
  maxWidth: 1240, marginInline: 'auto', paddingInline: '1.5rem',
}

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [panelLeft, setPanelLeft] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveTab(null), 120)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setActiveTab(null)
    setMobileOpen(false)
    setMobileExpanded(null)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Recompute panel left from the active tab's bounding rect
  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      const rect = tabRefs.current[activeTab]!.getBoundingClientRect()
      // Clamp so the panel never overflows the right edge of the viewport
      setPanelLeft(rect.left)
    }
  }, [activeTab])

  const panelTab = TABS.find(t => t.id === activeTab && t.items) as Extract<NavTab, { items: NavItem[] }> | undefined
  const hasBg = scrolled || !!activeTab || mobileOpen

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        onMouseLeave={scheduleClose}
        style={{
          position: 'fixed', left: 0, right: 0, top: 0, zIndex: 50,
          transition: 'background .35s ease, border-color .35s ease',
          borderBottom: '1px solid',
          borderColor: hasBg ? 'var(--mkt-line)' : 'transparent',
          background: hasBg ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: hasBg ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: hasBg ? 'blur(14px)' : 'none',
        }}
      >
        <div
          className="md:px-10"
          style={{ ...W, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: NAV_H }}
        >
          {/* Brand */}
          <Link
            href="/"
            onMouseEnter={() => { cancelClose(); setActiveTab(null) }}
            style={{
              color: 'var(--mkt-ink-text)', textDecoration: 'none', flexShrink: 0,
              fontFamily: 'var(--font-display)', fontSize: '1.35rem', letterSpacing: '.01em',
            }}
          >
            Heirloom Life
          </Link>

          {/* Desktop tabs */}
          <nav className="hidden lg:flex items-center" aria-label="Main">
            {TABS.map(tab => {
              const isOpen = activeTab === tab.id
              if (tab.items) {
                return (
                  <button
                    key={tab.id}
                    ref={el => { tabRefs.current[tab.id] = el }}
                    onMouseEnter={() => { cancelClose(); setActiveTab(tab.id) }}
                    onClick={() => setActiveTab(isOpen ? null : tab.id)}
                    aria-expanded={isOpen}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.28rem',
                      padding: '.5rem .8rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '.85rem', fontWeight: isOpen ? 500 : 400,
                      color: isOpen ? 'var(--teal-deep)' : 'var(--mkt-stone)',
                      fontFamily: 'inherit',
                      borderBottom: isOpen ? '2px solid var(--teal-deep)' : '2px solid transparent',
                      marginBottom: '-1px',
                      transition: 'color .15s, border-color .15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                    <svg
                      width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden
                      style={{ transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )
              }
              return (
                <Link
                  key={tab.id}
                  href={tab.href!}
                  onMouseEnter={() => { cancelClose(); setActiveTab(null) }}
                  className="mkt-nav-link"
                  style={{ padding: '.5rem .8rem', whiteSpace: 'nowrap' }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Right CTAs — entering this area closes any open panel */}
          <div
            onMouseEnter={() => { cancelClose(); setActiveTab(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}
          >
            <Link href="/auth/login" className="hidden lg:block mkt-nav-link">
              Log in
            </Link>
            <Link href="/start?path=retail" className="mkt-nav-cta">
              Start your Will
            </Link>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '.25rem', color: 'var(--mkt-ink-text)',
              }}
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M3 8h18M3 16h18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Desktop mega-panel — fixed, width fits content ────────────────── */}
      {panelTab && (
        <div
          className="hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: 'fixed',
            top: NAV_H,
            left: panelLeft,
            zIndex: 49,
            background: '#fff',
            border: '1px solid var(--mkt-line)',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,.07)',
            padding: '1.1rem 1.4rem 1.25rem',
            minWidth: 'max-content',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${panelTab.cols}, minmax(0, 1fr))`,
              gap: '.05rem 2.5rem',
            }}
          >
            {panelTab.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="mega-nav-item"
                onClick={() => setActiveTab(null)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            position: 'fixed', inset: 0, top: NAV_H, zIndex: 49,
            background: '#fff', overflowY: 'auto',
          }}
        >
          <div style={{ paddingInline: '1.5rem', paddingBottom: '3rem' }}>
            {TABS.map(tab => (
              <div key={tab.id} style={{ borderBottom: '1px solid var(--mkt-line)' }}>
                {tab.items ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === tab.id ? null : tab.id)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '.95rem 0', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '.9rem', fontWeight: 500, color: 'var(--mkt-ink-text)',
                        fontFamily: 'inherit', textAlign: 'left',
                      }}
                    >
                      {tab.label}
                      <svg
                        width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden
                        style={{
                          transition: 'transform .2s',
                          transform: mobileExpanded === tab.id ? 'rotate(180deg)' : 'none',
                          flexShrink: 0, color: 'var(--mkt-stone)',
                        }}
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {mobileExpanded === tab.id && (
                      <div style={{ paddingBottom: '.75rem', display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
                        {tab.items.map(item => (
                          <Link key={item.href} href={item.href} className="mega-nav-mobile-item">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={tab.href!}
                    style={{
                      display: 'block', padding: '.95rem 0',
                      fontSize: '.9rem', fontWeight: 500,
                      color: 'var(--mkt-ink-text)', textDecoration: 'none',
                    }}
                  >
                    {tab.label}
                  </Link>
                )}
              </div>
            ))}

            <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <Link
                href="/auth/login"
                style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--mkt-ink-text)', textDecoration: 'none' }}
              >
                Log in
              </Link>
              <Link href="/start?path=retail" className="mkt-nav-cta" style={{ justifyContent: 'center' }}>
                Start your Will
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
