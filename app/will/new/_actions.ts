'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { loadWillFormData } from './_data'
import { generateWillDocumentText } from './_drafting'
import { recordVersion } from './_versioning'
import { STEP_LABELS, type WillFormData, type StepId } from './_types'

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// Inserts the new rows before deleting the old ones (by id), so a failed
// insert never leaves a step's data wiped out with nothing to replace it.
async function replaceRows(
  supabase: SupabaseClient,
  table: string,
  willId: string,
  rows: Record<string, unknown>[]
) {
  const { data: oldRows } = await supabase.from(table).select('id').eq('will_id', willId)
  const oldIds = (oldRows ?? []).map((r) => r.id as string)

  if (rows.length > 0) {
    const { error } = await supabase.from(table).insert(rows)
    if (error) throw new Error(error.message)
  }

  if (oldIds.length > 0) {
    const { error } = await supabase.from(table).delete().in('id', oldIds)
    if (error) throw new Error(error.message)
  }
}

export async function saveStep(
  willId: string | null,
  step: StepId,
  formData: WillFormData,
  changeSummary?: string
): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Ensure a profiles row exists (fallback for users predating the trigger)
  await supabase
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email ?? '', full_name: user.user_metadata?.full_name ?? null },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  // Create will record on the first save
  let id = willId
  if (!id) {
    const { data, error } = await supabase
      .from('wills')
      .insert({ user_id: user.id, status: 'draft' })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    id = data.id as string
  }

  switch (step) {
    // ─── Personal details ────────────────────────────────────────────────────
    case 'personal': {
      const pd = formData.personalDetails
      // testators has no type column — replace with primary row only.
      // The spouse case replaces with both rows so we never orphan the primary.
      await replaceRows(supabase, 'testators', id, [
        {
          will_id: id,
          first_name: pd.firstName,
          middle_name: pd.middleName || null,
          last_name: pd.lastName,
          date_of_birth: pd.dateOfBirth || null,
          address_line_1: pd.addressLine1,
          suburb: pd.suburb,
          state: pd.state,
          postcode: pd.postcode,
          phone_mobile: pd.phoneMobile,
          email: pd.email,
          occupation: pd.occupation,
          marital_status: pd.maritalStatus,
          has_previous_will: pd.previousWill === 'yes',
          previous_will_location: pd.previousWill === 'yes' ? pd.previousWillLocation : null,
        },
      ])
      break
    }

    // ─── Spouse/partner details ───────────────────────────────────────────────
    case 'spouse': {
      const pd = formData.personalDetails
      const sd = formData.spouseDetails
      // Replace all testators with both rows so neither is lost on edit.
      await replaceRows(supabase, 'testators', id, [
        {
          will_id: id,
          first_name: pd.firstName,
          middle_name: pd.middleName || null,
          last_name: pd.lastName,
          date_of_birth: pd.dateOfBirth || null,
          address_line_1: pd.addressLine1,
          suburb: pd.suburb,
          state: pd.state,
          postcode: pd.postcode,
          phone_mobile: pd.phoneMobile,
          email: pd.email,
          occupation: pd.occupation,
          marital_status: pd.maritalStatus,
          has_previous_will: pd.previousWill === 'yes',
          previous_will_location: pd.previousWill === 'yes' ? pd.previousWillLocation : null,
        },
        {
          will_id: id,
          first_name: sd.firstName,
          middle_name: sd.middleName || null,
          last_name: sd.lastName,
          date_of_birth: sd.dateOfBirth || null,
          address_line_1: sd.addressLine1,
          suburb: sd.suburb,
          state: sd.state,
          postcode: sd.postcode,
          phone_mobile: sd.phoneMobile,
          email: sd.email,
          occupation: sd.occupation,
          marital_status: null,
          has_previous_will: sd.previousWill === 'yes',
          previous_will_location: sd.previousWill === 'yes' ? sd.previousWillLocation : null,
        },
      ])
      break
    }

    // ─── Children ─────────────────────────────────────────────────────────────
    case 'children': {
      const cd = formData.childrenData

      const childRows =
        cd.hasChildren === 'yes'
          ? cd.children.map((c) => ({
              will_id: id,
              first_name: c.name, // form collects a single name field
              date_of_birth: c.dateOfBirth || null,
              is_dependent: c.isDependent,
            }))
          : []
      await replaceRows(supabase, 'children', id, childRows)

      const hasMinors = cd.hasChildren === 'yes' && cd.children.some((c) => c.isDependent)
      const guardianRows =
        hasMinors && cd.guardian.firstName
          ? [
              {
                will_id: id,
                first_name: cd.guardian.firstName,
                last_name: cd.guardian.lastName,
                relationship: cd.guardian.relationship,
                phone: cd.guardian.phone,
                email: cd.guardian.email,
                is_primary: true,
                order_index: 0,
              },
            ]
          : []
      await replaceRows(supabase, 'guardians', id, guardianRows)
      break
    }

    // ─── Executors ────────────────────────────────────────────────────────────
    case 'executors': {
      const ed = formData.executorsData
      const rows: Record<string, unknown>[] = [
        {
          will_id: id,
          first_name: ed.primary.firstName,
          last_name: ed.primary.lastName,
          relationship: ed.primary.relationship,
          phone: ed.primary.phone,
          email: ed.primary.email,
          address_line_1: ed.primary.address,
          is_primary: true,
          order_index: 0,
        },
      ]
      if (ed.hasAlternate && ed.alternate.firstName) {
        rows.push({
          will_id: id,
          first_name: ed.alternate.firstName,
          last_name: ed.alternate.lastName,
          relationship: ed.alternate.relationship,
          phone: ed.alternate.phone,
          email: ed.alternate.email,
          address_line_1: ed.alternate.address,
          is_primary: false,
          order_index: 1,
        })
      }
      await replaceRows(supabase, 'executors', id, rows)
      break
    }

    // ─── Assets ───────────────────────────────────────────────────────────────
    case 'assets': {
      const rows = formData.assets.map((a) => {
        // institution_name covers bank, super fund, share company, insurer
        const institution_name =
          a.bankName || a.fundName || a.companyName || a.insurerName || null

        // account_number covers bank account number and super member number
        const account_number = a.accountNumber || a.memberNumber || null

        // estimated_value covers real estate value, cover amount, and "other" value
        const estimated_value = a.estimatedValue || a.coverAmount || a.otherValue || null

        // Capture fields with no dedicated column in the description
        let description = a.description || null
        if (a.assetType === 'bank_account' && a.bsb) {
          description = `BSB: ${a.bsb}${description ? ` — ${description}` : ''}`
        } else if (a.assetType === 'shares' && a.numberOfShares) {
          description = `${a.numberOfShares} shares${description ? ` — ${description}` : ''}`
        }

        return {
          will_id: id,
          asset_type: a.assetType || null,
          ownership_type: a.ownershipType || null,
          description,
          estimated_value,
          property_address_line_1:
            a.assetType === 'real_estate' ? a.propertyAddress || null : null,
          institution_name,
          account_number,
          policy_number: a.policyNumber || null,
          vehicle_make: a.make || null,
          vehicle_model: a.model || null,
          vehicle_year: a.year || null,
          vehicle_rego: a.rego || null,
        }
      })
      await replaceRows(supabase, 'assets', id, rows)
      break
    }

    // ─── Beneficiaries ────────────────────────────────────────────────────────
    case 'beneficiaries': {
      const bd = formData.beneficiariesData
      const rows = [
        ...bd.people.map((b, i) => ({
          will_id: id,
          beneficiary_type: 'individual',
          first_name: b.name, // form collects a single name field
          relationship: b.relationship,
          share_percentage: parseFloat(b.percentage) || 0,
          order_index: i,
        })),
        ...bd.charities.map((b, i) => ({
          will_id: id,
          beneficiary_type: 'organisation',
          organisation_name: b.name,
          abn: b.abn || null,
          share_percentage: parseFloat(b.percentage) || 0,
          order_index: bd.people.length + i,
        })),
      ]
      await replaceRows(supabase, 'beneficiaries', id, rows)
      break
    }

    // ─── Specific gifts ───────────────────────────────────────────────────────
    case 'gifts': {
      const rows = formData.specificGifts.map((g, i) => ({
        will_id: id,
        gift_type: g.type,
        description: g.description || null,
        cash_amount: g.type === 'cash' ? g.amount || null : null,
        recipient_type: 'individual',
        recipient_first_name: g.recipientName || null,
        recipient_relationship: g.recipientRelationship || null,
        order_index: i,
      }))
      await replaceRows(supabase, 'specific_gifts', id, rows)
      break
    }

    case 'review':
      // All data already saved from previous steps; nothing to do here.
      break
  }

  // Snapshot the resulting state into version history (skip 'review', which
  // never mutates anything). A failure here shouldn't block the save itself.
  if (step !== 'review') {
    try {
      const { formData: latest } = await loadWillFormData(supabase, user.id, id)
      await recordVersion(supabase, id, step, changeSummary ?? `Updated ${STEP_LABELS[step]}`, latest)
    } catch (versionError) {
      console.error('Version recording failed for', id, versionError)
    }
  }

  return id!
}

export async function completeWill(willId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('wills')
    .update({ status: 'pending_review' })
    .eq('id', willId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  // Draft the will document from the completed intake data. A drafting
  // failure shouldn't block submission — the solicitor review still covers it.
  try {
    const { formData } = await loadWillFormData(supabase, user.id, willId)
    const documentText = await generateWillDocumentText(formData)
    await supabase.from('wills').update({ document_text: documentText }).eq('id', willId)
  } catch (draftError) {
    console.error('Will drafting failed for', willId, draftError)
  }
}
