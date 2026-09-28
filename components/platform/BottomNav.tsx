'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
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
    label: 'My Will',
    href: '/dashboard/will',
    activeFor: (p: string) => p.startsWith('/dashboard/will') || p.startsWith('/will/new'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 6.5c-1.5-1.2-3.5-1.8-5.5-1.8-1 0-2 .15-3 .45v13.3c1-.3 2-.45 3-.45 2 0 4 .6 5.5 1.8m0-13.3c1.5-1.2 3.5-1.8 5.5-1.8 1 0 2 .15 3 .45v13.3c-1-.3-2-.45-3-.45-2 0-4 .6-5.5 1.8m0-13.3V19.8"/>
      </svg>
    ),
  },
  {
    label: 'Witnessing',
    href: '/witnessing',
    activeFor: (p: string) => p.startsWith('/witnessing'),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="6" width="14" height="12" rx="2"/>
        <path d="M16 10.5l5-3v9l-5-3"/>
      </svg>
    ),
  },
  {
    label: 'More',
    href: null,
    activeFor: (_p: string) => false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
] as const

const MORE_ITEMS: { label: string; href: string; icon: React.ReactNode }[] = []

export default function BottomNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; prevY: number; prevTime: number; velocity: number } | null>(null)

  // Hide during focused Will wizard flow
  const hidden = pathname.startsWith('/will/new')

  // Close sheet instantly on route change
  useEffect(() => {
    if (moreOpen || isClosing) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setMoreOpen(false)
      setIsClosing(false)
      /* eslint-enable react-hooks/set-state-in-effect */
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (hidden) return
    document.body.style.overflow = moreOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [moreOpen, hidden])

  if (hidden) return null

  function openMore() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setIsClosing(false)
    setMoreOpen(true)
  }

  function closeMore() {
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setMoreOpen(false)
      setIsClosing(false)
    }, 230)
  }

  function onSheetPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('a,button,input')) return
    dragRef.current = { startY: e.clientY, prevY: e.clientY, prevTime: e.timeStamp, velocity: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onSheetPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || !sheetRef.current) return
    const dy = Math.max(0, e.clientY - drag.startY)
    sheetRef.current.style.transform = `translateY(${dy}px)`
    sheetRef.current.style.transition = 'none'
    const dt = e.timeStamp - drag.prevTime
    if (dt > 0) {
      const iv = (e.clientY - drag.prevY) / dt * 1000
      drag.velocity = iv * 0.4 + drag.velocity * 0.6
    }
    drag.prevY = e.clientY
    drag.prevTime = e.timeStamp
  }

  function onSheetPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (!sheetRef.current) return
    const dy = Math.max(0, e.clientY - drag.startY)
    const vel = drag.velocity
    if (dy > 80 || vel > 700) {
      sheetRef.current.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1)'
      sheetRef.current.style.transform = 'translateY(110%)'
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(() => { setMoreOpen(false); setIsClosing(false) }, 220)
    } else {
      sheetRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      sheetRef.current.style.transform = 'translateY(0)'
      const el = sheetRef.current
      el.addEventListener('transitionend', () => { el.style.transform = ''; el.style.transition = '' }, { once: true })
    }
  }

  async function handleSignOut() {
    closeMore()
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/auth/login')
    }, 230)
  }

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <>
      {/* Bottom tab bar — iOS glass */}
      <nav
        className="md:hidden nav-glass fixed bottom-0 left-0 right-0 z-40"
        style={{
          borderTop: '1px solid rgba(221, 232, 231, 0.6)',
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
                  onClick={() => moreOpen ? closeMore() : openMore()}
                  aria-label="More options"
                  aria-expanded={moreOpen}
                  className="tab-press"
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
                className="tab-press"
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
            onClick={closeMore}
            className={isClosing ? 'overlay-exit' : 'overlay-enter'}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.3)',
            }}
            aria-hidden
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className={isClosing ? 'sheet-exit' : 'sheet-enter'}
            onPointerDown={onSheetPointerDown}
            onPointerMove={onSheetPointerMove}
            onPointerUp={onSheetPointerUp}
            onPointerCancel={onSheetPointerUp}
            style={{
              position: 'fixed', left: 0, right: 0,
              bottom: `calc(60px + env(safe-area-inset-bottom))`,
              zIndex: 51,
              background: '#fff',
              borderTop: '1px solid var(--line)',
              borderRadius: '16px 16px 0 0',
              paddingTop: 8,
              touchAction: 'none',
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
                  className="sheet-item"
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
                className="sheet-item"
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
