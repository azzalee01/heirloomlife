'use server'

import { supabaseAdmin } from '@/src/lib/supabase-server'
import { requireHost } from './server'

export interface SnapshotBeneficiary {
  name: string
  percentage: string
  isCharity: boolean
}

export interface WillSnapshot {
  willId: string
  // personal
  name: string
  dob: string
  address: string
  maritalStatus: string
  occupation: string
  // executors
  primaryExecutor: string
  alternateExecutor: string | null
  // distributions
  beneficiaries: SnapshotBeneficiary[]
  // assets
  assets: string[]
  // gifts
  specificGifts: string[]
  // flags
  triageFlags: string[]
  // which sections have any data
  completedSections: string[]
}

export async function getWillSnapshot(
  appointmentId: string,
): Promise<{ ok: true; snapshot: WillSnapshot } | { ok: false; error: string }> {
  try {
    await requireHost()

    const { data: appt } = await supabaseAdmin
      .from('appointments')
      .select('will_id')
      .eq('id', appointmentId)
      .maybeSingle()

    if (!appt?.will_id) return { ok: false, error: 'no_will' }
    const willId = appt.will_id as string

    const [testatorRes, executorRes, beneficiaryRes, assetRes, giftRes, willRes] = await Promise.all([
      supabaseAdmin
        .from('testators')
        .select('first_name, last_name, date_of_birth, address_line_1, suburb, state, postcode, marital_status, occupation')
        .eq('will_id', willId),
      supabaseAdmin
        .from('executors')
        .select('first_name, last_name, relationship, is_primary')
        .eq('will_id', willId)
        .order('order_index'),
      supabaseAdmin
        .from('beneficiaries')
        .select('beneficiary_type, first_name, last_name, organisation_name, share_percentage')
        .eq('will_id', willId)
        .order('order_index'),
      supabaseAdmin
        .from('assets')
        .select('asset_type, description, property_address_line_1, institution_name')
        .eq('will_id', willId),
      supabaseAdmin
        .from('specific_gifts')
        .select('gift_type, description, cash_amount, recipient_first_name')
        .eq('will_id', willId)
        .order('order_index'),
      supabaseAdmin
        .from('wills')
        .select('triage_flags')
        .eq('id', willId)
        .maybeSingle(),
    ])

    const testators = (testatorRes.data ?? []) as Record<string, unknown>[]
    const primary = testators.find((t) => t.marital_status !== null) ?? testators[0] ?? null

    const str = (v: unknown) => (v == null ? '' : String(v))

    const name = primary ? [primary.first_name, primary.last_name].filter(Boolean).join(' ') : ''
    const address = primary
      ? [primary.address_line_1, primary.suburb, primary.state, primary.postcode].filter(Boolean).join(', ')
      : ''

    const executors = (executorRes.data ?? []) as Record<string, unknown>[]
    const primaryExec = executors.find((e) => e.is_primary) ?? null
    const altExec = executors.find((e) => !e.is_primary) ?? null

    const fmtPerson = (e: Record<string, unknown> | null) =>
      e
        ? [e.first_name, e.last_name].filter(Boolean).join(' ') +
          (e.relationship ? ` (${str(e.relationship)})` : '')
        : ''

    const beneficiaries = (beneficiaryRes.data ?? []).map((b) => {
      const row = b as Record<string, unknown>
      return {
        name:
          row.beneficiary_type === 'organisation'
            ? str(row.organisation_name)
            : [row.first_name, row.last_name].filter(Boolean).join(' '),
        percentage: row.share_percentage != null ? `${row.share_percentage}%` : '',
        isCharity: row.beneficiary_type === 'organisation',
      }
    })

    const assets = (assetRes.data ?? []).map((a) => {
      const row = a as Record<string, unknown>
      const type = str(row.asset_type).replace(/_/g, ' ')
      const label = row.property_address_line_1 ?? row.institution_name ?? row.description ?? ''
      return label ? `${type}: ${str(label)}` : type
    })

    const specificGifts = (giftRes.data ?? []).map((g) => {
      const row = g as Record<string, unknown>
      return row.gift_type === 'cash'
        ? `$${str(row.cash_amount)} → ${str(row.recipient_first_name)}`
        : `${str(row.description)} → ${str(row.recipient_first_name)}`
    })

    const tf = ((willRes.data as Record<string, unknown> | null)?.triage_flags ?? {}) as Record<string, boolean>
    const FLAG_LABELS: Record<string, string> = {
      hasBusinessInterest: 'Business interest',
      hasBlendedFamily: 'Blended family',
      hasExclusionIntent: 'Exclusion intent',
      hasVulnerableBeneficiary: 'Vulnerable beneficiary',
      hasBeneficiaryFinancialChallenges: 'Financial challenges',
      hasComplexTrusts: 'Complex trusts',
    }
    const triageFlags = Object.entries(FLAG_LABELS).filter(([k]) => tf[k]).map(([, v]) => v)

    const completedSections: string[] = []
    if (name) completedSections.push('personal')
    if (executors.length > 0) completedSections.push('executors')
    if ((assetRes.data ?? []).length > 0) completedSections.push('assets')
    if ((beneficiaryRes.data ?? []).length > 0) completedSections.push('beneficiaries')
    if ((giftRes.data ?? []).length > 0) completedSections.push('gifts')

    return {
      ok: true,
      snapshot: {
        willId,
        name,
        dob: str(primary?.date_of_birth),
        address,
        maritalStatus: str(primary?.marital_status).replace(/_/g, ' '),
        occupation: str(primary?.occupation),
        primaryExecutor: fmtPerson(primaryExec),
        alternateExecutor: altExec ? fmtPerson(altExec) : null,
        beneficiaries,
        assets,
        specificGifts,
        triageFlags,
        completedSections,
      },
    }
  } catch (err) {
    console.error('getWillSnapshot failed:', err)
    return { ok: false, error: 'Failed to load snapshot' }
  }
}
