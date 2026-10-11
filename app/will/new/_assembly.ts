import { supabaseAdmin } from '@/src/lib/supabase-server'
import type { WillFormData } from './_types'
import { resolveSubstituteBeneficiaryText, formatCurrency, formatAmountDigits, computeRequiresDelayedVestingTrust } from './_types'
import { validateWillForGeneration, validateRenderedText } from './_validate'
import { assessComplexityFlags, maxSeverity } from './_complexity'

// ── Types ──────────────────────────────────────────────────────────────────

type Vars = Record<string, string>

interface ClauseInstance {
  code: string
  vars: Vars
  /** Heading to prepend (e.g. "3. EXECUTOR POWERS"). Clause text follows. */
  heading?: string
}

// ── Merge engine ───────────────────────────────────────────────────────────

/** Replace every {{key}} in text with the matching value from vars. */
function merge(text: string, vars: Vars): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

// ── Clause fetcher ─────────────────────────────────────────────────────────

async function fetchClauseTexts(codes: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(codes)]
  const { data, error } = await supabaseAdmin
    .from('clause_versions')
    .select('clauses!inner(clause_code), clause_text')
    .in('clauses.clause_code', unique)
    .in('status', ['production', 'draft'])
    .order('status', { ascending: false }) // 'production' > 'draft' lexicographically — prefer production
    .order('version', { ascending: false })

  if (error) throw new Error(`clause_versions fetch failed: ${error.message}`)

  // Keep only the highest version per clause code
  const map = new Map<string, string>()
  for (const row of data ?? []) {
    const code = (row.clauses as unknown as { clause_code: string }).clause_code
    if (!map.has(code)) map.set(code, row.clause_text as string)
  }
  return map
}

// ── Variable builders ──────────────────────────────────────────────────────

function testatorName(formData: WillFormData): string {
  const pd = formData.personalDetails
  return [pd.firstName, pd.middleName, pd.lastName].filter(Boolean).join(' ')
}

function fullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(' ')
}

function buildResidueDispositionText(formData: WillFormData): string {
  const { people, charities } = formData.beneficiariesData

  // Filter out blank-name and zero-share entries — must never appear in the document
  const activePeople = people.filter(
    (p) => p.name.trim() && (parseFloat(p.percentage) || 0) > 0
  )
  const activeCharities = charities.filter(
    (c) => c.name.trim() && (parseFloat(c.percentage) || 0) > 0
  )

  const all = [
    ...activePeople.map((p) => ({
      label: `${p.name}${p.relationship ? ` (${p.relationship})` : ''}`,
      name: p.name,
      pct: p.percentage,
      sub: p.substituteBeneficiary,
    })),
    ...activeCharities.map((c) => ({
      label: `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''}`,
      name: c.name,
      pct: c.percentage,
      sub: c.substituteBeneficiary,
    })),
  ]

  if (all.length === 0) return '[no beneficiaries named]'

  const survivorshipDays = formData.survivorshipDays || '30'

  // Single beneficiary at 100% — render in natural language without a percentage list
  if (all.length === 1 && parseFloat(all[0].pct) === 100) {
    const b = all[0]
    let s = `to ${b.label} absolutely`
    if (b.sub) {
      s += `. If ${b.label} does not survive me by ${survivorshipDays} days, that share passes instead to ${resolveSubstituteBeneficiaryText(b.sub, b.name)}`
    }
    return s
  }

  // Multiple beneficiaries — retain percentage/share structure
  const lines = all.map((b) => {
    let line = `  - ${b.pct}% to ${b.label}`
    if (b.sub) {
      line += `; if ${b.label} does not survive me by ${survivorshipDays} days, that share passes instead to ${resolveSubstituteBeneficiaryText(b.sub, b.name)}`
    }
    return line
  })
  return `as follows:\n\n${lines.join('\n')}`
}

function buildGiftLine(
  formData: WillFormData,
  g: WillFormData['specificGifts'][number]
): string {
  const desc = g.type === 'cash' ? `the sum of ${formatCurrency(g.amount)}` : g.description
  let line = `${desc} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}`
  if (g.substituteBeneficiary) {
    line += `. If ${g.recipientName} does not survive me by ${formData.survivorshipDays || '30'} days, this gift passes instead to ${resolveSubstituteBeneficiaryText(g.substituteBeneficiary, g.recipientName)}`
  }
  return line
}

function buildLifeInterestEndCondition(formData: WillFormData): string {
  const c = formData.lifeInterest.condition
  if (c === 'death') return 'their death'
  if (c === 'remarriage') return 'their remarriage or entering a new de facto relationship'
  if (c === 'death_or_remarriage') return 'their death, remarriage, or entry into a new de facto relationship, whichever occurs first'
  return 'the occurrence of the specified termination event'
}

// DIVORCE-01 is a statutory note (Succession Act 2006 ss 12-13), not an operative provision.
// LEGAL REVIEW REQUIRED before permanent removal: confirm no precedent obligation requires it
// to appear as a numbered testamentary clause. Pending that review, it is emitted as an
// un-numbered note after the execution clause rather than as a numbered clause.
const DIVORCE_NOTE_CODE = 'DIVORCE-01'

// ── Clause selector ────────────────────────────────────────────────────────

function selectClauses(formData: WillFormData): ClauseInstance[] {
  const pd = formData.personalDetails
  const ed = formData.executorsData
  const cd = formData.childrenData
  const tf = formData.triageFlags
  const requiresDelayedVestingTrust = computeRequiresDelayedVestingTrust(formData)
  const survivorshipDays = formData.survivorshipDays || '30'
  const tname = testatorName(formData)
  const primaryExecName = fullName(ed.primary.firstName, ed.primary.lastName)
  const backupExecName = fullName(ed.alternate.firstName, ed.alternate.lastName)

  const instances: ClauseInstance[] = []

  // ── 1. Revocation ────────────────────────────────────────────────────────
  instances.push({ code: 'REV-01', heading: '1. REVOCATION', vars: {} })

  // ── 2. Executors ─────────────────────────────────────────────────────────
  instances.push({
    code: 'EXEC-01',
    heading: '2. APPOINTMENT OF EXECUTOR',
    vars: { executor_name: primaryExecName },
  })

  if (ed.hasAlternate && ed.alternate.firstName) {
    instances.push({
      code: 'EXEC-02',
      heading: '3. SUBSTITUTE EXECUTOR',
      vars: {
        primary_executor_name: primaryExecName,
        backup_executor_name: backupExecName,
      },
    })
  }

  let clauseNo = ed.hasAlternate && ed.alternate.firstName ? 3 : 2

  // ── 3. Guardian ───────────────────────────────────────────────────────────
  if (requiresDelayedVestingTrust && cd.guardian.firstName) {
    const guardianName = fullName(cd.guardian.firstName, cd.guardian.lastName)
    instances.push({
      code: 'GUARD-01',
      heading: `${++clauseNo}. APPOINTMENT OF GUARDIAN`,
      vars: { guardian_name: guardianName },
    })
  }

  // ── 4. Debts ──────────────────────────────────────────────────────────────
  instances.push({ code: 'DEBT-01', heading: `${++clauseNo}. DEBTS AND EXPENSES`, vars: {} })

  // ── 5. Specific gifts ─────────────────────────────────────────────────────
  // Filter out incomplete rows — recipient name is the minimum requirement
  const activeGifts = formData.specificGifts.filter((g) => g.recipientName.trim())
  if (activeGifts.length > 0) {
    const giftLines = activeGifts
      .map((g) => `  - ${buildGiftLine(formData, g)}`)
      .join('\n')
    instances.push({
      code: 'GIFT-SPEC-01',
      heading: `${++clauseNo}. SPECIFIC GIFTS`,
      vars: { gift_list: giftLines },
    })
  }

  // ── 6. Residuary estate ───────────────────────────────────────────────────
  const { people, charities } = formData.beneficiariesData
  // Only count beneficiaries that will actually render
  const activePeople = people.filter((p) => p.name.trim() && (parseFloat(p.percentage) || 0) > 0)
  const activeCharities = charities.filter((c) => c.name.trim() && (parseFloat(c.percentage) || 0) > 0)
  if (activePeople.length > 0 || activeCharities.length > 0) {
    instances.push({
      code: 'RES-01',
      heading: `${++clauseNo}. RESIDUARY ESTATE`,
      vars: { residuary_disposition: buildResidueDispositionText(formData) },
    })
  }

  // ── 7. Charitable gift substitution ──────────────────────────────────────
  for (const c of activeCharities.filter((c) => c.substituteBeneficiary)) {
    instances.push({
      code: 'GIFT-CHARITY-SUB-01',
      heading: `${++clauseNo}. CHARITABLE GIFT SUBSTITUTION — ${c.name.toUpperCase()}`,
      vars: { charity_name: c.name },
    })
  }

  // ── 8. Survivorship and gift rules ────────────────────────────────────────
  instances.push({
    code: 'COMMON-GIFT-01',
    heading: `${++clauseNo}. SURVIVORSHIP AND GIFT RULES`,
    vars: { survivorship_days: survivorshipDays },
  })

  // ── 9. Testamentary trust ─────────────────────────────────────────────────
  if (requiresDelayedVestingTrust) {
    const vestingAge = cd.ageOfVesting || '25'
    instances.push({
      code: 'MIN-01',
      heading: `${++clauseNo}. MINOR BENEFICIARY TRUST`,
      vars: { vesting_age: vestingAge },
    })
    instances.push({
      code: 'MIN-02',
      heading: `${++clauseNo}. ADVANCEMENT POWERS`,
      vars: {},
    })
  }

  // ── 10. Life interest ─────────────────────────────────────────────────────
  if (formData.lifeInterest.enabled) {
    const li = formData.lifeInterest
    instances.push({
      code: 'LIFE-INT-01',
      heading: `${++clauseNo}. LIFE INTEREST / RIGHT TO RESIDE`,
      vars: {
        life_interest_property_description: li.propertyDescription,
        life_tenant_name: li.lifeTenantName,
        life_interest_end_condition: buildLifeInterestEndCondition(formData),
        remainder_beneficiary_name: li.remainderBeneficiaryName,
      },
    })
  }

  // ── 11. Pet care ──────────────────────────────────────────────────────────
  if (formData.petCare.hasPets === 'yes') {
    const pc = formData.petCare
    instances.push({
      code: 'PET-01',
      heading: `${++clauseNo}. CARE OF PETS`,
      vars: {
        pet_guardian_name: pc.caregiverName,
        pet_description: pc.petDescription,
        pet_name: pc.petName,
        pet_care_amount: formatAmountDigits(pc.careFundAmount || '0'),
      },
    })
  }

  // ── 12. Digital assets — only when the testator has digital assets ─────────
  // Credential/access location must NOT appear in the Will — it belongs in Executor Information only.
  const hasDigital = formData.assets.some((a) => a.assetType === 'digital_asset')
  if (hasDigital) {
    instances.push({
      code: 'DIGITAL-01',
      heading: `${++clauseNo}. DIGITAL ASSETS`,
      vars: { digital_access_note: '' },
    })
  }

  // ── 13. Executor powers ───────────────────────────────────────────────────
  instances.push({ code: 'EXEC-03', heading: `${++clauseNo}. EXECUTOR POWERS`, vars: {} })

  // ── 14. Trustee powers — only when a trust can arise ─────────────────────
  // TRUST-POWERS-01 and TRUSTEE-APPOINT-01 are conditional per their metadata:
  // "Omit if the Will creates no trust and no beneficiary can be under the vesting age."
  const hasTrust = requiresDelayedVestingTrust || tf.hasComplexTrusts
  if (hasTrust) {
    instances.push({ code: 'TRUST-POWERS-01', heading: `${++clauseNo}. TRUSTEE POWERS`, vars: {} })
    instances.push({ code: 'TRUSTEE-APPOINT-01', heading: `${++clauseNo}. TRUSTEE APPOINTMENT`, vars: {} })
  }

  // ── 15. Admin powers ─────────────────────────────────────────────────────
  instances.push({ code: 'APPROPRIATION-01', heading: `${++clauseNo}. APPROPRIATION POWER`, vars: {} })
  instances.push({ code: 'DELEGATE-01', heading: `${++clauseNo}. DELEGATION POWER`, vars: {} })
  instances.push({ code: 'INDEMNITY-01', heading: `${++clauseNo}. EXECUTOR INDEMNITY`, vars: {} })

  // ── 16. General provisions ────────────────────────────────────────────────
  instances.push({ code: 'DEFN-01', heading: `${++clauseNo}. DEFINITIONS`, vars: {} })
  instances.push({ code: 'INTERP-01', heading: `${++clauseNo}. INTERPRETATION`, vars: {} })

  // ── 17. Notes ─────────────────────────────────────────────────────────────
  const hasSuper = formData.assets.some((a) => a.assetType === 'superannuation')
  const hasInsurance = formData.assets.some((a) => a.assetType === 'life_insurance')
  if (hasSuper) {
    instances.push({ code: 'SUPER-01', heading: `${++clauseNo}. SUPERANNUATION NOTE`, vars: {} })
  }
  if (hasInsurance) {
    instances.push({ code: 'INSUR-01', heading: `${++clauseNo}. LIFE INSURANCE NOTE`, vars: {} })
  }
  // DIVORCE-01 is fetched separately and emitted after the execution clause as a non-numbered
  // informational note (see assembleWillDocument below). Do not add it to instances here.

  // ── 18. Escalation clauses ────────────────────────────────────────────────
  // Included with their solicitor-review warning when triage flags are set.
  if (tf.hasBusinessInterest) {
    instances.push({
      code: 'BIZ-01',
      heading: `${++clauseNo}. BUSINESS SUCCESSION`,
      vars: {
        business_name: '[business name — solicitor to complete]',
        business_successor_name: '[successor — solicitor to complete]',
        business_entity_name: '[entity name — solicitor to complete]',
        business_abn_acn: '[ABN/ACN — solicitor to complete]',
      },
    })
    instances.push({
      code: 'BIZ-02',
      heading: `${++clauseNo}. POWER TO CARRY ON BUSINESS`,
      vars: { business_wind_up_period: '12 months' },
    })
  }
  if (formData.assetsOutsideAustralia) {
    // foreign_asset_description describes the overseas property (e.g. "apartment in London").
    // foreign_jurisdiction names the country. These are distinct fields — merging both to
    // otherJurisdictions previously produced output like "China located in China".
    const overseasAssetDescriptions = formData.assets
      .filter((a) => a.isOverseas)
      .map((a) => [a.description, a.overseasCountry].filter(Boolean).join(' in '))
      .filter(Boolean)
    const foreignAssetDescription =
      overseasAssetDescriptions.length > 0
        ? overseasAssetDescriptions.join('; ')
        : '[overseas assets — solicitor to complete]'
    instances.push({
      code: 'FOREIGN-01',
      heading: `${++clauseNo}. FOREIGN ASSETS`,
      vars: {
        foreign_asset_description: foreignAssetDescription,
        foreign_jurisdiction: formData.otherJurisdictions || '[jurisdiction — solicitor to complete]',
        foreign_asset_beneficiary_name: '[beneficiary — solicitor to complete]',
      },
    })
  }
  if (tf.hasVulnerableBeneficiary) {
    instances.push({
      code: 'DISABILITY-01',
      heading: `${++clauseNo}. SPECIAL DISABILITY TRUST`,
      vars: {
        sdt_gift_description: '[gift — solicitor to complete]',
        sdt_trustee_name: '[trustee — solicitor to complete]',
        sdt_beneficiary_name: '[beneficiary — solicitor to complete]',
        sdt_residual_beneficiary_name: '[residual beneficiary — solicitor to complete]',
      },
    })
  }
  if (tf.hasComplexTrusts) {
    instances.push({
      code: 'TRUST-TESTAMENTARY-01',
      heading: `${++clauseNo}. TESTAMENTARY TRUST`,
      vars: {
        testamentary_trust_share: 'whole',
        trustee_name: primaryExecName,
        primary_trust_beneficiaries: '[beneficiaries — solicitor to complete]',
        trust_vesting_beneficiary: '[vesting beneficiary — solicitor to complete]',
      },
    })
  }
  if (tf.hasExclusionIntent) {
    instances.push({
      code: 'EXCL-01',
      heading: `${++clauseNo}. EXCLUSION`,
      vars: {
        excluded_person_name: '[excluded person — solicitor to complete]',
        exclusion_reasons: '[reasons — solicitor to complete]',
      },
    })
  }

  return instances
}

// ── Document header ────────────────────────────────────────────────────────

function buildDocumentHeader(formData: WillFormData): string {
  const pd = formData.personalDetails
  const name = testatorName(formData).toUpperCase()
  const address = [pd.addressLine1, pd.suburb, pd.state, pd.postcode].filter(Boolean).join(', ')
  const marital: Record<string, string> = {
    single: 'single',
    married: 'married',
    domestic_partner: 'in a domestic partnership',
    divorced: 'divorced',
    separated: 'separated',
    widowed: 'widowed',
  }

  return [
    `LAST WILL AND TESTAMENT OF ${name}`,
    '',
    `I, ${testatorName(formData)}${address ? `, of ${address}` : ''}, ${marital[pd.maritalStatus] ? `being ${marital[pd.maritalStatus]},` : ''} ` +
      `declare this to be my Last Will and Testament.`,
  ].join('\n')
}

// ── Top-level assembler ────────────────────────────────────────────────────

export async function assembleWillDocument(formData: WillFormData): Promise<string> {
  // ── Pre-render validation ────────────────────────────────────────────────
  const preCheck = validateWillForGeneration(formData)
  if (!preCheck.valid) {
    throw new Error(
      `Will generation blocked — validation failed:\n${preCheck.errors.map((e) => `  • ${e}`).join('\n')}`
    )
  }

  // ── Complexity gate ──────────────────────────────────────────────────────
  // Wills that require solicitor preparation (SOLICITOR_REQUIRED) must NOT be
  // automatically assembled into an executable document. They are routed to a
  // solicitor who will prepare the document manually. This check runs before
  // any Supabase fetches so that the failure is fast and clear.
  const complexityFlags = assessComplexityFlags(formData)
  const severity = maxSeverity(complexityFlags)
  if (severity === 'SOLICITOR_REQUIRED') {
    const blockerCodes = complexityFlags
      .filter((f) => f.severity === 'SOLICITOR_REQUIRED')
      .map((f) => f.code)
    throw new Error(
      `Will assembly blocked — requires solicitor: ${blockerCodes.join(', ')}. ` +
      `This Will has been submitted for review. Our team will prepare your document.`
    )
  }

  const instances = selectClauses(formData)
  const codes = [...instances.map((i) => i.code), DIVORCE_NOTE_CODE]
  const clauseTexts = await fetchClauseTexts([...new Set(codes)])

  const sections: string[] = [buildDocumentHeader(formData)]

  for (const instance of instances) {
    const raw = clauseTexts.get(instance.code)
    if (!raw) {
      sections.push(
        `${instance.heading ?? instance.code}\n\n[Clause ${instance.code} not yet available — solicitor to insert.]`
      )
      continue
    }

    const body = merge(raw, instance.vars)
    sections.push(instance.heading ? `${instance.heading}\n\n${body}` : body)
  }

  // ── Post-execution statutory note (DIVORCE-01) ───────────────────────────
  // Rendered as an un-numbered informational note after the execution clause.
  // LEGAL REVIEW REQUIRED: confirm this positioning satisfies the approved precedent.
  const divorceNoteText = clauseTexts.get(DIVORCE_NOTE_CODE)
  if (divorceNoteText) {
    sections.push(
      `NOTE — EFFECT OF MARRIAGE AND DIVORCE\n\n${merge(divorceNoteText, {})}`
    )
  }

  // Sentinel used by renderWillPdf to end body text before drawing the
  // programmatic Execution & Attestation block with signature fields.
  sections.push(
    'IN WITNESS WHEREOF I have set my hand to this my Will, signed in the presence of two witnesses present at the same time, who attested and subscribed this Will in my presence.'
  )

  const assembled = sections.join('\n\n')

  // ── Post-render text validation ──────────────────────────────────────────
  const postCheck = validateRenderedText(assembled)
  if (!postCheck.valid) {
    throw new Error(
      `Will generation blocked — post-render validation failed:\n${postCheck.errors.map((e) => `  • ${e}`).join('\n')}`
    )
  }

  return assembled
}
