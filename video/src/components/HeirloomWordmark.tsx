import React from 'react';
import { C, F } from '../tokens/design';

interface Props {
  color?: string;
  size?: number;
  dark?: boolean; // true = use on dark bg
}

// The Heirloom wordmark: "H" serif monogram + "Heirloom" italic text.
// Faithful to the production SideNav implementation.
export const HeirloomWordmark: React.FC<Props> = ({
  color,
  size = 22,
  dark = false,
}) => {
  const fg = color ?? (dark ? '#ffffff' : C.teal);
  const mono = color ?? (dark ? C.teal : C.teal);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.35,
        userSelect: 'none',
      }}
    >
      {/* Monogram mark */}
      <div
        style={{
          width: size * 1.45,
          height: size * 1.45,
          borderRadius: size * 0.28,
          background: dark ? 'rgba(42,180,174,0.15)' : C.tealLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontSize: size * 1.05,
            lineHeight: 1,
            color: mono,
            display: 'block',
            marginTop: size * 0.04,
          }}
        >
          H
        </span>
      </div>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontSize: size,
          lineHeight: 1,
          color: fg,
          letterSpacing: '-0.01em',
        }}
      >
        Heirloom
      </span>
    </div>
  );
};
