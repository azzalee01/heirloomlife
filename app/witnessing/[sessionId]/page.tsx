import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import WitnessingRoom from './_components/WitnessingRoom'

export default async function WitnessingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
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
  if (!will) notFound()

  const { data: session } = await supabase
    .from('witnessing_sessions')
    .select('id, scheduled_at, status, witness_source, recording_enabled, recording_status, recording_url, witness_attestations(id, witness_name, attested_at, access_token)')
    .eq('id', sessionId)
    .eq('will_id', will.id)
    .single()
  if (!session) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const witnesses = (
    (session.witness_attestations ?? []) as { id: string; witness_name: string; attested_at: string | null; access_token: string }[]
  ).map((w) => ({
    id: w.id,
    name: w.witness_name,
    attested: !!w.attested_at,
    inviteUrl: `${appUrl}/witness-invite/${w.access_token}`,
  }))

  const displayName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Testator'

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2.5">
          <Link href="/witnessing" className="text-xs font-semibold" style={{ color: 'var(--neutral)' }}>← Witnessing</Link>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            Signing session
          </h1>
        </div>
        {session.recording_enabled && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wide"
            style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--teal)' }} />
            RECORDING ENABLED
          </span>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)' }}>
          <p className="text-xs" style={{ color: 'var(--ink)' }}>
            Your witness must see you sign the physical, wet-ink copy of your will in real time over this call.
            A recording (if enabled) does not replace live witnessing  -  it is kept only as supporting evidence.
          </p>
        </div>

        <WitnessingRoom
          sessionId={session.id as string}
          status={session.status as string}
          displayName={displayName}
          recordingEnabled={session.recording_enabled as boolean}
          recordingStatus={session.recording_status as string | null}
          recordingUrl={session.recording_url as string | null}
        />

        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
              Witnesses
            </p>
            {session.witness_source === 'heirloom_provided' && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
              >
                Heirloom-provided
              </span>
            )}
          </div>
          <div className="space-y-2">
            {witnesses.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--neutral)' }}>No witnesses added.</p>
            )}
            {witnesses.map((w) => (
              <div key={w.id} className="bg-white border border-[var(--line)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--ink)' }}>{w.name}</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5"
                    style={{
                      background: w.attested ? 'rgba(42,180,174,0.1)' : 'var(--paper-warm)',
                      color: w.attested ? 'var(--teal-deep)' : 'var(--neutral)',
                    }}
                  >
                    {w.attested ? 'Attested' : 'Pending'}
                  </span>
                </div>
                {!w.attested && (
                  <p className="mt-1 text-xs break-all" style={{ color: 'var(--neutral)' }}>
                    Join link: <span style={{ color: 'var(--teal-deep)' }}>{w.inviteUrl}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
