import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const session = typeof params.session === 'string' ? params.session : null

  if (session) {
    const cookieStore = await cookies()
    cookieStore.set('hl_anon_session', session, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
    })
  }

  redirect('/start')
}
