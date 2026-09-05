import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import LogoutButton from '@/src/components/LogoutButton'

// ─── DB row types ─────────────────────────────────────────────────────────────

type Will = { id: string; status: string; updated_at: string; document_text: string | null }

type Testator = {
  id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  date_of_birth: string | null
  address_line_1: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  phone_mobile: string | null
  email: string | null
  occupation: string | null
  marital_status: string | null
  has_previous_will: boolean | null
  previous_will_location: string | null
}

type Child = {
  id: string
  first_name: string | null
  date_of_birth: string | null
  is_dependent: boolean
}

type Guardian = {
  id: string
  first_name: string | null
  last_name: string | null
  relationship: string | null
  phone: string | null
  email: string | null
}

type Executor = {
  id: string
  first_name: string | null
  last_name: string | null
  relationship: string | null
  phone: string | null
  email: string | null
  address_line_1: string | null
  is_primary: boolean
}

type Asset = {
  id: string
  asset_type: string | null
  ownership_type: string | null
  description: string | null
  estimated_value: number | string | null
  property_address_line_1: string | null
  institution_name: string | null
  account_number: string | null
  policy_number: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: string | null
  vehicle_rego: string | null
}

type Beneficiary = {
  id: string
  beneficiary_type: string
  first_name: string | null
  organisation_name: string | null
  abn: string | null
  relationship: string | null
  share_percentage: number | null
}

type Gift = {
  id: string
  gift_type: string | null
  description: string | null
  cash_amount: number | string | null
  recipient_first_name: string | null
  recipient_relationship: string | null
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const MARITAL_LABELS: Record<string, string> = {
  single: 'Single',
  married: 'Married',
  domestic_partner: 'Domestic Partner',
  divorced: 'Divorced',
  separated: 'Separated',
  widowed: 'Widowed',
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  bank_account: 'Bank Account',
  superannuation: 'Superannuation',
  shares: 'Shares / Investments',
  life_insurance: 'Life Insurance',
  vehicle: 'Vehicle',
  other: 'Other',
}

const OWNERSHIP_LABELS: Record<string, string> = {
  sole: 'Sole ownership',
  joint_tenants: 'Joint tenants',
  tenants_in_common: 'Tenants in common',
}

const STATUS_CFG = {
  draft: { label: 'In Progress', bg: 'var(--paper-warm)', color: 'var(--neutral)', border: 'var(--line)' },
  pending_review: { label: 'Under Review', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  approved: { label: 'Approved', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string | null {
  if (!d) return null
  try {
    return new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

function formatValue(v: number | string | null | undefined): string | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''))
  if (isNaN(n)) return String(v)
  return '$' + n.toLocaleString('en-AU')
}

function fullName(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

function assetTitle(a: Asset): string {
  switch (a.asset_type) {
    case 'real_estate': return a.property_address_line_1 || 'Property'
    case 'bank_account': return a.institution_name || 'Bank account'
    case 'superannuation': return a.institution_name || 'Super fund'
    case 'shares': return a.institution_name || 'Shares'
    case 'life_insurance': return a.institution_name || 'Life insurance'
    case 'vehicle':
      return [a.vehicle_year, a.vehicle_make, a.vehicle_model].filter(Boolean).join(' ') || 'Vehicle'
    default: return a.description || 'Asset'
  }
}

// ─── Section layout components ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-0.5 h-4 shrink-0" style={{ backgroundColor: 'var(--teal)' }} />
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--neutral)]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-44 shrink-0 text-[var(--neutral)]">{label}</span>
      <span className="text-[var(--ink)]">{value}</span>
    </div>
  )
}

function PersonBlock({ title, badge, fields }: {
  title: string
  badge?: { label: string; bg: string; color: string }
  fields: { label: string; value?: string | null }[]
}) {
  const visible = fields.filter((f) => f.value)
  if (visible.length === 0) return null
  return (
    <div className="border border-[var(--line)] bg-[var(--paper-warm)] px-5 py-4 space-y-2.5">
      <div className="flex items-center gap-2.5 mb-3">
        <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
        {badge && (
          <span
            className="inline-flex items-center px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}
      </div>
      {visible.map((f) => (
        <Field key={f.label} label={f.label} value={f.value} />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WillSummaryPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, status, updated_at, document_text')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const will = (willRows?.[0] as Will) ?? null
  if (!will) redirect('/dashboard')

  const [testatorRes, childrenRes, guardianRes, executorRes, assetRes, beneficiaryRes, giftRes] =
    await Promise.all([
      supabase.from('testators').select('*').eq('will_id', will.id),
      supabase.from('children').select('*').eq('will_id', will.id),
      supabase.from('guardians').select('*').eq('will_id', will.id).order('order_index').limit(1),
      supabase.from('executors').select('*').eq('will_id', will.id).order('order_index'),
      supabase.from('assets').select('*').eq('will_id', will.id),
      supabase.from('beneficiaries').select('*').eq('will_id', will.id).order('order_index'),
      supabase.from('specific_gifts').select('*').eq('will_id', will.id).order('order_index'),
    ])

  const testators = (testatorRes.data ?? []) as Testator[]
  const children = (childrenRes.data ?? []) as Child[]
  const guardian = ((guardianRes.data ?? [])[0] as Guardian) ?? null
  const executors = (executorRes.data ?? []) as Executor[]
  const assets = (assetRes.data ?? []) as Asset[]
  const beneficiaries = (beneficiaryRes.data ?? []) as Beneficiary[]
  const gifts = (giftRes.data ?? []) as Gift[]

  const primary = testators.find((t) => t.marital_status !== null) ?? testators[0] ?? null
  const spouse = testators.find((t) => t.marital_status === null) ?? null

  const sc = STATUS_CFG[(will.status as keyof typeof STATUS_CFG)] ?? STATUS_CFG.draft

  const dependents = children.filter((c) => c.is_dependent)
  const totalPct = beneficiaries.reduce((s, b) => s + (b.share_percentage ?? 0), 0)

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <header className="bg-[var(--paper)] border-b border-[var(--line)] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight shrink-0"
            style={{
              color: 'var(--teal)',
              fontFamily: "var(--font-display)",
              fontStyle: 'italic',
            }}
          >
            Heirloom Life
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-[var(--neutral)] hover:text-[var(--ink)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Will header */}
        <div className="bg-white border border-[var(--line)] overflow-hidden">
          <div className="h-px w-full" style={{ backgroundColor: 'var(--teal)' }} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-[var(--ink)]">Will Summary</h1>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border"
                  style={{ backgroundColor: sc.bg, color: sc.color, borderColor: sc.border }}
                >
                  {sc.label}
                </span>
              </div>
              <p className="text-sm text-[var(--neutral)] mt-1">
                Last updated {formatDate(will.updated_at)}
              </p>
            </div>
            <Link
              href={`/will/new?willId=${will.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white shrink-0 transition-colors self-start sm:self-auto"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              Edit Will
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* AI-drafted will document */}
        {will.document_text && (
          <div className="bg-white border border-[var(--line)] overflow-hidden">
            <div className="px-6 py-5">
              <Section title="Drafted Will Document">
                <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--ink)] leading-relaxed">
                  {will.document_text}
                </pre>
              </Section>
            </div>
          </div>
        )}

        {/* Document body */}
        <div className="bg-white border border-[var(--line)] divide-y divide-[var(--line)]">

          {/* Your Details */}
          {primary && (
            <div className="px-6 py-6 space-y-4">
              <Section title="Your Details">
                <div className="space-y-2.5">
                  <Field label="Full name" value={fullName(primary.first_name, primary.middle_name, primary.last_name)} />
                  <Field label="Date of birth" value={formatDate(primary.date_of_birth)} />
                  <Field label="Occupation" value={primary.occupation} />
                  <Field label="Mobile" value={primary.phone_mobile} />
                  <Field label="Email" value={primary.email} />
                  <Field label="Address" value={[primary.address_line_1, primary.suburb, primary.state, primary.postcode].filter(Boolean).join(', ')} />
                  <Field label="Marital status" value={MARITAL_LABELS[primary.marital_status ?? ''] ?? null} />
                  <Field label="Previous will" value={primary.has_previous_will === true ? `Yes${primary.previous_will_location ? `  -  ${primary.previous_will_location}` : ''}` : primary.has_previous_will === false ? 'No' : null} />
                </div>
              </Section>
            </div>
          )}

          {/* Spouse / Partner */}
          {spouse && (
            <div className="px-6 py-6 space-y-4">
              <Section title="Spouse / Partner">
                <div className="space-y-2.5">
                  <Field label="Full name" value={fullName(spouse.first_name, spouse.middle_name, spouse.last_name)} />
                  <Field label="Date of birth" value={formatDate(spouse.date_of_birth)} />
                  <Field label="Occupation" value={spouse.occupation} />
                  <Field label="Mobile" value={spouse.phone_mobile} />
                  <Field label="Email" value={spouse.email} />
                  <Field label="Address" value={[spouse.address_line_1, spouse.suburb, spouse.state, spouse.postcode].filter(Boolean).join(', ')} />
                  <Field label="Previous will" value={spouse.has_previous_will === true ? `Yes${spouse.previous_will_location ? `  -  ${spouse.previous_will_location}` : ''}` : spouse.has_previous_will === false ? 'No' : null} />
                </div>
              </Section>
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div className="px-6 py-6">
              <Section title="Children">
                <div className="space-y-3">
                  {children.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--paper-warm)] px-5 py-3.5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {c.first_name || `Child ${i + 1}`}
                        </p>
                        {c.date_of_birth && (
                          <p className="text-xs text-[var(--neutral)] mt-0.5">
                            Born {formatDate(c.date_of_birth)}
                          </p>
                        )}
                      </div>
                      {c.is_dependent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                          Dependent
                        </span>
                      )}
                    </div>
                  ))}

                  {dependents.length > 0 && guardian && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--neutral)] mb-2.5">
                        Guardian for Minor Children
                      </p>
                      <PersonBlock
                        title={fullName(guardian.first_name, guardian.last_name) || 'Guardian'}
                        fields={[
                          { label: 'Relationship', value: guardian.relationship },
                          { label: 'Phone', value: guardian.phone },
                          { label: 'Email', value: guardian.email },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* Executors */}
          {executors.length > 0 && (
            <div className="px-6 py-6">
              <Section title="Executors">
                <div className="space-y-3">
                  {executors.map((e) => (
                    <PersonBlock
                      key={e.id}
                      title={fullName(e.first_name, e.last_name) || 'Unnamed'}
                      badge={
                        e.is_primary
                          ? { label: 'Primary', bg: 'var(--teal-deep)', color: '#fff' }
                          : { label: 'Alternate', bg: 'var(--paper-warm)', color: 'var(--neutral)' }
                      }
                      fields={[
                        { label: 'Relationship', value: e.relationship },
                        { label: 'Phone', value: e.phone },
                        { label: 'Email', value: e.email },
                        { label: 'Address', value: e.address_line_1 },
                      ]}
                    />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* Assets */}
          {assets.length > 0 && (
            <div className="px-6 py-6">
              <Section title="Assets">
                <div className="space-y-3">
                  {assets.map((a) => {
                    const typeLabel = ASSET_TYPE_LABELS[a.asset_type ?? ''] ?? 'Asset'
                    const title = assetTitle(a)
                    const value = formatValue(a.estimated_value)
                    const ownership = OWNERSHIP_LABELS[a.ownership_type ?? ''] ?? null

                    const extraFields: { label: string; value?: string | null }[] = []
                    if (a.asset_type === 'bank_account' && a.account_number)
                      extraFields.push({ label: 'Account number', value: a.account_number })
                    if ((a.asset_type === 'life_insurance' || a.asset_type === 'superannuation') && a.policy_number)
                      extraFields.push({ label: 'Policy / member no.', value: a.policy_number })
                    if (a.asset_type === 'vehicle' && a.vehicle_rego)
                      extraFields.push({ label: 'Registration', value: a.vehicle_rego })
                    if (a.description && a.asset_type === 'other')
                      extraFields.push({ label: 'Description', value: a.description })

                    return (
                      <div key={a.id} className="border border-[var(--line)] bg-[var(--paper-warm)] px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--neutral)]">
                              {typeLabel}
                            </p>
                            <p className="text-sm font-semibold text-[var(--ink)] mt-0.5">{title}</p>
                          </div>
                          {value && (
                            <p className="text-sm font-bold shrink-0" style={{ color: 'var(--teal)' }}>
                              {value}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {ownership && <Field label="Ownership" value={ownership} />}
                          {extraFields.map((f) => (
                            <Field key={f.label} label={f.label} value={f.value} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            </div>
          )}

          {/* Beneficiaries */}
          {beneficiaries.length > 0 && (
            <div className="px-6 py-6">
              <Section title="Beneficiaries">
                <div className="space-y-2.5">
                  {beneficiaries.map((b) => {
                    const name = b.beneficiary_type === 'organisation' ? b.organisation_name : b.first_name
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-3 border border-[var(--line)] bg-[var(--paper-warm)] px-5 py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: 'var(--teal)' }}
                          >
                            {(name ?? '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--ink)]">{name ?? 'Unnamed'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {b.relationship && <p className="text-xs text-[var(--neutral)]">{b.relationship}</p>}
                              {b.abn && <p className="text-xs text-[var(--neutral)]">ABN {b.abn}</p>}
                            </div>
                          </div>
                        </div>
                        {b.share_percentage != null && (
                          <span
                            className="inline-flex items-center px-3 py-1 text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: 'var(--teal)' }}
                          >
                            {b.share_percentage}%
                          </span>
                        )}
                      </div>
                    )
                  })}

                  <div className="flex justify-between items-center pt-2 px-1">
                    <p className="text-sm font-semibold text-[var(--neutral)]">Total allocation</p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: Math.abs(totalPct - 100) < 0.01 ? 'var(--teal)' : '#d97706' }}
                    >
                      {totalPct.toFixed(totalPct % 1 === 0 ? 0 : 2)}%
                      {Math.abs(totalPct - 100) < 0.01 ? '' : '  -  should total 100%'}
                    </p>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* Specific Gifts */}
          {gifts.length > 0 && (
            <div className="px-6 py-6">
              <Section title="Specific Gifts">
                <div className="space-y-2.5">
                  {gifts.map((g) => {
                    const isCash = g.gift_type === 'cash'
                    return (
                      <div
                        key={g.id}
                        className="border border-[var(--line)] bg-[var(--paper-warm)] px-5 py-4 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--neutral)] mb-1">
                            {isCash ? 'Cash' : 'Item / Property'}
                          </p>
                          {isCash && g.cash_amount && (
                            <p className="text-sm font-bold" style={{ color: 'var(--teal)' }}>
                              {formatValue(g.cash_amount)}
                            </p>
                          )}
                          {!isCash && g.description && (
                            <p className="text-sm font-semibold text-[var(--ink)]">{g.description}</p>
                          )}
                          {g.recipient_first_name && (
                            <p className="text-sm text-[var(--neutral)] mt-1">
                              To{' '}
                              <span className="font-medium text-[var(--ink)]">{g.recipient_first_name}</span>
                              {g.recipient_relationship && ` (${g.recipient_relationship})`}
                            </p>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                          <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              </Section>
            </div>
          )}

          {/* Legal note */}
          <div className="px-6 py-5">
            <div className="border border-amber-100 bg-amber-50 px-5 py-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-bold">Important:</span> This is a summary of the
                information you have provided. A qualified solicitor will review your will before
                it is finalised. Please ensure all details are accurate before submitting.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
