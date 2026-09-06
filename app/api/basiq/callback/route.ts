import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { getBasiqServerToken, fetchBasiqAccounts } from '@/src/lib/basiq'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Identify the Heirloom user from their active session — more reliable than
  // depending on Basiq passing userId in the redirect since the param name is
  // not guaranteed across Basiq CDR gateway versions.
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Look up their Basiq user ID
  const { data: basiqRow } = await supabaseAdmin
    .from('basiq_users')
    .select('basiq_user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!basiqRow?.basiq_user_id) {
    redirect('/dashboard?bank_error=no_basiq_user')
  }

  try {
    const token = await getBasiqServerToken()
    const accounts = await fetchBasiqAccounts(token, basiqRow.basiq_user_id)

    if (accounts.length > 0) {
      const rows = accounts.map((a) => ({
        user_id: user.id,
        basiq_account_id: a.id,
        account_name: a.name,
        account_type: a.class?.type ?? null,
        balance: typeof a.balance === 'string' ? parseFloat(a.balance) : a.balance,
        currency: a.currency ?? 'AUD',
        last_synced_at: new Date().toISOString(),
      }))

      await supabaseAdmin
        .from('connected_accounts')
        .upsert(rows, { onConflict: 'user_id,basiq_account_id' })
    }
  } catch (err) {
    console.error('[basiq/callback]', err)
    redirect('/dashboard?bank_error=sync_failed')
  }

  redirect('/dashboard?bank_connected=true')
}
