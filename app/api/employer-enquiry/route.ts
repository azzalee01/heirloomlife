import { NextRequest } from 'next/server'
import { sendEmployerEnquiryEmail } from '@/src/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    name?: string
    company?: string
    email?: string
    message?: string
    website?: string
  }

  // Honeypot
  if (body.website) {
    return Response.json({ ok: true })
  }

  const { name, company, email, message = '' } = body

  if (!name?.trim() || !company?.trim() || !email?.trim()) {
    return Response.json({ error: 'Name, company, and email are required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    await Promise.all([
      supabaseAdmin.from('employer_enquiries').insert({
        contact_name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        message: message.trim() || null,
      }),
      sendEmployerEnquiryEmail({
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    ])
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Employer enquiry failed:', err)
    return Response.json({ error: 'Failed to send. Please email us directly at hello@heirloomlife.com.au' }, { status: 500 })
  }
}
