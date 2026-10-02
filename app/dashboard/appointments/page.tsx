import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { listAppointmentsForUser } from '@/src/lib/appointments/server'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, { label: string; style: React.CSSProperties }> = {
  scheduled: { label: 'Booked', style: { background: 'var(--teal-light)', color: 'var(--teal-deep)' } },
  in_progress: { label: 'In progress', style: { background: 'var(--teal-light)', color: 'var(--teal-deep)' } },
  completed: { label: 'Completed', style: { background: '#ecfdf5', color: '#065f46' } },
  cancelled: { label: 'Cancelled', style: { background: 'var(--paper-warm)', color: 'var(--neutral)' } },
  no_show: { label: 'Missed', style: { background: '#fffbeb', color: '#92400e' } },
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
        <section className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
          <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
          <div className="space-y-3 px-5 py-5">
            <h2 className="text-lg" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--neutral)' }}>
                  No upcoming calls. Prefer to talk it through? We’ll read each question aloud and help you enter your answers.
                </p>
                <Link href="/book" className="btn btn-primary inline-flex">Book a guided call</Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--line)' }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{when(r.starts_at)}</p>
                      <p className="text-xs" style={{ color: 'var(--neutral)' }}>For {r.customer_name}</p>
                    </div>
                    <Link href={`/dashboard/appointments/${r.id}`} className="btn btn-primary shrink-0">Open</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section className="rounded-xl border bg-white px-5 py-5" style={{ borderColor: 'var(--line)' }}>
            <h2 className="mb-3 text-lg" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>Past</h2>
            <ul className="space-y-3">
              {past.map((r) => {
                const s = STATUS[r.status] ?? STATUS.scheduled
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--line)' }}>
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>{when(r.starts_at)}</p>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={s.style}>{s.label}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
