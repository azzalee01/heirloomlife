import React from 'react';
import { C, F, R, S } from '../tokens/design';

export type QuestionStep = {
  label: string;     // e.g. "About you"
  question: string;  // e.g. "What is your full name?"
  answer: string;    // e.g. "Jane Smith"
  extra?: string;    // e.g. secondary answer / chip
  icon: string;      // SVG path d= for 18x18 icon
  iconBg: string;
  iconFg: string;
};

interface Props {
  step: QuestionStep;
  enterProgress: number; // 0 → 1 spring progress
}

// A single will-wizard step card.
// Slides in from slightly below with opacity fade.
export const WillQuestionCard: React.FC<Props> = ({ step, enterProgress }) => {
  const translateY = (1 - enterProgress) * 28;
  const opacity = enterProgress;

  return (
    <div
      style={{
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: R.card,
        padding: '28px 32px',
        width: '100%',
        maxWidth: 480,
        boxShadow: S.doc,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Step label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: R.btn,
            background: step.iconBg,
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
            stroke={step.iconFg}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={step.icon} />
          </svg>
        </div>
        <span
          style={{
            fontFamily: F.sans,
            fontSize: 11,
            fontWeight: 600,
            color: C.neutral,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {step.label}
        </span>
      </div>

      {/* Question */}
      <p
        style={{
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontSize: 22,
          color: C.ink,
          margin: '0 0 20px',
          lineHeight: 1.3,
          fontWeight: 400,
        }}
      >
        {step.question}
      </p>

      {/* Answer — styled as a filled input */}
      <div
        style={{
          background: C.tealLight,
          border: `1.5px solid ${C.teal}`,
          borderRadius: R.btn,
          padding: '11px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: `0 0 0 3px rgba(42,180,174,0.10)`,
        }}
      >
        <span
          style={{
            fontFamily: F.sans,
            fontSize: 14,
            fontWeight: 500,
            color: C.ink,
            flex: 1,
          }}
        >
          {step.answer}
        </span>
        {/* Check mark */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 5.5"
            stroke={C.teal}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Extra chip (optional) */}
      {step.extra && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: C.tealSoft,
              border: `1px solid ${C.teal}22`,
              borderRadius: R.full,
              padding: '4px 12px',
              fontFamily: F.sans,
              fontSize: 12,
              fontWeight: 500,
              color: C.tealDeep,
            }}
          >
            {step.extra}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step definitions ──────────────────────────────────────────────────────────

const PERSON_ICON = 'M12 11a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0';
const CHILD_ICON  = 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75';
const EXEC_ICON   = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
const BENE_ICON   = 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

export const WILL_STEPS: QuestionStep[] = [
  {
    label: 'About you',
    question: 'What is your full legal name?',
    answer: 'Jane Elizabeth Smith',
    iconBg: C.tealLight,
    iconFg: C.teal,
    icon: PERSON_ICON,
  },
  {
    label: 'Children',
    question: 'Do you have any children?',
    answer: 'Yes — 2 children',
    extra: 'Sam Smith, 8  ·  Lily Smith, 5',
    iconBg: '#EFF6FF',
    iconFg: '#3B82F6',
    icon: CHILD_ICON,
  },
  {
    label: 'Executor',
    question: 'Who will administer your estate?',
    answer: 'Michael James Smith',
    extra: 'Spouse  ·  Backup: Sarah Brown',
    iconBg: '#F0FDF4',
    iconFg: '#10B981',
    icon: EXEC_ICON,
  },
  {
    label: 'Beneficiaries',
    question: 'Who receives your estate?',
    answer: 'Michael Smith — 100%',
    extra: 'Backup: Sam & Lily Smith equally',
    iconBg: C.insureBg,
    iconFg: C.insureFg,
    icon: BENE_ICON,
  },
];
