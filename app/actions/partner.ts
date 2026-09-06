'use server'

import { cookies } from 'next/headers'

export async function setPartnerCodeCookie(code: string) {
  const cookieStore = await cookies()
  cookieStore.set('hl_partner_code', code.trim().toUpperCase(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 60, // 60 days
  })
}

export async function getPartnerCodeCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('hl_partner_code')?.value ?? null
}

export async function clearPartnerCodeCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('hl_partner_code')
}
