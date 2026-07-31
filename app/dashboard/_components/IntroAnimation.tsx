'use client'

import { useState, useEffect } from 'react'

const INTRO_FLAG = 'show_intro'

export default function IntroAnimation() {
  const [show] = useState<boolean>(() => {
    const flag = sessionStorage.getItem(INTRO_FLAG)
    if (flag) {
      sessionStorage.removeItem(INTRO_FLAG)
      return true
    }
    return false
  })

  const [mounted, setMounted] = useState(show)

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(() => setMounted(false), 3100)
    return () => clearTimeout(timer)
  }, [show])

  if (!mounted) return null

  return (
    <div className="hl-overlay">

      {/* Document icon — larger at 97×120, viewBox unchanged so paths scale up */}
      <svg width="97" height="120" viewBox="0 0 58 72" aria-hidden="true">
        <path className="hl-p hl-body" pathLength="1" d="M5 4 H37 L50 17 V68 H5 Z" />
        <path className="hl-p hl-fold" pathLength="1" d="M37 4 V17 H50" />
        <path className="hl-p hl-l1"  pathLength="1" d="M13 33 H42" />
        <path className="hl-p hl-l2"  pathLength="1" d="M13 43 H34" />
      </svg>

      {/* Two identical layers stacked — gray fades in, teal sweeps across */}
      <div className="hl-word-wrap">
        <span className="hl-word-gray">Heirloom</span>
        <span className="hl-word-teal" aria-hidden="true">Heirloom</span>
      </div>

      <div className="hl-ripple" />

    </div>
  )
}
