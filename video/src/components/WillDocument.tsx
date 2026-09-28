import React from 'react';
import { C, F, R, S } from '../tokens/design';

interface LineProps {
  width: string;     // e.g. '80%'
  height?: number;
  color?: string;
  enterProgress: number; // 0 → 1 determines opacity/translate
  delay: number;         // delay in 0-1 progress units before this line starts
}

// A single typeset line or block in the document.
const DocLine: React.FC<LineProps> = ({
  width,
  height = 10,
  color = C.line,
  enterProgress,
  delay,
}) => {
  const localProgress = Math.max(0, Math.min(1, (enterProgress - delay) / (1 - delay)));
  const opacity = localProgress;
  const scaleX = 0.6 + localProgress * 0.4;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: color,
        opacity,
        transformOrigin: 'left center',
        transform: `scaleX(${scaleX})`,
        marginBottom: 4,
      }}
    />
  );
};

interface Props {
  enterProgress: number; // 0 → 1 overall reveal progress
  scale?: number;        // for shrink-into-vault transition
  translateX?: number;
  translateY?: number;
}

export const WillDocument: React.FC<Props> = ({
  enterProgress,
  scale = 1,
  translateX = 0,
  translateY = 0,
}) => {
  const docOpacity = Math.min(1, enterProgress * 2);

  return (
    <div
      style={{
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: R.card,
        boxShadow: S.doc,
        width: 480,
        padding: '40px 48px',
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        opacity: docOpacity,
        transformOrigin: 'center center',
      }}
    >
      {/* Header — LAST WILL AND TESTAMENT */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: C.neutral,
            margin: '0 0 10px',
            opacity: enterProgress,
          }}
        >
          Last Will and Testament
        </p>
        <h2
          style={{
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontSize: 26,
            fontWeight: 400,
            color: C.ink,
            margin: '0 0 4px',
            opacity: enterProgress,
          }}
        >
          Jane Elizabeth Smith
        </h2>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 11,
            color: C.neutral,
            margin: 0,
            opacity: enterProgress,
          }}
        >
          New South Wales, Australia
        </p>
      </div>

      {/* Clause sections */}
      <DocSection
        title="1. Revocation"
        enterProgress={enterProgress}
        baseDelay={0.15}
        lineCount={2}
        lineWidths={['90%', '70%']}
      />
      <DocSection
        title="2. Appointment of Executor"
        enterProgress={enterProgress}
        baseDelay={0.30}
        lineCount={3}
        lineWidths={['85%', '92%', '55%']}
      />
      <DocSection
        title="3. Distribution of Estate"
        enterProgress={enterProgress}
        baseDelay={0.48}
        lineCount={3}
        lineWidths={['88%', '78%', '66%']}
        accent
      />
      <DocSection
        title="4. Guardian Appointment"
        enterProgress={enterProgress}
        baseDelay={0.62}
        lineCount={2}
        lineWidths={['82%', '50%']}
      />
      <DocSection
        title="5. Specific Gifts"
        enterProgress={enterProgress}
        baseDelay={0.74}
        lineCount={2}
        lineWidths={['75%', '60%']}
      />

      {/* Signature block */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: `1px solid ${C.line}`,
          opacity: Math.max(0, (enterProgress - 0.85) / 0.15),
        }}
      >
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 1, background: C.line, marginBottom: 6 }} />
            <p style={{ fontFamily: F.sans, fontSize: 10, color: C.neutral, margin: 0 }}>
              Testator signature
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 1, background: C.line, marginBottom: 6 }} />
            <p style={{ fontFamily: F.sans, fontSize: 10, color: C.neutral, margin: 0 }}>
              Witness signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  enterProgress: number;
  baseDelay: number;
  lineCount: number;
  lineWidths: string[];
  accent?: boolean;
}

const DocSection: React.FC<SectionProps> = ({
  title,
  enterProgress,
  baseDelay,
  lineCount,
  lineWidths,
  accent = false,
}) => {
  const localP = Math.max(0, Math.min(1, (enterProgress - baseDelay) / 0.18));

  return (
    <div style={{ marginBottom: 18 }}>
      <p
        style={{
          fontFamily: F.sans,
          fontSize: 11,
          fontWeight: 600,
          color: accent ? C.teal : C.ink,
          margin: '0 0 7px',
          opacity: localP,
        }}
      >
        {title}
      </p>
      {Array.from({ length: lineCount }, (_, i) => (
        <DocLine
          key={i}
          width={lineWidths[i] ?? '70%'}
          height={8}
          color={accent ? C.tealSoft : C.line}
          enterProgress={enterProgress}
          delay={baseDelay + 0.04 + i * 0.04}
        />
      ))}
    </div>
  );
};
