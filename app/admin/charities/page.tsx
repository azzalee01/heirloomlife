import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHostUser } from '@/src/lib/appointments/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import NewPartnerForm from './_components/NewPartnerForm'
import PartnerActiveToggle from './_components/PartnerActiveToggle'

export const metadata: Metadata = { title: 'Charity partners (admin)', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// A Will counts as "completed" for partner reporting once it leaves draft
// (submitted for review, approved, or executed) — i.e. the customer committed
// the bequest, not just typed it. Draft-only wills count as "started".
const COMPLETED_STATUSES = new Set(['pending_review', 'approved', 'executed', 'live'])

type PartnerRow = {
  id: string
  name: string
  abn: string
  referral_code: string
  logo_url: string | null
  contact_email: string | null
  active: boolean
}

type BequestRow = {
  will_id: string
  charity_partner_id: string
  share_percentage: number | null
  wills: { status: string } | null
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

export default async function CharityPartnersAdminPage() {
  const host = await getHostUser()
  if (!host) notFound()

  const [partnersRes, bequestsRes] = await Promise.all([
    supabaseAdmin
      .from('charity_partners')
      .select('id, name, abn, referral_code, logo_url, contact_email, active')
      .order('name'),
    // Every partner-linked bequest, with its Will's status — the attribution engine.
    supabaseAdmin
      .from('beneficiaries')
      .select('will_id, charity_partner_id, share_percentage, wills!inner(status)')
      .not('charity_partner_id', 'is', null),
  ])

  const partners = (partnersRes.data ?? []) as PartnerRow[]
  const bequests = (bequestsRes.data ?? []) as unknown as BequestRow[]

  // Aggregate per partner: distinct wills started, distinct wills completed,
  // and total gift count.
  type Stats = { started: Set<string>; completed: Set<string>; gifts: number }
  const byPartner = new Map<string, Stats>()
  for (const b of bequests) {
    if (!b.charity_partner_id) continue
    let s = byPartner.get(b.charity_partner_id)
    if (!s) { s = { started: new Set(), completed: new Set(), gifts: 0 }; byPartner.set(b.charity_partner_id, s) }
    s.started.add(b.will_id)
    s.gifts += 1
    if (b.wills && COMPLETED_STATUSES.has(b.wills.status)) s.completed.add(b.will_id)
  }

  const totalStarted = new Set(bequests.map((b) => b.will_id)).size
  const totalCompleted = new Set(bequests.filter((b) => b.wills && COMPLETED_STATUSES.has(b.wills.status)).map((b) => b.will_id)).size
  const activeCount = partners.filter((p) => p.active).length

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Charity partners</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
          Active partners appear in the Will charity picker. Picking one records a gift-in-Will to that charity.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Partners" value={String(partners.length)} sub={`${activeCount} active`} />
        <StatCard label="Wills started" value={String(totalStarted)} sub="with a partner gift" />
        <StatCard label="Wills completed" value={String(totalCompleted)} sub="submitted or beyond" />
        <StatCard label="Gifts recorded" value={String(bequests.length)} sub="partner bequests" />
      </div>

      <NewPartnerForm />

      <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)', color: 'var(--neutral)' }}>
              <th className="text-left px-4 py-3">Charity</th>
              <th className="text-left px-4 py-3 w-36">ABN</th>
              <th className="text-left px-4 py-3 w-28">Code</th>
              <th className="text-right px-4 py-3 w-24">Started</th>
              <th className="text-right px-4 py-3 w-28">Completed</th>
              <th className="text-right px-4 py-3 w-20">Gifts</th>
              <th className="text-right px-4 py-3 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: 'var(--line)' }}>
            {partners.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sm" style={{ color: 'var(--neutral)' }}>No partners yet — add your first pilot above.</td></tr>
            ) : (
              partners.map((p) => {
                const s = byPartner.get(p.id)
                return (
                  <tr key={p.id} className="hover:bg-[var(--paper-warm)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden bg-white border" style={{ borderColor: 'var(--line)' }}>
                          {p.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.logo_url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-semibold" style={{ color: 'var(--neutral)' }}>{p.name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </span>
                        <span className="font-medium" style={{ color: 'var(--ink)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: 'var(--neutral)' }}>{p.abn}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--neutral)' }}>{p.referral_code}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--ink)' }}>{s?.started.size ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--ink)' }}>{s?.completed.size ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--ink)' }}>{s?.gifts ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <PartnerActiveToggle partnerId={p.id} active={p.active} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
