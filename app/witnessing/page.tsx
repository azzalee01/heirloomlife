import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import ScheduleSessionForm from './_components/ScheduleSessionForm'
import SessionList, { type WitnessingSessionSummary } from './_components/SessionList'

export default async function WitnessingPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const will = willRows?.[0] as { id: string } | undefined

  if (!will) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
        <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Witnessing
          </h1>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="rounded-lg border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--line)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>No will started yet</h2>
            <p className="text-sm" style={{ color: 'var(--neutral)' }}>
              Start your will before scheduling a witnessing session.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const { data: sessionRows } = await supabase
    .from('witnessing_sessions')
    .select('id, scheduled_at, status, recording_enabled, recording_status, recording_url, witness_attestations(id, witness_name, attested_at)')
    .eq('will_id', will.id)
    .order('scheduled_at', { ascending: false })

  const sessions: WitnessingSessionSummary[] = (sessionRows ?? []).map((s) => ({
    id: s.id as string,
    scheduledAt: s.scheduled_at as string,
    status: s.status as WitnessingSessionSummary['status'],
    recordingEnabled: s.recording_enabled as boolean,
    recordingStatus: s.recording_status as string | null,
    recordingUrl: s.recording_url as string | null,
    witnesses: ((s.witness_attestations ?? []) as { id: string; witness_name: string; attested_at: string | null }[]).map((w) => ({
      id: w.id,
      name: w.witness_name,
      attested: !!w.attested_at,
    })),
  }))

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Witnessing
          </h1>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wide"
            style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)' }} />
            NSW AVL COMPLIANT
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm" style={{ color: 'var(--neutral)' }}>
          Schedule a remote witnessing session for signing your will over audio-visual link, in line with
          Part 2B of the Electronic Transactions Act 2000 (NSW). Your witness must see you sign in real time.
        </p>

        <ScheduleSessionForm />

        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--neutral)' }}>
            Sessions
          </p>
          <SessionList sessions={sessions} />
        </section>
      </main>
    </div>
  )
}
