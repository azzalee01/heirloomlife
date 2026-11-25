'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase-ssr'
import { supabaseAdmin } from '@/src/lib/supabase-server'
import { sendAccountDeletionRequestEmail } from '@/src/lib/email'

type Result = { ok: boolean; error?: string }

export async function saveProfileName(fullName: string): Promise<Result> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You are not signed in.' }

  const name = fullName.trim()
  if (!name) return { ok: false, error: 'Please enter your name.' }
  if (name.length > 120) return { ok: false, error: 'That name is too long.' }

  const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
  if (error) return { ok: false, error: error.message }

  // Keep the profiles row in sync (it feeds admin views + emails).
  await supabaseAdmin.from('profiles').update({ full_name: name }).eq('id', user.id)
  return { ok: true }
}

export async function changeEmail(newEmail: string): Promise<Result> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You are not signed in.' }

  const email = newEmail.trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  if (email === (user.email ?? '').toLowerCase()) return { ok: false, error: 'That is already your email address.' }

  // Triggers Supabase's secure email-change flow — a confirmation link is sent to
  // the new address (branded via our Send Email hook). The change only applies
  // once that link is clicked.
  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function requestAccountDeletion(): Promise<Result> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You are not signed in.' }

  try {
    await sendAccountDeletionRequestEmail({
      userId: user.id,
      email: user.email ?? '',
      name: (user.user_metadata?.full_name as string | undefined) ?? null,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'We could not submit your request. Please email hello@heirloomlife.com.au and we will action it.' }
  }
}
