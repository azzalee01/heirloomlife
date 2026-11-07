import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { PRICING } from '@/src/lib/pricing'

export const metadata: Metadata = { title: 'Accounts (admin)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const PLAN_LABEL: Record<string, string> = {
  will:  'Will',
  vault: 'Vault',
  free:  'Free',
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active:   { background: '#ecfdf5', color: '#065f46' },
  inactive: { background: 'var(--paper-warm)', color: 'var(--neutral)' },
  cancelled:{ background: '#fef2f2', color: '#b91c1c' },
}

const WILL_STYLE: Record<string, React.CSSProperties> = {
  draft:     { background: 'var(--paper-warm)', color: 'var(--neutral)' },
  approved:  { background: '#ecfdf5', color: '#065f46' },
  executed:  { background: '#ecfdf5', color: '#065f46' },
  pending_review: { background: '#fffbeb', color: '#92400e' },
}

const money = (n: number) => `$${n.toLocaleString('en-AU')}`
const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : null

type WillRow = {
  id: string; status: string; payment_status: string | null
  has_downloaded: boolean; needs_review: boolean; created_at: string
  executed_at: string | null
}
type ProfileRow = {
  id: string; email: string | null; full_name: string | null; phone: string | null
  plan: string | null; plan_status: string | null
  updates_status: string | null; updates_active_until: string | null
  rewit_credits: number | null; created_at: string
  wills: WillRow[] | null
}

// Revenue is derived from the plan + add-ons (there is no payments table). Treated as an estimate.
function revenueFor(p: ProfileRow): { total: number; products: string[] } {
  let total = 0
  const products: string[] = []
  if (p.plan === 'will' || p.plan === 'vault') {
    total += PRICING.willAud
    products.push(`Will ${money(PRICING.willAud)}`)
  }
  if (p.updates_status === 'active') {
    total += PRICING.updatesAudPerYear
    products.push(`Updates ${money(PRICING.updatesAudPerYear)}/yr`)
  }
  const rewit = p.rewit_credits ?? 0
  if (rewit > 0) {
    total += rewit * PRICING.rewitAud
    products.push(`${rewit}× re-witness ${money(rewit * PRICING.rewitAud)}`)
  }
  return { total, products }
}

function Badge({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={style}>
      {label}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: 'var(--line)' }}>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>{label}</div>
      <div className="mt-1 text-xl font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>{sub}</div>}
    </div>
  )
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>
}) {
  const host = await getHostUser()
  if (!host) notFound()

  const { q, plan } = await searchParams

  const [{ data: profiles }, { data: apptRows }, { data: ratingRows }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(`
        id, email, full_name, phone, plan, plan_status,
        updates_status, updates_active_until, rewit_credits, created_at,
        wills ( id, status, payment_status, created_at, has_downloaded, needs_review, executed_at )
      `)
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('appointments').select('user_id, status'),
    supabaseAdmin.from('appointment_ratings').select('rating'),
  ])

  // Appointment counts per user (booked = scheduled/in_progress/completed).
  const countMap = new Map<string, number>()
  let sessionsBooked = 0
  for (const a of apptRows ?? []) {
    if (['scheduled', 'completed', 'in_progress'].includes(a.status as string)) {
      sessionsBooked++
      if (a.user_id) countMap.set(a.user_id as string, (countMap.get(a.user_id as string) ?? 0) + 1)
    }
  }

  const ratings = (ratingRows ?? []).map((r) => r.rating as number)
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null

  // Filter
  let rows = (profiles ?? []) as ProfileRow[]
  if (q) {
    const lq = q.toLowerCase()
    rows = rows.filter((p) => p.email?.toLowerCase().includes(lq) || p.full_name?.toLowerCase().includes(lq))
  }
  if (plan) rows = rows.filter((p) => p.plan === plan)

  // Aggregate analytics (over the filtered set).
  const total = rows.length
  const withWill = rows.filter((p) => (p.wills ?? []).length > 0).length
  const paid = rows.filter((p) => p.plan === 'will' || p.plan === 'vault').length
  const executed = rows.filter((p) => (p.wills ?? []).some((w) => w.executed_at)).length
  const totalRevenue = rows.reduce((sum, p) => sum + revenueFor(p).total, 0)

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Accounts
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>
            {total} accounts · {withWill} with a Will · {paid} paid
          </p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search name or email…"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)', width: 220 }}
          />
          <select
            name="plan"
            defaultValue={plan ?? ''}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            <option value="">All plans</option>
            <option value="will">Will</option>
            <option value="free">Free</option>
          </select>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--teal)' }}>
            Filter
          </button>
          {(q || plan) && (
            <Link href="/admin/accounts" className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--neutral)' }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Analytics summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Revenue (est.)" value={money(totalRevenue)} sub="from plan + add-ons" />
        <StatCard label="Paid Wills" value={String(paid)} sub={total ? `${Math.round((paid / total) * 100)}% of accounts` : undefined} />
        <StatCard label="Wills completed" value={String(executed)} sub="executed & witnessed" />
        <StatCard label="With a Will" value={String(withWill)} />
        <StatCard label="Sessions booked" value={String(sessionsBooked)} />
        <StatCard label="Avg rating" value={avgRating ? `${avgRating.toFixed(1)}★` : '—'} sub={ratings.length ? `${ratings.length} rated` : undefined} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead style={{ background: 'var(--paper-warm)' }}>
            <tr>
              {['Name / Email', 'Plan', 'Paid', 'Products', 'Will', 'Completed', 'Calls', 'Joined', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--neutral)' }}>
                  No accounts found.
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const wills = p.wills ?? []
              const latestWill = wills[0]
              const executedWill = wills.find((w) => w.executed_at)
              const appts = countMap.get(p.id) ?? 0
              const rev = revenueFor(p)

              return (
                <tr key={p.id} className="border-t" style={{ borderColor: 'var(--line)' }}>

                  {/* Name / Email */}
                  <td className="px-4 py-3">
                    <div className="font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                      {p.full_name ?? <span style={{ color: 'var(--neutral)' }}>—</span>}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--neutral)' }}>{p.email}</div>
                    {p.phone && <div className="text-xs" style={{ color: 'var(--neutral)' }}>{p.phone}</div>}
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3">
                    <Badge
                      label={PLAN_LABEL[p.plan ?? ''] ?? (p.plan ?? 'free')}
                      style={STATUS_STYLE[p.plan_status ?? 'inactive']}
                    />
                  </td>

                  {/* Paid (est. revenue) */}
                  <td className="px-4 py-3 font-medium" style={{ color: rev.total > 0 ? 'var(--ink)' : 'var(--neutral)' }}>
                    {rev.total > 0 ? money(rev.total) : '—'}
                  </td>

                  {/* Products */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {rev.products.length ? rev.products.join(' · ') : '—'}
                  </td>

                  {/* Will status */}
                  <td className="px-4 py-3">
                    {latestWill ? (
                      <div className="flex flex-col gap-1">
                        <Badge
                          label={(executedWill ? 'executed' : latestWill.status).replace('_', ' ')}
                          style={WILL_STYLE[executedWill ? 'executed' : latestWill.status] ?? WILL_STYLE.draft}
                        />
                        {latestWill.needs_review && (
                          <Badge label="needs review" style={{ background: '#fef2f2', color: '#b91c1c' }} />
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--neutral)' }}>—</span>
                    )}
                  </td>

                  {/* Completed date */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {shortDate(executedWill?.executed_at) ?? '—'}
                  </td>

                  {/* Calls */}
                  <td className="px-4 py-3">
                    {appts > 0 ? (
                      <Link href={`/admin/appointments?user=${p.id}`} className="font-medium underline" style={{ color: 'var(--teal-deep)' }}>
                        {appts}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--neutral)' }}>—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {shortDate(p.created_at)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    {latestWill && (
                      <Link href={`/admin/wills/${latestWill.id}`} className="btn btn-secondary text-xs">
                        Will
                      </Link>
                    )}
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
