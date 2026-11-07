import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { verifyRatingSignature, appBaseUrl } from '@/src/lib/appointments/links'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const id = searchParams.get('id') ?? ''
  const scoreRaw = searchParams.get('score') ?? ''
  const sig = searchParams.get('sig') ?? ''
  const base = appBaseUrl()

  const score = parseInt(scoreRaw, 10)
  if (!id || isNaN(score) || score < 1 || score > 5 || !sig) {
    return NextResponse.redirect(`${base}/appointments/rated?error=invalid`)
  }

  let valid = false
  try { valid = verifyRatingSignature(id, score, sig) } catch { /* secret not set */ }
  if (!valid) {
    return NextResponse.redirect(`${base}/appointments/rated?error=invalid`)
  }

  // ignoreDuplicates: only the first click is stored
  await supabaseAdmin.from('appointment_ratings').upsert(
    { appointment_id: id, rating: score },
    { onConflict: 'appointment_id', ignoreDuplicates: true }
  )

  return NextResponse.redirect(`${base}/appointments/rated?score=${score}`)
}
