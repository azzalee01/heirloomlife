import { createHash } from 'crypto'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { validateRenderedText } from '@/app/will/new/_validate'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, plan_status')
    .eq('id', user.id)
    .single()

  // One-off Will purchasers retain download access permanently (matching marketing copy).
  // Vault subscribers retain Will access while active or after cancellation.
  const hasPaid = profile?.plan === 'will' || profile?.plan === 'vault'

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

  // If there is an active, non-stale witnessing session, serve the frozen
  // locked document from Storage. This ensures the customer prints and signs
  // exactly the document that was locked at booking time, not any live
  // mutable content. Never silently fall back to mutable content if the
  // locked document cannot be retrieved.
  const { data: activeSession } = await supabaseAdmin
    .from('witnessing_sessions')
    .select('id, content_hash')
    .eq('will_id', willRow.id)
    .in('status', ['scheduled', 'in_progress'])
    .eq('version_stale', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (activeSession?.id) {
    const { data: lockedBlob, error: fetchError } = await supabaseAdmin.storage
      .from('witnessing-booking-docs')
      .download(`sessions/${activeSession.id}/will.txt`)

    if (fetchError || !lockedBlob) {
      console.error(`[will/download] locked document missing for session ${activeSession.id}`, fetchError)
      return new Response(
        'Your Will is locked for a witnessing session and the locked document could not be retrieved. Please contact Heirloom support.',
        { status: 503 }
      )
    }

    const lockedContent = await lockedBlob.text()
    const actualHash = createHash('sha256').update(lockedContent, 'utf8').digest('hex')
    if (actualHash !== (activeSession.content_hash as string)) {
      console.error(`[will/download] hash mismatch for locked document, session ${activeSession.id}`)
      return new Response(
        'Will document integrity check failed. Please contact Heirloom support.',
        { status: 503 }
      )
    }

    await supabaseAdmin.from('wills').update({ has_downloaded: true }).eq('id', willRow.id)
    return new Response(lockedContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="my-will.txt"',
      },
    })
  }

  const documentText = willRow.document_text as string

  // Last-line text safety gate: confirm the stored document has no unresolved
  // artefacts (template variables, solicitor placeholders, etc.) before serving.
  const textCheck = validateRenderedText(documentText)
  if (!textCheck.valid) {
    console.error(`Download blocked for will ${willRow.id} — post-render validation failed:`, textCheck.errors)
    return new Response('Will document contains unresolved content and cannot be downloaded. Please contact support.', { status: 422 })
  }

  await supabaseAdmin
    .from('wills')
    .update({ has_downloaded: true })
    .eq('id', willRow.id)

  return new Response(documentText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="my-will.txt"',
    },
  })
}
