import { supabaseAdmin } from '@/src/lib/supabase-server'
import type { WillFormData } from './_types'
import { resolveSubstituteBeneficiaryText } from './_types'

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
    .eq('status', 'draft')
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
  const all = [
    ...people.map((p) => ({
      label: `${p.name}${p.relationship ? ` (${p.relationship})` : ''}`,
      pct: p.percentage,
      sub: p.substituteBeneficiary,
      isCharity: false,
    })),
    ...charities.map((c) => ({
      label: `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''}`,
      pct: c.percentage,
      sub: c.substituteBeneficiary,
      isCharity: true,
    })),
  ]

  if (all.length === 0) return '[no beneficiaries named]'

  if (all.length === 1) {
    const b = all[0]
    let s = `to ${b.label} absolutely`
    if (b.sub) {
      s += `. If ${b.label} does not survive me by ${formData.survivorshipDays || '30'} days, this share passes instead to ${resolveSubstituteBeneficiaryText(b.sub)}`
    }
    return s
  }

  const lines = all.map((b) => {
    let line = `  - ${b.pct}% to ${b.label}`
    if (b.sub) {
      line += `; if ${b.label} does not survive me by ${formData.survivorshipDays || '30'} days, this share passes instead to ${resolveSubstituteBeneficiaryText(b.sub)}`
    }
    return line
  })
  return `as follows:\n\n${lines.join('\n')}`
}

function buildGiftLine(
  formData: WillFormData,
  g: WillFormData['specificGifts'][number]
): string {
  const desc = g.type === 'cash' ? `the sum of $${g.amount}` : g.description
  let line = `${desc} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}`
  if (g.substituteBeneficiary) {
    line += `. If ${g.recipientName} does not survive me by ${formData.survivorshipDays || '30'} days, this gift passes instead to ${resolveSubstituteBeneficiaryText(g.substituteBeneficiary)}`
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

// ── Clause selector ────────────────────────────────────────────────────────

function selectClauses(formData: WillFormData): ClauseInstance[] {
  const pd = formData.personalDetails
  const ed = formData.executorsData
  const cd = formData.childrenData
  const hasDependent = cd.hasChildren === 'yes' && cd.children.some((c) => c.isDependent)
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
  if (hasDependent && cd.guardian.firstName) {
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
  if (formData.specificGifts.length > 0) {
    const giftLines = formData.specificGifts
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
  if (people.length > 0 || charities.length > 0) {
    instances.push({
      code: 'RES-01',
      heading: `${++clauseNo}. RESIDUARY ESTATE`,
      vars: { residuary_disposition: buildResidueDispositionText(formData) },
    })
  }

  // ── 7. Charitable gift substitution ──────────────────────────────────────
  for (const c of charities.filter((c) => c.substituteBeneficiary)) {
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
  if (hasDependent) {
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
        pet_description: pc.description,
        pet_name: pc.description,
        pet_care_amount: pc.careFundAmount || '0',
      },
    })
  }

  // ── 12. Digital assets ────────────────────────────────────────────────────
  const hasDigital = formData.assets.some((a) => a.assetType === 'digital_asset')
  if (hasDigital) {
    const digital = formData.assets.find((a) => a.assetType === 'digital_asset')
    instances.push({
      code: 'DIGITAL-01',
      heading: `${++clauseNo}. DIGITAL ASSETS`,
      vars: {
        digital_access_document_location: digital?.accessLocation || '[location not specified]',
      },
    })
  }

  // ── 13. Executor powers ───────────────────────────────────────────────────
  instances.push({ code: 'EXEC-03', heading: `${++clauseNo}. EXECUTOR POWERS`, vars: {} })

  // ── 14. Trustee powers ────────────────────────────────────────────────────
  instances.push({ code: 'TRUST-POWERS-01', heading: `${++clauseNo}. TRUSTEE POWERS`, vars: {} })
  instances.push({ code: 'TRUSTEE-APPOINT-01', heading: `${++clauseNo}. TRUSTEE APPOINTMENT`, vars: {} })

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
  instances.push({ code: 'DIVORCE-01', heading: `${++clauseNo}. MARRIAGE AND DIVORCE`, vars: {} })

  // ── 18. Escalation clauses ────────────────────────────────────────────────
  // Included with their solicitor-review warning when triage flags are set.
  const tf = formData.triageFlags
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
    instances.push({
      code: 'FOREIGN-01',
      heading: `${++clauseNo}. FOREIGN ASSETS`,
      vars: {
        foreign_asset_description: formData.otherJurisdictions || '[overseas assets — solicitor to complete]',
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

  // ── 19. Execution ─────────────────────────────────────────────────────────
  instances.push({
    code: 'EXEC-ATTEST-01',
    heading: `${++clauseNo}. EXECUTION AND ATTESTATION`,
    vars: { testator_name: tname },
  })

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
  const instances = selectClauses(formData)
  const codes = instances.map((i) => i.code)
  const clauseTexts = await fetchClauseTexts(codes)

  const sections: string[] = [buildDocumentHeader(formData)]

  for (const instance of instances) {
    const raw = clauseTexts.get(instance.code)
    if (!raw) {
      // Clause not in DB yet — emit a placeholder so the document is still complete
      sections.push(
        `${instance.heading ?? instance.code}\n\n[Clause ${instance.code} not yet available — solicitor to insert.]`
      )
      continue
    }

    const body = merge(raw, instance.vars)
    sections.push(instance.heading ? `${instance.heading}\n\n${body}` : body)
  }

  sections.push(
    'IMPORTANT NOTICE\n\n' +
      'This Will was prepared using Heirloom Life\'s clause assembly platform and has been subject to a standard solicitor quality review before being issued. ' +
      'It must be signed in the presence of two witnesses to be legally valid. ' +
      'If your circumstances involve overseas assets, business ownership, a blended family, or any other complex matter flagged above, ' +
      'a bespoke solicitor review is strongly recommended before execution.'
  )

  return sections.join('\n\n')
}
