import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'

type ConnectedAccountRow = {
  id: string
  account_name: string | null
  account_type: string | null
  balance: number | null
  currency: string
  last_synced_at: string | null
}

function formatBalance(balance: number | null, currency: string) {
  if (balance == null) return null
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(balance)
}

function formatSynced(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ManageBankConnectionsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: accounts } = await supabaseAdmin
    .from('connected_accounts')
    .select('id, account_name, account_type, balance, currency, last_synced_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const rows = (accounts ?? []) as ConnectedAccountRow[]

  async function disconnect() {
    'use server'
    const supabaseInner = await createSupabaseServerClient()
    const { data: { user: u } } = await supabaseInner.auth.getUser()
    if (!u) return

    await supabaseAdmin.from('connected_accounts').delete().eq('user_id', u.id)
    await supabaseAdmin.from('basiq_users').delete().eq('user_id', u.id)
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-lg">

        <Link href="/dashboard" className="text-xs font-medium mb-6 inline-block" style={{ color: 'var(--neutral)' }}>
          ← Back to dashboard
        </Link>

        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)', fontFamily: "var(--font-display)" }}>
          Connected accounts
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--neutral)' }}>
          Bank accounts connected to your Vault via Basiq.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-10 text-center" style={{ borderColor: 'var(--line)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--neutral)' }}>No bank accounts connected.</p>
            <Link href="/dashboard/bank-connect" className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>
              Connect an account →
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-hidden mb-4" style={{ borderColor: 'var(--line)', background: 'white' }}>
              {rows.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                      {a.account_name ?? 'Account'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {a.account_type && (
                        <span className="text-xs capitalize" style={{ color: 'var(--neutral)' }}>{a.account_type}</span>
                      )}
                      {a.last_synced_at && (
                        <span className="text-xs" style={{ color: 'var(--neutral)', opacity: 0.6 }}>
                          · Synced {formatSynced(a.last_synced_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  {a.balance != null && (
                    <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--ink)' }}>
                      {formatBalance(a.balance, a.currency)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <form action={disconnect}>
              <button
                type="submit"
                className="w-full rounded-lg border px-4 py-3 text-sm font-semibold text-left"
                style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c' }}
              >
                Disconnect all bank accounts
              </button>
            </form>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
              This removes your accounts from Heirloom. To fully revoke CDR consent with your bank, contact your bank or financial institution directly.
            </p>
          </>
        )}

        <div className="mt-8 rounded-lg border px-4 py-4" style={{ borderColor: 'var(--line)', background: 'white' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--ink)' }}>About this connection</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
            Your bank data is collected by Basiq, a Consumer Data Right accredited data intermediary, on Heirloom&apos;s behalf. We hold account name and balance only — no transaction history. Read more on our{' '}
            <Link href="/security-trust" className="underline" style={{ color: 'var(--teal-deep)' }}>
              Security &amp; Trust page
            </Link>.
          </p>
        </div>

      </div>
    </div>
  )
}
