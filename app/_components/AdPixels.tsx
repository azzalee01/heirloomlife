'use client'

// Loads the Meta Pixel and the Google (gtag.js) tag, each gated on its own env var, so the site
// ships with zero ad scripts until the IDs are configured. SPA route changes re-fire a PageView to
// both. Server-side conversions (the source of truth for Purchase) live in src/lib/analytics/meta-capi.ts.

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { captureAttributionFromUrl } from '@/src/lib/analytics/utm'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // First-touch attribution capture happens on every navigation but only writes once.
    captureAttributionFromUrl()
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView')
    if (typeof window.gtag === 'function' && GOOGLE_ADS_ID) {
      window.gtag('event', 'page_view', { send_to: GOOGLE_ADS_ID })
    }
  }, [pathname, searchParams])

  return null
}

export default function AdPixels() {
  if (!META_PIXEL_ID && !GOOGLE_ADS_ID) return null

  return (
    <>
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {GOOGLE_ADS_ID && (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());
            gtag('config','${GOOGLE_ADS_ID}');`}
          </Script>
        </>
      )}

      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  )
}
