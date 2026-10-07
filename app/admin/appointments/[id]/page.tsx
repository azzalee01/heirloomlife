import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { getHostUser, loadAppointment } from '@/src/lib/appointments/server'
import { getWitnessNamesFromEvents } from '@/src/lib/appointments/witnessing'
import { APPOINTMENT_TZ } from '@/src/lib/appointments/constants'
import HostRoom from './_components/HostRoom'
import RecordingsPanel from './_components/RecordingsPanel'
import { HostNotesEditor } from './_components/HostNotesEditor'
import WitnessingPanel from './_components/WitnessingPanel'

export const metadata: Metadata = { title: 'Guided call (host)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const stamp = (iso: string) =>
  new Intl.DateTimeFormat('en-AU', { timeZone: APPOINTMENT_TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(iso))

export default async function HostAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const host = await getHostUser()
  if (!host) notFound()
  const appt = await loadAppointment(id)
  if (!appt) notFound()

  // Look up the user's will (if they have an account) so the panel can pre-fill the will ID
  let suggestedWillId: string | null = null
  if (appt.user_id) {
    const { data: willRow } = await supabaseAdmin
      .from('wills')
      .select('id')
      .eq('user_id', appt.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    suggestedWillId = (willRow as { id: string } | null)?.id ?? null
  }

  // Fetch witness names from the audit trail once confirming has happened
  const witnessNames = appt.witnessing_status !== 'none' && appt.witnessing_status !== 'will_linked'
    ? await getWitnessNamesFromEvents(id)
    : null

  const [{ data: events }, { data: recordings }] = await Promise.all([
    supabaseAdmin
      .from('appointment_events')
      .select('id, event_type, actor, offset_seconds, metadata, created_at')
      .eq('appointment_id', id)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('appointment_recordings')
      .select('id, segment_index, status, started_at, duration_seconds')
      .eq('appointment_id', id)
      .order('segment_index', { ascending: true }),
  ])

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-8">
      <div>
        <Link href="/admin/appointments" className="text-sm" style={{ color: 'var(--neutral)' }}>← All calls</Link>
        <h1 className="mt-2 text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{appt.customer_name}</h1>
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>
          {stamp(appt.starts_at)} · {appt.status.replace('_', ' ')}
          {appt.customer_phone ? ` · ${appt.customer_phone}` : ''}
          {appt.booked_by_name ? ` · booked by ${appt.booked_by_name}` : ''}
        </p>
        {appt.escalated && (
          <p className="mt-2 inline-block rounded px-2 py-1 text-sm font-medium" style={{ background: '#fef2f2', color: '#b91c1c' }}>
            Escalated: capacity / undue-influence concern raised. Do not finalise without solicitor review.
          </p>
        )}
      </div>

      <HostRoom
        appointmentId={appt.id}
        consentGiven={Boolean(appt.recording_consent_at)}
        status={appt.status}
      />

      <WitnessingPanel
        appointmentId={appt.id}
        witnessingStatus={appt.witnessing_status ?? 'none'}
        linkedWillId={appt.will_id ?? null}
        suggestedWillId={suggestedWillId}
        testatorSignedAt={appt.testator_signed_confirmed_at ?? null}
        witness1Name={witnessNames?.witness1Name ?? null}
        witness2Name={witnessNames?.witness2Name ?? null}
        hasTestatorUpload={Boolean(appt.testator_upload_path)}
        hasExecutedWill={Boolean(appt.executed_will_path)}
        dailyRoomName={appt.daily_room_name ?? null}
      />

      <section>
        <h2 className="mb-2 text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Host notes</h2>
        <HostNotesEditor appointmentId={appt.id} initialNotes={appt.host_notes} />
      </section>

      <section>
        <h2 className="mb-2 text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Recordings</h2>
        <RecordingsPanel
          appointmentId={appt.id}
          recordings={(recordings ?? []) as { id: string; segment_index: number; status: string; started_at: string; duration_seconds: number | null }[]}
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Audit trail</h2>
        <ul className="divide-y border text-sm" style={{ borderColor: 'var(--line)' }}>
          {(events ?? []).length === 0 && <li className="px-4 py-3" style={{ color: 'var(--neutral)' }}>No events yet.</li>}
          {(events ?? []).map((e) => {
            const note = (e.metadata as { note?: string } | null)?.note
            return (
              <li key={e.id as string} className="flex flex-wrap items-baseline gap-x-3 px-4 py-2">
                <span style={{ color: 'var(--neutral)' }}>{stamp(e.created_at as string)}</span>
                <span className="font-medium" style={{ color: 'var(--ink)' }}>{(e.event_type as string).replace(/_/g, ' ')}</span>
                <span style={{ color: 'var(--neutral)' }}>{e.actor as string}</span>
                {e.offset_seconds != null && <span style={{ color: 'var(--neutral)' }}>@ {Math.floor((e.offset_seconds as number) / 60)}:{String((e.offset_seconds as number) % 60).padStart(2, '0')} into segment</span>}
                {note && <span style={{ color: 'var(--ink)' }}>“{note}”</span>}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
