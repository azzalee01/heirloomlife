'use client'

// dynamic({ ssr: false }) is only allowed inside a Client Component.
// This thin wrapper owns that import so the dashboard page (a Server Component)
// can render the animation without breaking the build.
import dynamic from 'next/dynamic'

const IntroAnimation = dynamic(() => import('./IntroAnimation'), { ssr: false })

export default function IntroAnimationLoader() {
  return <IntroAnimation />
}
