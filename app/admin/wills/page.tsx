import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import ApproveAmendmentButton from './_components/ApproveAmendmentButton'
import RejectAmendmentButton from './_components/RejectAmendmentButton'

type PendingRow = {
  id: string
  will_id: string
  change_summary: string | null
  needs_review: boolean
  needs_review_reasons: string[] | null
  created_at: string
  wills: { user_id: string; profiles: { email: string; full_name: string | null } | null } | null
}

export default async function WillsAdminPage() {
  const host = await getHostUser()
  if (!host) notFound()

  const { data } = await supabaseAdmin
    .from('will_versions')
    .select('id, will_id, change_summary, needs_review, needs_review_reasons, created_at, wills(user_id, profiles(email, full_name))')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const rows = (data ?? []) as unknown as PendingRow[]

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Pending will amendments
        </h2>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: rows.length > 0 ? '#fef2f2' : '#f0fdf4', color: rows.length > 0 ? '#b91c1c' : '#166534' }}>
          {rows.length} pending
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--line)' }}>
          <p className="text-sm" style={{ color: 'var(--neutral)' }}>No amendments pending review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const profile = row.wills?.profiles
            const reasons = row.needs_review_reasons ?? []
            return (
              <div key={row.id} className="rounded border bg-white px-5 py-4 space-y-3" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {profile?.full_name ?? 'Unknown'}{' '}
                      <span className="font-normal" style={{ color: 'var(--neutral)' }}>
                        — {profile?.email ?? row.wills?.user_id}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                      {new Date(row.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ApproveAmendmentButton versionId={row.id} />
                    <RejectAmendmentButton versionId={row.id} />
                  </div>
                </div>

                {row.change_summary && (
                  <p className="text-sm" style={{ color: 'var(--ink)' }}>{row.change_summary}</p>
                )}

                {row.needs_review && reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {reasons.map((r) => (
                      <span key={r} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <a
                    href={`/admin/wills/${row.will_id}?version=${row.id}`}
                    className="text-xs underline"
                    style={{ color: 'var(--teal-deep)' }}
                  >
                    Read amendment →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
