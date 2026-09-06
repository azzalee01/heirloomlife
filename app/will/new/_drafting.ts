import Anthropic from '@anthropic-ai/sdk'
import type { WillFormData } from './_types'
import { resolveSubstituteBeneficiaryText } from './_types'

function looksLikeCredential(text: string): boolean {
  if (/[0-9a-fA-F]{64}/.test(text)) return true
  if (/\b[0-9a-fA-F]{32,}\b/.test(text)) return true
  if (/\b[1-9A-HJ-NP-Za-km-z]{50,}\b/.test(text)) return true
  if (/(password|mnemonic|seed phrase|private key|secret key)\s*(is|:)/i.test(text)) return true
  const words = text.trim().split(/\s+/)
  if (words.length >= 11 && words.every(w => /^[a-z]+$/.test(w))) return true
  return false
}
const client = new Anthropic()

const SYSTEM_PROMPT = `You are drafting a formal Australian Will document from structured intake data for Heirloom, an online will-writing platform. Produce the complete will text, customised to this testator's specific circumstances (their state's conventions, whether they have a spouse, children, specific gifts, etc  -  omit any section that doesn't apply rather than leaving placeholders).

Structure to follow, adapting section numbers and headings as appropriate, and omitting any that don't apply:
1. Heading identifying the testator (full name, address) and a revocation-of-prior-wills clause.
2. Appointment of executor(s), including the alternate if one was named.
3. If there are dependent children, appointment of a guardian.
4. If there are dependent beneficiaries, a testamentary trust clause: their share is held on trust until the stated age of vesting rather than paid out immediately.
5. Specific gifts of named items or cash amounts to named recipients, including a substitute recipient clause where one was given (if the named recipient does not survive the testator by the stated survivorship period, the gift passes to the substitute instead).
6. Distribution of the residuary estate to the named beneficiaries by percentage (individuals and/or charities), including the survivorship period and substitute beneficiaries where given.
7. A life interest / right-to-reside clause, if one was specified  -  who may live in the property, until what triggering event, and who it passes to afterwards.
8. A pet care clause, if pets were specified  -  who cares for them and any funds set aside.
9. A funeral wishes section, clearly stated as guidance that is not legally binding on the executor.
10. A note on assets held overseas, if any, flagging that a separate will may be needed in that jurisdiction.
11. A note on assets with an existing binding death benefit nomination (superannuation/life insurance), flagging that those may pass outside the will.
12. A closing attestation clause for signing and witnessing (do not fabricate witness names).

Write in formal legal-document prose appropriate for a will, using the testator's real details throughout. Do not include commentary, explanations, or a preamble  -  output only the will document text itself. Include a note in an Important: line at the end of the document stating that this document was prepared using Heirloom Life's template platform and has been subject to a standard solicitor quality review before being issued, and must be signed and witnessed to be legally valid.`

function buildIntakeSummary(formData: WillFormData): string {
  const pd = formData.personalDetails
  const lines: string[] = []

  lines.push(
    `Testator: ${pd.firstName} ${pd.middleName} ${pd.lastName}, DOB ${pd.dateOfBirth}, occupation ${pd.occupation}.`
  )
  lines.push(`Address: ${pd.addressLine1}, ${pd.suburb} ${pd.state} ${pd.postcode}.`)
  lines.push(`Marital status: ${pd.maritalStatus || 'not specified'}.`)

  if (pd.maritalStatus === 'married' || pd.maritalStatus === 'domestic_partner') {
    const sd = formData.spouseDetails
    lines.push(`Spouse/partner: ${sd.firstName} ${sd.lastName}.`)
  }

  if (formData.childrenData.hasChildren === 'yes' && formData.childrenData.children.length > 0) {
    lines.push(
      'Children: ' +
        formData.childrenData.children
          .map((c) => `${c.name}${c.isDependent ? ' (minor/dependent)' : ''}`)
          .join(', ')
    )
    const hasMinors = formData.childrenData.children.some((c) => c.isDependent)
    if (hasMinors && formData.childrenData.guardian.firstName) {
      const g = formData.childrenData.guardian
      lines.push(`Guardian for minor children: ${g.firstName} ${g.lastName} (${g.relationship}).`)
    }
    if (hasMinors) {
      lines.push(`Testamentary trust age of vesting for dependent beneficiaries: ${formData.childrenData.ageOfVesting || '18'}.`)
    }
  }

  const primary = formData.executorsData.primary
  lines.push(`Primary executor: ${primary.firstName} ${primary.lastName}, ${primary.relationship}.`)
  if (formData.executorsData.hasAlternate) {
    const alt = formData.executorsData.alternate
    lines.push(`Alternate executor: ${alt.firstName} ${alt.lastName}, ${alt.relationship}.`)
  }

  if (formData.assets.length > 0) {
    lines.push(
      'Estate assets: ' +
        formData.assets
          .map((a) => {
            let s = `${a.assetType}${a.propertyAddress ? ` at ${a.propertyAddress}` : ''}${a.estimatedValue ? ` (est. $${a.estimatedValue})` : ''}`
            if (a.assetType === 'digital_asset' && a.description) s += ` - ${a.description}`
            if (a.assetType === 'digital_asset' && a.accessLocation && !looksLikeCredential(a.accessLocation)) {
              s += ` [access instructions at: ${a.accessLocation}]`
            }
            if (a.isOverseas) s += ` [overseas: ${a.overseasCountry}]`
            if ((a.assetType === 'superannuation' || a.assetType === 'life_insurance') && a.hasDeathBenefitNomination) {
              s += ` [has binding death benefit nomination: ${a.deathBenefitNominees}]`
            }
            return s
          })
          .join('; ')
    )
  }
  if (formData.assetsOutsideAustralia) {
    lines.push(`Testator holds assets outside Australia in: ${formData.otherJurisdictions || 'not specified'}.`)
  }

  const survivorshipDays = formData.survivorshipDays || '30'
  lines.push(`Survivorship period: ${survivorshipDays} days.`)

  if (formData.specificGifts.length > 0) {
    lines.push(
      'Specific gifts: ' +
        formData.specificGifts
          .map((g) => {
            let s = `${g.type === 'cash' ? `$${g.amount} cash` : g.description} to ${g.recipientName} (${g.recipientRelationship})`
              if (g.substituteBeneficiary) s += `, substitute if not surviving: ${resolveSubstituteBeneficiaryText(g.substituteBeneficiary)}`            
return s
          })
          .join('; ')
    )
  }

  const people = formData.beneficiariesData.people.map(
    (p) => `${p.name} (${p.relationship}) - ${p.percentage}%${p.substituteBeneficiary ? `, substitute: ${resolveSubstituteBeneficiaryText(p.substituteBeneficiary)}` : ''}`
  )
  const charities = formData.beneficiariesData.charities.map(
    (c) => `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''} - ${c.percentage}%${c.substituteBeneficiary ? `, substitute: ${resolveSubstituteBeneficiaryText(c.substituteBeneficiary)}` : ''}`
  )
  lines.push('Residuary beneficiaries: ' + [...people, ...charities].join('; '))

  if (formData.lifeInterest.enabled) {
    const li = formData.lifeInterest
    lines.push(
      `Life interest: ${li.lifeTenantName} (${li.lifeTenantRelationship}) may reside at ${li.propertyDescription} until ${li.condition}, then it passes to ${li.remainderBeneficiaryName} (${li.remainderBeneficiaryRelationship}).`
    )
  }

  if (formData.petCare.hasPets === 'yes') {
    const pc = formData.petCare
    lines.push(`Pet care: ${pc.description} to be cared for by ${pc.caregiverName} (${pc.caregiverRelationship})${pc.careFundAmount ? `, with $${pc.careFundAmount} set aside for care` : ''}.`)
  }

  // Funeral wishes excluded  -  non-testamentary, stored in personal_wishes separately.

  if (formData.importantDocumentsLocation) {
    lines.push(`Important documents location: ${formData.importantDocumentsLocation}.`)
  }

  return lines.join('\n')
}

export async function generateWillDocumentText(formData: WillFormData): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildIntakeSummary(formData) }],
  })

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}
