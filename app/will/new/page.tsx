import { cookies } from 'next/headers'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData, loadAnonSessionFormData, EMPTY_WILL_FORM_DATA } from './_data'
import type { StepId } from './_types'
import { STEP_IDS } from './_types'
import WillWizard from './_components/WillWizard'
import { hasUpdatesAccess, hasWillAccess as profileHasWillAccess } from '@/src/lib/entitlements'

export default async function WillNewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const willIdParam = typeof params.willId === 'string' ? params.willId : undefined
  const stepParam = typeof params.step === 'string' ? params.step : undefined
  const initialStep = (STEP_IDS as readonly string[]).includes(stepParam ?? '')
    ? (stepParam as StepId)
    : undefined

  // ── Authenticated path ────────────────────────────────────────────────────
  if (user) {
    const cookieStore = await cookies()
    const anonSessionId = cookieStore.get('hl_anon_session')?.value

    const [{ formData }, { data: profile }] = await Promise.all([
      loadWillFormData(supabase, user.id, willIdParam),
      supabaseAdmin.from('profiles').select('plan, plan_status, updates_status, updates_active_until').eq('id', user.id).single(),
    ])
    const hasWillAccess = profileHasWillAccess(profile)

    // Pre-populate wizard from an anonymous session when the user has no existing will.
    // The anon data becomes the initial state; real DB records are created on first step save.
    if (!formData.willId && !willIdParam && anonSessionId) {
      let anonData = null
      try {
        anonData = await loadAnonSessionFormData(supabase, anonSessionId)
      } catch {
        // Stale session  -  fall through to empty form
      }
      if (anonData) {
        return <WillWizard initialData={{ ...anonData, willId: null }} initialStep={initialStep} isAuthenticated={true} hasWillAccess={hasWillAccess} />
      }
    }

    // Gate: after the first download, changing the Will requires the unlimited-updates add-on.
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
          .select('plan, plan_status, updates_status, updates_active_until')
          .eq('id', user.id)
          .single()

        const hasAmendmentAccess = hasUpdatesAccess(profile)

        if (!hasAmendmentAccess) {
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
                  Unlimited updates are needed to change your Will
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral)' }}>
                  Your Will is complete and yours to keep. To change it, add beneficiaries or redraft it through the Estate Assistant, add unlimited updates for $25 a year.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard#upgrade"
                    className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                  >
                    Add unlimited updates  -  $25/year
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

    return <WillWizard initialData={formData} initialStep={initialStep} isAuthenticated={true} hasWillAccess={hasWillAccess} />
  }

  // ── Anonymous path ─────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const anonSessionId = cookieStore.get('hl_anon_session')?.value ?? null

  let anonFormData = { ...EMPTY_WILL_FORM_DATA }
  if (anonSessionId) {
    try {
      anonFormData = await loadAnonSessionFormData(supabase, anonSessionId)
    } catch {
      // Stale or invalid session  -  start fresh
    }
  }

  return <WillWizard initialData={anonFormData} initialStep={initialStep} isAuthenticated={false} hasWillAccess={false} />
}
