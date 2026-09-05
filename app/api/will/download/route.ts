import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', user.id)
    .single()

  const hasPaid =
    (profile?.plan === 'will' && profile?.plan_status === 'active') ||
    (profile?.plan === 'vault' && profile?.plan_status === 'active')

  if (!hasPaid) return new Response('Payment required', { status: 402 })

  const { data: willRow } = await supabaseAdmin
    .from('wills')
    .select('id, document_text')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!willRow?.document_text) {
    return new Response('Will document not ready', { status: 404 })
  }

  await supabaseAdmin
    .from('wills')
    .update({ has_downloaded: true })
    .eq('id', willRow.id)

  return new Response(willRow.document_text as string, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="my-will.txt"',
    },
  })
}
