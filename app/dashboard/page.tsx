// app/dashboard/page.tsx
// Full dashboard restyle  -  Donna platform UX, Heirloom brand tokens.
// Replaces the existing page.tsx entirely.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr';
import { supabaseAdmin } from '@/src/lib/supabase-server';
import LogoutButton from '@/src/components/LogoutButton';
import IntroAnimationLoader from './_components/IntroAnimationLoader';
import PlanCTA from './_components/PlanCTA';
import PartnerShareCard from './_components/PartnerShareCard';
import { hasVaultBenefits } from '@/src/lib/entitlements';

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
  has_death_benefit_nomination: boolean | null
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

type ConnectedAccountRow = {
  id: string
  institution_name: string | null
  account_name: string | null
  account_type: string | null
  balance: number | null
  currency: string
  last_synced_at: string | null
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
  draft:          { label: 'In Progress', badge: { background: 'var(--paper-warm)', color: 'var(--ink)' },   description: 'Your will is in progress  -  keep going to protect your estate.', cta: 'Continue', href: '/will/new' },
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
    case 'bank_account':   return a.description || 'Bank account';
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
  will: 'One-off Will',
  vault: 'Heirloom Membership',
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
  const bankConnected = sp.bank_connected === 'true';
  const bankError = typeof sp.bank_error === 'string' ? sp.bank_error : null;

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';

  const { data: willRows } = await supabase
    .from('wills').select('id, status, updated_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);

  const will = (willRows?.[0] as Will) ?? null;

  const [{ data: profileRow }, { data: coupleCodes }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('plan, plan_status, vault_access_until')
      .eq('id', user.id)
      .single(),
    supabaseAdmin
      .from('couple_discount_codes')
      .select('code, product, discount_cents, expires_at, used_at')
      .eq('generator_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const plan = (profileRow?.plan as string) ?? 'free';
  const planStatus = (profileRow?.plan_status as string | null) ?? null;
  const vaultBenefitsActive = hasVaultBenefits(profileRow);
  const vaultAccessUntil = profileRow?.vault_access_until
    ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(profileRow.vault_access_until as string))
    : null;

  const { data: connectedAccountsData } = await supabaseAdmin
    .from('connected_accounts')
    .select('id, institution_name, account_name, account_type, balance, currency, last_synced_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  const connectedAccounts: ConnectedAccountRow[] = (connectedAccountsData ?? []) as ConnectedAccountRow[]

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
      supabase.from('assets').select('id, asset_type, description, estimated_value, property_address_line_1, institution_name, vehicle_make, vehicle_model, vehicle_year, has_death_benefit_nomination').eq('will_id', will.id),
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
  const progressSteps = [
    { label: 'About you', step: 'personal', done: personalDone, ready: true, show: true },
    { label: 'Partner', step: 'spouse', done: spouseDone, ready: personalDone, show: maritalStatus === 'married' || maritalStatus === 'domestic_partner' },
    { label: 'Children', step: 'children', done: childrenDone, ready: personalDone, show: true },
    { label: 'Executors', step: 'executors', done: executors.length > 0, ready: personalDone, show: true },
    { label: 'Assets', step: 'assets', done: assets.length > 0, ready: personalDone, show: true },
    { label: 'Beneficiaries', step: 'beneficiaries', done: beneficiaries.length > 0, ready: personalDone, show: true },
    { label: 'Specific gifts', step: 'gifts', done: giftsDone, ready: personalDone, show: true },
    { label: 'Wishes & trusts', step: 'wishes', done: wishesDone, ready: personalDone, show: true },
  ].filter((step) => step.show)
  const completedSteps = progressSteps.filter((step) => step.done).length
  const progressPercent = Math.round((completedSteps / progressSteps.length) * 100)
  const nextStep = progressSteps.find((step) => !step.done && step.ready) ?? progressSteps.find((step) => !step.done)
  const visibleAssets = assets.slice(0, 5)
  const visibleBeneficiaries = beneficiaries.slice(0, 4)
  const visibleExecutors = executors.slice(0, 2)

  const bdbnNudges = assets.filter(
    a => (a.asset_type === 'superannuation' || a.asset_type === 'life_insurance') && a.has_death_benefit_nomination === false
  )

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden" style={{ background: 'var(--paper)' }}>
      <IntroAnimationLoader />

      {/* Page header  -  glass material: content scrolls under the translucent chrome */}
      <header
        className="sticky top-0 z-20 border-b px-6 h-14 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--line)',
        }}
      >
        <h1 className="text-lg sm:text-base font-medium" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
          Hi, {firstName}
        </h1>
        <div className="flex items-center gap-3">
          {will && (
            <Link href={sc.href} className="btn btn-glass-primary hidden items-center gap-2 px-3 py-1.5 text-xs font-semibold sm:inline-flex">
              {sc.cta} →
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">

        {/* ── Payment success banner ────────────────────────────────────────── */}
        {paymentSuccess && (
          <div
            className="rounded-lg border px-5 py-4 flex items-start gap-3"
            style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}
          >
            <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: '#166534' }}>
                Payment received — your Will document will be available to download below shortly.
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#166534', opacity: 0.8 }}>
                If it doesn&apos;t appear, refresh the page in a moment.
              </p>
            </div>
          </div>
        )}

        {/* ── Partner discount share cards ─────────────────────────────────── */}
        {(coupleCodes ?? []).map((c) => (
          <PartnerShareCard
            key={c.code as string}
            code={c.code as string}
            product={c.product as 'will' | 'vault'}
            discountCents={c.discount_cents as number}
            expiresAt={c.expires_at as string}
            usedAt={c.used_at as string | null}
          />
        ))}

        {/* ── Bank connection success / error banners ───────────────────────── */}
        {bankConnected && (
          <div className="rounded-lg border px-5 py-4 flex items-start gap-3" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#166534' }}>Bank account connected successfully.</p>
          </div>
        )}
        {bankError && (
          <div className="rounded-lg border px-5 py-4 flex items-start gap-3" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <p className="text-sm font-medium" style={{ color: '#991b1b' }}>
              {bankError === 'sync_failed' ? 'Account connected but balance sync failed — try again shortly.' : 'Could not complete bank connection. Please try again.'}
            </p>
          </div>
        )}

        {/* ── Will download card — shown once Will is paid ──────────────────── */}
        {will && plan === 'will' && planStatus === 'active' && (
          <div
            className="rounded-lg border-2 overflow-hidden"
            style={{ borderColor: 'var(--teal)' }}
          >
            <div
              className="px-5 py-1.5 text-center text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              Ready to download
            </div>
            <div className="px-5 py-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)', fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  Your Will is ready
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--neutral)' }}>
                  Print and sign with two witnesses present to make it legally valid.
                </p>
              </div>
              <a
                href="/api/will/download"
                className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download Will
              </a>
            </div>
          </div>
        )}

        {/* ── Will status card ──────────────────────────────────────────────── */}
        {!will ? (
          // Empty state  -  Donna-style dashed card
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
              <Link href={sc.href} className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border px-3 py-1.5 text-xs font-semibold sm:self-auto" style={{ borderColor: 'var(--teal)', color: 'var(--teal-deep)', background: 'rgba(42,180,174,.08)' }}>
                {sc.cta} →
              </Link>
            </div>
          </div>
        )}

        {will && (
          <Link href="/dashboard/life-events" className="group flex flex-col gap-3 rounded-lg border bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--paper-warm)', color: 'var(--teal-deep)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z" /><path d="M12 8v6M9 11h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Has something changed in your life?</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--neutral)' }}>Marriage, children, property and other changes may affect your estate plan.</p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--teal)' }}>Report a life change →</span>
          </Link>
        )}

        {/* ── BDBN nudge — superannuation / life insurance with no nomination ── */}
        {will && bdbnNudges.length > 0 && (
          <div className="rounded-lg border px-5 py-4 flex gap-3" style={{ borderColor: '#fbbf24', background: '#fffbeb' }}>
            <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                {bdbnNudges.length === 1
                  ? `${assetLabel(bdbnNudges[0])} — no binding nomination on file`
                  : `${bdbnNudges.length} assets have no binding nomination on file`}
              </p>
              <p className="mt-1 text-xs leading-5" style={{ color: '#78350f' }}>
                {bdbnNudges.length === 1
                  ? `${bdbnNudges[0].asset_type === 'life_insurance' ? 'Life insurance' : 'Superannuation'} sits outside your Will. Your fund trustee has full discretion over who receives this money unless you lodge a Binding Death Benefit Nomination directly with your fund.`
                  : 'Superannuation and life insurance sit outside your Will. The trustee of each fund has full discretion over who receives the money unless you lodge a Binding Death Benefit Nomination directly with them.'}
              </p>
              {bdbnNudges.length > 1 && (
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {bdbnNudges.map(a => (
                    <li key={a.id} className="text-xs font-medium" style={{ color: '#92400e' }}>· {assetLabel(a)}</li>
                  ))}
                </ul>
              )}
              <Link href="/learn/superannuation" className="mt-2 inline-block text-xs font-semibold" style={{ color: '#b45309' }}>
                What is a Binding Death Benefit Nomination? →
              </Link>
            </div>
          </div>
        )}

        {/* ── Connected accounts ────────────────────────────────────────────── */}
        {will && (
          <section>
            <div className="mb-2 flex items-center justify-between px-0.5">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                Connected accounts
              </p>
              {connectedAccounts.length > 0 && (
                <Link href="/dashboard/bank-connect" className="min-h-[44px] sm:min-h-0 inline-flex items-center text-xs font-medium" style={{ color: 'var(--teal)' }}>
                  + Add account
                </Link>
              )}
            </div>

            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--line)', background: 'white' }}>
              {/* Bank accounts row */}
              <div className="px-4 py-3.5 flex items-start gap-3" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: '#f0fdf4' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 10h18M3 14h18M5 6l7-3 7 3M4 10v10M20 10v10M8 10v10M12 10v10M16 10v10" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Bank accounts</p>
                  {connectedAccounts.length === 0 ? (
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--neutral)' }}>No accounts connected yet.</p>
                  ) : (
                    <ul className="mt-1.5 space-y-1.5">
                      {connectedAccounts.map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-4">
                          <span className="text-xs truncate" style={{ color: 'var(--neutral)' }}>
                            {a.account_name ?? 'Account'}
                            {a.account_type && <span className="ml-1.5 capitalize" style={{ color: 'var(--neutral)', opacity: 0.6 }}>· {a.account_type}</span>}
                          </span>
                          {a.balance != null && (
                            <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--ink)' }}>
                              ${a.balance.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {connectedAccounts.length === 0 && (
                  <Link
                    href="/dashboard/bank-connect"
                    className="shrink-0 self-center min-h-[44px] sm:min-h-0 inline-flex items-center text-xs font-semibold"
                    style={{ color: 'var(--teal)' }}
                  >
                    Connect →
                  </Link>
                )}
              </div>

              {/* Superannuation — coming soon */}
              <div className="px-4 py-3.5 flex items-start gap-3" style={{ opacity: 0.55 }}>
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: '#fffbeb' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Superannuation</p>
                    <span
                      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: 'var(--paper-warm)', color: 'var(--neutral)' }}
                    >
                      Coming soon
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
                    Live balance linking coming soon. Add your fund manually in your estate register in the meantime.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Estate + people: mirrors the landing-page platform preview ───── */}
        {will && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">

            {/* Estate */}
            <section>
              <div className="mb-2 flex items-center justify-between px-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                  Your Estate
                </p>
                <Link href="/will/new?step=assets" className="min-h-[44px] sm:min-h-0 inline-flex items-center text-xs font-medium" style={{ color: 'var(--teal)' }}>
                  Manage
                </Link>
              </div>

              {assets.length === 0 ? (
                <div className="m-4 rounded-lg border-2 border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--neutral)' }}>No assets added yet</p>
                  <Link href="/will/new?step=assets" className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
                    Add your assets →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {visibleAssets.map((a) => {
                    const cfg = ASSET_CFG[a.asset_type ?? ''] ?? ASSET_CFG.other;
                    const value = formatValue(a.estimated_value);
                    return (
                      <div
                        key={a.id}
                        className="min-w-0 rounded-lg border bg-white p-3"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <div
                          className="mb-2 flex h-7 w-7 items-center justify-center rounded-md"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Icon d={cfg.d} color={cfg.color} size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.typeLabel}</p>
                          <p className="mt-0.5 truncate text-xs font-semibold" style={{ color: 'var(--ink)' }}>
                            {assetLabel(a)}
                          </p>
                          {value && <p className="mt-0.5 text-xs font-semibold" style={{ color: 'var(--ink)' }}>{value}</p>}
                        </div>
                      </div>
                    );
                  })}
                  <Link
                    href="/will/new?step=assets"
                    className="flex min-h-[94px] items-center justify-center rounded-lg border-2 border-dashed p-3 text-center text-xs font-semibold"
                    style={{ borderColor: 'var(--line)', color: 'var(--teal)' }}
                  >
                    <span>{assets.length > visibleAssets.length ? `View all ${assets.length} assets →` : '+ Add asset'}</span>
                  </Link>
                </div>
              )}
            </section>

            {/* People */}
            <section>
              <div className="mb-2 flex items-center justify-between px-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--neutral)' }}>
                  Your People
                </p>
                <Link href="/will/new?step=beneficiaries" className="min-h-[44px] sm:min-h-0 inline-flex items-center text-xs font-medium" style={{ color: 'var(--teal)' }}>
                  Manage
                </Link>
              </div>

              <div className="space-y-2">
                {beneficiaries.length === 0 && executors.length === 0 ? (
                  <div className="m-4 rounded-lg border-2 border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}>
                    <p className="text-sm mb-3" style={{ color: 'var(--neutral)' }}>No people added yet</p>
                    <Link href="/will/new?step=beneficiaries" className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
                      Add beneficiaries →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                    {beneficiaries.length > 0 && (
                      <>
                        {visibleBeneficiaries.map((b) => {
                          const name = b.beneficiary_type === 'organisation' ? (b.organisation_name ?? 'Organisation') : (b.first_name ?? 'Unnamed');
                          return (
                            <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5" style={{ borderColor: 'var(--line)' }}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: 'var(--teal)' }}
                                >
                                  {name[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{name}</p>
                                  <p className="text-xs" style={{ color: 'var(--neutral)' }}>{b.relationship || 'Beneficiary'}</p>
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
                        {visibleExecutors.map((e) => {
                          const name = [e.first_name, e.last_name].filter(Boolean).join(' ') || 'Unnamed';
                          return (
                            <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5" style={{ borderColor: 'var(--line)' }}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: e.is_primary ? 'var(--teal-deep)' : 'var(--ink)' }}
                                >
                                  {name[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{name}</p>
                                  <p className="text-xs" style={{ color: 'var(--neutral)' }}>{e.relationship || 'Executor'}</p>
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
                    </div>
                  </>
                )}

                <Link
                  href="/will/new?step=beneficiaries"
                  className="flex items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 text-xs font-semibold"
                  style={{ borderColor: 'var(--line)', color: 'var(--teal)' }}
                >
                  <span>{beneficiaries.length > visibleBeneficiaries.length || executors.length > visibleExecutors.length ? 'View all people →' : '+ Add person'}</span>
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ── Setup progress, intentionally secondary to the estate snapshot ─ */}
        {will && completedSteps < progressSteps.length && (
          <div className="rounded-lg border bg-white px-5 py-4" style={{ borderColor: 'var(--line)' }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Complete your Will</p>
                  <span className="text-xs font-medium" style={{ color: 'var(--neutral)' }}>{completedSteps}/{progressSteps.length}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--paper-warm)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: 'var(--teal)' }} />
                </div>
              </div>
              {nextStep && (
                <Link
                  href={`/will/new?step=${nextStep.step}`}
                  className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1 rounded-lg sm:rounded-none bg-[var(--teal-light)] sm:bg-transparent px-4 sm:px-0 py-3 sm:py-0 text-sm sm:text-xs font-semibold"
                  style={{ color: 'var(--teal-deep)' }}
                >
                  Continue: {nextStep.label} →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Plan status / upgrade, below the core dashboard ─────────────── */}
        {will && plan !== 'free' && planStatus && (
          <div id="upgrade" className="flex items-center justify-between gap-3 rounded-lg border bg-white px-5 py-3" style={{ borderColor: 'var(--line)' }}>
            <div className="min-w-0">
              <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{PLAN_LABELS[plan] ?? plan}</span>
              {PLAN_STATUS_LABELS[planStatus] && (
                <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold" style={{ background: PLAN_STATUS_LABELS[planStatus].bg, color: PLAN_STATUS_LABELS[planStatus].color }}>
                  {PLAN_STATUS_LABELS[planStatus].label}
                </span>
              )}
              {plan === 'will' && vaultBenefitsActive && vaultAccessUntil && (
                <span className="ml-2 text-xs" style={{ color: 'var(--neutral)' }}>Full Vault benefits until {vaultAccessUntil}</span>
              )}
            </div>
            {plan === 'will' && <Link href="/pricing#living-vault" className="shrink-0 text-xs font-semibold" style={{ color: 'var(--teal)' }}>{vaultBenefitsActive ? 'Keep benefits →' : 'Join annually →'}</Link>}
          </div>
        )}

        {will && (plan === 'free' || (plan === 'will' && !vaultBenefitsActive)) && (
          <div id="upgrade">
            <PlanCTA />
          </div>
        )}

      </main>
    </div>
  );
}
