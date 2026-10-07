import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import DownloadExecutedWillButton from '@/app/dashboard/will/_components/DownloadExecutedWillButton'

export default async function DocumentsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, status, executed_at, executed_will_path, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const will = (willRows?.[0] as {
    id: string
    status: string
    executed_at: string | null
    executed_will_path: string | null
    updated_at: string
  } | undefined) ?? null

  const hasExecuted = !!will?.executed_at

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center"
        style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Documents
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">

        {/* Executed Will */}
        <section className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div className="h-[3px]" style={{ background: hasExecuted ? 'var(--teal)' : 'var(--line)' }} />
          <div className="px-6 py-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Executed Will
              </h2>
              {hasExecuted && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(42,180,174,0.12)', color: 'var(--teal-deep)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)' }} />
                  Executed
                </span>
              )}
            </div>

            {hasExecuted ? (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--ink)' }}>
                  Your signed and witnessed Will — legally valid as executed on{' '}
                  {new Date(will!.executed_at!).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}.
                </p>
                <DownloadExecutedWillButton willId={will!.id} />
              </div>
            ) : will ? (
              <p className="text-sm" style={{ color: 'var(--neutral)' }}>
                Your Will hasn&apos;t been witnessed yet.{' '}
                <a href="/witnessing" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                  Arrange witnessing
                </a>{' '}
                to get your executed Will stored here.
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'var(--neutral)' }}>
                No Will found.{' '}
                <a href="/will/new" style={{ color: 'var(--teal-deep)', textDecoration: 'underline' }}>
                  Create your Will
                </a>{' '}
                to get started.
              </p>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
