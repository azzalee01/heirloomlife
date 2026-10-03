import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHostUser } from '@/src/lib/appointments/server'

const NAV = [
  { href: '/admin/accounts',     label: 'Accounts' },
  { href: '/admin/appointments', label: 'Calls' },
  { href: '/admin/availability', label: 'Availability' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const host = await getHostUser()
  if (!host) notFound()

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 flex h-12 items-center gap-6 border-b px-6"
        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--line)' }}
      >
        <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>
          Heirloom Admin
        </span>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[var(--paper-warm)]"
              style={{ color: 'var(--ink)' }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-xs" style={{ color: 'var(--neutral)' }}>
            ← Back to platform
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
