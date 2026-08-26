import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
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

  // AV witnessing requires active Living Vault membership AND a NSW address on file.
  const [profileRes, testatorRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('plan, plan_status').eq('id', user.id).single(),
    supabase.from('testators').select('state').eq('will_id', will.id).not('marital_status', 'is', null).limit(1).single(),
  ])
  const isActiveMember = profileRes.data?.plan === 'vault' && profileRes.data?.plan_status === 'active'
  const userState = (testatorRes.data as { state: string | null } | null)?.state ?? null
  const isNSW = userState === 'NSW'

  if (!isActiveMember || !isNSW) {
    const reason = !isActiveMember
      ? { heading: 'Living Vault membership required', body: 'AV witness scheduling is available to Living Vault members. Your first Will is free  -  upgrade to unlock remote witnessing and unlimited amendments.' }
      : { heading: 'NSW only', body: 'Remote AV witnessing is currently available for NSW addresses only, consistent with NSW\'s statutory AV witnessing scheme. Your address on file is ' + (userState ?? 'not set') + '.' }
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
        <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>Witnessing</h1>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="border border-[var(--line)] bg-white p-8 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--teal-light)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{reason.heading}</h2>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>{reason.body}</p>
            {!isActiveMember && (
              <Link href="/pricing" className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
                See Living Vault  -  $8/mo
              </Link>
            )}
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
