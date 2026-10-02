import { notFound } from 'next/navigation'
import Link from 'next/link'
import { authorizeViewer, toView } from '@/src/lib/appointments/server'
import JoinPanel from '@/app/appointments/_components/JoinPanel'

export const dynamic = 'force-dynamic'

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let view
  try {
    view = toView(await authorizeViewer({ appointmentId: id }))
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-6"
        style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', borderColor: 'var(--line)' }}
      >
        <Link href="/dashboard/appointments" className="text-sm" style={{ color: 'var(--neutral)' }}>← Appointments</Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 pb-28 sm:px-6 md:pb-8">
        <JoinPanel
          access={{ appointmentId: id }}
          initial={view}
          supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE}
          bookHref="/book"
        />
      </main>
    </div>
  )
}
