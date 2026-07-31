'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout';
import { FadeIn } from '@/components/shared';
import { getIcon } from '@/lib/icon-map';

const EASE_REVEAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Heirloom feature set ──────────────────────────────────────────────────────
// Replace with content from your locale/config system if you add i18n.
const FEATURES = [
  {
    iconName: 'file-text',
    title: 'A legally valid Will, in minutes',
    description:
      'Answer simple questions about your wishes. We generate a correctly structured Will that meets Australian legal requirements — no legalese, no forms, no confusion.',
  },
  {
    iconName: 'user-check',
    title: 'Optional solicitor review',
    description:
      'Every Will can be reviewed by one of our partner solicitors. You get written confirmation your document is legally sound — included in your plan.',
  },
  {
    iconName: 'archive',
    title: 'Living Vault for everything else',
    description:
      'Store your accounts, property, insurance, and wishes in a secure vault your executor can access when the time comes. Update it anytime.',
  },
  {
    iconName: 'refresh-cw',
    title: 'Update as life changes',
    description:
      'Marriage, children, property, business — major life events change what your Will should say. Heirloom makes amendments straightforward, not expensive.',
  },
];

// ── FeatureRow ────────────────────────────────────────────────────────────────
function FeatureRow({
  feature,
  index,
}: {
  feature: typeof FEATURES[number];
  index: number;
}) {
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: 0.1, ease: EASE_REVEAL }}
      className={`flex flex-col ${
        isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center gap-8 md:gap-14`}
    >
      {/* Text side */}
      <div className="flex-1 min-w-0">
        {/* Icon + step marker */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--color-teal-light)',
              color: 'var(--color-teal)',
            }}
          >
            {getIcon(feature.iconName, 22)}
          </div>
          {/* Hairline teal step label */}
          <span
            className="text-[11px] font-medium tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-teal)' }}
          >
            0{index + 1}
          </span>
        </div>

        <h3
          className="text-2xl md:text-3xl font-heading font-light text-primary mb-3 tracking-tight"
          style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
        >
          {feature.title}
        </h3>

        <p className="text-[15px] text-secondary leading-relaxed max-w-md">
          {feature.description}
        </p>
      </div>

      {/* Visual side — placeholder until illustrations are ready */}
      <div className="flex-1 min-w-0 w-full">
        <div
          className="rounded-2xl aspect-[4/3] flex items-center justify-center transition-all duration-300"
          style={{
            border: '1px solid var(--color-border)',
            background: 'white',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              '0 8px 30px rgba(42,180,174,0.08)';
            (e.currentTarget as HTMLDivElement).style.borderColor =
              'rgba(42,180,174,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLDivElement).style.borderColor =
              'var(--color-border)';
          }}
        >
          <div style={{ color: 'var(--color-teal)', opacity: 0.15 }}>
            {getIcon(feature.iconName, 56)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── FeatureShowcase ───────────────────────────────────────────────────────────
export function FeatureShowcase() {
  return (
    <section id="features" className="section" style={{ background: 'white' }}>
      <Container>
        <FadeIn>
          <div className="max-w-3xl mb-14 md:mb-20">
            <h2
              className="hero-heading text-3xl md:text-4xl lg:text-5xl text-primary mb-5 text-balance"
              style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif' }}
            >
              Everything your Will needs.
              <br />
              Nothing it doesn't.
            </h2>
            <p className="text-lg text-secondary leading-relaxed max-w-2xl text-pretty">
              Heirloom covers the full picture — from a legally valid Will to a living
              record your executor can actually use.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-16 md:space-y-24">
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
