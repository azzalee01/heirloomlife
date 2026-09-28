'use client';

import { useEffect, useRef, useState } from 'react';

// Desktop and mobile videos live in /public/video/ after rendering.
// Poster images provide an instant visual while the video loads.
//
// Respects prefers-reduced-motion: shows the static poster instead of the video.
// Lazy-loads the <video> element so it doesn't delay LCP of above-the-fold content.

interface Props {
  className?: string;
}

export default function ProductFilm({ className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (videoRef.current && !reducedMotion) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — video stays paused; poster image remains visible.
      });
    }
  }, [reducedMotion, mounted]);

  const posterSrc = '/video/desktop-poster.jpg';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        // Preserve 16:9 aspect ratio for desktop, switch to 9:16 hint on mobile via CSS
        aspectRatio: '16 / 9',
        background: '#0A1211', // matches video bg so poster loads cleanly
        boxShadow:
          '0 0 0 1px rgba(42,180,174,0.10), 0 8px 32px rgba(0,0,0,0.18), 0 40px 80px rgba(0,0,0,0.12)',
      }}
    >
      {/* Poster-only fallback for reduced-motion users and SSR */}
      {(!mounted || reducedMotion) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt="Heirloom — create and manage your Will"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Full animated video for users who allow motion */}
      {mounted && !reducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          preload="none"
          aria-label="Heirloom product overview — create, review, and keep your Will current"
        >
          {/* WebM first (smaller, VP8/VP9 — best for Chrome/Firefox) */}
          <source src="/video/desktop.webm" type="video/webm" />
          {/* H.264 fallback (Safari, older browsers) */}
          <source src="/video/desktop-web.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}

// ─── Mobile variant ────────────────────────────────────────────────────────────
// Import this and show it on narrow viewports via CSS display:none/block.

export function ProductFilmMobile({ className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (videoRef.current && !reducedMotion) {
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion, mounted]);

  const posterSrc = '/video/mobile-poster.jpg';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 340,
        marginInline: 'auto',
        aspectRatio: '9 / 16',
        borderRadius: 32,
        overflow: 'hidden',
        background: '#0A1211',
        boxShadow: '0 0 0 1px rgba(42,180,174,0.10), 0 8px 40px rgba(0,0,0,0.22)',
      }}
    >
      {(!mounted || reducedMotion) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt="Heirloom app on mobile"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {mounted && !reducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          preload="none"
          aria-label="Heirloom on mobile"
        >
          <source src="/video/mobile.webm" type="video/webm" />
          <source src="/video/mobile-web.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
