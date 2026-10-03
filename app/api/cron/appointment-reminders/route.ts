import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendAppointmentReminderEmail } from '@/src/lib/email'
import { sendSms } from '@/src/lib/sms'
import { joinUrl } from '@/src/lib/appointments/links'
import { logEvent } from '@/src/lib/appointments/server'

// Run every 15 minutes (see the schedule note in the PR). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const dynamic = 'force-dynamic'

type Row = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  booked_by_email: string | null
  starts_at: string
  token_version: number
}

const HOUR = 3_600_000

async function sendWindow(window: '24h' | '1h', from: Date, to: Date, minBookingAgeMs: number): Promise<number> {
  const col = window === '24h' ? 'reminder_24h_sent_at' : 'reminder_1h_sent_at'
  const { data } = await supabaseAdmin
    .from('appointments')
    .select('id, customer_name, customer_email, customer_phone, booked_by_email, starts_at, token_version')
    .eq('status', 'scheduled')
    .is(col, null)
    .gt('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    // A booking made moments ago has just been confirmed: don't also send it a reminder.
    .lt('created_at', new Date(Date.now() - minBookingAgeMs).toISOString())
  let sent = 0
  for (const r of (data ?? []) as Row[]) {
    // Claim first (only one run can flip null -> now), so overlapping runs never double-send.
    const { data: claimed } = await supabaseAdmin
      .from('appointments')
      .update({ [col]: new Date().toISOString() })
      .eq('id', r.id)
      .is(col, null)
      .select('id')
    if (!claimed?.length) continue

    const link = joinUrl(r.id, r.token_version)
    const ok = await sendAppointmentReminderEmail({ to: r.customer_email, name: r.customer_name, startsAt: r.starts_at, joinUrl: link, window })
    if (ok && r.booked_by_email && r.booked_by_email !== r.customer_email) {
      await sendAppointmentReminderEmail({ to: r.booked_by_email, name: 'there', startsAt: r.starts_at, joinUrl: link, window })
    }
    if (ok && r.customer_phone) {
      const when = window === '1h' ? 'in about 1 hour' : 'tomorrow'
      await sendSms(
        r.customer_phone,
        `Hi ${r.customer_name.split(' ')[0]}, your Heirloom Life Will call is ${when}. Join here: ${link}`
      )
    }
    if (ok) {
      sent++
      await logEvent(r.id, 'reminder_sent', 'system', { metadata: { window } })
    } else {
      // Release the claim so the next run retries.
      await supabaseAdmin.from('appointments').update({ [col]: null }).eq('id', r.id)
    }
  }
  return sent
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  // Day-before reminder: calls 23-24h away (four 15-minute runs land in that hour), for bookings at least 3h old.
  const sent24 = await sendWindow('24h', new Date(now.getTime() + 23 * HOUR), new Date(now.getTime() + 24 * HOUR), 3 * HOUR)
  // 1h reminder: calls starting within the next hour.
  const sent1 = await sendWindow('1h', now, new Date(now.getTime() + HOUR), 0)
  return NextResponse.json({ sent24h: sent24, sent1h: sent1 })
}
