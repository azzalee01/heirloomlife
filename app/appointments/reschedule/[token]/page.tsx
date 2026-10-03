import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { authorizeViewer } from '@/src/lib/appointments/server'
import RescheduleFlow from '../../_components/RescheduleFlow'

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' }
export const dynamic = 'force-dynamic'

export default async function ReschedulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let appt
  try {
    appt = await authorizeViewer({ token })
  } catch {
    notFound()
  }

  // Only reschedulable if it's scheduled and hasn't started yet.
  if (appt.status !== 'scheduled' || new Date() >= new Date(appt.starts_at)) {
    notFound()
  }

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--teal)' }}>
          Heirloom
        </p>
        <RescheduleFlow access={{ token }} currentStartsAt={appt.starts_at} />
      </div>
    </div>
  )
}
