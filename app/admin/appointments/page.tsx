import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHostUser, listHostAppointments } from '@/src/lib/appointments/server'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'

export const metadata: Metadata = { title: 'Appointments (host)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))

export default async function HostAppointmentsPage() {
  // 404 (not a redirect) for everyone who isn't a host, so the page's existence isn't advertised.
  const host = await getHostUser()
  if (!host) notFound()

  const rows = await listHostAppointments(host.id)

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Guided calls</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>Last 14 days and everything upcoming. Times in Sydney.</p>
      <div className="mt-6 overflow-x-auto border" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead style={{ background: 'var(--paper-warm)', color: 'var(--neutral)' }}>
            <tr>
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Consent</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6" style={{ color: 'var(--neutral)' }}>No calls yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>{when(r.starts_at)}</td>
                <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>
                  {r.customer_name}
                  {r.booked_by_name && <span style={{ color: 'var(--neutral)' }}> · booked by {r.booked_by_name}</span>}
                  {r.customer_phone && <div style={{ color: 'var(--neutral)' }}>{r.customer_phone}</div>}
                </td>
                <td className="px-4 py-3">
                  {r.status.replace('_', ' ')}
                  {r.escalated && <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: '#fef2f2', color: '#b91c1c' }}>escalated</span>}
                </td>
                <td className="px-4 py-3">{r.recording_consent_at ? 'Agreed' : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/appointments/${r.id}`} className="btn btn-secondary">Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
