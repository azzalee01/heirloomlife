import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import ApproveAmendmentButton from '../_components/ApproveAmendmentButton'
import RejectAmendmentButton from '../_components/RejectAmendmentButton'

export default async function WillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ willId: string }>
  searchParams: Promise<{ version?: string }>
}) {
  const host = await getHostUser()
  if (!host) notFound()

  const { willId } = await params
  const { version: versionId } = await searchParams

  // Load will + profile
  const { data: will } = await supabaseAdmin
    .from('wills')
    .select('id, status, user_id, profiles(email, full_name)')
    .eq('id', willId)
    .maybeSingle()

  if (!will) notFound()

  const profile = (will as unknown as { profiles: { email: string; full_name: string | null } | null }).profiles

  // Load the specific version if provided, otherwise the latest pending one
  const versionQuery = supabaseAdmin
    .from('will_versions')
    .select('id, version_number, status, change_summary, needs_review_reasons, rejection_reason, document_text, created_at')
    .eq('will_id', willId)

  const { data: version } = versionId
    ? await versionQuery.eq('id', versionId).maybeSingle()
    : await versionQuery.eq('status', 'pending_review').order('created_at', { ascending: false }).limit(1).maybeSingle()

  // Load all versions for sidebar
  const { data: allVersions } = await supabaseAdmin
    .from('will_versions')
    .select('id, version_number, status, change_summary, created_at')
    .eq('will_id', willId)
    .order('created_at', { ascending: false })

  type VersionRow = { id: string; version_number: number | null; status: string | null; change_summary: string | null; created_at: string }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/wills" className="text-xs underline" style={{ color: 'var(--neutral)' }}>
          ← All amendments
        </Link>
        <span style={{ color: 'var(--neutral)' }}>/</span>
        <span className="text-xs" style={{ color: 'var(--ink)' }}>
          {profile?.full_name ?? profile?.email ?? willId}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Version sidebar */}
        <aside className="w-56 shrink-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--neutral)' }}>
            Versions
          </p>
          {(allVersions ?? []).map((v) => {
            const vRow = v as VersionRow
            const active = vRow.id === (version as { id: string } | null)?.id
            const statusColor = vRow.status === 'pending_review' ? '#92400e'
              : vRow.status === 'approved' ? '#065f46'
              : vRow.status === 'rejected' ? '#b91c1c'
              : 'var(--neutral)'
            return (
              <a
                key={vRow.id}
                href={`/admin/wills/${willId}?version=${vRow.id}`}
                className="block rounded border px-3 py-2.5 text-xs transition-colors"
                style={{
                  borderColor: active ? 'var(--teal)' : 'var(--line)',
                  background: active ? 'rgba(42,180,174,0.05)' : 'white',
                  color: 'var(--ink)',
                }}
              >
                <span className="font-medium">v{vRow.version_number ?? '—'}</span>
                <span className="ml-1.5" style={{ color: statusColor }}>
                  {vRow.status?.replace('_', ' ')}
                </span>
                <p className="mt-0.5 truncate" style={{ color: 'var(--neutral)' }}>
                  {vRow.change_summary ?? 'No summary'}
                </p>
              </a>
            )
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {!version ? (
            <div className="rounded-lg border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--line)' }}>
              <p className="text-sm" style={{ color: 'var(--neutral)' }}>No pending amendment found for this Will.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    {(version as { change_summary: string | null }).change_summary ?? 'No summary provided'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                    {new Date((version as { created_at: string }).created_at).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {(version as { status: string }).status === 'pending_review' && (
                  <div className="flex gap-2 shrink-0">
                    <ApproveAmendmentButton versionId={(version as { id: string }).id} />
                    <RejectAmendmentButton versionId={(version as { id: string }).id} />
                  </div>
                )}
              </div>

              {(version as { rejection_reason: string | null }).rejection_reason && (
                <div className="rounded border px-4 py-3" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#b91c1c' }}>Rejection reason</p>
                  <p className="text-sm" style={{ color: '#7f1d1d' }}>
                    {(version as { rejection_reason: string }).rejection_reason}
                  </p>
                </div>
              )}

              {(version as { needs_review_reasons: string[] | null }).needs_review_reasons?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {((version as { needs_review_reasons: string[] }).needs_review_reasons).map((r) => (
                    <span key={r} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#fef2f2', color: '#b91c1c' }}>
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Will document text */}
              <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
                <div className="h-[3px]" style={{ background: 'var(--teal)' }} />
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed px-6 py-6" style={{ color: 'var(--ink)' }}>
                  {(version as { document_text: string | null }).document_text ?? 'No document text available for this version.'}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
