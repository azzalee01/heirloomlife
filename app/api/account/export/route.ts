import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { loadWillFormData } from '@/app/will/new/_data'

export const dynamic = 'force-dynamic'

// "Download my data" — returns the signed-in user's own account + Will data as a
// JSON file. Scoped to the current user; nothing else is exposed.
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let will = null
  try {
    const loaded = await loadWillFormData(supabase, user.id)
    will = loaded.formData
  } catch {
    // No Will yet — leave null.
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      name: (user.user_metadata?.full_name as string | undefined) ?? null,
      createdAt: user.created_at,
    },
    profile,
    will,
  }

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="heirloom-my-data.json"',
      'Cache-Control': 'no-store',
    },
  })
}
