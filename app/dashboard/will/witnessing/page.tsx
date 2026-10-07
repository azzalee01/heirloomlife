import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadAppointment } from '@/src/lib/appointments/server'
import TestatorUploadForm from './_components/TestatorUploadForm'

export const dynamic = 'force-dynamic'

export default async function WitnessingUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ appt?: string }>
}) {
  const { appt: appointmentId } = await searchParams

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  if (!appointmentId) {
    return <ErrorPage message="No appointment specified." />
  }

  const appt = await loadAppointment(appointmentId)
  if (!appt || appt.user_id !== user.id) {
    return <ErrorPage message="Appointment not found." />
  }

  if (appt.witnessing_status === 'executed') {
    return (
      <Shell>
        <div className="space-y-3 rounded border p-6 text-center" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.04)' }}>
          <p className="text-lg font-medium" style={{ color: 'var(--teal-deep)' }}>Your Will has been executed ✓</p>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>
            Your fully executed Will is ready to download from your dashboard.
          </p>
          <a href="/dashboard/will" className="btn btn-primary inline-block">Go to your Will</a>
        </div>
      </Shell>
    )
  }

  if (appt.witnessing_status !== 'testator_signed') {
    return <ErrorPage message="This upload link is not active. Please contact Heirloom if you believe this is an error." />
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Upload your signed Will
          </h1>
          <p className="mt-2 text-base" style={{ color: 'var(--neutral)' }}>
            Thank you for your witnessing session. Please upload a scan or clear photo of your signed Will below.
          </p>
        </div>

        <div className="rounded border p-4 text-sm space-y-2" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
          <p className="font-medium" style={{ color: 'var(--ink)' }}>Before you upload, check:</p>
          <ul className="list-disc pl-4 space-y-1" style={{ color: 'var(--neutral)' }}>
            <li>You have signed every page of the Will (including the Execution &amp; Attestation page)</li>
            <li>Both witnesses signed in your presence</li>
            <li>All signatures are clearly visible in the scan</li>
          </ul>
        </div>

        <TestatorUploadForm appointmentId={appointmentId} />
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 border-b px-4 sm:px-6 h-14 flex items-center" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
        <p className="text-base" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--teal)' }}>Heirloom</p>
      </header>
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
    </div>
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <Shell>
      <p className="text-sm" style={{ color: 'var(--neutral)' }}>{message}</p>
    </Shell>
  )
}
