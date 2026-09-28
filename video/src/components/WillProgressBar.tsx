import React from 'react';
import { C, F } from '../tokens/design';

interface Props {
  steps: string[];
  activeIndex: number; // 0-based
}

// Faithful recreation of the ProgressBar from app/will/new/_components/ProgressBar.tsx.
// Segmented horizontal track. Active/completed = teal, future = light border.
export const WillProgressBar: React.FC<Props> = ({ steps, activeIndex }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      {steps.map((label, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        const segColor = isDone || isActive ? C.teal : C.line;

        return (
          <React.Fragment key={label}>
            {/* Segment line */}
            <div
              style={{
                flex: 1,
                height: 2,
                borderRadius: 2,
                background: segColor,
                transition: 'background 0.3s ease',
              }}
            />
            {/* Step chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: isDone
                    ? C.tealSoft
                    : isActive
                    ? C.teal
                    : C.paperWarm,
                  border: isActive
                    ? 'none'
                    : isDone
                    ? `1.5px solid ${C.tealSoft}`
                    : `1.5px solid ${C.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  // Checkmark
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke={C.tealDeep}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 10,
                      fontWeight: 600,
                      color: isActive ? '#fff' : C.neutral,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: F.sans,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.ink : isDone ? C.tealDeep : C.neutral,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}

      {/* Final line segment */}
      <div
        style={{
          flex: 1,
          height: 2,
          borderRadius: 2,
          background: activeIndex >= steps.length ? C.teal : C.line,
        }}
      />
    </div>
  );
};
