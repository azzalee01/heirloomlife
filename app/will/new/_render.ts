import type { WillFormData } from './_types'

const MARITAL_LABELS: Record<string, string> = {
  single: 'single',
  married: 'married',
  domestic_partner: 'in a domestic partnership',
  divorced: 'divorced',
  separated: 'separated',
  widowed: 'widowed',
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  real_estate: 'Real Estate',
  bank_account: 'Bank Account',
  superannuation: 'Superannuation',
  shares: 'Shares / Investments',
  life_insurance: 'Life Insurance',
  vehicle: 'Vehicle',
  other: 'Other Asset',
}

const CONDITION_LABELS: Record<string, string> = {
  death: 'their death',
  remarriage: 'their remarriage or entering a new de facto relationship',
  death_or_remarriage: 'their death, remarriage, or entering a new de facto relationship, whichever occurs first',
}

function fullName(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

function assetLabel(a: WillFormData['assets'][number]): string {
  switch (a.assetType) {
    case 'real_estate':
      return a.propertyAddress || 'Property'
    case 'bank_account':
      return a.description || 'Bank account'
    case 'superannuation':
      return a.fundName || 'Superannuation fund'
    case 'shares':
      return a.companyName || 'Shares'
    case 'life_insurance':
      return a.insurerName || 'Life insurance policy'
    case 'vehicle':
      return [a.year, a.make, a.model].filter(Boolean).join(' ') || 'Vehicle'
    default:
      return a.description || 'Asset'
  }
}

/**
 * Deterministic, non-AI rendering of the will as readable document text.
 * Used for the always-available "live" preview and for replaying past
 * versions — no API call, so it's free and instant.
 */
export function renderWillText(formData: WillFormData): string {
  const pd = formData.personalDetails
  const sections: string[] = []

  const testatorName = fullName(pd.firstName, pd.middleName, pd.lastName) || '[Your name]'
  const address = [pd.addressLine1, pd.suburb, pd.state, pd.postcode].filter(Boolean).join(', ')
  const survivorshipDays = formData.survivorshipDays || '30'
  let clauseNo = 0
  const next = () => ++clauseNo

  sections.push(`LAST WILL AND TESTAMENT OF ${testatorName.toUpperCase()}`)

  sections.push(
    `I, ${testatorName}${address ? `, of ${address}` : ''}, ` +
      `being ${MARITAL_LABELS[pd.maritalStatus] || 'of the marital status shown in my profile'}, ` +
      `declare this to be my Last Will and Testament, and I revoke all previous wills and testamentary dispositions.`
  )

  if (pd.maritalStatus === 'married' || pd.maritalStatus === 'domestic_partner') {
    const sd = formData.spouseDetails
    const spouseName = fullName(sd.firstName, sd.lastName)
    if (spouseName) sections.push(`${next()}. SPOUSE / PARTNER\n\nMy spouse/partner is ${spouseName}.`)
  }

  const primary = formData.executorsData.primary
  if (primary.firstName) {
    let text = `${next()}. EXECUTORS\n\nI appoint ${fullName(primary.firstName, primary.lastName)}${primary.relationship ? ` (${primary.relationship})` : ''} as the Executor of this my Will.`
    if (formData.executorsData.hasAlternate) {
      const alt = formData.executorsData.alternate
      text += ` If my Executor is unable or unwilling to act, I appoint ${fullName(alt.firstName, alt.lastName)}${alt.relationship ? ` (${alt.relationship})` : ''} as alternate Executor.`
    }
    sections.push(text)
  } else {
    sections.push(`${next()}. EXECUTORS\n\n[No executor has been named yet.]`)
  }

  const dependents = formData.childrenData.hasChildren === 'yes' ? formData.childrenData.children.filter((c) => c.isDependent) : []
  if (formData.childrenData.hasChildren === 'yes' && formData.childrenData.children.length > 0) {
    let text = `${next()}. CHILDREN\n\nMy children are: ${formData.childrenData.children.map((c) => c.name).join(', ')}.`
    if (dependents.length > 0 && formData.childrenData.guardian.firstName) {
      const g = formData.childrenData.guardian
      text += ` Should any of my children be minors at the time of my death, I appoint ${fullName(g.firstName, g.lastName)}${g.relationship ? ` (${g.relationship})` : ''} as their guardian.`
    }
    sections.push(text)
  }

  // Testamentary trust — only relevant when there are dependent beneficiaries.
  if (dependents.length > 0) {
    const age = formData.childrenData.ageOfVesting || '18'
    sections.push(
      `${next()}. TESTAMENTARY TRUST\n\n` +
        `Where any beneficiary under this Will is under the age of ${age} years at the time their share would ` +
        `otherwise vest, my Executor shall hold that share on trust, applying income and capital for that ` +
        `beneficiary's benefit as my Executor sees fit, until that beneficiary reaches ${age} years of age, ` +
        `at which point their share shall vest absolutely.`
    )
  }

  if (formData.specificGifts.length > 0) {
    const gifts = formData.specificGifts
      .map((g) => {
        let line = `- ${g.type === 'cash' ? `The sum of $${g.amount || '0'}` : g.description || 'An item'} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}.`
        if (g.substituteBeneficiary) {
          line += ` If ${g.recipientName} does not survive me by ${survivorshipDays} days, this gift is instead given to ${g.substituteBeneficiary}.`
        }
        return line
      })
      .join('\n')
    sections.push(`${next()}. SPECIFIC GIFTS\n\nI give the following specific gifts:\n${gifts}`)
  }

  const people = formData.beneficiariesData.people
  const charities = formData.beneficiariesData.charities
  if (people.length > 0 || charities.length > 0) {
    const lines = [
      ...people.map((p) => {
        let line = `- ${p.percentage}% to ${p.name}${p.relationship ? ` (${p.relationship})` : ''}.`
        if (p.substituteBeneficiary) line += ` If ${p.name} does not survive me by ${survivorshipDays} days, this share is instead given to ${p.substituteBeneficiary}.`
        return line
      }),
      ...charities.map((c) => {
        let line = `- ${c.percentage}% to ${c.name}${c.abn ? ` (ABN ${c.abn})` : ''}.`
        if (c.substituteBeneficiary) line += ` If ${c.name} no longer exists at the time of my death, this share is instead given to ${c.substituteBeneficiary}.`
        return line
      }),
    ].join('\n')
    sections.push(
      `${next()}. RESIDUARY ESTATE\n\n` +
        `A beneficiary must survive me by ${survivorshipDays} days to inherit under this clause. ` +
        `I give the residue of my estate, after payment of debts, funeral and testamentary expenses, as follows:\n${lines}`
    )
  } else {
    sections.push(`${next()}. RESIDUARY ESTATE\n\n[No beneficiaries have been named yet.]`)
  }

  if (formData.lifeInterest.enabled) {
    const li = formData.lifeInterest
    sections.push(
      `${next()}. LIFE INTEREST\n\n` +
        `I give ${li.lifeTenantName || '[unnamed]'}${li.lifeTenantRelationship ? ` (${li.lifeTenantRelationship})` : ''} the right to reside at ` +
        `${li.propertyDescription || '[property not described]'} until ${CONDITION_LABELS[li.condition] || 'a triggering event occurs'}, ` +
        `after which the property passes to ${li.remainderBeneficiaryName || '[unnamed]'}${li.remainderBeneficiaryRelationship ? ` (${li.remainderBeneficiaryRelationship})` : ''}.`
    )
  }

  if (formData.petCare.hasPets === 'yes') {
    const pc = formData.petCare
    let text = `${next()}. CARE OF PETS\n\nI wish for ${pc.description || 'my pets'} to be cared for by ${pc.caregiverName || '[unnamed]'}${pc.caregiverRelationship ? ` (${pc.caregiverRelationship})` : ''}.`
    if (pc.careFundAmount) text += ` I direct that $${pc.careFundAmount} be set aside from my estate for their ongoing care.`
    sections.push(text)
  }

  // Funeral wishes are non-testamentary and stored in personal_wishes — not included in the signed Will document.

  if (formData.assetsOutsideAustralia) {
    sections.push(
      `${next()}. ASSETS OUTSIDE AUSTRALIA\n\n` +
        `I own assets in the following jurisdiction(s): ${formData.otherJurisdictions || '[not specified]'}. ` +
        `A separate will valid in that jurisdiction may be required — this has been noted for solicitor review.`
    )
  }

  if (formData.importantDocumentsLocation) {
    sections.push(`${next()}. IMPORTANT DOCUMENTS\n\n${formData.importantDocumentsLocation}`)
  }

  if (formData.assets.length > 0) {
    const assets = formData.assets
      .map((a) => {
        let line = `- ${ASSET_TYPE_LABELS[a.assetType] || 'Asset'}: ${assetLabel(a)}`
        if (a.isOverseas) line += ` (overseas — ${a.overseasCountry || 'country not specified'})`
        if ((a.assetType === 'superannuation' || a.assetType === 'life_insurance') && a.hasDeathBenefitNomination) {
          line += ` — NOTE: has a binding death benefit nomination on file (${a.deathBenefitNominees || 'nominee not specified'}); this asset may pass outside this will`
        }
        return line
      })
      .join('\n')
    sections.push(`ESTATE ASSETS ON RECORD (for reference)\n\n${assets}`)
  }

  sections.push(
    'IN WITNESS WHEREOF I have set my hand to this my Will, signed in the presence of two witnesses present at the same time, who attested and subscribed this Will in my presence.'
  )

  sections.push(
    'IMPORTANT NOTICE\n\n' +
      'Heirloom Life provides a platform for you to prepare your own Will. We are not a law firm and this is not legal advice. Our platform is built using established estate planning drafting standards. This document has not been reviewed by a solicitor unless you have purchased the review add-on. If your situation involves overseas assets, business ownership, or a blended family, a solicitor review is strongly recommended — this is available as an add-on from your Vault.'
  )

  return sections.join('\n\n')
}
