import { NextRequest } from 'next/server'
import { sendPartnerEnquiryEmail } from '@/src/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    name?: string
    firm?: string
    role?: string
    state?: string
    settlementsPerYear?: string
    email?: string
    website?: string
  }

  // Honeypot — bots fill this field, humans leave it blank
  if (body.website) {
    return Response.json({ ok: true })
  }

  const { name, firm, role = '', state = '', settlementsPerYear = '', email } = body

  if (!name?.trim() || !firm?.trim() || !email?.trim()) {
    return Response.json({ error: 'Name, firm, and email are required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    await Promise.all([
      supabaseAdmin.from('partner_enquiries').insert({
        name: name.trim(),
        firm: firm.trim(),
        role: role.trim(),
        state: state.trim(),
        settlements_per_year: settlementsPerYear.trim(),
        email: email.trim(),
      }),
      sendPartnerEnquiryEmail({
        name: name.trim(),
        firm: firm.trim(),
        role: role.trim(),
        state: state.trim(),
        settlementsPerYear: settlementsPerYear.trim(),
        email: email.trim(),
      }),
    ])
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Partner enquiry failed:', err)
    return Response.json({ error: 'Failed to send. Please email us directly at hello@heirloomlife.com.au' }, { status: 500 })
  }
}
