import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import ClauseStatusButton from './_components/ClauseStatusButton'

const STATUS_STYLE: Record<string, { background: string; color: string; label: string }> = {
  draft:      { background: '#fffbeb', color: '#92400e', label: 'Draft' },
  production: { background: '#ecfdf5', color: '#065f46', label: 'Production' },
  retired:    { background: 'var(--paper-warm)', color: 'var(--neutral)', label: 'Retired' },
}

export default async function ClausesAdminPage() {
  const host = await getHostUser()
  if (!host) notFound()

  const { data } = await supabaseAdmin
    .from('clause_versions')
    .select('id, version, status, clause_text, clauses(clause_code, name, jurisdiction)')
    .order('clause_code')

  type Row = {
    id: string
    version: number
    status: string
    clause_text: string
    clauses: { clause_code: string; name: string; jurisdiction: string } | null
  }

  const rows = (data ?? []) as unknown as Row[]
  const draftCount = rows.filter((r) => r.status === 'draft').length
  const prodCount = rows.filter((r) => r.status === 'production').length

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Clause library</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 rounded-full font-medium" style={{ background: '#ecfdf5', color: '#065f46' }}>
            {prodCount} production
          </span>
          <span className="px-2 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#92400e' }}>
            {draftCount} draft
          </span>
        </div>
      </div>

      <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)', color: 'var(--neutral)' }}>
              <th className="text-left px-4 py-3 w-36">Code</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3 w-24">Version</th>
              <th className="text-left px-4 py-3 w-28">Status</th>
              <th className="text-left px-4 py-3 w-28">Preview</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: 'var(--line)' }}>
            {rows.map((row) => {
              const style = STATUS_STYLE[row.status] ?? STATUS_STYLE.draft
              return (
                <tr key={row.id} className="hover:bg-[var(--paper-warm)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--ink)' }}>
                    {row.clauses?.clause_code ?? '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>
                    {row.clauses?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--neutral)' }}>
                    v{row.version}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: style.background, color: style.color }}>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs truncate" style={{ color: 'var(--neutral)' }}>
                      {row.clause_text.slice(0, 80)}…
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status !== 'retired' && (
                      <ClauseStatusButton versionId={row.id} currentStatus={row.status} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
