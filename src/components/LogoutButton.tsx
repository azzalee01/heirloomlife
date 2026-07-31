'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-[var(--neutral)] hover:text-[var(--ink)] transition-colors"
    >
      Sign out
    </button>
  )
}
