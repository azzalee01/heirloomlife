import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendWillAbandonmentEmail } from '@/src/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find users with a draft will that hasn't been touched in 3-7 days
  // and who haven't already received an abandonment email
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: rows, error } = await supabaseAdmin
    .from('wills')
    .select('user_id, updated_at, profiles!inner(abandonment_email_sent_at)')
    .eq('status', 'draft')
    .lt('updated_at', threeDaysAgo)
    .gt('updated_at', sevenDaysAgo)
    .is('profiles.abandonment_email_sent_at', null)

  if (error) {
    console.error('Abandonment cron query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const userIds = rows.map(r => r.user_id as string)

  // Fetch emails and names for these users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const userMap = new Map(
    (users?.users ?? []).map(u => [u.id, { email: u.email ?? '', name: u.user_metadata?.full_name as string | null ?? null }])
  )

  let sent = 0
  const sentIds: string[] = []

  for (const userId of userIds) {
    const user = userMap.get(userId)
    if (!user?.email) continue

    const firstName = user.name ? user.name.split(' ')[0] : null
    await sendWillAbandonmentEmail({ to: user.email, firstName })
    sentIds.push(userId)
    sent++
  }

  // Mark emails as sent
  if (sentIds.length > 0) {
    await supabaseAdmin
      .from('profiles')
      .update({ abandonment_email_sent_at: new Date().toISOString() })
      .in('id', sentIds)
  }

  return NextResponse.json({ sent })
}
