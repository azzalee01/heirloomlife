import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PRICING } from '@/src/lib/pricing'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import IntroAnimationLoader from './_components/IntroAnimationLoader'
import PartnerShareCard from './_components/PartnerShareCard'

type Will = { id: string; status: string; updated_at: string }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const WILL_STATUS = {
  draft: {
    label: 'In progress',
    badge: { background: 'var(--paper-warm)', color: 'var(--ink)' },
    headline: 'Your questionnaire is in progress.',
    sub: 'Keep going — once submitted your Will goes to our legal team for review.',
  },
  pending_review: {
    label: 'Awaiting review',
    badge: { background: '#fffbeb', color: '#92400e' },
    headline: "We’re checking your Will before it is released.",
    sub: "Our legal team is reviewing your Will. We’ll be in touch once it’s ready.",
  },
  approved: {
    label: 'Ready to sign',
    badge: { background: '#ecfdf5', color: '#065f46' },
    headline: 'Your Will is ready.',
    sub: 'Download it and follow the signing instructions below to make it legally valid.',
  },
} as const

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const sp = await searchParams
  const paymentSuccess = sp.payment === 'success'

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there'

  const { data: willRows } = await supabase
    .from('wills').select('id, status, updated_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
  const will = (willRows?.[0] as Will) ?? null

  const [{ data: profileRow }, { data: coupleCodes }, { data: pendingAmendmentRow }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('plan, plan_status, updates_status, updates_active_until')
      .eq('id', user.id)
      .single(),
    supabaseAdmin
      .from('couple_discount_codes')
      .select('code, product, discount_cents, expires_at, used_at')
      .eq('generator_id', user.id)
      .order('created_at', { ascending: false }),
    will
      ? supabaseAdmin
          .from('will_versions')
          .select('id, change_summary, created_at')
          .eq('will_id', will.id)
          .eq('status', 'pending_review')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const plan = (profileRow?.plan as string) ?? 'free'
  const planStatus = (profileRow?.plan_status as string | null) ?? null
  const isPaid = (plan === 'will' || plan === 'vault') && planStatus === 'active'

  const willStatus = (will?.status as keyof typeof WILL_STATUS) ?? 'draft'
  const sc = WILL_STATUS[willStatus] ?? WILL_STATUS.draft
  const hasPendingAmendment = willStatus === 'approved' && !!pendingAmendmentRow

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden" style={{ background: 'var(--paper)' }}>
      <IntroAnimationLoader />

      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--line)',
        }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Hi, {firstName}
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4 pb-28 md:pb-8">

        {/* Payment success */}
        {paymentSuccess && (
          <div className="rounded-lg border px-5 py-4 flex items-start gap-3" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: '#166534' }}>
                Payment received — your Will is being prepared.
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#166534', opacity: 0.8 }}>
                If it doesn&apos;t appear below shortly, refresh the page.
              </p>
            </div>
          </div>
        )}

        {/* Partner share cards */}
        {(coupleCodes ?? []).map((c) => (
          <PartnerShareCard
            key={c.code as string}
            code={c.code as string}
            product={c.product as 'will' | 'vault'}
            discountCents={c.discount_cents as number}
            expiresAt={c.expires_at as string}
            usedAt={c.used_at as string | null}
          />
        ))}

        {/* ── Your Will ──────────────────────────────────────────────────────── */}
        <section className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
          <div className="px-6 py-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Your Will
              </h2>
              {will && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={sc.badge}>
                  {sc.label}
                </span>
              )}
            </div>

            {!will ? (
              <div>
                <p className="text-base font-medium mb-1" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  Start your Will.
                </p>
                <p className="text-sm mb-5" style={{ color: 'var(--neutral)' }}>
                  Create a legally valid Will to protect the people and things you care about most.
                </p>
                <Link href="/will/new" className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
                  Create my Will →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-base font-medium mb-1" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {sc.headline}
                </p>
                <p className="text-sm mb-1" style={{ color: 'var(--neutral)' }}>{sc.sub}</p>
                <p className="text-xs mb-5" style={{ color: 'var(--neutral)', opacity: 0.6 }}>
                  Last updated {formatDate(will.updated_at)}
                </p>

                {hasPendingAmendment && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 mb-5 text-xs"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
                  >
                    <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <span>
                      <strong className="font-semibold">Update awaiting review</strong> — your current Will is still valid and downloadable.
                      We&apos;ll let you know when the updated version is ready.
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {willStatus === 'draft' && (
                    <Link href="/will/new" className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
                      Continue →
                    </Link>
                  )}

                  {willStatus === 'pending_review' && (
                    <Link href="/will/summary" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg" style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
                      View summary
                    </Link>
                  )}

                  {willStatus === 'approved' && (
                    <>
                      <Link href="/dashboard/will" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg" style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
                        View Will
                      </Link>
                      {isPaid ? (
                        <a href="/api/will/download" className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          Download PDF
                        </a>
                      ) : (
                        <Link href="/pricing" className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
                          Download my Will — ${PRICING.willAud} →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Signing ────────────────────────────────────────────────────────── */}
        {will && willStatus !== 'draft' && (
          <section className="rounded-xl border bg-white px-6 py-5" style={{ borderColor: 'var(--line)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--neutral)' }}>
              Signing
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--ink)' }}>
              Your Will must be signed in front of two witnesses to be legally valid.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/the-will#signing"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
                style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}
              >
                How to sign your Will
              </Link>
              <Link
                href="/witnessing"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
                style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}
              >
                Arrange witnessing
              </Link>
            </div>
          </section>
        )}

        {/* ── Need help? ─────────────────────────────────────────────────────── */}
        <section className="rounded-xl border bg-white px-6 py-5" style={{ borderColor: 'var(--line)' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--neutral)' }}>
            Need help?
          </h2>
          <a
            href="mailto:support@heirloomlife.com.au"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
            style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}
          >
            Contact Heirloom
          </a>
        </section>

      </main>
    </div>
  )
}
