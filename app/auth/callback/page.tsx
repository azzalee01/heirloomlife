'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { user } = session
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            full_name: user.user_metadata?.full_name ?? '',
          },
          { onConflict: 'id' }
        )
        sessionStorage.setItem('show_intro', 'true')
        router.replace('/dashboard')
      } else {
        router.replace('/auth/login')
      }
    })
  }, [router])

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
      <p style={{ color: 'var(--neutral)', fontSize: '.9rem', fontFamily: "var(--font-body)" }}>Signing you in…</p>
    </div>
  )
}
