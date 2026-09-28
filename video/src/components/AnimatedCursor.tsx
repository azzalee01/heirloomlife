import React from 'react';

interface AnimatedCursorProps {
  x: number;
  y: number;
  opacity?: number;
  scale?: number; // 1 = normal, <1 = clicking
}

// Standard macOS-style arrow cursor in SVG.
// The cursor hotspot is the top-left tip of the arrow.
export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  x,
  y,
  opacity = 1,
  scale = 1,
}) => {
  const size = 28;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: 'none',
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: '0 0', // hotspot at top-left tip
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
        zIndex: 9999,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Arrow cursor path */}
        <path
          d="M4.5 3L20 13.5L12.5 14.5L9 21L4.5 3Z"
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
