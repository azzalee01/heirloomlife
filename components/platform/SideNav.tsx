'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Settings, HelpCircle, LogOut, PanelLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Nav items ────────────────────────────────────────────────────────────────
type NavKey = 'dashboard' | 'life-events' | 'will' | 'live-will' | 'witnessing' | 'vault' | 'poa' | 'documents';

const NAV_ITEMS: { key: NavKey; label: string; href: string; shortcut: string }[] = [
  { key: 'dashboard', label: 'Overview',   href: '/dashboard',  shortcut: '⌘H' },
  { key: 'life-events', label: 'Life Changes', href: '/dashboard/life-events', shortcut: '⌘C' },
  { key: 'will',      label: 'Edit Will',      href: '/will/new',       shortcut: '⌘W' },
  { key: 'live-will', label: 'Will Document', href: '/dashboard/will', shortcut: '⌘L' },
  { key: 'witnessing', label: 'Witnessing', href: '/witnessing', shortcut: '⌘E' },
  { key: 'vault',     label: 'Living Vault', href: '/dashboard/vault',    shortcut: '⌘V' },
  { key: 'poa',       label: 'Power of Attorney', href: '/poa', shortcut: '⌘P' },
  { key: 'documents', label: 'Documents',  href: '/documents',  shortcut: '⌘D' },
];

// ── Icons ────────────────────────────────────────────────────────────────────
function NavIcon({ k }: { k: NavKey }) {
  const common = 'stroke-current';
  switch (k) {
    case 'dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M3 11.5L12 4l9 7.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'life-events':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8v6M9 11h6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'will':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'live-will':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M12 6.5c-1.5-1.2-3.5-1.8-5.5-1.8-1 0-2 .15-3 .45v13.3c1-.3 2-.45 3-.45 2 0 4 .6 5.5 1.8m0-13.3c1.5-1.2 3.5-1.8 5.5-1.8 1 0 2 .15 3 .45v13.3c-1-.3-2-.45-3-.45-2 0-4 .6-5.5 1.8m0-13.3V19.8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'witnessing':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <rect x="2" y="6" width="14" height="12" rx="2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 10.5l5-3v9l-5-3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'vault':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case 'poa':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'documents':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M3 7h7l2 2h9v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7V6a2 2 0 012-2h6l2 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// ── NavTooltip (inline, no portal dep) ───────────────────────────────────────
function NavTooltip({
  label,
  shortcut,
  disabled,
  children,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (disabled) return;
    timer.current = setTimeout(() => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        setPos({ top: r.top + r.height / 2, left: r.right + 12 });
      }
      setVisible(true);
    }, 50);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => { if (disabled) hide(); }, [disabled]);

  return (
    <>
      <div ref={ref} onMouseEnter={show} onMouseLeave={hide}>{children}</div>
      {visible && (
        <div
          role="tooltip"
          className="fixed z-[9999] pointer-events-none flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-lg -translate-y-1/2"
          style={{ top: pos.top, left: pos.left, background: '#1a1a1a' }}
        >
          {label}
          {shortcut && <span className="text-white/60">{shortcut}</span>}
        </div>
      )}
    </>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return (
    <span
      className={cn(sizeClass, 'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none')}
      style={{ backgroundColor: 'var(--teal)' }}
    >
      {initials || '?'}
    </span>
  );
}

// ── SideNav ───────────────────────────────────────────────────────────────────
export function SideNav({
  userName,
  onLogout,
}: {
  userName: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // ⌘B toggles sidebar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'b' && e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleClick(e: React.MouseEvent) {
    if (open) return;
    const t = e.target as HTMLElement;
    if (t.closest('a,button,input,[role="menu"],svg')) return;
    setOpen(true);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-black/70 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={cn(
          'h-screen border-r flex-shrink-0 flex flex-col',
          'fixed top-0 left-0 z-50 transition-transform duration-300 ease-out w-[256px]',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0 md:transition-[width] md:duration-150',
          open ? 'md:w-[256px]' : 'md:w-[56px]',
        )}
        style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
        onClick={handleClick}
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="shrink-0 flex items-center justify-between p-2 h-14">
            {open ? (
              <>
                <Link href="/dashboard" className="flex items-center ml-2">
                  <span
                    className="text-lg"
                    style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', color: 'var(--teal)' }}
                  >
                    Heirloom
                  </span>
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--paper-warm)] transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="size-4 md:hidden" style={{ color: 'var(--neutral)' }} />
                  <PanelLeft className="size-4 hidden md:block" style={{ color: 'var(--neutral)' }} />
                </button>
              </>
            ) : (
              <NavTooltip label="Open sidebar" shortcut="⌘B">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                  className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--paper-warm)] transition-colors ml-0.5"
                  aria-label="Open sidebar"
                >
                  <span
                    className="text-sm transition-opacity duration-100 group-hover:opacity-0"
                    style={{ fontFamily: "var(--font-display)", fontStyle: 'italic', color: 'var(--teal)' }}
                  >
                    H
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                    <PanelLeft className="size-4" style={{ color: 'var(--neutral)' }} />
                  </span>
                </button>
              </NavTooltip>
            )}
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <nav className="p-2 mt-4">
              <ul className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = item.key === 'dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center rounded-md px-2 py-2 text-sm transition-colors',
                        active
                          ? 'font-medium bg-[var(--paper-warm)]'
                          : 'hover:bg-[var(--paper-warm)]',
                      )}
                      style={{ color: active ? 'var(--ink)' : 'var(--neutral)' }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="relative mr-2.5 shrink-0" style={{ color: active ? 'var(--teal)' : 'inherit' }}>
                        <NavIcon k={item.key} />
                      </span>
                      <span className={cn('truncate', open ? 'opacity-100' : 'opacity-0 w-0')}>
                        {item.label}
                      </span>
                      {open && (
                        <span
                          className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--neutral)' }}
                          aria-hidden
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.key}>
                      <NavTooltip label={item.label} shortcut={item.shortcut} disabled={open}>
                        {link}
                      </NavTooltip>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* User footer */}
          <div className="shrink-0 px-2 pt-2 pb-4">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg transition-colors hover:bg-[var(--paper-warm)]',
                  open ? 'px-2 py-2' : 'px-1 py-1 justify-center',
                )}
              >
                <Avatar name={userName} size={open ? 'sm' : 'md'} />
                <span className={cn('flex-1 text-left', open ? 'block' : 'hidden')}>
                  <span className="block text-sm font-medium leading-tight" style={{ color: 'var(--ink)' }}>
                    {userName}
                  </span>
                  <span className="block text-xs leading-tight" style={{ color: 'var(--neutral)' }}>
                    Estate plan
                  </span>
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-14 left-2 z-50 w-56 rounded-lg border p-1 shadow-xl"
                  style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
                >
                  <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--line)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{userName}</div>
                    <div className="text-xs" style={{ color: 'var(--neutral)' }}>Heirloom Life</div>
                  </div>
                  <ul className="text-sm space-y-0.5">
                    <li>
                      <button
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--paper-warm)] text-left transition-colors"
                        style={{ color: 'var(--ink)' }}
                      >
                        <Settings className="size-4" style={{ color: 'var(--neutral)' }} />
                        Settings
                      </button>
                    </li>
                    <li>
                      <a
                        href="mailto:support@heirloomlife.com.au"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--paper-warm)] transition-colors"
                        style={{ color: 'var(--ink)' }}
                      >
                        <HelpCircle className="size-4" style={{ color: 'var(--neutral)' }} />
                        Help
                      </a>
                    </li>
                  </ul>
                  <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--line)' }}>
                    <button
                      onClick={() => { setMenuOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--paper-warm)] text-left transition-colors text-sm"
                      style={{ color: 'var(--ink)' }}
                    >
                      <LogOut className="size-4" style={{ color: 'var(--neutral)' }} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
