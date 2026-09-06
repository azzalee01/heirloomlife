import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MIN_TEXT_LENGTH = 200

const EXTRACTION_SYSTEM = `You are extracting structured data from an uploaded Australian Will document.

Read the Will text carefully. Extract every field you can identify with confidence into the JSON structure below. For any field you cannot find or are uncertain about, use null — never guess or invent values.

A Will document typically contains: testator name and sometimes address, executor names and relationships, beneficiary names and percentages, guardian names, specific gifts, and sometimes children's names. A Will does NOT typically contain phone numbers, email addresses, bank BSB/account numbers, or occupations — leave those null.

For percentages: convert fractions or words to numbers (e.g. "one half" → "50", "one third" → "33.33"). For dates: use ISO format YYYY-MM-DD where found. For Australian states: use abbreviations (NSW, VIC, QLD, SA, WA, TAS, ACT, NT).

Return ONLY valid JSON matching this exact structure, no markdown fences, no commentary:

{
  "personalDetails": {
    "firstName": string | null,
    "middleName": string | null,
    "lastName": string | null,
    "dateOfBirth": string | null,
    "addressLine1": string | null,
    "suburb": string | null,
    "state": string | null,
    "postcode": string | null,
    "maritalStatus": "single" | "married" | "domestic_partner" | "divorced" | "separated" | "widowed" | null
  },
  "spouseDetails": {
    "firstName": string | null,
    "middleName": string | null,
    "lastName": string | null
  } | null,
  "childrenData": {
    "hasChildren": "yes" | "no" | null,
    "children": [{ "name": string, "dateOfBirth": string | null, "isDependent": boolean }],
    "guardian": { "firstName": string | null, "lastName": string | null, "relationship": string | null } | null
  } | null,
  "executorsData": {
    "primary": { "firstName": string | null, "lastName": string | null, "relationship": string | null },
    "hasAlternate": boolean,
    "alternate": { "firstName": string | null, "lastName": string | null, "relationship": string | null } | null
  } | null,
  "beneficiariesData": {
    "people": [{ "name": string, "relationship": string, "percentage": string }],
    "charities": [{ "name": string, "abn": string | null, "percentage": string }]
  } | null,
  "specificGifts": [{ "type": "item" | "cash", "description": string, "amount": string, "recipientName": string, "recipientRelationship": string }]
}`

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Dynamic import avoids pdf-parse's module-level test file read that breaks Next.js
  // Cast to any: @types/pdf-parse uses `export =` but ESM interop may wrap it in .default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule = await import('pdf-parse') as any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const pdfParse: (buf: Buffer) => Promise<{ text: string }> = pdfParseModule.default ?? pdfParseModule
  const result = await pdfParse(buffer)
  return result.text ?? ''
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value ?? ''
}

// Collect non-null field paths from the extracted object
function collectExtractedFields(obj: Record<string, unknown>, prefix: string, acc: string[]): void {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v === null || v === undefined || v === '' || v === false) continue
    if (Array.isArray(v)) {
      if (v.length > 0) acc.push(path)
    } else if (typeof v === 'object') {
      collectExtractedFields(v as Record<string, unknown>, path, acc)
    } else {
      acc.push(path)
    }
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ success: false, reason: 'no_file' }, { status: 400 })

  const fileName = file.name.toLowerCase()
  const isPdf = fileName.endsWith('.pdf')
  const isDocx = fileName.endsWith('.docx')
  if (!isPdf && !isDocx) {
    return Response.json({ success: false, reason: 'unsupported_type' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ success: false, reason: 'too_large' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let text: string
  try {
    text = isPdf
      ? await extractTextFromPdf(buffer)
      : await extractTextFromDocx(buffer)
  } catch {
    return Response.json({ success: false, reason: 'protected' })
  }

  if (text.trim().length < MIN_TEXT_LENGTH) {
    return Response.json({ success: false, reason: 'unreadable' })
  }

  const anthropic = new Anthropic()
  let extractedData: Record<string, unknown>
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: text.slice(0, 40000) }],
    })
    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
    extractedData = JSON.parse(raw)
  } catch {
    return Response.json({ success: false, reason: 'parse_error' })
  }

  const extractedFields: string[] = []
  collectExtractedFields(extractedData, '', extractedFields)

  const confidence = extractedFields.length < 3 ? 'low' : 'ok'

  // Store original file if user is authenticated
  let uploadedDocId: string | null = null
  if (user) {
    try {
      const ext = isPdf ? 'pdf' : 'docx'
      const docId = crypto.randomUUID()
      const storagePath = `${user.id}/${docId}.${ext}`
      const { error: storageErr } = await supabaseAdmin.storage
        .from('uploaded-wills')
        .upload(storagePath, buffer, {
          contentType: isPdf
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
      if (!storageErr) {
        const { data: row } = await supabaseAdmin
          .from('uploaded_will_documents')
          .insert({ id: docId, user_id: user.id, file_name: file.name, file_type: ext, storage_path: storagePath })
          .select('id')
          .single()
        uploadedDocId = row?.id ?? null
      }
    } catch {
      // Non-critical — extraction result is still returned
    }
  }

  return Response.json({ success: true, confidence, extractedData, extractedFields, uploadedDocId })
}
