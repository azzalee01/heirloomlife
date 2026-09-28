'use server'

import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'node:crypto'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from '@/app/will/new/_data'
import { saveStep } from '@/app/will/new/_actions'
import { assembleWillDocument } from '@/app/will/new/_assembly'
import type { WillFormData } from '@/app/will/new/_types'
import { hasUpdatesAccess } from '@/src/lib/entitlements'

const client = new Anthropic()

export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string }
export type AmendmentProposal = {
  id: string
  toolName: string
  toolInput: Record<string, unknown>
  summary: string
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'add_asset',
    description:
      'Propose adding a new asset to the estate (real estate, bank account, superannuation, shares, life insurance, vehicle, or other). Call this when the user describes acquiring or wanting to record a new asset.',
    input_schema: {
      type: 'object',
      properties: {
        assetType: {
          type: 'string',
          enum: ['real_estate', 'bank_account', 'superannuation', 'shares', 'life_insurance', 'vehicle', 'other'],
        },
        ownershipType: { type: 'string', enum: ['sole', 'joint_tenants', 'tenants_in_common'] },
        propertyAddress: { type: 'string', description: 'Full address, for real_estate' },
        estimatedValue: { type: 'string', description: 'Estimated value in AUD' },
        bankName: { type: 'string' },
        bsb: { type: 'string' },
        accountNumber: { type: 'string' },
        fundName: { type: 'string' },
        memberNumber: { type: 'string' },
        companyName: { type: 'string' },
        numberOfShares: { type: 'string' },
        insurerName: { type: 'string' },
        policyNumber: { type: 'string' },
        coverAmount: { type: 'string' },
        make: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'string' },
        rego: { type: 'string' },
        description: { type: 'string', description: 'For other asset type' },
        otherValue: { type: 'string' },
      },
      required: ['assetType'],
    },
  },
  {
    name: 'add_beneficiary',
    description:
      'Propose adding a person or charity as a new beneficiary to inherit a share of the residuary estate. Only call this when the user has stated (or confirmed) a percentage share.',
    input_schema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['individual', 'organisation'] },
        name: { type: 'string', description: "Person's name, or organisation/charity name" },
        relationship: { type: 'string', description: 'Relationship to the testator, for individuals' },
        abn: { type: 'string', description: 'ABN, for organisations' },
        percentage: { type: 'string', description: 'Share of the estate as a percentage, e.g. "25"' },
      },
      required: ['kind', 'name', 'percentage'],
    },
  },
  {
    name: 'add_specific_gift',
    description:
      'Propose adding a specific item or a cash gift to a named person, separate from the residuary estate split.',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['item', 'cash'] },
        description: { type: 'string', description: 'Description of the item, for type=item' },
        amount: { type: 'string', description: 'Cash amount in AUD, for type=cash' },
        recipientName: { type: 'string' },
        recipientRelationship: { type: 'string' },
      },
      required: ['type', 'recipientName'],
    },
  },
  {
    name: 'replace_executor',
    description:
      'Propose replacing the current primary executor or backup executor with a new person. Call this when the user wants to change who their executor or backup executor is.',
    input_schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['primary', 'backup'], description: 'Which executor to replace' },
        currentName: {
          type: 'string',
          description: 'Full name of the person being replaced, for the confirmation message',
        },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        relationship: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
      },
      required: ['role', 'firstName', 'lastName'],
    },
  },
  {
    name: 'update_beneficiary_share',
    description:
      "Propose changing an existing beneficiary's percentage share of the residuary estate.",
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the existing beneficiary to update' },
        newPercentage: { type: 'string', description: 'New share percentage, e.g. "30"' },
      },
      required: ['name', 'newPercentage'],
    },
  },
  {
    name: 'replace_beneficiary',
    description:
      'Propose replacing a named beneficiary in the residuary estate with a different person, keeping the same or a new percentage.',
    input_schema: {
      type: 'object',
      properties: {
        currentName: { type: 'string', description: 'Name of the beneficiary being replaced' },
        newName: { type: 'string', description: 'Name of the replacement beneficiary' },
        relationship: { type: 'string', description: "New person's relationship to the testator" },
        newPercentage: {
          type: 'string',
          description: 'New percentage — omit to keep the current share unchanged',
        },
      },
      required: ['currentName', 'newName'],
    },
  },
  {
    name: 'refer_to_solicitor',
    description:
      'Call this ONLY when the user asks a question that requires personalised legal advice about their specific circumstances — e.g. whether to include or exclude someone, whether something is legally valid for them, tax implications, preventing a challenge, what they "should" do with their estate. Do NOT call this for general terminology questions.',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Brief description of the legal topic' },
      },
      required: ['topic'],
    },
  },
]

const SYSTEM_PROMPT = `You are the Estate Assistant for Heirloom, an Australian online Will-writing platform. You help customers understand what their Will currently says, explain Will concepts in plain language, and propose changes when life changes.

## What you can do

1. **Answer factual questions** about the Will using the summary below as your only source. Be direct. Do not make up or guess anything not in the summary. If something isn't recorded there, say so clearly.

2. **Explain Will terminology** — short factual explanations for general concepts like executor, beneficiary, residuary estate, guardian, survivorship period, etc. Keep explanations general, not personalised to this specific Will.

3. **Propose changes** — use the provided tools to propose changes the user has decided on. Never claim a change has been made without using a tool. After calling a tool, one sentence describing what you're proposing and that it needs confirmation. Ask one clarifying question if required information is missing.

4. **Refer to a solicitor** — call refer_to_solicitor when the question requires personalised legal judgment about this person's circumstances.

## Rules

- Answer questions from the Will summary only.
- Propose one change at a time unless the user clearly requested multiple.
- Never give personalised legal advice: whether to include or exclude someone, enforceability, tax consequences, how to prevent a challenge, whether an arrangement is legally valid for this person, or what someone "should" do. Call refer_to_solicitor for these.
- Do NOT add disclaimers to every response. Only call refer_to_solicitor when genuinely required.
- Keep responses short and conversational.`

function summarizeWill(formData: WillFormData): string {
  const parts: string[] = []
  const pd = formData.personalDetails

  if (pd.firstName) {
    parts.push(
      `Testator: ${pd.firstName}${pd.middleName ? ' ' + pd.middleName : ''} ${pd.lastName}, DOB ${pd.dateOfBirth || 'not provided'}, marital status: ${pd.maritalStatus || 'not specified'}.`
    )
  }

  // Executors
  const ep = formData.executorsData.primary
  if (ep.firstName) {
    parts.push(`Primary executor: ${ep.firstName} ${ep.lastName} (${ep.relationship || 'relationship not specified'}).`)
    if (formData.executorsData.hasAlternate && formData.executorsData.alternate.firstName) {
      const ea = formData.executorsData.alternate
      parts.push(
        `Backup/alternate executor: ${ea.firstName} ${ea.lastName} (${ea.relationship || 'relationship not specified'}).`
      )
    } else {
      parts.push('No backup executor appointed.')
    }
  } else {
    parts.push('Executors: none appointed yet.')
  }

  // Children and guardian
  if (formData.childrenData.hasChildren === 'yes' && formData.childrenData.children.length > 0) {
    parts.push(
      'Children: ' +
        formData.childrenData.children
          .map((c) => `${c.name}${c.isDependent ? ' (minor/dependent)' : ''}`)
          .join(', ') +
        '.'
    )
    const hasMinors = formData.childrenData.children.some((c) => c.isDependent)
    if (hasMinors) {
      const g = formData.childrenData.guardian
      if (g.firstName) {
        parts.push(`Guardian for minor children: ${g.firstName} ${g.lastName} (${g.relationship}).`)
      } else {
        parts.push('No guardian appointed for minor children.')
      }
      parts.push(
        `Minor beneficiaries' share held on trust until age: ${formData.childrenData.ageOfVesting || '18'}.`
      )
    }
  } else {
    parts.push('No children recorded.')
  }

  // Residuary beneficiaries
  if (
    formData.beneficiariesData.people.length > 0 ||
    formData.beneficiariesData.charities.length > 0
  ) {
    const people = formData.beneficiariesData.people.map(
      (p) =>
        `${p.name} (${p.relationship || 'relationship not specified'}) — ${p.percentage}%${p.substituteBeneficiary ? `, substitute: ${p.substituteBeneficiary}` : ''}`
    )
    const charities = formData.beneficiariesData.charities.map(
      (c) => `${c.name}${c.abn ? ` (ABN ${c.abn})` : ''} — ${c.percentage}%`
    )
    parts.push('Residuary beneficiaries: ' + [...people, ...charities].join('; ') + '.')
  } else {
    parts.push('Residuary beneficiaries: none recorded yet.')
  }

  // Specific gifts
  if (formData.specificGifts.length > 0) {
    parts.push(
      'Specific gifts: ' +
        formData.specificGifts
          .map(
            (g) =>
              `${g.type === 'cash' ? `$${g.amount} cash` : g.description} to ${g.recipientName}${g.recipientRelationship ? ` (${g.recipientRelationship})` : ''}`
          )
          .join('; ') +
        '.'
    )
  } else {
    parts.push('Specific gifts: none.')
  }

  // Assets (brief)
  if (formData.assets.length > 0) {
    parts.push(
      'Estate assets: ' +
        formData.assets
          .map(
            (a) =>
              `${a.assetType}${a.propertyAddress ? ` at ${a.propertyAddress}` : ''}${a.description ? ` (${a.description})` : ''}`
          )
          .join(', ') +
        '.'
    )
  } else {
    parts.push('Assets: none recorded yet.')
  }

  // Pet care
  if (formData.petCare.hasPets === 'yes') {
    const pc = formData.petCare
    parts.push(
      `Pet care: ${pc.petDescription || 'pet'} named ${pc.petName}, carer: ${pc.caregiverName}${pc.careFundAmount ? `, fund: $${pc.careFundAmount}` : ''}.`
    )
  }

  return parts.join('\n')
}

async function getWillContext(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
  userId: string
  willId: string
  hasDownloaded: boolean
  willStatus: string
}> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, has_downloaded, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const will = willRows?.[0] as
    | { id: string; has_downloaded: boolean; status: string }
    | undefined
  if (!will) throw new Error('No will found — start a will first')

  return {
    supabase,
    userId: user.id,
    willId: will.id,
    hasDownloaded: will.has_downloaded ?? false,
    willStatus: will.status ?? 'draft',
  }
}

async function requireAmendmentAccess(userId: string, hasDownloaded: boolean): Promise<void> {
  if (!hasDownloaded) return
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status, updates_status, updates_active_until')
    .eq('id', userId)
    .single()
  if (!hasUpdatesAccess(profile)) {
    throw new Error('MEMBERSHIP_REQUIRED')
  }
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  const { supabase, willId } = await getWillContext()
  const { data } = await supabase
    .from('chat_messages')
    .select('id, role, content')
    .eq('will_id', willId)
    .order('created_at', { ascending: true })
  return (data ?? []) as ChatMessage[]
}

export async function sendChatMessage(
  history: ChatMessage[],
  userText: string
): Promise<{ reply: string; proposals: AmendmentProposal[] }> {
  const { supabase, userId, willId, hasDownloaded } = await getWillContext()
  await requireAmendmentAccess(userId, hasDownloaded)
  const { formData } = await loadWillFormData(supabase, userId, willId)

  await supabase.from('chat_messages').insert({ will_id: willId, role: 'user', content: userText })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\nCurrent Will summary:\n${summarizeWill(formData)}`,
    tools: TOOLS,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userText },
    ],
  })

  let reply = ''
  const proposals: AmendmentProposal[] = []
  for (const block of response.content) {
    if (block.type === 'text') {
      reply += block.text
    } else if (block.type === 'tool_use') {
      proposals.push({
        id: block.id,
        toolName: block.name,
        toolInput: block.input as Record<string, unknown>,
        summary: describeProposal(block.name, block.input as Record<string, unknown>),
      })
    }
  }

  if (reply.trim()) {
    await supabase
      .from('chat_messages')
      .insert({ will_id: willId, role: 'assistant', content: reply.trim() })
  }

  return { reply: reply.trim(), proposals }
}

function describeProposal(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'add_asset':
      return `Add asset: ${input.assetType}${input.description ? ` — ${input.description}` : ''}`
    case 'add_beneficiary':
      return `Add beneficiary: ${input.name} (${input.percentage}%)`
    case 'add_specific_gift':
      return `Add gift: ${input.type === 'cash' ? `$${input.amount}` : input.description} to ${input.recipientName}`
    case 'replace_executor': {
      const role = input.role === 'backup' ? 'backup' : 'primary'
      const from = input.currentName ? ` replacing ${input.currentName}` : ''
      return `Replace ${role} executor${from} with ${input.firstName} ${input.lastName}`
    }
    case 'update_beneficiary_share':
      return `Update ${input.name}'s share to ${input.newPercentage}%`
    case 'replace_beneficiary':
      return `Replace ${input.currentName} with ${input.newName}${input.newPercentage ? ` (${input.newPercentage}%)` : ''} as beneficiary`
    case 'refer_to_solicitor':
      return `Legal question: ${input.topic}`
    default:
      return `Proposed change: ${toolName}`
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export async function applyAmendment(
  proposal: AmendmentProposal
): Promise<{ requiresReview: boolean }> {
  // Solicitor referral is informational — no DB change needed
  if (proposal.toolName === 'refer_to_solicitor') return { requiresReview: false }

  const { supabase, userId, willId, hasDownloaded, willStatus } = await getWillContext()
  await requireAmendmentAccess(userId, hasDownloaded)
  const { formData } = await loadWillFormData(supabase, userId, willId)
  const input = proposal.toolInput

  let amendmentVersionId: string | null = null

  switch (proposal.toolName) {
    case 'add_asset': {
      const assets = [
        ...formData.assets,
        {
          id: randomUUID(),
          assetType: str(input.assetType) as WillFormData['assets'][number]['assetType'],
          ownershipType: str(input.ownershipType) as WillFormData['assets'][number]['ownershipType'],
          propertyAddress: str(input.propertyAddress),
          estimatedValue: str(input.estimatedValue),
          bankName: str(input.bankName),
          bsb: str(input.bsb),
          accountNumber: str(input.accountNumber),
          fundName: str(input.fundName),
          memberNumber: str(input.memberNumber),
          companyName: str(input.companyName),
          numberOfShares: str(input.numberOfShares),
          insurerName: str(input.insurerName),
          policyNumber: str(input.policyNumber),
          coverAmount: str(input.coverAmount),
          make: str(input.make),
          model: str(input.model),
          year: str(input.year),
          rego: str(input.rego),
          description: str(input.description),
          otherValue: str(input.otherValue),
          accessLocation: '',
          hasDeathBenefitNomination: false,
          deathBenefitNominees: '',
          isOverseas: false,
          overseasCountry: '',
        },
      ]
      ;({ versionId: amendmentVersionId } = await saveStep(willId, 'assets', { ...formData, assets }, proposal.summary))
      break
    }

    case 'add_beneficiary': {
      const entry = {
        id: randomUUID(),
        name: str(input.name),
        percentage: str(input.percentage),
        substituteBeneficiary: '',
      }
      const beneficiariesData =
        input.kind === 'organisation'
          ? {
              ...formData.beneficiariesData,
              charities: [
                ...formData.beneficiariesData.charities,
                { ...entry, abn: str(input.abn) },
              ],
            }
          : {
              ...formData.beneficiariesData,
              people: [
                ...formData.beneficiariesData.people,
                { ...entry, relationship: str(input.relationship) },
              ],
            }
      ;({ versionId: amendmentVersionId } = await saveStep(willId, 'beneficiaries', { ...formData, beneficiariesData }, proposal.summary))
      break
    }

    case 'add_specific_gift': {
      const specificGifts = [
        ...formData.specificGifts,
        {
          id: randomUUID(),
          type: (input.type === 'cash' ? 'cash' : 'item') as 'item' | 'cash',
          description: str(input.description),
          amount: str(input.amount),
          recipientName: str(input.recipientName),
          recipientRelationship: str(input.recipientRelationship),
          substituteBeneficiary: '',
        },
      ]
      ;({ versionId: amendmentVersionId } = await saveStep(willId, 'gifts', { ...formData, specificGifts }, proposal.summary))
      break
    }

    case 'replace_executor': {
      const person = {
        firstName: str(input.firstName),
        lastName: str(input.lastName),
        relationship: str(input.relationship),
        phone: str(input.phone),
        email: str(input.email),
        address: str(input.address),
      }
      const executorsData =
        input.role === 'backup'
          ? { ...formData.executorsData, hasAlternate: true, alternate: person }
          : { ...formData.executorsData, primary: person }
      ;({ versionId: amendmentVersionId } = await saveStep(willId, 'executors', { ...formData, executorsData }, proposal.summary))
      break
    }

    case 'update_beneficiary_share': {
      const targetName = str(input.name).toLowerCase()
      const newPct = str(input.newPercentage)
      const people = formData.beneficiariesData.people.map((p) =>
        p.name.toLowerCase() === targetName ? { ...p, percentage: newPct } : p
      )
      const charities = formData.beneficiariesData.charities.map((c) =>
        c.name.toLowerCase() === targetName ? { ...c, percentage: newPct } : c
      )
      ;({ versionId: amendmentVersionId } = await saveStep(
        willId,
        'beneficiaries',
        { ...formData, beneficiariesData: { ...formData.beneficiariesData, people, charities } },
        proposal.summary
      ))
      break
    }

    case 'replace_beneficiary': {
      const currentName = str(input.currentName).toLowerCase()
      const newName = str(input.newName)
      const people = formData.beneficiariesData.people.map((p) =>
        p.name.toLowerCase() === currentName
          ? {
              ...p,
              name: newName,
              relationship: str(input.relationship) || p.relationship,
              percentage: str(input.newPercentage) || p.percentage,
            }
          : p
      )
      ;({ versionId: amendmentVersionId } = await saveStep(
        willId,
        'beneficiaries',
        { ...formData, beneficiariesData: { ...formData.beneficiariesData, people } },
        proposal.summary
      ))
      break
    }

    default:
      throw new Error(`Unknown amendment type: ${proposal.toolName}`)
  }

  // For Wills already submitted (non-draft), regenerate the document.
  // Draft Wills aren't released yet — the next completeWill() call handles it.
  const requiresReview = willStatus !== 'draft'
  if (requiresReview) {
    try {
      const { formData: updated } = await loadWillFormData(supabase, userId, willId)
      const documentText = await assembleWillDocument(updated)

      if (willStatus === 'approved') {
        // Preserve the approved document so users can continue downloading it.
        // Store the new text in the exact version row created by saveStep above;
        // staff promotes it to wills.document_text when the amendment is approved.
        if (amendmentVersionId) {
          await supabaseAdmin
            .from('will_versions')
            .update({ document_text: documentText, status: 'pending_review' })
            .eq('id', amendmentVersionId)
        }
      } else {
        // pending_review: still being reviewed, no approved version to preserve.
        await supabaseAdmin
          .from('wills')
          .update({ document_text: documentText })
          .eq('id', willId)
      }
    } catch (err) {
      console.error('[estate-assistant] Will regeneration failed:', err)
    }
  }

  return { requiresReview }
}
