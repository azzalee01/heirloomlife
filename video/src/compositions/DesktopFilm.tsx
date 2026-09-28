import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion';
import { useFonts } from '../hooks/useFonts';
import { C, F, R, S, SPRING_CONFIG, FPS, TOTAL_FRAMES } from '../tokens/design';
import { HeirloomWordmark } from '../components/HeirloomWordmark';
import { WillProgressBar } from '../components/WillProgressBar';
import { WillQuestionCard, WILL_STEPS } from '../components/WillQuestionCard';
import { WillDocument } from '../components/WillDocument';
import { VaultGrid } from '../components/VaultGrid';
import { LifeEventBadge } from '../components/LifeEventBadge';
import { PlatformShell } from '../components/PlatformShell';

// ─── Layout ───────────────────────────────────────────────────────────────────
// One large floating product panel against a dark atmospheric canvas.
// Approach: Legora-style — the UI IS the visual. Subtle 3D tilt, floating motion.

const PANEL_W = 1360;
const PANEL_H = 840;
const PANEL_LEFT = (1920 - PANEL_W) / 2;
const PANEL_TOP  = (1080 - PANEL_H) / 2;

// ─── Phase timing ─────────────────────────────────────────────────────────────
// Each phase overlaps the next by FADE frames for a smooth crossfade.
const FADE = 20;

const PH = {
  // CREATE — Will wizard questions
  c_in:  0,    c_out: 150,
  // REVIEW — Document assembles
  r_in:  130,  r_out: 285,
  // PROTECT — Vault revealed
  p_in:  265,  p_out: 410,
  // UPDATE — Life event
  u_in:  390,  u_out: 520,
  // LOOP — seamless return to CREATE
  l_in:  500,  l_out: 540,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function phaseOp(frame: number, inF: number, outF: number, noFadeIn = false, noFadeOut = false) {
  if (noFadeIn && noFadeOut) return 1;
  if (noFadeIn) return interpolate(frame, [outF - FADE, outF], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (noFadeOut) return interpolate(frame, [inF, inF + FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return interpolate(frame, [inF, inF + FADE, outF - FADE, outF], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

function sp(frame: number, startAt: number, cfg = SPRING_CONFIG.gentle) {
  return spring({ frame: frame - startAt, fps: FPS, config: cfg, from: 0, to: 1 });
}

// Absolute fill layer for stacking content phases inside the panel
const Layer: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
    {children}
  </div>
);

// ─── Phase content components ──────────────────────────────────────────────────

// CREATE — Will wizard cycling through 4 question steps
const STEP_ENTER: number[] = [0, 35, 70, 105];

const CreatePhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);

  // Which step is currently active
  const activeStep = STEP_ENTER.reduce((acc, sf, i) => (f >= sf ? i : acc), 0);

  // Outgoing step fades up and out
  const prevStep = activeStep > 0 ? activeStep - 1 : -1;

  function stepProgress(idx: number) {
    const enter = STEP_ENTER[idx] ?? 0;
    const nextEnter = STEP_ENTER[idx + 1] ?? 9999;
    const enterSpring = sp(f, enter, SPRING_CONFIG.snappy);
    const exitOp = interpolate(f, [nextEnter - 5, nextEnter + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const exitY = interpolate(f, [nextEnter - 5, nextEnter + 15], [0, -18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return { enterSpring, exitOp, exitY };
  }

  const headerIn = sp(f, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 40px', gap: 24 }}>
      {/* Header */}
      <div style={{ opacity: headerIn, transform: `translateY(${(1 - headerIn) * 8}px)` }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
          Create my Will
        </p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: C.ink, margin: '0 0 20px', fontWeight: 400 }}>
          A few questions about you and your family.
        </h2>
        <WillProgressBar steps={['About you', 'Children', 'Executor', 'Beneficiaries']} activeIndex={activeStep} />
      </div>

      {/* Question cards — stacked, previous slides up as next enters */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {WILL_STEPS.map((step, i) => {
          if (i > activeStep) return null; // not yet shown
          const { enterSpring, exitOp, exitY } = stepProgress(i);
          const isActive = i === activeStep;
          return (
            <div
              key={step.label}
              style={{
                position: 'absolute',
                width: '100%',
                maxWidth: 560,
                opacity: isActive ? enterSpring : exitOp,
                transform: `translateY(${isActive ? (1 - enterSpring) * 24 : exitY}px)`,
                pointerEvents: 'none',
              }}
            >
              <WillQuestionCard step={step} enterProgress={isActive ? enterSpring : 1} />
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <div style={{ display: 'flex', justifyContent: 'center', opacity: sp(f, STEP_ENTER[activeStep] ?? 0) }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.teal, borderRadius: R.btn, padding: '12px 28px',
          fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: '#fff',
          boxShadow: S.teal,
        }}>
          {activeStep < 3 ? 'Continue' : 'Review my Will'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// REVIEW — Will document assembles
const ReviewPhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const docProgress = sp(f, 0);
  const headerIn = sp(f, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 40px 24px', overflow: 'hidden' }}>
      <div style={{ opacity: headerIn, transform: `translateY(${(1 - headerIn) * 8}px)`, textAlign: 'center', marginBottom: 24, width: '100%' }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
          Draft ready
        </p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: C.ink, margin: 0, fontWeight: 400 }}>
          Review your Will
        </h2>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
          <WillDocument enterProgress={docProgress} />
        </div>
      </div>
    </div>
  );
};

// PROTECT — Vault grid
const ProtectPhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const headerIn = sp(f, 0, SPRING_CONFIG.snappy);
  const vaultIn = sp(f, 8);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 40px' }}>
      <div style={{ opacity: headerIn, transform: `translateY(${(1 - headerIn) * 8}px)`, marginBottom: 24 }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
          Your estate
        </p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: C.ink, margin: 0, fontWeight: 400 }}>
          Everything, in one place.
        </h2>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
        <VaultGrid enterProgress={vaultIn} />
      </div>
    </div>
  );
};

// UPDATE — Life event overlaid on vault
const UpdatePhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const vaultIn = 1; // vault already at full opacity (carry-over from protect)
  const badgeIn = sp(f, 8, SPRING_CONFIG.snappy);
  const cardIn  = sp(f, 28);
  const ctaIn   = sp(f, 50);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Life events</p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, color: C.ink, margin: 0, fontWeight: 400 }}>Life changes.</h2>
      </div>

      {/* Vault grid (background, slightly dimmed) */}
      <div style={{ opacity: 0.35, position: 'absolute', inset: '96px 40px 40px', pointerEvents: 'none', overflow: 'hidden' }}>
        <VaultGrid enterProgress={1} />
      </div>

      {/* Life event notification — centered over the vault */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
        <LifeEventBadge
          event="Bought a home"
          icon="M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9"
          iconBg={C.tealLight}
          iconFg={C.teal}
          enterProgress={badgeIn}
        />

        {/* Prompt card */}
        <div style={{
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 14}px)`,
          background: C.paper,
          border: `1.5px solid ${C.teal}`,
          borderRadius: R.card,
          padding: '16px 22px',
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: `0 0 0 4px rgba(42,180,174,0.08), ${S.cardHover}`,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: R.btn, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.ink, margin: '0 0 2px' }}>Property added to your estate</p>
            <p style={{ fontFamily: F.sans, fontSize: 11, color: C.neutral, margin: 0 }}>Consider updating your beneficiaries</p>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: C.teal, flexShrink: 0 }} />
        </div>

        {/* CTA */}
        <div style={{ opacity: ctaIn, display: 'inline-flex', alignItems: 'center', gap: 8, background: C.teal, borderRadius: R.btn, padding: '12px 28px', fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: S.teal }}>
          Keep my Will current
        </div>
      </div>
    </div>
  );
};

// ─── Main composition ──────────────────────────────────────────────────────────

export const DesktopFilm: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // ── Panel motion ──────────────────────────────────────────────────────────
  // Constant gentle 3D tilt — premium product showcase angle.
  const ROT_Y = 5;   // degrees — panel tilts slightly left edge toward viewer
  const ROT_X = 1.5; // degrees — slight top-down view

  // Floating: full sine cycle (frame 0 = 0px, frame 270 = +6px, frame 540 = 0px → seamless loop)
  const floatY = Math.sin((frame / TOTAL_FRAMES) * Math.PI * 2) * 6;
  // Very subtle horizontal drift in the opposite phase
  const floatX = Math.sin((frame / TOTAL_FRAMES) * Math.PI * 2 + Math.PI / 2) * 2;

  // Panel entrance (first 40 frames)
  const panelIn    = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panelScale = interpolate(frame, [0, 40], [0.96, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panelY     = interpolate(frame, [0, 40], [14, 0],   { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Phase opacities ───────────────────────────────────────────────────────
  const createOp  = phaseOp(frame, PH.c_in, PH.c_out, true,  false);
  const reviewOp  = phaseOp(frame, PH.r_in, PH.r_out, false, false);
  const protectOp = phaseOp(frame, PH.p_in, PH.p_out, false, false);
  const updateOp  = phaseOp(frame, PH.u_in, PH.u_out, false, false);
  const loopOp    = phaseOp(frame, PH.l_in, PH.l_out, false, true);

  // Which nav item to highlight
  const activeNav = updateOp > 0.5 ? 3 : protectOp > 0.5 ? 2 : 1;

  // ── Background teal accent brightness (pulses slightly with phase changes) ─
  const glowIntensity = 0.07 + protectOp * 0.03 + updateOp * 0.02;

  return (
    <AbsoluteFill style={{ background: '#070C0B', overflow: 'hidden' }}>

      {/* ── Atmospheric background ──────────────────────────────────────── */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 80% 70% at 50% 45%, #0f2420 0%, #070C0B 65%)`,
      }} />

      {/* Subtle scanline / grain overlay via repeating gradient */}
      <AbsoluteFill style={{
        backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, transparent 2px, transparent 4px)`,
        pointerEvents: 'none',
      }} />

      {/* ── Teal panel halo (behind the panel) ─────────────────────────── */}
      <div style={{
        position: 'absolute',
        width: PANEL_W + 240,
        height: PANEL_H + 240,
        left: PANEL_LEFT - 120 + floatX,
        top: PANEL_TOP - 120 + floatY + panelY,
        background: `radial-gradient(ellipse at center, rgba(42,180,174,${glowIntensity}) 0%, transparent 60%)`,
        filter: 'blur(40px)',
        opacity: panelIn,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ── Heirloom wordmark ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 32, left: 44, zIndex: 20,
        opacity: panelIn,
        transform: `translateY(${(1 - panelIn) * 8}px)`,
      }}>
        <HeirloomWordmark dark size={19} />
      </div>

      {/* ── THE FLOATING PRODUCT PANEL ─────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          width: PANEL_W,
          height: PANEL_H,
          left: PANEL_LEFT + floatX,
          top: PANEL_TOP + floatY + panelY,
          transform: `perspective(1600px) rotateY(${ROT_Y}deg) rotateX(${ROT_X}deg) scale(${panelScale})`,
          transformOrigin: '50% 50%',
          borderRadius: 12,
          overflow: 'hidden',
          opacity: panelIn,
          boxShadow: `
            0 0 0 1px rgba(42,180,174,0.14),
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 24px 60px rgba(0,0,0,0.65),
            0 60px 120px rgba(0,0,0,0.40),
            0 0 80px rgba(42,180,174,0.08)
          `,
          zIndex: 10,
        }}
      >
        <PlatformShell activeNav={activeNav}>
          {/* Phase layers stacked inside the content area */}
          <div style={{ position: 'relative', height: '100%', background: C.paperWarm }}>

            {/* CREATE */}
            <Layer opacity={createOp}>
              <CreatePhase localFrame={frame - PH.c_in} />
            </Layer>

            {/* REVIEW */}
            <Layer opacity={reviewOp}>
              <ReviewPhase localFrame={frame - PH.r_in} />
            </Layer>

            {/* PROTECT */}
            <Layer opacity={protectOp}>
              <ProtectPhase localFrame={frame - PH.p_in} />
            </Layer>

            {/* UPDATE */}
            <Layer opacity={updateOp}>
              <UpdatePhase localFrame={frame - PH.u_in} />
            </Layer>

            {/* LOOP — identical to CREATE at localFrame 0 for seamless loop */}
            <Layer opacity={loopOp}>
              <CreatePhase localFrame={0} />
            </Layer>
          </div>
        </PlatformShell>
      </div>

      {/* ── Subtle bottom vignette ──────────────────────────────────────── */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(7,12,11,0.6) 0%, transparent 25%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />
    </AbsoluteFill>
  );
};
