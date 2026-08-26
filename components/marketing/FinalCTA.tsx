'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Container } from '@/components/layout';
import { siteConfig } from '@/lib/config';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FinalCTA() {
  return (
    <section
      data-header-theme="dark"
      className="section-lg"
      style={{ background: 'var(--color-surface-dark)' }}
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center">

          {/* Hairline teal eyebrow  -  consistent with Hero eyebrow treatment */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-8"
          >
            <span
              className="inline-block text-[11px] font-medium tracking-[0.18em] uppercase"
              style={{ color: 'var(--color-accent-hero)' }}
            >
              Start today
            </span>
          </motion.div>

          {/* Headline  -  Instrument Serif, editorial scale */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
            className="hero-heading text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl text-white !leading-[1.1] mb-10 text-balance"
          >
            Your family deserves to know.
          </motion.h2>

          {/* Subtitle  -  quiet, purposeful */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="text-[15px] md:text-base mb-12 leading-relaxed"
            style={{ color: '#5A7A77' }}
          >
            A complete, solicitor-reviewed Will takes less than 20 minutes.
            <br className="hidden sm:block" />
            The clarity it creates lasts a lifetime.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button variant="primary" size="xl" asChild>
              <Link href={siteConfig.signupUrl}>Write your Will</Link>
            </Button>
            <Button variant="darkOutline" size="xl" asChild>
              <Link href={siteConfig.pricingUrl}>View pricing</Link>
            </Button>
          </motion.div>

          {/* Fine print trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="mt-8 text-xs tracking-wide"
            style={{ color: '#2E4E4C' }}
          >
            No subscription required · Solicitor review included · Secure Australian storage
          </motion.p>

        </div>
      </Container>
    </section>
  );
}
