import { NextRequest } from 'next/server'
import { sendCharityEnquiryEmail } from '@/src/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    orgName?: string
    contactName?: string
    email?: string
    role?: string
    orgType?: string
    message?: string
  }

  const { orgName, contactName, email, role = '', orgType = '', message = '' } = body

  if (!orgName?.trim() || !contactName?.trim() || !email?.trim()) {
    return Response.json({ error: 'Organisation name, contact name and email are required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    await sendCharityEnquiryEmail({ orgName, contactName, email, role, orgType, message })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Charity enquiry email failed:', err)
    return Response.json({ error: 'Failed to send. Please email us directly at hello@heirloomlife.com.au' }, { status: 500 })
  }
}
