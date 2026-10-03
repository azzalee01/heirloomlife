import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { listAppointmentsForUser } from '@/src/lib/appointments/server'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; style: React.CSSProperties }> = {
  scheduled:   { label: 'Booked',      style: { background: 'var(--teal-light)', color: 'var(--teal-deep)' } },
  in_progress: { label: 'In progress', style: { background: 'var(--teal-light)', color: 'var(--teal-deep)' } },
  completed:   { label: 'Completed',   style: { background: '#ecfdf5', color: '#065f46' } },
  cancelled:   { label: 'Cancelled',   style: { background: 'var(--paper-warm)', color: 'var(--neutral)' } },
  no_show:     { label: 'Missed',      style: { background: '#fffbeb', color: '#92400e' } },
}

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', {
    timeZone: APPOINTMENT_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))

export default async function AppointmentsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { upcoming, past } = await listAppointmentsForUser(user)

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 flex h-14 items-center border-b px-6"
        style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Appointments
        </h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 pb-28 sm:px-6 md:pb-8">
        {/* Upcoming */}
        <section className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
          <div className="h-1" style={{ background: 'var(--teal)' }} />
          <div className="space-y-4 px-5 py-6">
            <h2 className="text-xl font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <div className="space-y-4">
                <p className="text-lg leading-relaxed" style={{ color: 'var(--mkt-stone)' }}>
                  No upcoming calls booked. Prefer to talk it through? We&rsquo;ll read each question aloud and help you enter your answers.
                </p>
                <Link href="/book" className="btn btn-primary inline-flex" style={{ height: 56, fontSize: 18 }}>
                  Book a guided call
                </Link>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {upcoming.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-lg font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                        {when(r.starts_at)}
                      </p>
                      {r.customer_name && (
                        <p className="mt-0.5 text-base" style={{ color: 'var(--neutral)' }}>
                          For {r.customer_name}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/appointments/${r.id}`}
                      className="btn btn-primary shrink-0"
                      style={{ height: 52, fontSize: 17, paddingLeft: 20, paddingRight: 20 }}
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
            <div className="h-1" style={{ background: 'var(--line)' }} />
            <div className="px-5 py-6">
              <h2 className="mb-4 text-xl font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                Past
              </h2>
              <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
                {past.map((r) => {
                  const s = STATUS[r.status] ?? STATUS.scheduled
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <p className="text-lg" style={{ color: 'var(--ink)' }}>{when(r.starts_at)}</p>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                        style={s.style}
                      >
                        {s.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
