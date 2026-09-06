import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { getBasiqServerToken, createBasiqUser, createBasiqAuthLink } from '@/src/lib/basiq'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  let mobile: string
  try {
    const body = await request.json() as { mobile?: string }
    mobile = (body.mobile ?? '').trim()
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }
  if (!mobile) return new Response('mobile is required', { status: 400 })

  try {
    const token = await getBasiqServerToken()

    // Reuse existing Basiq user if present
    const { data: existing } = await supabaseAdmin
      .from('basiq_users')
      .select('basiq_user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let basiqUserId: string
    if (existing?.basiq_user_id) {
      basiqUserId = existing.basiq_user_id
    } else {
      basiqUserId = await createBasiqUser(token, user.email ?? '')
      await supabaseAdmin
        .from('basiq_users')
        .insert({ user_id: user.id, basiq_user_id: basiqUserId })
    }

    const consentUrl = await createBasiqAuthLink(token, basiqUserId, mobile)
    return Response.json({ url: consentUrl })
  } catch (err) {
    console.error('[basiq/connect]', err)
    return new Response('Failed to initiate connection', { status: 500 })
  }
}
