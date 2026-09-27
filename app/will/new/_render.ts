import type { WillFormData } from './_types'
import { resolveSubstituteBeneficiaryText, formatCurrency } from './_types'

// ─── Approved clause text library ──────────────────────────────────────────
// These texts mirror the approved Supabase clause_versions for NSW.
// Do not modify substantive wording without a corresponding update to the
// heirloomlife-legal clause library and the clause_versions table.

const DEBT_01 =
  `My Executor must pay, as soon as reasonably practicable after my death and before making any distribution to beneficiaries, all of my just and lawful debts, my reasonable funeral and burial or cremation expenses, and all costs and expenses of administering my estate (including legal fees and accounting fees).\n\n` +
  `My Executor may defer payment of any debt that is genuinely disputed until the dispute is finally resolved, and may set aside a reasonable reserve from my estate to meet any contingent liabilities.`

const EXEC_03 =
  `In addition to all powers conferred by law, my Executor has the following powers, exercisable at my Executor's absolute discretion:\n\n` +
  `(a) **Sale** — to sell, call in and convert into money any part of my estate at any time and in any manner my Executor thinks fit, and to grant options over any estate property;\n\n` +
  `(b) **Postponement** — to postpone the sale or conversion of any estate property for as long as my Executor thinks fit, without liability for any loss caused by the postponement;\n\n` +
  `(c) **Receipts and compromises** — to collect and receive all amounts due to my estate, and to settle, compromise or refer to arbitration any debt, claim or dispute on such terms as my Executor thinks fit;\n\n` +
  `(d) **Assents** — to assent to the vesting of, or transfer, any estate property to any beneficiary in or towards satisfaction of their entitlement under this Will;\n\n` +
  `(e) **Professional assistance** — to employ solicitors, accountants, financial advisers and other professionals, and to pay their costs and expenses from my estate.\n\n` +
  `My Executor may exercise any of these powers without the consent of any beneficiary.`

const TRUST_POWERS_01 =
  `Where my Executor acts as trustee of any trust arising under this Will, my Executor has the following investment and management powers, which are in addition to all powers conferred by the *Trustee Act 1925* (NSW) and are not limited by it:\n\n` +
  `(a) **Investment** — to invest trust funds in any form of investment, including property, equities, managed funds and any other investment that a prudent person of business would consider appropriate, subject to any overriding duties of prudence and loyalty owed to the beneficiaries;\n\n` +
  `(b) **Retention** — to retain any property forming part of the trust for such period as my Executor thinks fit without liability for loss, even if it is not otherwise an authorised investment;\n\n` +
  `(c) **Variation** — to vary, transpose or realise any investment when and in such manner as my Executor thinks fit;\n\n` +
  `(d) **Delegation** — to delegate investment functions to a person reasonably believed to be appropriately qualified, and to review that delegation at reasonable intervals, to the extent permitted by law;\n\n` +
  `(e) **Professional advice** — to obtain and rely on the advice of investment or other professionals, and to act on that advice in good faith, without personal liability for any resulting loss.\n\n` +
  `The powers conferred by this clause are in addition to, and not in derogation of, all other powers conferred by law or this Will.`

const TRUSTEE_APPOINT_01 =
  `My Executor (acting as trustee of any trust arising under this Will) may at any time, by deed, appoint one or more additional trustees or substitute trustees of that trust, provided that:\n\n` +
  `(a) the total number of trustees shall not exceed four at any time;\n\n` +
  `(b) every individual trustee must be at least 18 years of age and legally capable of acting as trustee at the time of appointment and throughout their tenure (unless a corporate trustee is appointed); and\n\n` +
  `(c) a new trustee appointed under this clause shall have the same powers and obligations as the original trustee.\n\n` +
  `This power is exercisable in addition to any power of appointment conferred by the *Trustee Act 1925* (NSW).\n\n` +
  `A trustee who retires, whether under this clause or under the *Trustee Act 1925* (NSW), is not released from any liability arising before their retirement.`

const APPROPRIATION_01 =
  `My Executor may, in their absolute discretion, appropriate any property (whether real or personal) forming part of my estate towards the satisfaction of any legacy, share or pecuniary entitlement payable to any beneficiary, at such value as my Executor determines to be fair and reasonable at the date of appropriation.\n\n` +
  `In making an appropriation, my Executor:\n\n` +
  `(a) is not required to obtain the prior consent of the beneficiary;\n\n` +
  `(b) shall give reasonable notice of the appropriation to the beneficiary or, if the beneficiary is under a legal disability, to their legal representative;\n\n` +
  `(c) shall document the appropriation in writing; and\n\n` +
  `(d) may take into account any tax consequences for the estate or the beneficiary.\n\n` +
  `An appropriation duly made under this clause is final and binding on all persons interested in my estate.\n\n` +
  `This power is in addition to any power of appropriation conferred by the *Trustee Act 1925* (NSW) or any other legislation.`

const DELEGATE_01 =
  `My Executor may, in their discretion, delegate any professional, administrative, legal or financial function arising in the administration of my estate to any solicitor, accountant, financial adviser, estate agent or other professional or agent, and may pay the reasonable costs and expenses of such delegation from my estate. A delegation under this clause does not extend to the exercise of any discretion that is personal to my Executor as a matter of law or equity.\n\n` +
  `A delegation under this clause:\n\n` +
  `(a) must be in writing and specify the scope of the delegation;\n\n` +
  `(b) does not release my Executor from their general duties as executor, but allows them to rely on the expertise of the delegate in good faith; and\n\n` +
  `(c) may be revoked by my Executor at any time.\n\n` +
  `My Executor is not personally liable for any act or omission of a delegate appointed in good faith under this clause, provided my Executor exercised reasonable care in selecting the delegate.`

const INDEMNITY_01 =
  `My Executor shall be indemnified out of my estate from and against all actions, proceedings, claims, liabilities, costs and expenses arising from or incidental to the administration of my estate and the exercise of any power or discretion under this Will, except to the extent that the liability arises directly from my Executor's own fraud, wilful default or gross negligence.\n\n` +
  `My Executor shall not be personally liable for:\n\n` +
  `(a) any loss or depreciation in the value of any estate asset (including any investment), unless the loss results from my Executor's fraud, wilful default or gross negligence;\n\n` +
  `(b) any act or omission of any agent, solicitor, accountant or other professional appointed in good faith by my Executor; or\n\n` +
  `(c) any act done or omission made in good faith in reliance on the advice of a barrister, solicitor or other qualified professional.\n\n` +
  `My Executor's right to indemnity under this clause is in addition to, and does not limit, any right of indemnity conferred by law.`

// Dependency-aware definitions. "intestacy rules" intentionally omitted — no operative clause uses it.
// "child"/"children" only when an active clause references child concepts (dependents, children on
// the will, or substitute sentinels). "minor"/"vesting age" only when MIN-01/MIN-02 render.
function buildDefinitions(hasDependent: boolean, hasChildrenRef: boolean): string {
  return (
    `In this Will, unless the context otherwise requires:\n\n` +
    `**"my estate"** means all real and personal property of which I am the beneficial owner at the date of my death, including property over which I have a general power of appointment;\n\n` +
    `**"my Executor"** means the executor or executors for the time being of this Will, including any substituted executor, and includes my Executor acting as trustee where the context so requires;\n\n` +
    (hasChildrenRef
      ? `**"child"** and **"children"** include any person recognised as my child under the *Status of Children Act 1996* (NSW) and any child adopted by me, but does not include a stepchild unless expressly stated;\n\n`
      : '') +
    (hasDependent
      ? `**"minor"** means a person who has not yet attained the age of 18 years;\n\n` +
        `**"vesting age"** means the age specified in a trust clause at which a beneficiary becomes absolutely entitled to trust property;\n\n`
      : '') +
    `Words importing one gender include all genders. Words importing the singular include the plural and vice versa. A reference to a person includes a corporation.`
  )
}

const INTERP_01 =
  `This Will is to be construed in accordance with the law of New South Wales.\n\n` +
  `If any provision of this Will is held to be void, invalid or unenforceable for any reason, that provision shall be severed from this Will and the remaining provisions shall continue in full force and effect as if this Will had been executed without the severed provision.\n\n` +
  `A reference to any legislation includes any amendment, re-enactment or replacement of that legislation in force from time to time.\n\n` +
  `Headings in this Will are for convenience only and do not affect its interpretation.\n\n` +
  `If there is any uncertainty or ambiguity, this Will must be construed in a manner that gives effect to my apparent intention as gathered from the Will as a whole.`

function MIN_01(vestingAge: string): string {
  return (
    `If any beneficiary under this Will is under the age of ${vestingAge} years at the date on which they become entitled to receive a gift, my Executor shall hold that beneficiary's entitlement (the "Trust Property") on the following trusts:\n\n` +
    `(a) my Executor shall hold the Trust Property and any income from it on trust for the beneficiary until they attain the vesting age or die under that age;\n\n` +
    `(b) until the beneficiary attains the vesting age, my Executor may in their absolute discretion apply so much of the income and capital of the Trust Property as my Executor thinks fit for the maintenance, education, advancement and general benefit of the beneficiary;\n\n` +
    `(c) on the beneficiary attaining the vesting age, my Executor shall transfer the Trust Property (including any undistributed income) to the beneficiary absolutely;\n\n` +
    `(d) if the beneficiary dies before attaining the vesting age, the Trust Property shall pass to any backup beneficiary named for that gift or, if none, shall fall into the residue of my estate, except that if the Trust Property is itself the residue or a share of the residue, it shall instead pass to the other beneficiaries entitled to the residue in the proportions in which they take it or, if there are none, shall be distributed in accordance with the intestacy provisions of the *Succession Act 2006* (NSW) as if I had died without a Will.`
  )
}

const MIN_02 =
  `In addition to any power conferred under this Will or by the *Trustee Act 1925* (NSW), my Executor may at any time, in their absolute discretion, advance all or any part of the capital of any trust fund held for a minor beneficiary for the maintenance, education or other benefit of that beneficiary, without being required to bring the advancement into account when calculating the beneficiary's final entitlement unless my Executor specifies otherwise at the time of the advancement.\n\n` +
  `In exercising this power, my Executor:\n\n` +
  `(a) may pay any amount directly to the minor's parent or guardian, or directly to a school, medical provider or other person on behalf of the minor;\n\n` +
  `(b) is not obliged to have regard to other resources available to the minor or their parent or guardian; and\n\n` +
  `(c) shall keep a reasonable record of any advancements made.`

function COMMON_GIFT_01(days: string): string {
  return (
    `The following rules apply to all gifts made under this Will:\n\n` +
    `**Survivorship**\n\n` +
    `A beneficiary must survive me by at least ${days} days to be entitled to receive a gift under this Will, whether the gift is specific, pecuniary or residuary.\n\n` +
    `**Lapse of gifts**\n\n` +
    `If a gift to a named individual lapses because the beneficiary does not survive me by ${days} days and no substitute beneficiary has been named for that gift, the lapsed gift shall fall into the residue of my estate.\n\n` +
    `**Class gifts**\n\n` +
    `A gift to a class of persons (for example, "to my children equally") takes effect in favour of all members of the class who survive me by at least ${days} days. A child who is conceived before the death of the relevant person and born alive within the usual period of gestation following that death is treated as a member of the class. If a class member does not satisfy the survivorship condition but is survived by one or more descendants who do, those descendants take the class member's share equally per stirpes, subject to the same survivorship condition. If a class member does not satisfy the survivorship condition and leaves no surviving descendant, their share accrues to the surviving members of the class in proportion to their shares.\n\n` +
    `**Uncertain order of death**\n\n` +
    `If it is uncertain whether a beneficiary survived me, that beneficiary shall be presumed to have died before me for the purposes of this Will.`
  )
}

// APPROVED_LEGAL_TEXT_REQUIRED — PET_TRANSFER_MECHANICS
// The current PET-01 wording is internally inconsistent:
//   "I request (but do not legally require)..." — precatory/non-binding
//   "I direct my Executor to transfer custody..." — imperative/binding
// These formulations are in direct conflict. Do NOT rewrite until a replacement
// is approved by the solicitor review team.
function PET_01(guardianName: string, petDescription: string, careFundAmount: string): string {
  return (
    `I request (but do not legally require) that ${guardianName} take ownership and ongoing care of my ${petDescription} following my death.\n\n` +
    `I direct my Executor to transfer custody of my pet to ${guardianName} as soon as practicable after my death. If ${guardianName} is unwilling or unable to accept custody, my Executor shall make arrangements for my pet to be placed with a suitable person or reputable animal rescue organisation.\n\n` +
    `I give the sum of ${formatCurrency(careFundAmount)} to ${guardianName} to assist with the ongoing cost of caring for my pet. If ${guardianName} does not accept custody of my pet, this sum shall fall into residue.`
  )
}

// LEGAL REVIEW REQUIRED — DIGITAL_01
// The following points require solicitor confirmation before this clause is finalised:
//   1. "online banking" within "digital assets" — potential tension with bank secrecy obligations
//   2. "I direct any custodian or platform..." — enforceability against third-party platforms
//   3. Coverage of crypto, NFTs, loyalty points — confirm adequacy under NSW/Cth law
//   4. Executor access rights — confirm compliance with applicable access/computer laws
// Do NOT modify the clause text until the legal review is complete.
// Credential/access location must NOT appear in the signed Will — it belongs in Executor Information only.
function DIGITAL_01(): string {
  return (
    `I give my Executor the authority, to the fullest extent permitted by law and by the terms of any relevant service, to access, manage and deal with all of my digital assets following my death.\n\n` +
    `"Digital assets" includes, without limitation:\n\n` +
    `(a) online accounts (including email accounts, social media accounts, cloud storage accounts, subscription services and online banking);\n\n` +
    `(b) digital files, documents, photographs, videos and other content stored on devices or in the cloud;\n\n` +
    `(c) domain names and websites;\n\n` +
    `(d) cryptocurrency, non-fungible tokens (NFTs) and other digital or blockchain-based assets; and\n\n` +
    `(e) loyalty points, airline miles, gaming assets and in-app purchases with monetary value.\n\n` +
    `My Executor may, in their discretion:\n\n` +
    `(a) memorialise, close or delete any social media or online account;\n\n` +
    `(b) access, download and preserve digital content of personal or financial value to my estate;\n\n` +
    `(c) sell, transfer or otherwise realise any digital asset with monetary value; and\n\n` +
    `(d) engage a professional digital estate specialist at the cost of my estate.\n\n` +
    `I direct any custodian or platform holding my digital assets to cooperate with my Executor on production of a certified copy of the grant of probate and this Will.`
  )
}

function RES_01(residuaryDisposition: string): string {
  return (
    `Subject to the payment of my debts, funeral expenses and the costs of administering my estate, I give the whole of the rest and residue of my estate ${residuaryDisposition}.\n\n` +
    `If all persons otherwise entitled to receive a share of the residue under this clause (including any substitute beneficiaries) fail to survive me, or fail to satisfy any applicable survivorship condition, that share shall pass in accordance with the intestacy provisions of the *Succession Act 2006* (NSW) as if I had died without a Will.`
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MARITAL_LABELS: Record<string, string> = {
  single: 'single',
  married: 'married',
  domestic_partner: 'in a domestic partnership',
  divorced: 'divorced',
  separated: 'separated',
  widowed: 'widowed',
}

function fullName(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

function buildResidueText(formData: WillFormData): string {
  const { people, charities } = formData.beneficiariesData
  const survivorshipDays = formData.survivorshipDays || '30'

  const activePeople = people.filter((p) => p.name.trim() && (parseFloat(p.percentage) || 0) > 0)
  const activeCharities = charities.filter((c) => c.name.trim() && (parseFloat(c.percentage) || 0) > 0)
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

  if (all.length === 0) return '[No beneficiaries have been named yet.]'

  if (all.length === 1 && parseFloat(all[0].pct) === 100) {
    const b = all[0]
    let s = `to ${b.label} absolutely`
    if (b.sub) {
      s += `. If ${b.label} does not survive me by ${survivorshipDays} days, that share passes instead to ${resolveSubstituteBeneficiaryText(b.sub, b.name)}`
    }
    return s
  }

  const lines = all.map((b) => {
    let line = `  - ${b.pct}% to ${b.label}`
    if (b.sub) {
      line += `; if ${b.label} does not survive me by ${survivorshipDays} days, that share passes instead to ${resolveSubstituteBeneficiaryText(b.sub, b.name)}`
    }
    return line
  })
  return `as follows:\n\n${lines.join('\n')}`
}

/**
 * Deterministic, non-AI rendering of the Will as readable document text.
 * Uses approved Heirloom clause texts from the NSW legal library.
 * Used for the live preview; the download path uses assembleWillDocument() which
 * fetches the same approved texts from Supabase clause_versions.
 */
export function renderWillText(formData: WillFormData): string {
  const pd = formData.personalDetails
  const sections: string[] = []

  const testatorName = fullName(pd.firstName, pd.middleName, pd.lastName) || '[Your name]'
  const address = [pd.addressLine1, pd.suburb, pd.state, pd.postcode].filter(Boolean).join(', ')
  const survivorshipDays = formData.survivorshipDays || '30'
  const hasDependent =
    formData.childrenData.hasChildren === 'yes' &&
    formData.childrenData.children.some((c) => c.isDependent)
  const hasTrust = hasDependent || formData.triageFlags.hasComplexTrusts
  const hasDigitalAssets = formData.assets.some((a) => a.assetType === 'digital_asset')
  const hasChildrenRef =
    hasDependent ||
    formData.childrenData.hasChildren === 'yes' ||
    formData.beneficiariesData.people.some(
      (p) =>
        p.substituteBeneficiary === '__testator_children__' ||
        p.substituteBeneficiary === '__their_children__'
    ) ||
    formData.specificGifts.some(
      (g) =>
        g.substituteBeneficiary === '__testator_children__' ||
        g.substituteBeneficiary === '__their_children__'
    )

  let clauseNo = 0
  const next = () => ++clauseNo

  // ── Title and preamble ────────────────────────────────────────────────────
  sections.push(`LAST WILL AND TESTAMENT OF ${testatorName.toUpperCase()}`)

  sections.push(
    `I, ${testatorName}${address ? `, of ${address}` : ''}, ` +
      `being ${MARITAL_LABELS[pd.maritalStatus] || 'of the marital status shown in my profile'}, ` +
      `declare this to be my Last Will and Testament, and I revoke all previous wills and testamentary dispositions.`
  )

  // ── 1. Spouse / Partner ───────────────────────────────────────────────────
  if (pd.maritalStatus === 'married' || pd.maritalStatus === 'domestic_partner') {
    const sd = formData.spouseDetails
    const spouseName = fullName(sd.firstName, sd.lastName)
    if (spouseName) {
      sections.push(`${next()}. SPOUSE / PARTNER\n\nMy spouse/partner is ${spouseName}.`)
    }
  }

  // ── 2. Executors ──────────────────────────────────────────────────────────
  const primary = formData.executorsData.primary
  if (primary.firstName) {
    let text =
      `${next()}. EXECUTORS\n\n` +
      `I appoint ${fullName(primary.firstName, primary.lastName)}${primary.relationship ? ` (${primary.relationship})` : ''} as the Executor of this my Will.`
    if (formData.executorsData.hasAlternate) {
      const alt = formData.executorsData.alternate
      if (alt.firstName) {
        text += ` If my Executor is unable or unwilling to act, I appoint ${fullName(alt.firstName, alt.lastName)}${alt.relationship ? ` (${alt.relationship})` : ''} as alternate Executor.`
      }
    }
    sections.push(text)
  } else {
    sections.push(`${next()}. EXECUTORS\n\n[No executor has been named yet.]`)
  }

  // ── 3. Children / Guardians ───────────────────────────────────────────────
  if (formData.childrenData.hasChildren === 'yes' && formData.childrenData.children.length > 0) {
    let text =
      `${next()}. CHILDREN\n\n` +
      `My children are: ${formData.childrenData.children.map((c) => c.name).join(', ')}.`
    if (hasDependent && formData.childrenData.guardian.firstName) {
      const g = formData.childrenData.guardian
      text += ` Should any of my children be minors at the time of my death, I appoint ${fullName(g.firstName, g.lastName)}${g.relationship ? ` (${g.relationship})` : ''} as their guardian.`
    }
    sections.push(text)
  }

  // ── 4. Debts and Expenses (DEBT-01) ──────────────────────────────────────
  sections.push(`${next()}. DEBTS AND EXPENSES\n\n${DEBT_01}`)

  // ── 5. Specific Gifts ─────────────────────────────────────────────────────
  const activeGifts = formData.specificGifts.filter((g) => g.recipientName.trim())
  if (activeGifts.length > 0) {
    const gifts = activeGifts
      .map((g) => {
        let line =
          `- ${g.type === 'cash' ? `The sum of ${formatCurrency(g.amount || '0')}` : g.description || 'An item'} ` +
          `to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}.`
        if (g.substituteBeneficiary) {
          line += ` If ${g.recipientName} does not survive me by ${survivorshipDays} days, this gift is instead given to ${resolveSubstituteBeneficiaryText(g.substituteBeneficiary, g.recipientName)}.`
        }
        return line
      })
      .join('\n')
    sections.push(`${next()}. SPECIFIC GIFTS\n\nI give the following specific gifts:\n${gifts}`)
  }

  // ── 6. Residuary Estate (RES-01) ──────────────────────────────────────────
  const activePeople = formData.beneficiariesData.people.filter(
    (p) => p.name.trim() && (parseFloat(p.percentage) || 0) > 0
  )
  const activeCharities = formData.beneficiariesData.charities.filter(
    (c) => c.name.trim() && (parseFloat(c.percentage) || 0) > 0
  )
  if (activePeople.length > 0 || activeCharities.length > 0) {
    sections.push(`${next()}. RESIDUARY ESTATE\n\n${RES_01(buildResidueText(formData))}`)
  } else {
    sections.push(`${next()}. RESIDUARY ESTATE\n\n[No beneficiaries have been named yet.]`)
  }

  // ── 7. Survivorship and Gift Rules (COMMON-GIFT-01) ───────────────────────
  sections.push(`${next()}. SURVIVORSHIP AND GIFT RULES\n\n${COMMON_GIFT_01(survivorshipDays)}`)

  // ── 8. Minor Beneficiary Trust (MIN-01 + MIN-02) ─────────────────────────
  if (hasDependent) {
    const vestingAge = formData.childrenData.ageOfVesting || '25'
    sections.push(`${next()}. MINOR BENEFICIARY TRUST\n\n${MIN_01(vestingAge)}`)
    sections.push(`${next()}. ADVANCEMENT POWERS\n\n${MIN_02}`)
  }

  // ── 9. Care of Pets (PET-01) ──────────────────────────────────────────────
  if (formData.petCare.hasPets === 'yes') {
    const pc = formData.petCare
    const guardianName = pc.caregiverName || '[unnamed carer]'
    const petDesc = pc.description || 'pet'
    const fundAmount = pc.careFundAmount || '0'
    sections.push(`${next()}. CARE OF PETS\n\n${PET_01(guardianName, petDesc, fundAmount)}`)
  }

  // ── 10. Digital Assets (DIGITAL-01) — conditional on asset type ───────────
  // Access/credential location is NOT included in the Will — it belongs in Executor Information only.
  if (hasDigitalAssets) {
    sections.push(`${next()}. DIGITAL ASSETS\n\n${DIGITAL_01()}`)
  }

  // ── 11. Executor Powers (EXEC-03) — always ───────────────────────────────
  sections.push(`${next()}. EXECUTOR POWERS\n\n${EXEC_03}`)

  // ── 12–13. Trustee Powers + Appointment — only when a trust can arise ─────
  if (hasTrust) {
    sections.push(`${next()}. TRUSTEE POWERS\n\n${TRUST_POWERS_01}`)
    sections.push(`${next()}. TRUSTEE APPOINTMENT\n\n${TRUSTEE_APPOINT_01}`)
  }

  // ── 14. Appropriation Power (APPROPRIATION-01) — always ──────────────────
  sections.push(`${next()}. APPROPRIATION POWER\n\n${APPROPRIATION_01}`)

  // ── 15. Delegation Power (DELEGATE-01) — always ──────────────────────────
  sections.push(`${next()}. DELEGATION POWER\n\n${DELEGATE_01}`)

  // ── 16. Executor Indemnity (INDEMNITY-01) — always ───────────────────────
  sections.push(`${next()}. EXECUTOR INDEMNITY\n\n${INDEMNITY_01}`)

  // ── 17. Definitions (DEFN-01 — dependency-aware) ─────────────────────────
  // "intestacy rules" intentionally excluded — no operative clause uses that defined term.
  // "child"/"children" only when hasChildrenRef. "minor"/"vesting age" only when MIN-01/MIN-02 render.
  sections.push(`${next()}. DEFINITIONS\n\n${buildDefinitions(hasDependent, hasChildrenRef)}`)

  // ── 18. Interpretation (INTERP-01) — always ──────────────────────────────
  sections.push(`${next()}. INTERPRETATION\n\n${INTERP_01}`)

  // IN WITNESS WHEREOF — sentinel for PDF renderer; replaced with the formatted
  // Execution & Attestation block. Plain-text preview shows it as-is.
  sections.push(
    'IN WITNESS WHEREOF I have set my hand to this my Will, signed in the presence of two witnesses present at the same time, who attested and subscribed this Will in my presence.'
  )

  return sections.join('\n\n')
}
