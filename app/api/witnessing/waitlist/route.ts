import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: unknown; state?: unknown }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null
  const state = typeof body.state === 'string' ? body.state.trim().toUpperCase() : null

  if (!email || !email.includes('@') || !state) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('witnessing_waitlist')
    .upsert({ email, state }, { onConflict: 'email,state', ignoreDuplicates: true })

  if (error) {
    console.error('[witnessing/waitlist] insert failed:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
