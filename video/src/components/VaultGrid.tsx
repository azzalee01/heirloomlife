import React from 'react';
import { C, F, R, S } from '../tokens/design';

export interface VaultCardData {
  title: string;
  subtitle: string;
  fg: string;
  bg: string;
  icon: string; // SVG path d=
  value?: string;
}

interface CardProps {
  card: VaultCardData;
  enterProgress: number; // 0 → 1
  delay: number;         // 0-1 offset before card starts
}

const VaultCardItem: React.FC<CardProps> = ({ card, enterProgress, delay }) => {
  const localP = Math.max(0, Math.min(1, (enterProgress - delay) / (1 - delay + 0.001)));
  const translateY = (1 - localP) * 20;

  return (
    <div
      style={{
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: R.card,
        padding: '16px 18px',
        boxShadow: S.card,
        opacity: localP,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Teal accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${card.fg} 30%, ${card.fg} 70%, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: R.btn,
          background: card.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={card.fg}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={card.icon} />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 13,
            fontWeight: 600,
            color: C.ink,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {card.title}
        </p>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 11,
            color: C.neutral,
            margin: '2px 0 0',
          }}
        >
          {card.subtitle}
        </p>
      </div>

      {/* Value */}
      {card.value && (
        <span
          style={{
            fontFamily: F.sans,
            fontSize: 12,
            fontWeight: 600,
            color: card.fg,
            flexShrink: 0,
            background: card.bg,
            padding: '3px 8px',
            borderRadius: R.full,
          }}
        >
          {card.value}
        </span>
      )}
    </div>
  );
};

interface VaultGridProps {
  enterProgress: number; // 0 → 1
}

const VAULT_CARDS: VaultCardData[] = [
  {
    title: 'My Will',
    subtitle: 'Drafted · Pending signature',
    fg: C.teal,
    bg: C.tealLight,
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    value: 'Saved',
  },
  {
    title: 'Property',
    subtitle: '14 Willowbrook Terrace',
    fg: C.propertyFg,
    bg: C.propertyBg,
    icon: 'M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9',
    value: '$920k',
  },
  {
    title: 'Superannuation',
    subtitle: 'AustralianSuper · Binding nom.',
    fg: C.superFg,
    bg: C.superBg,
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    value: '$148k',
  },
  {
    title: 'Life Insurance',
    subtitle: 'OnePath · $1.2M coverage',
    fg: C.insureFg,
    bg: C.insureBg,
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    value: 'Active',
  },
  {
    title: 'Bank Accounts',
    subtitle: 'Commonwealth Bank · 2 accounts',
    fg: C.bankFg,
    bg: C.bankBg,
    icon: 'M3 10h18M3 14h18M5 6l7-3 7 3M4 10v10M20 10v10M8 10v10M12 10v10M16 10v10',
    value: '$42k',
  },
  {
    title: 'Important Documents',
    subtitle: 'Passport · Birth Certificate · More',
    fg: C.docFg,
    bg: C.docBg,
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    value: '6 docs',
  },
];

export const VaultGrid: React.FC<VaultGridProps> = ({ enterProgress }) => {
  // Stagger delays across cards
  const stagger = 0.12;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        width: '100%',
        maxWidth: 560,
      }}
    >
      {VAULT_CARDS.map((card, i) => (
        <VaultCardItem
          key={card.title}
          card={card}
          enterProgress={enterProgress}
          delay={i * stagger}
        />
      ))}
    </div>
  );
};
