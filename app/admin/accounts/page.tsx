import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const metadata: Metadata = { title: 'Accounts (admin)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const PLAN_LABEL: Record<string, string> = {
  will:  'Will',
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
  pending_review: { background: '#fffbeb', color: '#92400e' },
}

function Badge({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={style}>
      {label}
    </span>
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

  // Fetch all profiles with their latest will
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, email, full_name, phone, plan, plan_status,
      updates_status, updates_active_until, created_at,
      wills ( id, status, payment_status, created_at, has_downloaded, needs_review )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  // Fetch appointment counts per user
  const { data: apptCounts } = await supabaseAdmin
    .from('appointments')
    .select('user_id')
    .in('status', ['scheduled', 'completed', 'in_progress'])

  const countMap = new Map<string, number>()
  for (const a of apptCounts ?? []) {
    if (a.user_id) countMap.set(a.user_id, (countMap.get(a.user_id) ?? 0) + 1)
  }

  // Filter
  let rows = profiles ?? []
  if (q) {
    const lq = q.toLowerCase()
    rows = rows.filter(
      (p) =>
        p.email?.toLowerCase().includes(lq) ||
        p.full_name?.toLowerCase().includes(lq),
    )
  }
  if (plan) rows = rows.filter((p) => p.plan === plan)

  const total = rows.length
  const withWill = rows.filter((p) => (p.wills as unknown[])?.length > 0).length
  const paid = rows.filter((p) => p.plan_status === 'active').length

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Accounts
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--neutral)' }}>
            {total} accounts · {withWill} with a Will · {paid} active paid
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
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--teal)' }}
          >
            Filter
          </button>
          {(q || plan) && (
            <Link
              href="/admin/accounts"
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: 'var(--line)', color: 'var(--neutral)' }}
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead style={{ background: 'var(--paper-warm)' }}>
            <tr>
              {['Name / Email', 'Plan', 'Will', 'Calls', 'Updates', 'Joined', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--neutral)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--neutral)' }}>
                  No accounts found.
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const wills = (p.wills ?? []) as {
                id: string; status: string; payment_status: string
                has_downloaded: boolean; needs_review: boolean; created_at: string
              }[]
              const latestWill = wills[0]
              const appts = countMap.get(p.id) ?? 0

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

                  {/* Will */}
                  <td className="px-4 py-3">
                    {latestWill ? (
                      <div className="flex flex-col gap-1">
                        <Badge
                          label={latestWill.status.replace('_', ' ')}
                          style={WILL_STYLE[latestWill.status] ?? WILL_STYLE.draft}
                        />
                        {latestWill.needs_review && (
                          <Badge label="needs review" style={{ background: '#fef2f2', color: '#b91c1c' }} />
                        )}
                        {latestWill.has_downloaded && (
                          <Badge label="downloaded" style={{ background: 'var(--teal-light)', color: 'var(--teal-deep)' }} />
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--neutral)' }}>—</span>
                    )}
                  </td>

                  {/* Calls */}
                  <td className="px-4 py-3">
                    {appts > 0 ? (
                      <Link
                        href={`/admin/appointments?user=${p.id}`}
                        className="font-medium underline"
                        style={{ color: 'var(--teal-deep)' }}
                      >
                        {appts}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--neutral)' }}>—</span>
                    )}
                  </td>

                  {/* Updates */}
                  <td className="px-4 py-3">
                    {p.updates_status === 'active' ? (
                      <Badge label="active" style={STATUS_STYLE.active} />
                    ) : (
                      <span style={{ color: 'var(--neutral)' }}>—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    {new Date(p.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    {latestWill && (
                      <Link
                        href={`/admin/wills/${latestWill.id}`}
                        className="btn btn-secondary text-xs"
                      >
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
