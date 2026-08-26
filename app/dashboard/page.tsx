// app/dashboard/page.tsx
// Full dashboard restyle — Donna platform UX, Heirloom brand tokens.
// Replaces the existing page.tsx entirely.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { supabaseAdmin } from '@/src/lib/supabase-server';
import LogoutButton from '@/src/components/LogoutButton';
import AiChat from './_components/AiChat';
import IntroAnimationLoader from './_components/IntroAnimationLoader';
import PlanCTA from './_components/PlanCTA';

// ─── DB row types ─────────────────────────────────────────────────────────────
type Will = { id: string; status: string; updated_at: string }

type AssetRow = {
  id: string
  asset_type: string | null
  description: string | null
  estimated_value: number | string | null
  property_address_line_1: string | null
  institution_name: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: string | null
}

type BeneficiaryRow = {
  id: string
  beneficiary_type: string
  first_name: string | null
  organisation_name: string | null
  relationship: string | null
  share_percentage: number | null
}

type ExecutorRow = {
  id: string
  first_name: string | null
  last_name: string | null
  relationship: string | null
  is_primary: boolean
}

// ─── Asset config ─────────────────────────────────────────────────────────────
const ASSET_CFG: Record<string, { typeLabel: string; color: string; bg: string; d: string }> = {
  real_estate:    { typeLabel: 'Real Estate',    color: 'var(--teal)',     bg: 'var(--paper-warm)', d: 'M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9' },
  vehicle:        { typeLabel: 'Vehicle',        color: '#3b82f6',         bg: '#eff6ff',           d: 'M7 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM5 17H3v-4l2-5h14l2 5v4h-2M5 17h14' },
  bank_account:   { typeLabel: 'Bank Account',   color: '#10b981',         bg: '#f0fdf4',           d: 'M3 10h18M3 14h18M5 6l7-3 7 3M4 10v10M20 10v10M8 10v10M12 10v10M16 10v10' },
  superannuation: { typeLabel: 'Superannuation', color: '#f59e0b',         bg: '#fffbeb',           d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  shares:         { typeLabel: 'Shares',         color: '#8b5cf6',         bg: '#f5f3ff',           d: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  life_insurance: { typeLabel: 'Life Insurance', color: '#ec4899',         bg: '#fdf2f8',           d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  other:          { typeLabel: 'Other Asset',    color: 'var(--neutral)',  bg: 'var(--paper-warm)', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
}

const STATUS_CFG = {
  draft:          { label: 'In Progress', badge: { background: 'var(--paper-warm)', color: 'var(--ink)' },   description: 'Your will is in progress — keep going to protect your estate.', cta: 'Continue', href: '/will/new' },
  pending_review: { label: 'Under Review', badge: { background: '#fffbeb', color: '#92400e' },               description: 'Submitted and being reviewed by our legal team.', cta: 'View Summary', href: '/will/summary' },
  approved:       { label: 'Approved', badge: { background: '#ecfdf5', color: '#065f46' },                   description: 'Your will has been approved and is ready to sign.', cta: 'View Will', href: '/will/summary' },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function assetLabel(a: AssetRow): string {
  switch (a.asset_type) {
    case 'real_estate':    return a.property_address_line_1 || 'Property';
    case 'bank_account':   return a.institution_name || 'Bank account';
    case 'superannuation': return a.institution_name || 'Super fund';
    case 'shares':         return a.institution_name || 'Shares';
    case 'life_insurance': return a.institution_name || 'Life insurance';
    case 'vehicle':        return [a.vehicle_year, a.vehicle_make, a.vehicle_model].filter(Boolean).join(' ') || 'Vehicle';
    default:               return a.description || 'Asset';
  }
}

function formatValue(v: number | string | null): string | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return String(v);
  return '$' + n.toLocaleString('en-AU');
}

function Icon({ d, color, size = 18 }: { d: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ─── Plan status config ───────────────────────────────────────────────────────
const PLAN_LABELS: Record<string, string> = {
  will: 'Will Document',
  vault: 'Living Vault',
}

const PLAN_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',    bg: '#ecfdf5', color: '#065f46' },
  past_due:  { label: 'Past due',  bg: '#fffbeb', color: '#92400e' },
  cancelled: { label: 'Cancelled', bg: 'var(--paper-warm)', color: 'var(--neutral)' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const sp = await searchParams;
  const paymentSuccess = sp.payment === 'success';

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';

  const { data: willRows } = await supabase
    .from('wills').select('id, status, updated_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);

  const will = (willRows?.[0] as Will) ?? null;

  const { data: profileRow } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', user.id)
    .single();

  const plan = (profileRow?.plan as string) ?? 'free';
  const planStatus = (profileRow?.plan_status as string | null) ?? null;

  let assets: AssetRow[] = [];
  let beneficiaries: BeneficiaryRow[] = [];
  let executors: ExecutorRow[] = [];

  let personalDone = false
  let spouseDone = false
  let childrenDone = false
  let giftsDone = false
  let wishesDone = false
  let maritalStatus: string | null = null

  if (will) {
    const [aRes, bRes, eRes, tRes, cRes, gRes, wRes] = await Promise.all([
      supabase.from('assets').select('id, asset_type, description, estimated_value, property_address_line_1, institution_name, vehicle_make, vehicle_model, vehicle_year').eq('will_id', will.id),
      supabase.from('beneficiaries').select('id, beneficiary_type, first_name, organisation_name, relationship, share_percentage').eq('will_id', will.id).order('order_index'),
      supabase.from('executors').select('id, first_name, last_name, relationship, is_primary').eq('will_id', will.id).order('order_index'),
      supabase.from('testators').select('first_name, marital_status').eq('will_id', will.id),
      supabase.from('children').select('id', { count: 'exact', head: true }).eq('will_id', will.id),
      supabase.from('specific_gifts').select('id', { count: 'exact', head: true }).eq('will_id', will.id),
      supabase.from('wills').select('survivorship_days, pet_care').eq('id', will.id).single(),
    ]);
    assets        = (aRes.data ?? []) as AssetRow[];
    beneficiaries = (bRes.data ?? []) as BeneficiaryRow[];
    executors     = (eRes.data ?? []) as ExecutorRow[];

    const primaryTestator = (tRes.data ?? []).find((t: { first_name: string | null; marital_status: string | null }) => t.marital_status !== null) ?? (tRes.data ?? [])[0]
    personalDone  = !!(primaryTestator as { first_name: string | null } | undefined)?.first_name
    maritalStatus = (primaryTestator as { marital_status: string | null } | undefined)?.marital_status ?? null
    spouseDone    = !!(tRes.data ?? []).find((t: { marital_status: string | null }) => t.marital_status === null && (t as { first_name?: string | null }).first_name)
    childrenDone  = (cRes.count ?? 0) > 0
    giftsDone     = (gRes.count ?? 0) > 0
    wishesDone    = !!(wRes.data?.survivorship_days)
  }

  const sc = STATUS_CFG[(will?.status as keyof typeof STATUS_CFG) ?? 'draft'] ?? STATUS_CFG.draft;

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <IntroAnimationLoader />

      {/* Page header — glass material: content scrolls under the translucent chrome */}
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--line)',
        }}
      >
        <div>
          <h1
            className="text-base font-medium"
            style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Hi, {firstName}
          </h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Payment success banner ────────────────────────────────────────── */}
        {paymentSuccess && (
          <div
            className="rounded-lg border px-5 py-4 flex items-center gap-3"
            style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#166534' }}>
              Payment received — your plan will be activated shortly.
            </p>
          </div>
        )}

        {/* ── Will status card ──────────────────────────────────────────────── */}
        {!will ? (
          // Empty state — Donna-style dashed card
          <div
            className="rounded-lg border-2 border-dashed p-12 text-center"
            style={{ borderColor: 'var(--line)' }}
          >
            <div
              className="mx-auto mb-5 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--paper-warm)' }}
            >
              <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="var(--teal)" size={22} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink)' }}>
              Start your estate plan
            </h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--neutral)' }}>
              Create a legally valid Will to protect the people and assets you care about most.
            </p>
            <Link
              href="/will/new"
              className="btn btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
            >
              Create your Will
              <Icon d="M5 12h14M12 5l7 7-7 7" color="var(--teal-deep)" size={14} />
            </Link>
          </div>
        ) : (
          // Will status card
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--line)', background: 'white' }}
          >
            {/* Teal accent bar */}
            <div className="h-[3px] w-full" style={{ backgroundColor: 'var(--teal)' }} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--paper-warm)' }}
                >
                  <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="var(--teal)" size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Your Will</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                      style={sc.badge}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--ink)' }}>{sc.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                    Last updated {formatDate(will.updated_at)}
                  </p>
                </div>
              </div>
              <Link
                href={sc.href}
                className="btn btn-glass-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold shrink-0 self-start sm:self-auto"
              >
                {sc.cta}
                <Icon d="M5 12h14M12 5l7 7-7 7" color="var(--teal-deep)" size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Step progress ─────────────────────────────────────────────────── */}
        {will && (
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--line)', background: 'white' }}
          >
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--line)', background: 'var(--paper-warm)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Will progress
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {[
                { label: 'About You',       step: 'personal',      done: personalDone,              ready: true },
                { label: 'Your Partner',    step: 'spouse',        done: spouseDone,                ready: personalDone, show: maritalStatus === 'married' || maritalStatus === 'domestic_partner' },
                { label: 'Your Children',   step: 'children',      done: childrenDone,              ready: personalDone },
                { label: 'Your Executors',  step: 'executors',     done: executors.length > 0,      ready: personalDone },
                { label: 'Your Assets',     step: 'assets',        done: assets.length > 0,         ready: personalDone },
                { label: 'Beneficiaries',   step: 'beneficiaries', done: beneficiaries.length > 0,  ready: personalDone },
                { label: 'Specific Gifts',  step: 'gifts',         done: giftsDone,                 ready: personalDone },
                { label: 'Wishes & Trusts', step: 'wishes',        done: wishesDone,                ready: personalDone },
              ]
                .filter((s) => s.show !== false)
                .map(({ label, step, done, ready }) => {
                  const status = done ? 'Completed' : ready ? 'Ready' : 'Not Started'
                  const badgeStyle = done
                    ? { background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }
                    : ready
                    ? { background: '#fffbeb', color: '#92400e' }
                    : { background: 'var(--paper-warm)', color: 'var(--neutral)' }
                  return (
                    <div key={step} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-xs font-semibold shrink-0"
                          style={badgeStyle}
                        >
                          {status}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--ink)' }}>{label}</span>
                      </div>
                      <Link
                        href={`/will/new?step=${step}`}
                        className="text-xs font-medium shrink-0"
                        style={{ color: 'var(--teal)' }}
                      >
                        {done ? 'Edit' : 'Start'} →
                      </Link>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── Plan status / upgrade CTA ─────────────────────────────────────── */}
        {will && plan !== 'free' && planStatus && (
          <div
            className="rounded-lg border px-5 py-4 flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--line)', background: 'white' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--paper-warm)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {PLAN_LABELS[plan] ?? plan}
                </span>
                {PLAN_STATUS_LABELS[planStatus] && (
                  <span
                    className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ background: PLAN_STATUS_LABELS[planStatus].bg, color: PLAN_STATUS_LABELS[planStatus].color }}
                  >
                    {PLAN_STATUS_LABELS[planStatus].label}
                  </span>
                )}
                {plan === 'will' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--neutral)' }}>
                    Upgrade to Living Vault for ongoing updates and document storage.
                  </p>
                )}
              </div>
            </div>
            {plan === 'will' && (
              <Link
                href="#upgrade"
                className="text-xs font-semibold shrink-0"
                style={{ color: 'var(--teal)' }}
              >
                Upgrade →
              </Link>
            )}
          </div>
        )}

        {will && plan === 'free' && (
          <PlanCTA />
        )}

        {/* ── Two-column grid ───────────────────────────────────────────────── */}
        {will && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Estate */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                  Your Estate
                </p>
                <Link href="/will/new?step=assets" className="text-xs font-medium" style={{ color: 'var(--teal)' }}>
                  Edit
                </Link>
              </div>

              {assets.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--neutral)' }}>No assets added yet</p>
                  <Link href="/will/new?step=assets" className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
                    Add your assets →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {assets.map((a) => {
                    const cfg = ASSET_CFG[a.asset_type ?? ''] ?? ASSET_CFG.other;
                    const value = formatValue(a.estimated_value);
                    return (
                      <div
                        key={a.id}
                        className="rounded-lg border p-4 flex flex-col gap-3"
                        style={{ borderColor: 'var(--line)', background: 'white' }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Icon d={cfg.d} color={cfg.color} size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>
                            {cfg.typeLabel}
                          </p>
                          <p className="text-sm font-semibold leading-snug mt-0.5 truncate" style={{ color: 'var(--ink)' }}>
                            {assetLabel(a)}
                          </p>
                          {value && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--ink)' }}>{value}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {/* Add asset */}
                  <Link
                    href="/will/new?step=assets"
                    className="rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] hover:border-[var(--teal)] transition-colors"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <div
                      className="w-7 h-7 rounded border-2 border-dashed flex items-center justify-center transition-colors"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      <Icon d="M12 5v14M5 12h14" color="var(--neutral)" size={12} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--neutral)' }}>Add asset</span>
                  </Link>
                </div>
              )}
            </section>

            {/* People */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                  Your People
                </p>
                <Link href="/will/new?step=beneficiaries" className="text-xs font-medium" style={{ color: 'var(--teal)' }}>
                  Edit
                </Link>
              </div>

              <div className="space-y-2">
                {beneficiaries.length === 0 && executors.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}>
                    <p className="text-sm mb-3" style={{ color: 'var(--neutral)' }}>No people added yet</p>
                    <Link href="/will/new?step=beneficiaries" className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
                      Add beneficiaries →
                    </Link>
                  </div>
                ) : (
                  <>
                    {beneficiaries.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-1 pb-1">
                          <p className="text-xs font-semibold" style={{ color: 'var(--neutral)' }}>Beneficiaries</p>
                          <Link href="/will/new?step=beneficiaries" className="text-xs font-medium" style={{ color: 'var(--teal)' }}>Edit</Link>
                        </div>
                        {beneficiaries.map((b) => {
                          const name = b.beneficiary_type === 'organisation' ? (b.organisation_name ?? 'Organisation') : (b.first_name ?? 'Unnamed');
                          return (
                            <div key={b.id} className="rounded-lg border px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--line)', background: 'white' }}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: 'var(--teal)' }}
                                >
                                  {name[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{name}</p>
                                  {b.relationship && <p className="text-xs" style={{ color: 'var(--neutral)' }}>{b.relationship}</p>}
                                </div>
                              </div>
                              {b.share_percentage != null && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white shrink-0" style={{ backgroundColor: 'var(--teal)' }}>
                                  {b.share_percentage}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}

                    {executors.length > 0 && (
                      <>
                        <div className={`flex items-center justify-between px-1 pb-1 ${beneficiaries.length > 0 ? 'pt-3' : ''}`}>
                          <p className="text-xs font-semibold" style={{ color: 'var(--neutral)' }}>Executors</p>
                          <Link href="/will/new?step=executors" className="text-xs font-medium" style={{ color: 'var(--teal)' }}>Edit</Link>
                        </div>
                        {executors.map((e) => {
                          const name = [e.first_name, e.last_name].filter(Boolean).join(' ') || 'Unnamed';
                          return (
                            <div key={e.id} className="rounded-lg border px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--line)', background: 'white' }}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: e.is_primary ? 'var(--teal-deep)' : 'var(--ink)' }}
                                >
                                  {name[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{name}</p>
                                  {e.relationship && <p className="text-xs" style={{ color: 'var(--neutral)' }}>{e.relationship}</p>}
                                </div>
                              </div>
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold shrink-0"
                                style={e.is_primary
                                  ? { background: 'rgba(42,180,174,0.1)', color: 'var(--teal-deep)' }
                                  : { background: 'var(--paper-warm)', color: 'var(--ink)' }
                                }
                              >
                                {e.is_primary ? 'Primary' : 'Alternate'}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}

                {/* Add person */}
                <Link
                  href="/will/new?step=beneficiaries"
                  className="flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 hover:border-[var(--teal)] transition-colors"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <div
                    className="w-7 h-7 rounded border-2 border-dashed flex items-center justify-center transition-colors shrink-0"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <Icon d="M12 5v14M5 12h14" color="var(--neutral)" size={12} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--neutral)' }}>Add person</span>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ── AI Chat ───────────────────────────────────────────────────────── */}
        <AiChat />

      </main>
    </div>
  );
}
