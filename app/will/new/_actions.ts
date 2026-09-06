'use server'

import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from './_data'
import { generateWillDocumentText } from './_drafting'
import { recordVersion } from './_versioning'
import { STEP_LABELS, type WillFormData, type StepId, type PersonalWishesData } from './_types'
import { sendResumeEmail } from '@/src/lib/email'

const ANON_COOKIE = 'hl_anon_session'


async function getAnonSessionId(): Promise<string | null> {
  const store = await cookies()
  return store.get(ANON_COOKIE)?.value ?? null
}

// Save entire WillFormData as JSONB to an anonymous session.
// Creates a new session (with cookie) if none exists; returns the session UUID.
async function saveToAnonSession(formData: WillFormData): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const store = await cookies()
  const existing = store.get(ANON_COOKIE)?.value

  const payload = formData as unknown as Record<string, unknown>

  if (existing) {
    await supabase.from('anonymous_will_sessions').update({ form_data: payload }).eq('id', existing)
    return existing
  }

  const { data, error } = await supabase
    .from('anonymous_will_sessions')
    .insert({ form_data: payload })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  const id = data.id as string
  store.set(ANON_COOKIE, id, { maxAge: 30 * 24 * 60 * 60, path: '/', sameSite: 'lax', secure: true, httpOnly: true })
  return id
}

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

// testators rows are fully replaced on every save (personal, spouse, and
// wishes steps all touch this table)  -  build the complete row set from
// current form state every time so no step ever clobbers another's fields.
function buildTestatorRows(formData: WillFormData): Record<string, unknown>[] {
  const pd = formData.personalDetails
  const sd = formData.spouseDetails
  // Funeral fields are no longer written from the core flow  -  they live in
  // personal_wishes (non-testamentary) and are saved via savePersonalWishes.
  const wishesFields = {
    assets_outside_australia: formData.assetsOutsideAustralia,
    other_jurisdictions: formData.assetsOutsideAustralia
      ? formData.otherJurisdictions.split(',').map((s) => s.trim()).filter(Boolean)
      : null,
    important_documents_location: formData.importantDocumentsLocation || null,
  }

  const primaryRow = {
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
    ...wishesFields,
  }

  const rows: Record<string, unknown>[] = [primaryRow]

  if (pd.maritalStatus === 'married' || pd.maritalStatus === 'domestic_partner') {
    rows.push({
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
    })
  }

  return rows
}

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
  const { data: { user } } = await supabase.auth.getUser()

  // Anonymous path: save entire form state as JSONB, skip normalized tables.
  if (!user) {
    // Eligibility and review steps don't persist data themselves.
    if (step === 'eligibility' || step === 'review') {
      const sessionId = await getAnonSessionId()
      return sessionId ?? await saveToAnonSession(formData)
    }
    return await saveToAnonSession(formData)
  }

  // Ensure a profiles row exists (fallback for users predating the trigger)
  await supabase
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email ?? '', full_name: user.user_metadata?.full_name ?? null },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  // Create will record on the first save
  let id = willId
  let willStatus = 'draft'
  if (!id) {
    const cookieStore = await cookies()
    const partnerRef = cookieStore.get('hl_partner_ref')?.value ?? null
    const { data, error } = await supabase
      .from('wills')
      .insert({
        user_id: user.id,
        status: 'draft',
        ...(partnerRef && { partner_referral_code: partnerRef }),
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    id = data.id as string
  } else {
    const { data } = await supabase.from('wills').select('status').eq('id', id).single()
    willStatus = (data?.status as string | undefined) ?? 'draft'
  }
  // Only a will that's already been completed once is a "live" document  - 
  // edits to it (via the wizard or the AI chat) warrant a fresh legal review.
  // Steps during the original intake wizard are skipped since the data is
  // incomplete until all steps are done (see completeWill).
  const isAmendmentToLiveWill = willStatus !== 'draft'

  switch (step) {
    // ─── Personal details ────────────────────────────────────────────────────
    case 'personal': {
      await replaceRows(supabase, 'testators', id, buildTestatorRows(formData).map((r) => ({ ...r, will_id: id })))
      break
    }

    // ─── Spouse/partner details ───────────────────────────────────────────────
    case 'spouse': {
      await replaceRows(supabase, 'testators', id, buildTestatorRows(formData).map((r) => ({ ...r, will_id: id })))
      break
    }

    // ─── Children ─────────────────────────────────────────────────────────────
    case 'children': {
      const cd = formData.childrenData

      const vestingAge = parseInt(cd.ageOfVesting, 10) || null
      const childRows =
        cd.hasChildren === 'yes'
          ? cd.children.map((c) => ({
              will_id: id,
              first_name: c.name, // form collects a single name field
              date_of_birth: c.dateOfBirth || null,
              is_dependent: c.isDependent,
              // Testamentary trust: a minor/dependent beneficiary's share is
              // held on trust until they reach this age, rather than vesting
              // immediately at 18 by default.
              distribution_age: c.isDependent ? vestingAge : null,
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
          description = `BSB: ${a.bsb}${description ? `  -  ${description}` : ''}`
        } else if (a.assetType === 'shares' && a.numberOfShares) {
          description = `${a.numberOfShares} shares${description ? `  -  ${description}` : ''}`
        }

        const nominationApplies = a.assetType === 'superannuation' || a.assetType === 'life_insurance'

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
          has_death_benefit_nomination: nominationApplies ? a.hasDeathBenefitNomination : null,
          death_benefit_nominees: nominationApplies && a.hasDeathBenefitNomination ? a.deathBenefitNominees || null : null,
          is_overseas: a.isOverseas,
          overseas_country: a.isOverseas ? a.overseasCountry || null : null,
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
          // Who takes this share if this beneficiary doesn't survive the
          // testator by the survivorship period (see wills.survivorship_days).
          lapse_fallback: b.substituteBeneficiary || null,
          order_index: i,
        })),
        ...bd.charities.map((b, i) => ({
          will_id: id,
          beneficiary_type: 'organisation',
          organisation_name: b.name,
          abn: b.abn || null,
          share_percentage: parseFloat(b.percentage) || 0,
          lapse_fallback: b.substituteBeneficiary || null,
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
        lapse_fallback: g.substituteBeneficiary || null,
        order_index: i,
      }))
      await replaceRows(supabase, 'specific_gifts', id, rows)
      break
    }

    // ─── Wishes & Trusts ────────────────────────────────────────────────────
    case 'wishes': {
      // funeral/jurisdiction fields live on testators  -  rebuild via the
      // shared builder so personal/spouse data already saved isn't clobbered.
      await replaceRows(supabase, 'testators', id, buildTestatorRows(formData).map((r) => ({ ...r, will_id: id })))

      const survivorshipDays = parseInt(formData.survivorshipDays, 10) || 30
      const { error: willError } = await supabase
        .from('wills')
        .update({
          survivorship_days: survivorshipDays,
          pet_care: formData.petCare.hasPets === 'yes' ? formData.petCare : null,
          life_interest: formData.lifeInterest.enabled ? formData.lifeInterest : null,
        })
        .eq('id', id)
      if (willError) throw new Error(willError.message)
      break
    }

    case 'review':
      // All data already saved from previous steps; nothing to do here.
      break
  }

  // Keep triage_flags current on every step save.
  await supabase.from('wills').update({ triage_flags: formData.triageFlags }).eq('id', id)

  // Snapshot the resulting state into version history (skip 'review', which
  // never mutates anything). A failure here shouldn't block the save itself.
  if (step !== 'review') {
    try {
      const { formData: latest } = await loadWillFormData(supabase, user.id, id)
      await recordVersion(supabase, id, step, changeSummary ?? `Updated ${STEP_LABELS[step]}`, latest, isAmendmentToLiveWill)
    } catch (versionError) {
      console.error('Version recording failed for', id, versionError)
    }
  }

  return id!
}

// Save Personal Wishes (non-testamentary, not part of the signed Will).
export async function savePersonalWishes(
  willId: string | null,
  wishes: PersonalWishesData
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // For anon sessions, personal wishes are stored inside the session form_data.
    const sessionId = await getAnonSessionId()
    if (!sessionId) return
    await supabase.from('anonymous_will_sessions').update({
      form_data: { personalWishes: wishes } as unknown as Record<string, unknown>
    }).eq('id', sessionId)
    return
  }

  if (!willId) return
  const payload = {
    funeral_type: wishes.funeralType || null,
    funeral_resting_place: wishes.funeralRestingPlace || null,
    funeral_additional_wishes: wishes.funeralAdditionalWishes || null,
    has_funeral_plan: wishes.hasFuneralPlan,
    funeral_plan_details: wishes.hasFuneralPlan ? wishes.funeralPlanDetails || null : null,
  }

  const { data: existing } = await supabase
    .from('personal_wishes')
    .select('id')
    .eq('will_id', willId)
    .maybeSingle()

  if (existing) {
    await supabase.from('personal_wishes').update(payload).eq('will_id', willId)
  } else {
    await supabase.from('personal_wishes').insert({ ...payload, will_id: willId })
  }
}

// Store email on anonymous session and send a resume link.
export async function storeAnonEmail(email: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const sessionId = await getAnonSessionId()
  if (!sessionId) return
  await supabase.from('anonymous_will_sessions').update({ email }).eq('id', sessionId)
  await sendResumeEmail({ to: email, sessionId })
}

export async function completeWill(willId: string): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', user.id)
    .single()

  const hasPaidWill =
    (profile?.plan === 'will' || profile?.plan === 'vault') && profile?.plan_status === 'active'

  if (!hasPaidWill) {
    throw new Error('WILL_PAYMENT_REQUIRED')
  }

  const { error } = await supabase
    .from('wills')
    .update({ status: 'pending_review' })
    .eq('id', willId)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)

  // Draft the will document from the completed intake data. A drafting
  // failure shouldn't block submission  -  the solicitor review still covers it.
  try {
    const { formData } = await loadWillFormData(supabase, user.id, willId)
    const documentText = await generateWillDocumentText(formData)
    await supabase.from('wills').update({ document_text: documentText }).eq('id', willId).eq('user_id', user.id)

    // Run the AI legal review exactly once here, now that all 7 steps are
    // in and the full picture is available  -  not on every step along the way.
    await recordVersion(supabase, willId, null, 'Completed will intake', formData, true)
  } catch (draftError) {
    console.error('Will drafting failed for', willId, draftError)
  }
}
