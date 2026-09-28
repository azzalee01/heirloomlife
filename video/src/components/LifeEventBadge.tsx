import React from 'react';
import { C, F, R, S } from '../tokens/design';

interface Props {
  event: string;
  icon: string; // SVG path d=
  iconBg: string;
  iconFg: string;
  enterProgress: number; // 0 → 1
}

// Life-event notification chip — matches the life-events dashboard section
export const LifeEventBadge: React.FC<Props> = ({
  event,
  icon,
  iconBg,
  iconFg,
  enterProgress,
}) => {
  const translateY = (1 - enterProgress) * 16;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: C.paper,
        border: `1.5px solid ${C.line}`,
        borderRadius: R.full,
        padding: '10px 18px 10px 10px',
        boxShadow: S.card,
        opacity: enterProgress,
        transform: `translateY(${translateY}px)`,
        maxWidth: 320,
      }}
    >
      {/* Icon pill */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconFg}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 11,
            fontWeight: 500,
            color: C.neutral,
            margin: '0 0 1px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Life event
        </p>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 14,
            fontWeight: 600,
            color: C.ink,
            margin: 0,
          }}
        >
          {event}
        </p>
      </div>

      {/* Teal dot indicator */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: C.teal,
          flexShrink: 0,
        }}
      />
    </div>
  );
};
