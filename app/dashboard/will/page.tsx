import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData } from '@/app/will/new/_data'
import { renderWillText } from '@/app/will/new/_render'
import AiChat from '@/app/dashboard/_components/AiChat'
import LegalReviewCallout from './_components/LegalReviewCallout'
import VersionHistory, { type VersionSummary } from './_components/VersionHistory'
import DownloadWillButton from './_components/DownloadWillButton'

export default async function TheWillPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, subscription_status, needs_review, needs_review_reasons, updated_at, has_downloaded')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const will = willRows?.[0] as
    | { id: string; subscription_status: string; needs_review: boolean; needs_review_reasons: string[] | null; updated_at: string; has_downloaded: boolean }
    | undefined

  if (!will) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
        <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            The Will
          </h1>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="rounded-lg border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--line)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>No will started yet</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--neutral)' }}>
              Start your will to see it here as a living document you can read, question, and update any time.
            </p>
            <Link href="/will/new" className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
              Create your Will
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const { formData } = await loadWillFormData(supabase, user.id, will.id)
  const documentText = renderWillText(formData)

  const { data: versionRows } = await supabase
    .from('will_versions')
    .select('id, created_at, change_summary, needs_review')
    .eq('will_id', will.id)
    .order('created_at', { ascending: false })

  const versions: VersionSummary[] = (versionRows ?? []).map((v) => ({
    id: v.id as string,
    createdAt: v.created_at as string,
    changeSummary: v.change_summary as string,
    needsReview: v.needs_review as boolean,
  }))

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            The Will
          </h1>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wide"
            style={{ background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal)' }} />
            LIVE
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {will.needs_review && (
          <LegalReviewCallout reasons={will.needs_review_reasons ?? []} subscriptionStatus={will.subscription_status} />
        )}

        {/* Live document */}
        <div className="bg-white border border-[var(--line)] overflow-hidden">
          <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
          <div className="px-6 py-6 space-y-5">
            <DownloadWillButton
              willId={will.id}
              documentText={documentText}
              hasDownloaded={will.has_downloaded ?? false}
            />
            <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--ink)] leading-relaxed">{documentText}</pre>
          </div>
        </div>

        {/* Ask about your will */}
        <AiChat />

        {/* Version history */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--neutral)' }}>
            Version History
          </p>
          <VersionHistory versions={versions} />
        </section>

      </main>
    </div>
  )
}
