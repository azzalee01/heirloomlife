import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { authorizeViewer, toView } from '@/src/lib/appointments/server'
import JoinPanel from '../../_components/JoinPanel'

// The link is the credential: keep it out of search engines and caches.
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: 'no-referrer' }
export const dynamic = 'force-dynamic'

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let view
  try {
    view = toView(await authorizeViewer({ token }))
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen px-5 py-8" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--teal)' }}>
          Heirloom
        </p>
        <JoinPanel access={{ token }} initial={view} supportPhone={process.env.NEXT_PUBLIC_SUPPORT_PHONE} />
      </div>
    </div>
  )
}
