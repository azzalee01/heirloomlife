import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData, loadAnonSessionFormData, EMPTY_WILL_FORM_DATA } from '@/app/will/new/_data'
import WillWizard from '@/app/will/new/_components/WillWizard'

export default async function StartPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Load existing data — from DB for authenticated users, from anon session cookie otherwise
  let formData = { ...EMPTY_WILL_FORM_DATA }
  if (user) {
    try {
      const { formData: loaded } = await loadWillFormData(supabase, user.id)
      formData = loaded
    } catch {
      // No will yet — start fresh
    }
  } else {
    const cookieStore = await cookies()
    const anonSessionId = cookieStore.get('hl_anon_session')?.value ?? null
    if (anonSessionId) {
      try {
        formData = await loadAnonSessionFormData(supabase, anonSessionId)
      } catch {
        // Stale session — start fresh
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
                fontFamily: "'Instrument Serif', Georgia, serif",
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
              Answer a few questions — no account needed until you&apos;re ready to download.
            </p>
          </div>

          {/* Wizard — rendered inside a white card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--mkt-line)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <WillWizard initialData={formData} isAuthenticated={!!user} />
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
