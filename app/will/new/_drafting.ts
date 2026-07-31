import Anthropic from '@anthropic-ai/sdk'
import type { WillFormData } from './_types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are drafting a formal Australian Will document from structured intake data for Heirloom, an online will-writing platform. Produce the complete will text, customised to this testator's specific circumstances (their state's conventions, whether they have a spouse, children, specific gifts, etc — omit any section that doesn't apply rather than leaving placeholders).

Structure to follow, adapting section numbers and headings as appropriate:
1. Heading identifying the testator (full name, address) and a revocation-of-prior-wills clause.
2. Appointment of executor(s), including the alternate if one was named.
3. If there are dependent children, appointment of a guardian.
4. Specific gifts of named items or cash amounts to named recipients.
5. Distribution of the residuary estate to the named beneficiaries by percentage (individuals and/or charities).
6. A closing attestation clause for signing and witnessing (do not fabricate witness names).

Write in formal legal-document prose appropriate for a will, using the testator's real details throughout. Do not include commentary, explanations, or a preamble — output only the will document text itself. Include a note in a Important: line at the end of the document that this draft requires solicitor review before execution.`

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
          .map((a) => `${a.assetType}${a.propertyAddress ? ` at ${a.propertyAddress}` : ''}${a.estimatedValue ? ` (est. $${a.estimatedValue})` : ''}`)
          .join('; ')
    )
  }

  if (formData.specificGifts.length > 0) {
    lines.push(
      'Specific gifts: ' +
        formData.specificGifts
          .map((g) => `${g.type === 'cash' ? `$${g.amount} cash` : g.description} to ${g.recipientName} (${g.recipientRelationship})`)
          .join('; ')
    )
  }

  const people = formData.beneficiariesData.people.map((p) => `${p.name} (${p.relationship}) — ${p.percentage}%`)
  const charities = formData.beneficiariesData.charities.map((c) => `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''} — ${c.percentage}%`)
  lines.push('Residuary beneficiaries: ' + [...people, ...charities].join('; '))

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
