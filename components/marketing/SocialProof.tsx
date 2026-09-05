'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout';
import { FadeIn } from '@/components/shared';
import { getIcon } from '@/lib/icon-map';

const EASE_REVEAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Stats ────────────────────────────────────────────────────────────────────
// Heirloom-specific numbers. Update once real data is available.
const STATS = [
  { value: 20, suffix: 'min', label: 'Average time to complete' },
  { value: 98, suffix: '%', label: 'Customer satisfaction' },
  { value: 3000, suffix: '+', label: 'Wills written' },
];

const TRUST_BADGES = [
  { iconName: 'shield-check', text: 'Solicitor reviewed' },
  { iconName: 'lock', text: 'Secure Australian servers' },
  { iconName: 'check-circle', text: 'Available across all Australian states' },
  { iconName: 'refresh-cw', text: 'Update anytime' },
];

// ── useCountUp ────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1.5) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return { count, ref };
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: EASE_REVEAL }}
      className="text-center"
    >
      {/* Teal stat number  -  Instrument Serif */}
      <p
        className="stat-display text-4xl md:text-5xl lg:text-6xl mb-2"
        style={{ color: 'var(--color-teal)' }}
      >
        {count.toLocaleString()}
        <span className="text-2xl md:text-3xl ml-1">{suffix}</span>
      </p>
      <p className="text-sm text-secondary font-medium uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}

// ── SocialProof ───────────────────────────────────────────────────────────────
export function SocialProof() {
  return (
    <section className="section" style={{ background: 'var(--color-stone)' }}>
      <Container>
        <FadeIn>
          <h2 className="hero-heading text-3xl md:text-4xl lg:text-5xl text-primary text-center mb-14 md:mb-20 text-balance">
            Trusted by Australians
            <br className="hidden sm:block" />
            who plan ahead.
          </h2>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-14 md:mb-20">
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Trust badges */}
        <FadeIn delay={0.3}>
          <div className="border-t pt-8" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-secondary">
              {TRUST_BADGES.map((badge) => (
                <span key={badge.text} className="flex items-center gap-2">
                  <span style={{ color: 'var(--color-teal)' }}>
                    {getIcon(badge.iconName, 14)}
                  </span>
                  {badge.text}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
