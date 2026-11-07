import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Thank you — Heirloom Life', robots: { index: false, follow: false } }

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']

const MESSAGES: Record<number, string> = {
  1: 'Thank you for letting us know. We take every piece of feedback seriously.',
  2: 'Thanks for sharing. We&apos;d love to do better — please reach out if there&apos;s anything we can improve.',
  3: 'Thank you for the feedback. We&apos;re always working to make the experience better.',
  4: 'Thanks for the kind words. We&apos;ll keep working hard.',
  5: 'That means a lot to us. Thank you.',
}

export default async function RatedPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; error?: string }>
}) {
  const { score: scoreRaw, error } = await searchParams
  const score = scoreRaw ? parseInt(scoreRaw, 10) : NaN
  const valid = !isNaN(score) && score >= 1 && score <= 5

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--mkt-surface, #F8F6F1)', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#2AB4AE', fontSize: '1.35rem', margin: '0 0 2rem' }}>Heirloom</p>

      {error || !valid ? (
        <>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#0E1310', margin: '0 0 1rem', fontWeight: 400 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#5A6360', fontSize: '1rem', lineHeight: 1.65, maxWidth: 380 }}>
            That link doesn&apos;t look right. If you&apos;d like to share feedback, reply to the email we sent you.
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '2.5rem', letterSpacing: '.1em', color: '#2AB4AE', margin: '0 0 1.25rem' }}>{STARS[score]}</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', color: '#0E1310', margin: '0 0 1rem', fontWeight: 400 }}>
            Thank you for your feedback.
          </h1>
          <p
            style={{ color: '#5A6360', fontSize: '1rem', lineHeight: 1.65, maxWidth: 380 }}
            dangerouslySetInnerHTML={{ __html: MESSAGES[score] ?? '' }}
          />
          <p style={{ marginTop: '2rem', color: '#5A6360', fontSize: '.9rem', lineHeight: 1.65, maxWidth: 380 }}>
            We&apos;re with you every step of the way. If you have any further questions, just reply to the email we sent you.
          </p>
        </>
      )}
    </div>
  )
}
