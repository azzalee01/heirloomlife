'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'

const TABS = [
  {
    label: 'Overview',
    href: '/dashboard',
    activeFor: (p: string) => p === '/dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 11.5L12 4l9 7.5"/>
        <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/>
      </svg>
    ),
  },
  {
    label: 'Will',
    href: '/dashboard/will',
    activeFor: (p: string) => p.startsWith('/dashboard/will') || p.startsWith('/will/new'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Vault',
    href: '/dashboard/vault',
    activeFor: (p: string) => p.startsWith('/dashboard/vault'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'More',
    href: null,
    activeFor: (p: string) => ['/dashboard/life-events', '/documents', '/witnessing', '/poa'].some(h => p.startsWith(h)),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
] as const

const MORE_ITEMS = [
  {
    label: 'Life Changes',
    href: '/dashboard/life-events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z"/>
        <path d="M12 8v6M9 11h6"/>
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 7h7l2 2h9v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
        <path d="M3 7V6a2 2 0 012-2h6l2 2"/>
      </svg>
    ),
  },
  {
    label: 'Witnessing',
    href: '/witnessing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="6" width="14" height="12" rx="2"/>
        <path d="M16 10.5l5-3v9l-5-3"/>
      </svg>
    ),
  },
  {
    label: 'Power of Attorney',
    href: '/poa',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export default function BottomNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  // Hide during focused Will wizard flow
  if (pathname.startsWith('/will/new')) return null

  // Close sheet on route change
  useEffect(() => { setMoreOpen(false) }, [pathname])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = moreOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [moreOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: '#fff',
          borderTop: '1px solid var(--line)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Main navigation"
      >
        <div style={{ display: 'flex', height: 60 }}>
          {TABS.map((tab) => {
            const active = tab.activeFor(pathname)
            const isMore = tab.href === null

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(v => !v)}
                  aria-label="More options"
                  aria-expanded={moreOpen}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 3, background: 'none', border: 'none',
                    cursor: 'pointer', padding: '8px 0',
                    color: active || moreOpen ? 'var(--teal-deep)' : 'var(--neutral)',
                  }}
                >
                  <span style={{ color: 'inherit' }}>{tab.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: active || moreOpen ? 600 : 400 }}>{tab.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 3, textDecoration: 'none', padding: '8px 0',
                  color: active ? 'var(--teal-deep)' : 'var(--neutral)',
                }}
                aria-current={active ? 'page' : undefined}
              >
                <span style={{ color: 'inherit' }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="md:hidden">
          {/* Overlay */}
          <div
            onClick={() => setMoreOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.3)',
            }}
            aria-hidden
          />

          {/* Sheet */}
          <div
            style={{
              position: 'fixed', left: 0, right: 0,
              bottom: `calc(60px + env(safe-area-inset-bottom))`,
              zIndex: 51,
              background: '#fff',
              borderTop: '1px solid var(--line)',
              borderRadius: '16px 16px 0 0',
              paddingTop: 8,
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
              <div style={{ width: 36, height: 4, background: 'var(--line)', borderRadius: 2 }}/>
            </div>

            {/* User row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 12px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{userName}</div>
                <div style={{ fontSize: 12, color: 'var(--neutral)' }}>Estate plan</div>
              </div>
            </div>

            {/* Nav items */}
            <div style={{ paddingBlock: '6px' }}>
              {MORE_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', textDecoration: 'none',
                    color: pathname.startsWith(item.href) ? 'var(--teal-deep)' : 'var(--ink)',
                    background: pathname.startsWith(item.href) ? 'var(--paper-warm)' : 'transparent',
                  }}
                >
                  <span style={{ color: pathname.startsWith(item.href) ? 'var(--teal)' : 'var(--neutral)', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: pathname.startsWith(item.href) ? 500 : 400 }}>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div style={{ borderTop: '1px solid var(--line)', padding: '6px 0 12px' }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  color: 'var(--ink)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--neutral)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                <span style={{ fontSize: 15 }}>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
