'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Container } from '@/components/layout';
import { siteConfig } from '@/lib/config';

const EASE_REVEAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero() {
  return (
    <section
      data-header-theme="dark"
      className="hero-stage section-lg !pt-36 pb-0 md:!pt-32 lg:!pt-40 md:pb-0 overflow-hidden"
      // Deep ink background  -  teal spotlight cone reads clearly against near-black
      style={{ background: '#0A1211' }}
    >
      {/* Headline + CTAs  -  z-index 2 so it sits above the cone ::after */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Container>
          <div className="max-w-4xl mx-auto text-center mb-24">

            {/* Eyebrow  -  hairline teal label, Heirloom brand voice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_REVEAL }}
              className="mb-7"
            >
              <span
                className="inline-block text-[11px] font-medium tracking-[0.18em] uppercase"
                style={{ color: 'var(--color-accent-hero)' }}
              >
                Australian Estate Planning
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: EASE_REVEAL }}
              className="hero-heading text-[clamp(2rem,7vw,4.5rem)] text-white mb-7 !leading-[1.1]"
            >
              Your Will,{' '}
              <span style={{ color: 'var(--color-accent-hero)' }}>done right.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE_REVEAL }}
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 text-balance"
              style={{ color: '#8AADAA' }}
            >
              A legally valid Australian Will in under 20 minutes  -  with optional solicitor review,
              living document storage, and everything your family needs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: EASE_REVEAL }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            >
              <Button variant="primary" size="xl" asChild>
                <Link href={siteConfig.signupUrl}>
                  Write your Will
                </Link>
              </Button>
              <Button variant="darkOutline" size="xl" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>

            {/* Trust micro-line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: EASE_REVEAL }}
              className="text-xs tracking-wide"
              style={{ color: '#4A6A67' }}
            >
              Solicitor-reviewed
            </motion.p>

          </div>
        </Container>
      </div>

      {/* Platform mock  -  z-index 2 */}
      <div className="relative" style={{ zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.38, ease: EASE_REVEAL }}
          className="px-4 sm:px-8 lg:px-16 xl:px-24 pb-20 md:pb-28"
        >
          <div
            data-hero-mock
            className="mx-auto"
            style={{
              maxWidth: '1480px',
              borderRadius: '16px',
              boxShadow: [
                '0 0 0 1px rgba(42,180,174,0.12)',
                '0 0 24px rgba(42,180,174,0.14)',
                '0 0 70px rgba(26,125,121,0.16)',
                '0 0 140px rgba(26,125,121,0.08)',
                '0 40px 100px rgba(0,0,0,0.55)',
              ].join(', '),
            }}
          >
            {/* Replace with <HeirloomDashboardMock /> once built */}
            <div
              className="w-full rounded-2xl flex items-center justify-center"
              style={{
                minHeight: '480px',
                background: 'linear-gradient(160deg, #0E1514 0%, #111F1E 100%)',
                border: '1px solid rgba(42,180,174,0.1)',
              }}
            >
              <span
                className="text-sm tracking-widest uppercase font-medium"
                style={{ color: 'rgba(42,180,174,0.3)' }}
              >
                Platform mock
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
