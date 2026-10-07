import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendRewitnessingReminderEmail } from '@/src/lib/email'

export const dynamic = 'force-dynamic'

const CADENCE_LABEL: Record<number, string> = {
  12: 'every year',
  24: 'every 2 years',
  36: 'every 3 years',
}

type Row = {
  id: string
  email: string
  full_name: string | null
  rewit_reminder_months: number
  rewit_next_reminder_at: string
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, rewit_reminder_months, rewit_next_reminder_at')
    .not('rewit_reminder_months', 'is', null)
    .lte('rewit_next_reminder_at', now)

  if (error) {
    console.error('rewit-reminders: failed to query profiles:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  for (const row of (data ?? []) as Row[]) {
    const cadenceLabel = CADENCE_LABEL[row.rewit_reminder_months] ?? `every ${row.rewit_reminder_months / 12} years`

    // Bump next_reminder_at before sending — if the email fails we still advance
    // the schedule so a bad address can't block the row forever.
    const nextMs = Date.now() + row.rewit_reminder_months * 30.44 * 24 * 60 * 60 * 1000
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ rewit_next_reminder_at: new Date(nextMs).toISOString() })
      .eq('id', row.id)
    if (updateError) {
      console.error(`rewit-reminders: failed to bump next_reminder_at for ${row.id}:`, updateError)
      continue
    }

    const ok = await sendRewitnessingReminderEmail({
      to: row.email,
      name: row.full_name,
      cadenceLabel,
    })
    if (ok) sent++
  }

  return NextResponse.json({ checked: (data ?? []).length, sent })
}
