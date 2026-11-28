import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendWillAbandonmentEmail } from '@/src/lib/email'
import { loadWillFormData } from '@/app/will/new/_data'
import { abandonmentKind } from './_classify'
import { unsubscribeUrl } from '@/src/lib/unsubscribe'

export const runtime = 'nodejs'
export const maxDuration = 60

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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
    // Disambiguate the embed: wills has two FKs to profiles (user_id + solicitor_id),
    // so a bare profiles embed is ambiguous (PGRST201). We want the will OWNER.
    .select('id, user_id, updated_at, profiles!wills_user_id_fkey!inner(abandonment_email_sent_at, email_opt_out)')
    .eq('status', 'draft')
    .lt('updated_at', threeDaysAgo)
    .gt('updated_at', sevenDaysAgo)
    .is('profiles.abandonment_email_sent_at', null)
    .eq('profiles.email_opt_out', false)

  if (error) {
    console.error('Abandonment cron query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Fetch emails and names for these users
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const userMap = new Map(
    (users?.users ?? []).map(u => [u.id, { email: u.email ?? '', name: u.user_metadata?.full_name as string | null ?? null }])
  )

  let sent = 0
  const sentIds: string[] = []
  const byKind = { nudge: 0, ready: 0 }

  for (const row of rows as Array<{ id: string; user_id: string }>) {
    const userId = row.user_id
    const user = userMap.get(userId)
    if (!user?.email) continue

    // Finished-but-unpaid wills ('review') get the "ready to unlock" copy, not the
    // "you haven't finished" nudge. Paid wills never reach here (status = 'draft').
    const { formData } = await loadWillFormData(supabaseAdmin, userId, row.id)
    const kind = abandonmentKind(formData)

    const firstName = user.name ? user.name.split(' ')[0] : null
    await sendWillAbandonmentEmail({ to: user.email, firstName, kind, unsubscribeUrl: unsubscribeUrl(APP_URL, userId) })
    sentIds.push(userId)
    byKind[kind]++
    sent++
  }

  // Mark emails as sent
  if (sentIds.length > 0) {
    await supabaseAdmin
      .from('profiles')
      .update({ abandonment_email_sent_at: new Date().toISOString() })
      .in('id', sentIds)
  }

  return NextResponse.json({ sent, byKind })
}
