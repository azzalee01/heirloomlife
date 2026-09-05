import { cookies } from 'next/headers'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData, loadAnonSessionFormData, EMPTY_WILL_FORM_DATA } from '@/app/will/new/_data'
import WillWizard from '@/app/will/new/_components/WillWizard'
import { hasWillAccess as profileHasWillAccess } from '@/src/lib/entitlements'

export default async function StartPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  void params

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
      <MarketingNav />

      <main
        className="min-h-screen"
        style={{ background: 'var(--mkt-surface)', paddingTop: '5rem', paddingBottom: '5rem' }}
      >
        <div
          className="mx-auto px-4"
          style={{ maxWidth: '860px' }}
        >
          {/* Page intro */}
          <div className="text-center mb-10">
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.05,
                letterSpacing: '-.01em',
                color: 'var(--mkt-ink-text)',
                margin: 0,
              }}
            >
              Create your Will
            </h1>
            <p
              style={{
                marginTop: '1rem',
                fontSize: '1rem',
                lineHeight: 1.65,
                color: 'var(--mkt-stone)',
                maxWidth: '30rem',
                marginInline: 'auto',
              }}
            >
              Your answers are saved at every step. Take your time.
            </p>
          </div>

          {/* Wizard  -  rendered inside a white card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--mkt-line)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <WillWizard initialData={formData} isAuthenticated={!!user} hasWillAccess={hasWillAccess} />
          </div>

          {/* Trust footnote */}
          <p
            className="text-center mt-6 text-xs"
            style={{ color: 'var(--mkt-stone-soft)' }}
          >
            Your answers are saved automatically. Available across Australia.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </>
  )
}
