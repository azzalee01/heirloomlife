import Link from 'next/link'

const EVENTS = [
  { title: 'Marriage or partnership', body: 'Review your relationship details, beneficiaries and existing Will.', href: '/will/new?step=personal', tone: '#fdf2f8' },
  { title: 'Separation or divorce', body: 'Check appointments, gifts and the people named in your estate plan.', href: '/will/new?step=personal', tone: '#fff7ed' },
  { title: 'A new child', body: 'Add a child and revisit guardianship, gifts and distribution choices.', href: '/will/new?step=children', tone: '#eff6ff' },
  { title: 'Property bought or sold', body: 'Keep your asset register current and check any specific gifts.', href: '/will/new?step=assets', tone: '#ecfdf5' },
  { title: 'Business or inheritance', body: 'Record a material change in what your estate includes.', href: '/will/new?step=assets', tone: '#f5f3ff' },
  { title: 'Executor or beneficiary change', body: 'Update the people responsible for, or included in, your plan.', href: '/will/new?step=executors', tone: '#f0fdfa' },
  { title: 'Moving interstate', body: 'Review your address and state-specific signing guidance.', href: '/will/new?step=personal', tone: '#f8fafc' },
  { title: 'Pet care changed', body: 'Update who should care for your pets and the wishes you leave behind.', href: '/will/new?step=wishes', tone: '#fefce8' },
]

export default function LifeEventsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 flex h-14 items-center border-b px-6" style={{ background: 'rgba(255,255,255,.86)', backdropFilter: 'blur(16px)', borderColor: 'var(--line)' }}>
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>Life Changes</h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.16em]" style={{ color: 'var(--teal-deep)' }}>Keep your plan current</p>
          <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Life changed. Let&apos;s check what your estate plan needs next.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6" style={{ color: 'var(--neutral)' }}>
            Choose what happened and we&apos;ll take you to the information most likely to need review. A change may affect your estate record, your Will, or both.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EVENTS.map((event) => (
            <Link key={event.title} href={event.href} className="group rounded-xl border bg-white p-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--teal)]" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: event.tone, color: 'var(--teal-deep)' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{event.title}</h3>
                    <span className="text-sm transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--teal)' }}>→</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--neutral)' }}>{event.body}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-lg border bg-white px-5 py-4" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Something else changed?</p>
          <p className="mt-1 text-xs leading-5" style={{ color: 'var(--neutral)' }}>Tell the Estate Assistant in the panel beside you. It can read your current estate information, ask what is missing and propose supported updates for your approval.</p>
        </div>
      </main>
    </div>
  )
}
