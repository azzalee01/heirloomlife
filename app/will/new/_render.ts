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

function fullName(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

function assetLabel(a: WillFormData['assets'][number]): string {
  switch (a.assetType) {
    case 'real_estate':
      return a.propertyAddress || 'Property'
    case 'bank_account':
      return a.bankName || 'Bank account'
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

  sections.push(`LAST WILL AND TESTAMENT OF ${testatorName.toUpperCase()}`)

  sections.push(
    `I, ${testatorName}${address ? `, of ${address}` : ''}, ` +
      `being ${MARITAL_LABELS[pd.maritalStatus] || 'of the marital status shown in my profile'}, ` +
      `declare this to be my Last Will and Testament, and I revoke all previous wills and testamentary dispositions.`
  )

  if (pd.maritalStatus === 'married' || pd.maritalStatus === 'domestic_partner') {
    const sd = formData.spouseDetails
    const spouseName = fullName(sd.firstName, sd.lastName)
    if (spouseName) sections.push(`1. SPOUSE / PARTNER\n\nMy spouse/partner is ${spouseName}.`)
  }

  const primary = formData.executorsData.primary
  if (primary.firstName) {
    let text = `${sections.length + 1}. EXECUTORS\n\nI appoint ${fullName(primary.firstName, primary.lastName)}${primary.relationship ? ` (${primary.relationship})` : ''} as the Executor of this my Will.`
    if (formData.executorsData.hasAlternate) {
      const alt = formData.executorsData.alternate
      text += ` If my Executor is unable or unwilling to act, I appoint ${fullName(alt.firstName, alt.lastName)}${alt.relationship ? ` (${alt.relationship})` : ''} as alternate Executor.`
    }
    sections.push(text)
  } else {
    sections.push(`${sections.length + 1}. EXECUTORS\n\n[No executor has been named yet.]`)
  }

  if (formData.childrenData.hasChildren === 'yes' && formData.childrenData.children.length > 0) {
    const dependents = formData.childrenData.children.filter((c) => c.isDependent)
    let text = `${sections.length + 1}. CHILDREN\n\nMy children are: ${formData.childrenData.children.map((c) => c.name).join(', ')}.`
    if (dependents.length > 0 && formData.childrenData.guardian.firstName) {
      const g = formData.childrenData.guardian
      text += ` Should any of my children be minors at the time of my death, I appoint ${fullName(g.firstName, g.lastName)}${g.relationship ? ` (${g.relationship})` : ''} as their guardian.`
    }
    sections.push(text)
  }

  if (formData.specificGifts.length > 0) {
    const gifts = formData.specificGifts
      .map(
        (g) =>
          `- ${g.type === 'cash' ? `The sum of $${g.amount || '0'}` : g.description || 'An item'} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}.`
      )
      .join('\n')
    sections.push(`${sections.length + 1}. SPECIFIC GIFTS\n\nI give the following specific gifts:\n${gifts}`)
  }

  const people = formData.beneficiariesData.people
  const charities = formData.beneficiariesData.charities
  if (people.length > 0 || charities.length > 0) {
    const lines = [
      ...people.map((p) => `- ${p.percentage}% to ${p.name}${p.relationship ? ` (${p.relationship})` : ''}.`),
      ...charities.map((c) => `- ${c.percentage}% to ${c.name}${c.abn ? ` (ABN ${c.abn})` : ''}.`),
    ].join('\n')
    sections.push(
      `${sections.length + 1}. RESIDUARY ESTATE\n\nI give the residue of my estate, after payment of debts and expenses, as follows:\n${lines}`
    )
  } else {
    sections.push(`${sections.length + 1}. RESIDUARY ESTATE\n\n[No beneficiaries have been named yet.]`)
  }

  if (formData.assets.length > 0) {
    const assets = formData.assets
      .map((a) => `- ${ASSET_TYPE_LABELS[a.assetType] || 'Asset'}: ${assetLabel(a)}`)
      .join('\n')
    sections.push(`ESTATE ASSETS ON RECORD (for reference)\n\n${assets}`)
  }

  sections.push(
    'IN WITNESS WHEREOF I have set my hand to this my Will, signed in the presence of two witnesses present at the same time, who attested and subscribed this Will in my presence.'
  )

  return sections.join('\n\n')
}
