'use server'

import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'node:crypto'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from '@/app/will/new/_data'
import { saveStep } from '@/app/will/new/_actions'
import type { WillFormData } from '@/app/will/new/_types'

const client = new Anthropic()

export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string }
export type AmendmentProposal = { id: string; toolName: string; toolInput: Record<string, unknown>; summary: string }

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'add_asset',
    description:
      'Propose adding a new asset to the estate (real estate, bank account, superannuation, shares, life insurance, vehicle, or other). Call this when the user describes acquiring or wanting to include a new asset.',
    input_schema: {
      type: 'object',
      properties: {
        assetType: {
          type: 'string',
          enum: ['real_estate', 'bank_account', 'superannuation', 'shares', 'life_insurance', 'vehicle', 'other'],
        },
        ownershipType: { type: 'string', enum: ['sole', 'joint_tenants', 'tenants_in_common'] },
        propertyAddress: { type: 'string', description: 'Full address, for real_estate' },
        estimatedValue: { type: 'string', description: 'Estimated value in AUD, for real_estate' },
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
        make: { type: 'string', description: 'For vehicle' },
        model: { type: 'string', description: 'For vehicle' },
        year: { type: 'string', description: 'For vehicle' },
        rego: { type: 'string', description: 'For vehicle' },
        description: { type: 'string', description: 'For other asset type' },
        otherValue: { type: 'string', description: 'Estimated value, for other asset type' },
      },
      required: ['assetType'],
    },
  },
  {
    name: 'add_beneficiary',
    description:
      'Propose adding a person or charity as a beneficiary who will inherit a share of the estate. Only propose this when the user has stated (or you have confirmed) a percentage share.',
    input_schema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['individual', 'organisation'] },
        name: { type: 'string', description: "Person's name, or organisation/charity name" },
        relationship: { type: 'string', description: 'Relationship to the testator, for individuals' },
        abn: { type: 'string', description: 'ABN, for organisations' },
        percentage: { type: 'string', description: 'Share of the estate as a percentage number, e.g. "25"' },
      },
      required: ['kind', 'name', 'percentage'],
    },
  },
  {
    name: 'add_specific_gift',
    description:
      'Propose leaving a specific item or a specific amount of cash to a named person, separate from the general estate split.',
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
    name: 'add_executor',
    description: 'Propose adding a primary or alternate executor to manage the estate.',
    input_schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['primary', 'alternate'] },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        relationship: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
      },
      required: ['role', 'firstName'],
    },
  },
]

const SYSTEM_PROMPT = `You are the Estate Assistant for Heirloom, an Australian online will-writing platform. You help users keep an already-drafted will up to date by chatting about life changes, and you answer questions about what their will currently says.

Rules:
- You are not a lawyer and must not give legal advice (e.g. whether something is enforceable, what they "should" do with their estate, tax consequences). If asked, say you can't provide legal advice and suggest the solicitor review included with their plan.
- You CAN and SHOULD answer factual questions about the will's current contents using the summary provided below.
- To change the will, you must call one of the provided tools. Never claim you've updated the will in text — only a confirmed tool call actually changes anything. After calling a tool, briefly tell the user what you're proposing in one sentence and that they need to confirm it.
- If a life update is ambiguous (e.g. missing a percentage share, or unclear which asset type), ask a clarifying question instead of guessing.
- Keep responses short and conversational.`

function summarizeWill(formData: WillFormData): string {
  const parts: string[] = []
  const pd = formData.personalDetails
  if (pd.firstName) parts.push(`Testator: ${pd.firstName} ${pd.lastName}, marital status: ${pd.maritalStatus || 'not set'}.`)
  if (formData.assets.length > 0) {
    parts.push(
      'Assets: ' +
        formData.assets.map((a) => `${a.assetType || 'unknown'}${a.description ? ` (${a.description})` : ''}`).join(', ')
    )
  } else {
    parts.push('Assets: none added yet.')
  }
  if (formData.beneficiariesData.people.length > 0 || formData.beneficiariesData.charities.length > 0) {
    const people = formData.beneficiariesData.people.map((p) => `${p.name} (${p.percentage}%)`)
    const charities = formData.beneficiariesData.charities.map((c) => `${c.name} (${c.percentage}%)`)
    parts.push('Beneficiaries: ' + [...people, ...charities].join(', '))
  } else {
    parts.push('Beneficiaries: none added yet.')
  }
  if (formData.executorsData.primary.firstName) {
    parts.push(
      `Primary executor: ${formData.executorsData.primary.firstName} ${formData.executorsData.primary.lastName}.` +
        (formData.executorsData.hasAlternate ? ` Alternate: ${formData.executorsData.alternate.firstName} ${formData.executorsData.alternate.lastName}.` : '')
    )
  } else {
    parts.push('Executors: none added yet.')
  }
  if (formData.specificGifts.length > 0) {
    parts.push(
      'Specific gifts: ' +
        formData.specificGifts.map((g) => `${g.type === 'cash' ? `$${g.amount}` : g.description} to ${g.recipientName}`).join(', ')
    )
  }
  return parts.join('\n')
}

async function getWillId(): Promise<{ supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>; userId: string; willId: string; hasDownloaded: boolean }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: willRows } = await supabase
    .from('wills')
    .select('id, has_downloaded')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
  const will = willRows?.[0] as { id: string; has_downloaded: boolean } | undefined
  if (!will) throw new Error('No will found — start a will first')

  return { supabase, userId: user.id, willId: will.id, hasDownloaded: will.has_downloaded ?? false }
}

async function requireAmendmentAccess(userId: string, hasDownloaded: boolean): Promise<void> {
  if (!hasDownloaded) return
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', userId)
    .single()
  const isActive = profile?.plan === 'vault' && profile?.plan_status === 'active'
  if (!isActive) {
    throw new Error('MEMBERSHIP_REQUIRED')
  }
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  const { supabase, willId } = await getWillId()
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
  const { supabase, userId, willId, hasDownloaded } = await getWillId()
  await requireAmendmentAccess(userId, hasDownloaded)
  const { formData } = await loadWillFormData(supabase, userId, willId)

  await supabase.from('chat_messages').insert({ will_id: willId, role: 'user', content: userText })

  const response = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\nCurrent will state:\n${summarizeWill(formData)}`,
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
    await supabase.from('chat_messages').insert({ will_id: willId, role: 'assistant', content: reply.trim() })
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
      return `Add specific gift: ${input.type === 'cash' ? `$${input.amount}` : input.description} to ${input.recipientName}`
    case 'add_executor':
      return `Add ${input.role} executor: ${input.firstName} ${input.lastName ?? ''}`.trim()
    default:
      return `Proposed change: ${toolName}`
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export async function applyAmendment(proposal: AmendmentProposal): Promise<void> {
  const { supabase, userId, willId, hasDownloaded } = await getWillId()
  await requireAmendmentAccess(userId, hasDownloaded)
  const { formData } = await loadWillFormData(supabase, userId, willId)
  const input = proposal.toolInput

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
          hasDeathBenefitNomination: false,
          deathBenefitNominees: '',
          isOverseas: false,
          overseasCountry: '',
        },
      ]
      await saveStep(willId, 'assets', { ...formData, assets }, proposal.summary)
      break
    }
    case 'add_beneficiary': {
      const entry = { id: randomUUID(), name: str(input.name), percentage: str(input.percentage), substituteBeneficiary: '' }
      const beneficiariesData =
        input.kind === 'organisation'
          ? { ...formData.beneficiariesData, charities: [...formData.beneficiariesData.charities, { ...entry, abn: str(input.abn) }] }
          : { ...formData.beneficiariesData, people: [...formData.beneficiariesData.people, { ...entry, relationship: str(input.relationship) }] }
      await saveStep(willId, 'beneficiaries', { ...formData, beneficiariesData }, proposal.summary)
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
      await saveStep(willId, 'gifts', { ...formData, specificGifts }, proposal.summary)
      break
    }
    case 'add_executor': {
      const person = {
        firstName: str(input.firstName),
        lastName: str(input.lastName),
        relationship: str(input.relationship),
        phone: str(input.phone),
        email: str(input.email),
        address: str(input.address),
      }
      const wantsPrimary = input.role === 'primary'
      let executorsData = formData.executorsData
      if (wantsPrimary && !formData.executorsData.primary.firstName) {
        executorsData = { ...formData.executorsData, primary: person }
      } else if (!formData.executorsData.hasAlternate) {
        executorsData = { ...formData.executorsData, hasAlternate: true, alternate: person }
      } else {
        throw new Error('Both a primary and alternate executor are already set. Remove one first.')
      }
      await saveStep(willId, 'executors', { ...formData, executorsData }, proposal.summary)
      break
    }
    default:
      throw new Error(`Unknown amendment type: ${proposal.toolName}`)
  }
}
