import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'

type TriageFlags = {
  hasBusinessInterest?: boolean
  hasBlendedFamily?: boolean
  hasExclusionIntent?: boolean
  hasVulnerableBeneficiary?: boolean
  hasBeneficiaryFinancialChallenges?: boolean
  hasComplexTrusts?: boolean
}

const FLAG_DETAILS: {
  key: keyof TriageFlags
  title: string
  body: string
  severity: 'high' | 'medium'
}[] = [
  {
    key: 'hasBusinessInterest',
    title: 'Business ownership or commercial interest',
    body: 'Wills involving business interests require careful handling of shareholder agreements, buy-sell clauses, and succession planning. A template Will may not adequately address these  -  a solicitor review is strongly recommended.',
    severity: 'high',
  },
  {
    key: 'hasBlendedFamily',
    title: 'Blended family or children from different relationships',
    body: 'Blended family structures create competing claims on an estate. Without careful drafting, children from a prior relationship may be inadvertently disadvantaged. A solicitor review is recommended to ensure all parties are properly provided for.',
    severity: 'high',
  },
  {
    key: 'hasExclusionIntent',
    title: 'Intention to exclude a spouse, child, or close family member',
    body: 'Excluding a close family member creates a high risk of a Family Provision claim against your estate. A solicitor can advise on how to structure your Will to minimise this risk and document your reasons.',
    severity: 'high',
  },
  {
    key: 'hasVulnerableBeneficiary',
    title: 'Beneficiary with a disability or reduced mental capacity',
    body: 'Leaving assets directly to a person with a disability may affect their eligibility for government support. A Special Disability Trust or testamentary trust is often more appropriate  -  a solicitor review is recommended.',
    severity: 'high',
  },
  {
    key: 'hasBeneficiaryFinancialChallenges',
    title: 'Beneficiary with difficulty managing money',
    body: 'A direct inheritance may not be in the best interests of a beneficiary with financial challenges. A testamentary trust with conditions may better protect that person  -  worth discussing with a solicitor.',
    severity: 'medium',
  },
  {
    key: 'hasComplexTrusts',
    title: 'Complex trust structures',
    body: 'Existing trust structures  -  family trusts, SMSFs, unit trusts  -  interact with your Will in ways a template may not fully address. A solicitor review is recommended to ensure your Will works with your existing structures.',
    severity: 'medium',
  },
]

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: willRow } = await supabase
    .from('wills')
    .select('id, triage_flags, assets_outside_australia: testators(assets_outside_australia)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const flags = (willRow?.triage_flags ?? {}) as TriageFlags

  // Check overseas assets via testators table
  const { data: testatorRows } = await supabase
    .from('testators')
    .select('assets_outside_australia, other_jurisdictions')
    .eq('will_id', willRow?.id ?? '')
    .limit(1)

  const hasOverseasAssets = testatorRows?.[0]?.assets_outside_australia === true

  const triggeredFlags = FLAG_DETAILS.filter((f) => flags[f.key])

  const allRecommendations = [
    ...(hasOverseasAssets ? [{
      title: 'Assets outside Australia',
      body: 'Overseas assets may require a separate Will valid in that jurisdiction. Australian succession law does not automatically apply to assets held abroad. A solicitor familiar with international estate planning should review this.',
      severity: 'high' as const,
    }] : []),
    ...triggeredFlags,
  ]

  const hasRecommendations = allRecommendations.length > 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--line)',
        }}
      >
        <div>
          <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
            Recommendations
          </h1>
          <p className="text-xs" style={{ color: 'var(--neutral)' }}>
            Flagged areas in your estate plan
          </p>
        </div>
        {hasRecommendations && (
          <a
            href="mailto:hello@heirloomlife.com.au?subject=Solicitor%20review%20request"
            className="btn btn-primary text-sm px-4 py-2"
          >
            Request solicitor review  -  ~$150
          </a>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {!hasRecommendations ? (
          <div
            className="rounded-lg border-2 border-dashed p-12 text-center"
            style={{ borderColor: 'var(--line)' }}
          >
            <div
              className="mx-auto mb-5 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(42,180,174,0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
              No recommendations
            </h2>
            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--neutral)' }}>
              Based on what you&apos;ve told us, your estate plan doesn&apos;t have any flags that would typically warrant a professional review.
            </p>
          </div>
        ) : (
          <>
            {/* Intro card */}
            <div
              className="rounded-lg border px-5 py-4"
              style={{ borderColor: 'var(--line)', background: 'white' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                Based on what you told us during your Will questionnaire, we&apos;ve identified {allRecommendations.length} area{allRecommendations.length !== 1 ? 's' : ''} that may benefit from a professional review. Your Will is complete and valid once signed  -  these are recommendations, not blockers. A solicitor review add-on is available for around $150.
              </p>
            </div>

            {/* Recommendation cards */}
            {allRecommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: 'var(--line)', background: 'white' }}
              >
                <div
                  className="h-[3px] w-full"
                  style={{ backgroundColor: rec.severity === 'high' ? '#d97706' : 'var(--teal)' }}
                />
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: rec.severity === 'high' ? '#fffbeb' : 'rgba(42,180,174,0.1)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={rec.severity === 'high' ? '#d97706' : 'var(--teal-deep)'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{rec.title}</p>
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 mt-0.5"
                        style={rec.severity === 'high'
                          ? { background: '#fffbeb', color: '#92400e' }
                          : { background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }
                        }
                      >
                        {rec.severity === 'high' ? 'Review recommended' : 'Worth considering'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed pl-9" style={{ color: 'var(--neutral)' }}>
                    {rec.body}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div
              className="rounded-lg border px-5 py-5 space-y-3"
              style={{ borderColor: 'var(--line)', background: 'white' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Request a solicitor review</p>
              <p className="text-sm" style={{ color: 'var(--neutral)' }}>
                Our partner lawyers can review your Will against the flagged areas and communicate with you directly through the platform. Around $150  -  the same price point as other online legal review services.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="mailto:hello@heirloomlife.com.au?subject=Solicitor%20review%20request%20from%20Vault"
                  className="btn btn-primary text-sm px-4 py-2.5 inline-flex items-center gap-2"
                >
                  Request review
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <Link
                  href="/dashboard/will"
                  className="btn btn-secondary text-sm px-4 py-2.5"
                >
                  View your Will
                </Link>
              </div>
              <p className="text-xs" style={{ color: 'var(--neutral)' }}>
                Messaging with your assigned lawyer will appear here once a review is underway.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
