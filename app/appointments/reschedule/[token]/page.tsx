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
    <div className="min-h-screen px-5 py-10 sm:py-14" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--teal)' }}>
            Heirloom
          </p>
          <p className="mt-1 text-base" style={{ color: 'var(--neutral)' }}>Your Will is in good hands.</p>
        </div>
        <RescheduleFlow access={{ token }} currentStartsAt={appt.starts_at} />
      </div>
    </div>
  )
}
