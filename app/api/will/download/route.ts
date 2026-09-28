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

  const documentText = willRow.document_text as string

  // Last-line text safety gate: confirm the stored document has no unresolved
  // artefacts (template variables, solicitor placeholders, etc.) before serving.
  // This should never fire for a document produced by assembleWillDocument(),
  // which runs the same check at assembly time. It guards against documents
  // stored via other paths (e.g. admin tools, manual inserts).
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
