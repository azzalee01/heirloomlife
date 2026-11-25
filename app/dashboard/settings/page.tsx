import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { hasUpdatesAccess } from '@/src/lib/entitlements'
import ProfileForm from './_components/ProfileForm'
import DataPrivacy from './_components/DataPrivacy'
import ManageUpdatesButton from '../_components/ManageUpdatesButton'

export const metadata = { title: 'Settings · Heirloom Life' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white px-6 py-5" style={{ borderColor: 'var(--line)' }}>
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--neutral)' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status, updates_status, updates_active_until, stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  const name = (profile?.full_name as string | null) ?? (user.user_metadata?.full_name as string | undefined) ?? ''
  const plan = (profile?.plan as string | null) ?? 'free'
  const planStatus = (profile?.plan_status as string | null) ?? null
  const isPaid = (plan === 'will' || plan === 'vault') && planStatus === 'active'
  const hasUpdates = hasUpdatesAccess(profile)
  const hasBilling = !!(profile?.stripe_customer_id as string | null)
  const updatesUntil = profile?.updates_active_until as string | null

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center"
        style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--line)' }}
      >
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4 pb-28 md:pb-8">
        <Section title="Profile">
          <ProfileForm initialName={name} email={user.email ?? ''} />
        </Section>

        <Section title="Plan & billing">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  {isPaid ? 'Will — purchased' : 'Free'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                  {hasUpdates
                    ? `Unlimited updates active${updatesUntil ? ` until ${formatDate(updatesUntil)}` : ''}`
                    : 'No unlimited-updates add-on'}
                </p>
              </div>
              {hasBilling && <ManageUpdatesButton />}
            </div>

            {!hasUpdates && (
              <Link
                href="/dashboard#upgrade"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
                style={{ background: 'var(--paper-warm)', color: 'var(--ink)', border: '1px solid var(--line)' }}
              >
                Add unlimited updates — $25/year
              </Link>
            )}
          </div>
        </Section>

        <Section title="Data & privacy">
          <DataPrivacy />
        </Section>
      </main>
    </div>
  )
}
