import { notFound } from 'next/navigation'
import { authorizeViewer, toView } from '@/src/lib/appointments/server'
import DashboardCallView from './_components/DashboardCallView'

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
    <DashboardCallView
      id={id}
      initial={view}
      supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE}
    />
  )
}
