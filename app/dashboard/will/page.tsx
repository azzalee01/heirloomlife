import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from '@/app/will/new/_data'
import { assembleWillDocument } from '@/app/will/new/_assembly'
import { renderWillText } from '@/app/will/new/_render'
import AiChat from '@/app/dashboard/_components/AiChat'
import LegalReviewCallout from './_components/LegalReviewCallout'
import VersionHistory, { type VersionSummary } from './_components/VersionHistory'
import DownloadWillButton from './_components/DownloadWillButton'
import DownloadExecutedWillButton from './_components/DownloadExecutedWillButton'
import UnlockWillBanner from './_components/UnlockWillBanner'
import { completeWill } from '@/app/will/new/_actions'

export default async function TheWillPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', user.id)
    .single()
  const hasPaidForWill = profile?.plan === 'will' || profile?.plan === 'vault'

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, status, needs_review, needs_review_reasons, updated_at, has_downloaded, executed_at, executed_will_path')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const will = willRows?.[0] as
    | { id: string; status: string; needs_review: boolean; needs_review_reasons: string[] | null; updated_at: string; has_downloaded: boolean; executed_at: string | null; executed_will_path: string | null }
    | undefined

  if (!will) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
        <header className="sticky top-0 z-20 border-b px-4 sm:px-6 h-14 flex items-center" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            The Will
          </h1>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

  // First time a paid user arrives with a draft will — finalise it now.
  // completeWill sets status to pending_review and kicks off solicitor review.
  if (hasPaidForWill && will.status === 'draft') {
    try { await completeWill(will.id) } catch { /* non-blocking */ }
  }

  const { formData } = await loadWillFormData(supabase, user.id, will.id)
  let documentText: string
  try {
    documentText = await assembleWillDocument(formData)
  } catch (err) {
    console.warn('[will/page] assembleWillDocument failed, falling back to renderWillText:', err)
    documentText = renderWillText(formData)
  }

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
      <header className="sticky top-0 z-20 border-b px-4 sm:px-6 h-14 flex items-center justify-between" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            The Will
          </h1>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wide"
            style={{
              background: hasPaidForWill ? 'rgba(42,180,174,0.1)' : 'rgba(0,0,0,0.05)',
              color: hasPaidForWill ? 'var(--teal-deep)' : 'var(--neutral)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: hasPaidForWill ? 'var(--teal)' : 'var(--neutral)' }} />
            {hasPaidForWill ? 'LIVE' : 'DRAFT'}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {will.needs_review && (
          <LegalReviewCallout reasons={will.needs_review_reasons ?? []} />
        )}

        {/* Will document */}
        <div className="bg-white border border-[var(--line)] overflow-hidden">
          <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
          <div className="px-6 py-6 space-y-5">
            {will.executed_at && (
              <div className="rounded border px-4 py-3 flex items-start gap-3" style={{ borderColor: 'var(--teal)', background: 'rgba(42,180,174,0.06)' }}>
                <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                <div className="space-y-2 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--teal-deep)' }}>
                    Will executed —{' '}
                    {new Date(will.executed_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                    Your signed Will is stored securely. Download it below to keep a personal copy.
                  </p>
                  <DownloadExecutedWillButton willId={will.id} />
                </div>
              </div>
            )}

            {hasPaidForWill && (
              <DownloadWillButton
                willId={will.id}
                documentText={documentText}
                hasDownloaded={will.has_downloaded ?? false}
                testatorName={[formData.personalDetails.firstName, formData.personalDetails.middleName, formData.personalDetails.lastName].filter(Boolean).join(' ')}
                funeralWishes={formData.personalWishes}
              />
            )}
            <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--ink)] leading-relaxed">{documentText}</pre>
          </div>
        </div>

        {/* Payment CTA for users who haven't yet unlocked */}
        {!hasPaidForWill && <UnlockWillBanner />}

        {/* Executor Information — non-testamentary; does not form part of the Will */}
        {(() => {
          const digitalAccessLocation = formData.assets.find((a) => a.assetType === 'digital_asset')?.accessLocation
          if (!formData.importantDocumentsLocation && !digitalAccessLocation) return null
          return (
            <div className="border border-[var(--line)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--line)] flex items-center gap-2" style={{ background: 'var(--paper)' }}>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>Executor Information</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--neutral)' }}>Not part of the Will</span>
              </div>
              <div className="px-4 py-4 space-y-3" style={{ background: 'var(--paper)' }}>
                <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                  This information is for your Executor&apos;s reference only. It does not form part of your Will, is not testamentary, and may be updated at any time without re-signing your Will.
                </p>
                {formData.importantDocumentsLocation && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink)' }}>Important document location</p>
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>{formData.importantDocumentsLocation}</p>
                  </div>
                )}
                {digitalAccessLocation && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink)' }}>Digital credentials location</p>
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>{digitalAccessLocation}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* Ask about your will — paid users only */}
        {hasPaidForWill && <AiChat />}

        {/* Version history */}
        {versions.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--neutral)' }}>
              Version History
            </p>
            <VersionHistory versions={versions} />
          </section>
        )}

      </main>
    </div>
  )
}
