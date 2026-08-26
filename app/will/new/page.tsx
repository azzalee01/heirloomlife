import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from './_data'
import type { StepId } from './_types'
import { STEP_IDS } from './_types'
import WillWizard from './_components/WillWizard'

export default async function WillNewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const willIdParam = typeof params.willId === 'string' ? params.willId : undefined
  const stepParam = typeof params.step === 'string' ? params.step : undefined
  const initialStep = (STEP_IDS as readonly string[]).includes(stepParam ?? '')
    ? (stepParam as StepId)
    : undefined

  const { formData } = await loadWillFormData(supabase, user.id, willIdParam)

  // Gate: if this Will has been downloaded and the user has no active membership,
  // block re-entry into the questionnaire for amendments.
  if (formData.willId) {
    const { data: willRow } = await supabase
      .from('wills')
      .select('has_downloaded')
      .eq('id', formData.willId)
      .single()

    if (willRow?.has_downloaded) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan, plan_status')
        .eq('id', user.id)
        .single()

      const isActiveMember = profile?.plan === 'vault' && profile?.plan_status === 'active'

      if (!isActiveMember) {
        return (
          <div className="h-full flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="max-w-md space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--teal-light)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                Amendments require Living Vault
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                Your Will has been downloaded — that&apos;s your free generation. To make further amendments, add beneficiaries, or redraft via AI chat, upgrade to Living Vault for $8/month.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  See Living Vault — $8/mo
                </Link>
                <Link
                  href="/dashboard"
                  className="btn btn-secondary inline-flex items-center justify-center px-6 py-3 text-sm"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        )
      }
    }
  }

  return <WillWizard initialData={formData} initialStep={initialStep} />
}
