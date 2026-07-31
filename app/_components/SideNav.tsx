'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/src/components/LogoutButton'

const NAV = [
  {
    key: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    key: 'will',
    href: '/will/new',
    label: 'My Will',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
]

interface Props {
  userName: string
  userEmail: string
}

export default function SideNav({ userName, userEmail }: Props) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('hl-nav-expanded')
    if (saved !== null) setExpanded(saved === 'true')
  }, [])

  function toggle() {
    setExpanded((v) => {
      const next = !v
      localStorage.setItem('hl-nav-expanded', String(next))
      return next
    })
  }

  const initials = userName.slice(0, 2).toUpperCase()

  return (
    <aside
      className="shrink-0 flex flex-col bg-[var(--paper)] border-r border-[var(--line)] h-full transition-[width] duration-150 ease-out"
      style={{ width: expanded ? 'var(--sidebar-w)' : 'var(--sidebar-collapsed-w)' }}
    >
      {/* Wordmark + collapse toggle */}
      <div className="h-14 px-3 flex items-center justify-between shrink-0 border-b border-[var(--line)]">
        {expanded ? (
          <>
            <Link
              href="/dashboard"
              className="text-[15px] ml-1 select-none"
              style={{
                color: 'var(--teal)',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Heirloom Life
            </Link>
            <button
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--neutral)] hover:bg-[var(--paper-warm)] hover:text-[var(--ink)] transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--neutral)] hover:bg-[var(--paper-warm)] hover:text-[var(--ink)] transition-colors mx-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-2 mt-1" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.key === 'dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith('/will/')
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={['nav-link', active ? 'is-active' : ''].join(' ')}
                  title={expanded ? undefined : item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {expanded && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-[var(--line)] p-2">
        <div className={['flex items-center gap-2.5 px-2 py-2', expanded ? '' : 'justify-center'].join(' ')}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 select-none"
            style={{ backgroundColor: 'var(--teal-deep)' }}
            title={userEmail}
          >
            {initials}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--ink)] truncate leading-tight">{userName}</p>
              <p className="text-[11px] text-[var(--neutral)] truncate leading-tight">{userEmail}</p>
            </div>
          )}
        </div>
        {expanded && (
          <div className="px-2 mt-0.5">
            <LogoutButton />
          </div>
        )}
      </div>
    </aside>
  )
}
