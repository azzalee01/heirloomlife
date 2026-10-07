import { NextResponse, type NextRequest } from 'next/server'
import { after } from 'next/server'
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

async function mirrorRecordingToStorage(appointmentId: string, recordingId: string) {
  try {
    // Fetch a short-lived download link from Daily
    const linkRes = await fetch(`https://api.daily.co/v1/recordings/${recordingId}/access-link`, {
      headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
    })
    if (!linkRes.ok) throw new Error(`Daily access-link ${linkRes.status}`)
    const { download_link } = (await linkRes.json()) as { download_link: string }

    // Stream the file directly into Supabase Storage (no in-memory buffer)
    const fileRes = await fetch(download_link)
    if (!fileRes.ok || !fileRes.body) throw new Error(`Daily download ${fileRes.status}`)

    const storagePath = `${appointmentId}/${recordingId}.mp4`
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/session-recordings/${storagePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': fileRes.headers.get('content-type') ?? 'video/mp4',
          'x-upsert': 'true',
        },
        body: fileRes.body,
        // @ts-ignore — Node 18+ duplex required for streaming request bodies
        duplex: 'half',
      }
    )
    if (!uploadRes.ok) {
      const detail = await uploadRes.text()
      throw new Error(`Supabase upload ${uploadRes.status}: ${detail}`)
    }

    await supabaseAdmin
      .from('appointment_recordings')
      .update({ storage_path: storagePath })
      .eq('provider_recording_id', recordingId)

    console.log(`Recording mirrored: ${recordingId} → ${storagePath}`)
  } catch (err) {
    console.error(`mirrorRecordingToStorage failed for ${recordingId}:`, err)
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.DAILY_WEBHOOK_HMAC_SECRET
  if (!secret) {
    console.warn('[daily-webhook] DAILY_WEBHOOK_HMAC_SECRET not set — request not verified')
    return NextResponse.json({ ok: true })
  }

  const rawBody = await request.text()
  const sig = request.headers.get('x-daily-signature') ?? ''
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')

  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
  ) {
    // During webhook registration Daily signs with a key we haven't yet confirmed.
    // Log it and return 200 so registration can succeed; we'll tighten this once the
    // correct secret is confirmed in Vercel.
    console.warn('[daily-webhook] HMAC mismatch — sig:', sig, 'expected:', expected)
    return NextResponse.json({ ok: true, ignored: true })
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

  // Try to update an existing row first
  const { data: updated } = await supabaseAdmin
    .from('appointment_recordings')
    .update({ status: 'available', duration_seconds: duration ?? null })
    .eq('provider_recording_id', recording_id)
    .select('id')

  if (!updated?.length) {
    // No matching row — find the next segment_index and insert
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
  }

  // Mirror to Heirloom-owned storage in the background so we return 200 to Daily immediately
  after(mirrorRecordingToStorage(appointmentId, recording_id))

  return NextResponse.json({ ok: true })
}
