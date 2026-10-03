'use client'

import { useCallback, useRef } from 'react'
import Script from 'next/script'

interface TurnstileGlobal {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; callback: (t: string) => void; 'error-callback'?: () => void }
  ) => string
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal
  }
}

interface Props {
  siteKey: string
  onToken: (token: string) => void
  onError?: () => void
}

export function TurnstileWidget({ siteKey, onToken, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendered = useRef(false)

  const onScriptLoad = useCallback(() => {
    if (rendered.current || !containerRef.current || !window.turnstile) return
    rendered.current = true
    window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onToken,
      'error-callback': onError,
    })
  }, [siteKey, onToken, onError])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={onScriptLoad}
      />
      <div ref={containerRef} />
    </>
  )
}
