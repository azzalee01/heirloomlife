import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { hasVaultBenefits } from '@/src/lib/entitlements'
import PlanCTA from '../_components/PlanCTA'

const FEATURES = [
  { title: 'Will and version history', body: 'Keep your completed Will accessible and maintain a clear history as your wishes change.', href: '/dashboard/will', action: 'Open Will' },
  { title: 'Life-change reviews', body: 'Record a marriage, separation, new child, property move or other major event and see what needs attention.', href: '/dashboard/life-events', action: 'Review a life change' },
  { title: 'Supported amendments', body: 'Update people, assets and wishes without rebuilding your estate plan from the beginning.', href: '/will/new', action: 'Update Will' },
  { title: 'Witnessing access', body: 'Use signing guidance and, for eligible NSW members, request remote AV witness scheduling.', href: '/witnessing', action: 'See witnessing' },
]

export default async function VaultPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status, vault_access_until')
    .eq('id', user.id)
    .single()

  const benefitsActive = hasVaultBenefits(profile)
  const annualMember = profile?.plan === 'vault' && benefitsActive
  const accessUntil = profile?.vault_access_until
    ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(profile.vault_access_until))
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b px-6" style={{ background: 'rgba(255,255,255,.88)', borderColor: 'var(--line)', backdropFilter: 'blur(16px)' }}>
        <h1 className="text-base font-medium" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>Living Vault</h1>
        <span className="text-xs font-semibold" style={{ color: benefitsActive ? 'var(--teal-deep)' : 'var(--neutral)' }}>
          {annualMember ? 'Annual membership active' : benefitsActive && accessUntil ? `Benefits active until ${accessUntil}` : 'Benefits period ended'}
        </span>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--teal) 30%, var(--teal) 70%, transparent)' }} />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[.14em]" style={{ color: 'var(--teal-deep)' }}>Your estate command centre</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-normal leading-tight" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>Keep the plan useful after the Will is created.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: 'var(--neutral)' }}>Your Will, estate information, life changes and next actions stay together here. Your completed Will remains yours to download even when premium benefits end.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex min-h-44 flex-col justify-between rounded-xl border bg-white p-5" style={{ borderColor: 'var(--line)' }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--neutral)' }}>{feature.body}</p>
              </div>
              <Link href={feature.href} className="mt-5 text-sm font-semibold" style={{ color: 'var(--teal-deep)' }}>{feature.action} →</Link>
            </div>
          ))}
        </section>

        {!benefitsActive && <PlanCTA />}
        {benefitsActive && !annualMember && (
          <section className="flex flex-col justify-between gap-4 rounded-xl border bg-[var(--paper-warm)] p-5 sm:flex-row sm:items-center" style={{ borderColor: 'var(--line)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Keep your Vault benefits after {accessUntil}</p>
              <p className="mt-1 text-xs leading-5" style={{ color: 'var(--neutral)' }}>Join for $99 a year. Your Will is already yours; membership keeps supported updates and continuing benefits active.</p>
            </div>
            <Link href="/pricing#living-vault" className="btn btn-primary shrink-0 px-5 py-2.5 text-sm font-semibold">View annual membership</Link>
          </section>
        )}
      </main>
    </div>
  )
}
