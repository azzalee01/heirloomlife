import { NextResponse, type NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '@/src/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface DailyProps {
  room_name?: string
  recording_id?: string
  duration?: number
}

interface DailyWebhookEvent {
  type: string
  properties?: DailyProps
}

export async function POST(request: NextRequest) {
  const secret = process.env.DAILY_WEBHOOK_HMAC_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 501 })

  const rawBody = await request.text()
  const sig = request.headers.get('x-daily-signature') ?? ''
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')

  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
  ) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 401 })
  }

  let event: DailyWebhookEvent
  try {
    event = JSON.parse(rawBody) as DailyWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  if (event.type !== 'recording.ready-to-download') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const { room_name, recording_id, duration } = event.properties ?? {}
  if (!room_name || !recording_id) return NextResponse.json({ ok: true })

  // Parse room name: appt-{uuid}-v{n}
  const m = room_name.match(/^appt-([0-9a-f-]+)-v\d+$/)
  if (!m) return NextResponse.json({ ok: true })
  const appointmentId = m[1]

  // Try to update an existing row first (host may have already seeded it via refreshRecordings).
  const { data: updated } = await supabaseAdmin
    .from('appointment_recordings')
    .update({ status: 'available', duration_seconds: duration ?? null })
    .eq('provider_recording_id', recording_id)
    .select('id')

  if (updated?.length) {
    return NextResponse.json({ ok: true, updated: updated.length })
  }

  // No matching row — find the next segment_index for this appointment and insert.
  const { data: existing } = await supabaseAdmin
    .from('appointment_recordings')
    .select('segment_index')
    .eq('appointment_id', appointmentId)
    .order('segment_index', { ascending: false })
    .limit(1)

  const nextSegment = ((existing?.[0]?.segment_index as number | undefined) ?? -1) + 1

  await supabaseAdmin.from('appointment_recordings').upsert(
    {
      appointment_id: appointmentId,
      segment_index: nextSegment,
      provider_recording_id: recording_id,
      status: 'available',
      started_at: new Date().toISOString(),
      duration_seconds: duration ?? null,
    },
    { onConflict: 'appointment_id,segment_index' }
  )

  return NextResponse.json({ ok: true, created: true })
}
