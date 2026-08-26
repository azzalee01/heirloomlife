import Anthropic from '@anthropic-ai/sdk'
import type { WillFormData } from './_types'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a legal-risk triage assistant for Heirloom, an Australian online will-writing platform. Every will already gets a standard solicitor check before being finalised. Your job is narrower: flag whether THIS will's specific circumstances warrant a closer, non-standard solicitor review beyond that baseline check.

Flag needsReview=true for things like:
- Blended families, estranged relatives, or dependants who could contest the will
- Minor or dependent children with no guardian named, or an unclear guardian arrangement
- Business assets, trusts, overseas assets, or other structures beyond simple personal assets
- Residuary beneficiary percentages that don't sum to 100%, or gifts that conflict with each other
- No executor named, or an executor who is also a major beneficiary in a way that could raise concerns
- Beneficiaries or specific gifts with no substitute/fallback named  -  a real risk if that person predeceases the testator
- A life interest (right to reside) provision, which needs careful drafting to avoid ambiguity
- Assets with a binding death benefit nomination noted, since those may conflict with the will's residuary intentions
- Any other circumstance a solicitor would specifically want to look at before this will is signed

Do not flag routine, simple estates with no red flags  -  most straightforward wills should return needsReview=false.`

const SCHEMA = {
  type: 'object',
  properties: {
    needsReview: { type: 'boolean' },
    reasons: {
      type: 'array',
      items: { type: 'string' },
      description: 'Short, plain-English reasons a solicitor should look at this will. Empty if needsReview is false.',
    },
  },
  required: ['needsReview', 'reasons'],
  additionalProperties: false,
} as const

function summarizeForReview(formData: WillFormData): string {
  const pd = formData.personalDetails
  const totalPct =
    formData.beneficiariesData.people.reduce((s, p) => s + (parseFloat(p.percentage) || 0), 0) +
    formData.beneficiariesData.charities.reduce((s, c) => s + (parseFloat(c.percentage) || 0), 0)

  return JSON.stringify({
    maritalStatus: pd.maritalStatus,
    children: formData.childrenData.children.map((c) => ({ isDependent: c.isDependent })),
    hasGuardianNamed: !!formData.childrenData.guardian.firstName,
    ageOfVesting: formData.childrenData.ageOfVesting,
    hasPrimaryExecutor: !!formData.executorsData.primary.firstName,
    executorIsAlsoBeneficiary:
      formData.executorsData.primary.firstName &&
      formData.beneficiariesData.people.some(
        (p) => p.name?.toLowerCase() === `${formData.executorsData.primary.firstName} ${formData.executorsData.primary.lastName}`.toLowerCase()
      ),
    assetTypes: formData.assets.map((a) => a.assetType),
    assetsWithDeathBenefitNomination: formData.assets.filter((a) => a.hasDeathBenefitNomination).length,
    overseasAssetCount: formData.assets.filter((a) => a.isOverseas).length,
    residuaryBeneficiaryPercentageTotal: totalPct,
    residuaryBeneficiariesMissingSubstitute: [...formData.beneficiariesData.people, ...formData.beneficiariesData.charities].filter((b) => !b.substituteBeneficiary).length,
    specificGiftCount: formData.specificGifts.length,
    survivorshipDays: formData.survivorshipDays,
    lifeInterestEnabled: formData.lifeInterest.enabled,
    hasPets: formData.petCare.hasPets === 'yes',
  })
}

export async function assessLegalReviewNeed(
  formData: WillFormData
): Promise<{ needsReview: boolean; reasons: string[] }> {
  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: summarizeForReview(formData) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return { needsReview: false, reasons: [] }

  try {
    const parsed = JSON.parse(textBlock.text) as { needsReview: boolean; reasons: string[] }
    return { needsReview: !!parsed.needsReview, reasons: parsed.reasons ?? [] }
  } catch {
    return { needsReview: false, reasons: [] }
  }
}
