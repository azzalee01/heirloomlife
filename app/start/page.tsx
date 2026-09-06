import { cookies } from 'next/headers'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData, loadAnonSessionFormData, EMPTY_WILL_FORM_DATA } from '@/app/will/new/_data'
import StartPageClient from './_components/StartPageClient'
import { hasWillAccess as profileHasWillAccess } from '@/src/lib/entitlements'

export default async function StartPage({ searchParams }: { searchParams: Promise<{ mode?: string; partner?: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  // Load existing data  -  from DB for authenticated users, from anon session cookie otherwise
  let formData = { ...EMPTY_WILL_FORM_DATA }
  let hasWillAccess = false
  if (user) {
    try {
      const [{ formData: loaded }, { data: profile }] = await Promise.all([
        loadWillFormData(supabase, user.id),
        supabase.from('profiles').select('plan, plan_status, vault_access_until').eq('id', user.id).single(),
      ])
      formData = loaded
      hasWillAccess = profileHasWillAccess(profile)
    } catch {
      // No will yet  -  start fresh
    }
  } else {
    const cookieStore = await cookies()
    const anonSessionId = cookieStore.get('hl_anon_session')?.value ?? null
    if (anonSessionId) {
      try {
        formData = await loadAnonSessionFormData(supabase, anonSessionId)
      } catch {
        // Stale session  -  start fresh
      }
    }
  }

  return (
    <>
      {/* Nav — desktop only */}
      <div className="hidden sm:block">
        <MarketingNav />
      </div>

      {/* Mobile: full-screen shell. Desktop: scrollable marketing page */}
      <div
        className="flex flex-col h-dvh overflow-hidden sm:h-auto sm:overflow-visible sm:min-h-screen"
        style={{ background: 'var(--mkt-surface)' }}
      >
        <div
          className="flex-1 min-h-0 flex flex-col sm:flex-none sm:mx-auto sm:px-4 sm:py-20"
          style={{ maxWidth: '860px', width: '100%' }}
        >
          <StartPageClient
            serverFormData={formData}
            isAuthenticated={!!user}
            hasWillAccess={hasWillAccess}
            autoOpenUpload={params.mode === 'upload'}
            partnerCode={params.partner ?? null}
          />

          <p className="hidden sm:block text-center mt-6 text-xs" style={{ color: 'var(--mkt-stone-soft)' }}>
            Your answers are saved automatically. Available across Australia.
          </p>
        </div>
      </div>

      {/* Footer — desktop only */}
      <div className="hidden sm:block">
        <MarketingFooter />
      </div>
    </>
  )
}
