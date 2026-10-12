import { NextRequest } from 'next/server'
import { sendEmployerEnquiryEmail } from '@/src/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    contactName?: string
    company?: string
    role?: string
    email?: string
    employeeCount?: string
    state?: string
    intent?: string
    website?: string
  }

  // Honeypot
  if (body.website) {
    return Response.json({ ok: true })
  }

  const { contactName, company, role = '', email, employeeCount = '', state = '', intent = '' } = body

  if (!contactName?.trim() || !company?.trim() || !email?.trim()) {
    return Response.json({ error: 'Name, company, and email are required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    await Promise.all([
      supabaseAdmin.from('employer_enquiries').insert({
        contact_name: contactName.trim(),
        company: company.trim(),
        role: role.trim(),
        email: email.trim(),
        employee_count: employeeCount.trim(),
        state: state.trim(),
        intent: intent.trim(),
      }),
      sendEmployerEnquiryEmail({
        contactName: contactName.trim(),
        company: company.trim(),
        role: role.trim(),
        email: email.trim(),
        employeeCount: employeeCount.trim(),
        state: state.trim(),
        intent: intent.trim(),
      }),
    ])
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Employer enquiry failed:', err)
    return Response.json({ error: 'Failed to send. Please email us directly at hello@heirloomlife.com.au' }, { status: 500 })
  }
}
