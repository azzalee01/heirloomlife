import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const metadata: Metadata = { title: 'Accounts (admin)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Internal accounts are excluded from customer analytics so test/staff entitlements don't inflate metrics.
const INTERNAL_ROLES = new Set(['staff', 'admin'])

const PLAN_LABEL: Record<string, string> = { will: 'Will', vault: 'Vault', free: 'Free' }

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

const money = (cents: number) => `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`
const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : null

type WillRow = {
  id: string; status: string; needs_review: boolean; executed_at: string | null; created_at: string
}
type ProfileRow = {
  id: string; email: string | null; full_name: string | null; phone: string | null
  plan: string | null; plan_status: string | null; role: string | null
  updates_status: string | null; created_at: string
  wills: WillRow[] | null
}
type PaymentRow = {
  user_id: string | null; product: string; amount_total: number; amount_refunded: number; status: string
}

function Badge({ label, style }: { label: string; style?: React.CSSProperties }) {
  return <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={style}>{label}</span>
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

  const [{ data: profiles }, { data: apptRows }, { data: ratingRows }, { data: paymentRows }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(`
        id, email, full_name, phone, plan, plan_status, role, updates_status, created_at,
        wills ( id, status, needs_review, executed_at, created_at )
      `)
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('appointments').select('user_id, status'),
    supabaseAdmin.from('appointment_ratings').select('rating'),
    // Real money, live mode only — the source of truth for revenue.
    supabaseAdmin.from('payments').select('user_id, product, amount_total, amount_refunded, status').eq('livemode', true),
  ])

  // Net paid + products per user, from the Stripe-backed ledger.
  const payByUser = new Map<string, { net: number; products: Set<string> }>()
  for (const pay of (paymentRows ?? []) as PaymentRow[]) {
    if (!pay.user_id) continue
    const net = (pay.amount_total ?? 0) - (pay.amount_refunded ?? 0)
    const e = payByUser.get(pay.user_id) ?? { net: 0, products: new Set<string>() }
    e.net += net
    e.products.add(pay.product)
    payByUser.set(pay.user_id, e)
  }

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

  // Exclude internal/staff accounts, then apply UI filters.
  let rows = ((profiles ?? []) as ProfileRow[]).filter((p) => !INTERNAL_ROLES.has(p.role ?? ''))
  if (q) {
    const lq = q.toLowerCase()
    rows = rows.filter((p) => p.email?.toLowerCase().includes(lq) || p.full_name?.toLowerCase().includes(lq))
  }
  if (plan) rows = rows.filter((p) => p.plan === plan)

  // Aggregate analytics over the filtered customer set.
  const total = rows.length
  const withWill = rows.filter((p) => (p.wills ?? []).length > 0).length
  const paid = rows.filter((p) => (payByUser.get(p.id)?.net ?? 0) > 0).length
  const executed = rows.filter((p) => (p.wills ?? []).some((w) => w.executed_at)).length
  const revenueCents = rows.reduce((sum, p) => sum + (payByUser.get(p.id)?.net ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Accounts</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>
            {total} customers · {withWill} with a Will · {paid} paid · staff accounts excluded
          </p>
        </div>

        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search name or email…"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)', width: 220 }}
          />
          <select name="plan" defaultValue={plan ?? ''} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
            <option value="">All plans</option>
            <option value="will">Will</option>
            <option value="free">Free</option>
          </select>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: 'var(--teal)' }}>Filter</button>
          {(q || plan) && (
            <Link href="/admin/accounts" className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--neutral)' }}>Clear</Link>
          )}
        </form>
      </div>

      {/* Analytics summary — revenue is live Stripe money (net of refunds) */}
      <div className="mb-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Revenue" value={money(revenueCents)} sub="live Stripe, net of refunds" />
        <StatCard label="Paid customers" value={String(paid)} sub={total ? `${Math.round((paid / total) * 100)}% of ${total}` : undefined} />
        <StatCard label="Wills completed" value={String(executed)} sub="executed & witnessed" />
        <StatCard label="With a Will" value={String(withWill)} />
        <StatCard label="Sessions booked" value={String(sessionsBooked)} />
        <StatCard label="Avg rating" value={avgRating ? `${avgRating.toFixed(1)}★` : '—'} sub={ratings.length ? `${ratings.length} rated` : undefined} />
      </div>
      <p className="mb-6 text-xs" style={{ color: 'var(--neutral)' }}>
        Revenue reads from the Stripe-backed payment ledger. &ldquo;Plan&rdquo; shows access/entitlement, which can exist without a payment (e.g. staff).
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead style={{ background: 'var(--paper-warm)' }}>
            <tr>
              {['Name / Email', 'Plan', 'Paid', 'Products', 'Will', 'Completed', 'Calls', 'Joined', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--neutral)' }}>No customers found.</td></tr>
            )}
            {rows.map((p) => {
              const wills = p.wills ?? []
              const latestWill = wills[0]
              const executedWill = wills.find((w) => w.executed_at)
              const appts = countMap.get(p.id) ?? 0
              const pay = payByUser.get(p.id)
              const products = pay ? [...pay.products] : []

              return (
                <tr key={p.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-4 py-3">
                    <div className="font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                      {p.full_name ?? <span style={{ color: 'var(--neutral)' }}>—</span>}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--neutral)' }}>{p.email}</div>
                    {p.phone && <div className="text-xs" style={{ color: 'var(--neutral)' }}>{p.phone}</div>}
                  </td>

                  <td className="px-4 py-3">
                    <Badge label={PLAN_LABEL[p.plan ?? ''] ?? (p.plan ?? 'free')} style={STATUS_STYLE[p.plan_status ?? 'inactive']} />
                  </td>

                  {/* Paid (real, net) */}
                  <td className="px-4 py-3 font-medium" style={{ color: pay && pay.net > 0 ? 'var(--ink)' : 'var(--neutral)' }}>
                    {pay && pay.net > 0 ? money(pay.net) : '—'}
                  </td>

                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {products.length ? products.join(' · ') : '—'}
                  </td>

                  <td className="px-4 py-3">
                    {latestWill ? (
                      <div className="flex flex-col gap-1">
                        <Badge
                          label={(executedWill ? 'executed' : latestWill.status).replace('_', ' ')}
                          style={WILL_STYLE[executedWill ? 'executed' : latestWill.status] ?? WILL_STYLE.draft}
                        />
                        {latestWill.needs_review && <Badge label="needs review" style={{ background: '#fef2f2', color: '#b91c1c' }} />}
                      </div>
                    ) : <span style={{ color: 'var(--neutral)' }}>—</span>}
                  </td>

                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {shortDate(executedWill?.executed_at) ?? '—'}
                  </td>

                  <td className="px-4 py-3">
                    {appts > 0 ? (
                      <Link href={`/admin/appointments?user=${p.id}`} className="font-medium underline" style={{ color: 'var(--teal-deep)' }}>{appts}</Link>
                    ) : <span style={{ color: 'var(--neutral)' }}>—</span>}
                  </td>

                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>{shortDate(p.created_at)}</td>

                  <td className="px-4 py-3 text-right">
                    {latestWill && <Link href={`/admin/wills/${latestWill.id}`} className="btn btn-secondary text-xs">Will</Link>}
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
