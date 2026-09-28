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
import { LifeEventBadge } from '../components/LifeEventBadge';

// ─── Mobile: portrait 1080×1920 ───────────────────────────────────────────────
// Shows a phone-proportioned product panel (portrait UI, no sidebar) floating
// against the same dark atmospheric background as the desktop version.

const PANEL_W = 520;
const PANEL_H = 960;
const PANEL_LEFT = (1080 - PANEL_W) / 2;
const PANEL_TOP  = (1920 - PANEL_H) / 2 - 40;

// Phase timing — same structure as desktop
const FADE = 20;
const PH = {
  c_in:  0,    c_out: 150,
  r_in:  130,  r_out: 285,
  p_in:  265,  p_out: 410,
  u_in:  390,  u_out: 520,
  l_in:  500,  l_out: 540,
} as const;

function phaseOp(frame: number, inF: number, outF: number, noFadeIn = false, noFadeOut = false) {
  if (noFadeIn && noFadeOut) return 1;
  if (noFadeIn) return interpolate(frame, [outF - FADE, outF], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (noFadeOut) return interpolate(frame, [inF, inF + FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return interpolate(frame, [inF, inF + FADE, outF - FADE, outF], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
}

function sp(frame: number, startAt: number, cfg = SPRING_CONFIG.gentle) {
  return spring({ frame: frame - startAt, fps: FPS, config: cfg, from: 0, to: 1 });
}

const Layer: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
    {children}
  </div>
);

// ─── Mobile shell ─────────────────────────────────────────────────────────────

const MobileShell: React.FC<{ children: React.ReactNode; activeTab?: number }> = ({
  children,
  activeTab = 1,
}) => {
  const tabs = [
    { label: 'Home',   icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
    { label: 'Will',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Vault',  icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { label: 'Life',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.paperWarm, borderRadius: 'inherit', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ height: 44, background: C.paper, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
        <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.ink }}>9:41</span>
        <HeirloomWordmark size={15} />
        <svg width="38" height="14" viewBox="0 0 38 14" fill="none">
          <rect x="1" y="1" width="12" height="12" rx="2" stroke={C.neutral} strokeWidth="1.2" />
          <rect x="2" y="3" width="10" height="8" rx="1" fill={C.teal} />
          <path d="M17 7a5 5 0 0110 0" stroke={C.neutral} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 7a2 2 0 014 0" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="22" cy="7" r="1.2" fill={C.ink} />
          <rect x="28" y="2.5" width="9" height="9" rx="2" stroke={C.neutral} strokeWidth="1.2" />
          <rect x="29" y="3.5" width="6" height="7" rx="1" fill={C.ink} />
          <rect x="37" y="5" width="1" height="4" rx="0.5" fill={C.neutral} />
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>

      {/* Bottom nav */}
      <div style={{ height: 78, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', paddingBottom: 14, flexShrink: 0 }}>
        {tabs.map((tab, i) => {
          const active = i === activeTab;
          return (
            <div key={tab.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.teal : C.neutral} strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              <span style={{ fontFamily: F.sans, fontSize: 10, fontWeight: active ? 600 : 400, color: active ? C.teal : C.neutral }}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Phase content (mobile-adapted) ───────────────────────────────────────────

const STEP_ENTER: number[] = [0, 35, 70, 105];

const MCreatePhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const activeStep = STEP_ENTER.reduce((acc, sf, i) => (f >= sf ? i : acc), 0);
  const headerIn = sp(f, 0);

  function stepEnterP(i: number) {
    return sp(f, STEP_ENTER[i] ?? 0, SPRING_CONFIG.snappy);
  }
  function stepExitOp(i: number) {
    const nextEnter = STEP_ENTER[i + 1] ?? 9999;
    return interpolate(f, [nextEnter - 5, nextEnter + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }
  function stepExitY(i: number) {
    const nextEnter = STEP_ENTER[i + 1] ?? 9999;
    return interpolate(f, [nextEnter - 5, nextEnter + 15], [0, -16], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 18px', gap: 16 }}>
      <div style={{ opacity: headerIn, transform: `translateY(${(1 - headerIn) * 6}px)` }}>
        <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>
          Step {activeStep + 1} of 4
        </p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 22, color: C.ink, margin: '0 0 14px', fontWeight: 400 }}>
          Build your Will
        </h2>
        <div style={{ display: 'flex', gap: 5 }}>
          {WILL_STEPS.map((_, i) => (
            <div key={i} style={{ height: 2, flex: 1, borderRadius: 2, background: i <= activeStep ? C.teal : C.line }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {WILL_STEPS.map((step, i) => {
          if (i > activeStep) return null;
          const isActive = i === activeStep;
          const enterP = stepEnterP(i);
          const exitOp = stepExitOp(i);
          const exitY  = stepExitY(i);
          return (
            <div key={step.label} style={{
              position: 'absolute', width: '100%',
              opacity: isActive ? enterP : exitOp,
              transform: `translateY(${isActive ? (1 - enterP) * 20 : exitY}px)`,
            }}>
              <WillQuestionCard step={step} enterProgress={isActive ? enterP : 1} />
            </div>
          );
        })}
      </div>

      <div style={{ opacity: sp(f, STEP_ENTER[activeStep] ?? 0), display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.teal, borderRadius: R.btn, padding: '14px', fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: S.teal }}>
          {activeStep < 3 ? 'Continue' : 'Review my Will'}
        </div>
      </div>
    </div>
  );
};

const MReviewPhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const docP = sp(f, 0);
  const headerIn = sp(f, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 14px', overflow: 'hidden', alignItems: 'center' }}>
      <div style={{ opacity: headerIn, textAlign: 'center', marginBottom: 14, width: '100%' }}>
        <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Draft ready</p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 22, color: C.ink, margin: 0, fontWeight: 400 }}>Review your Will</h2>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: 'scale(0.68)', transformOrigin: 'top center', width: '147%', marginLeft: '-23%' }}>
          <WillDocument enterProgress={docP} />
        </div>
      </div>
    </div>
  );
};

const MOBILE_VAULT = [
  { title: 'My Will', subtitle: 'Draft · Ready to sign', fg: C.teal, bg: C.tealLight, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Property', subtitle: '14 Willowbrook Terrace', fg: C.propertyFg, bg: C.propertyBg, icon: 'M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9' },
  { title: 'Superannuation', subtitle: 'AustralianSuper · $148k', fg: C.superFg, bg: C.superBg, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'Life Insurance', subtitle: 'OnePath · $1.2M', fg: C.insureFg, bg: C.insureBg, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

const MProtectPhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const headerIn = sp(f, 0, SPRING_CONFIG.snappy);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 14px', gap: 12 }}>
      <div style={{ opacity: headerIn, transform: `translateY(${(1 - headerIn) * 6}px)` }}>
        <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Your estate</p>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 22, color: C.ink, margin: 0, fontWeight: 400 }}>Everything, in one place.</h2>
      </div>
      {MOBILE_VAULT.map((card, i) => {
        const p = sp(f, i * 12);
        return (
          <div key={card.title} style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: R.card, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, opacity: p, transform: `translateY(${(1 - p) * 14}px)`, boxShadow: S.card, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${card.fg} 30%, ${card.fg} 70%, transparent)`, opacity: 0.6 }} />
            <div style={{ width: 36, height: 36, borderRadius: R.btn, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={card.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={card.icon} /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>{card.title}</p>
              <p style={{ fontFamily: F.sans, fontSize: 11, color: C.neutral, margin: '1px 0 0' }}>{card.subtitle}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.neutral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        );
      })}
    </div>
  );
};

const MUpdatePhase: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const f = Math.max(0, localFrame);
  const textIn  = sp(f, 0);
  const badgeIn = sp(f, 12, SPRING_CONFIG.snappy);
  const cardIn  = sp(f, 30);
  const ctaIn   = sp(f, 50);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 18px', gap: 20, textAlign: 'center' }}>
      <div style={{ opacity: textIn, transform: `translateY(${(1 - textIn) * 12}px)` }}>
        <h2 style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 38, color: C.ink, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.1 }}>Life changes.</h2>
        <p style={{ fontFamily: F.sans, fontSize: 14, color: C.neutral, margin: 0 }}>Keep your plan current.</p>
      </div>

      <LifeEventBadge event="Bought a home" icon="M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9" iconBg={C.tealLight} iconFg={C.teal} enterProgress={badgeIn} />

      <div style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 14}px)`, background: C.paper, border: `1.5px solid ${C.teal}`, borderRadius: R.card, padding: '14px 16px', width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: `0 0 0 3px rgba(42,180,174,0.08)` }}>
        <div style={{ width: 34, height: 34, borderRadius: R.btn, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-8 9 8v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8zM9 21V12h6v9" /></svg>
        </div>
        <div>
          <p style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.ink, margin: '0 0 3px' }}>Property added to your estate</p>
          <p style={{ fontFamily: F.sans, fontSize: 11, color: C.neutral, margin: 0 }}>Consider updating your beneficiaries</p>
        </div>
      </div>

      <div style={{ opacity: ctaIn, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.teal, borderRadius: R.btn, padding: '14px', fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: '#fff', boxShadow: S.teal }}>
          Keep my Will current
        </div>
      </div>
    </div>
  );
};

// ─── Main mobile composition ───────────────────────────────────────────────────

export const MobileFilm: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // Floating motion — full sine cycle = seamless loop
  const floatY = Math.sin((frame / TOTAL_FRAMES) * Math.PI * 2) * 8;
  const floatX = Math.sin((frame / TOTAL_FRAMES) * Math.PI * 2 + Math.PI / 2) * 2;

  // Gentle tilt for depth — portrait phone at slight angle looks great
  const ROT_Y = 3;
  const ROT_X = 1;

  const panelIn    = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panelScale = interpolate(frame, [0, 40], [0.96, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panelY     = interpolate(frame, [0, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const createOp  = phaseOp(frame, PH.c_in, PH.c_out, true,  false);
  const reviewOp  = phaseOp(frame, PH.r_in, PH.r_out, false, false);
  const protectOp = phaseOp(frame, PH.p_in, PH.p_out, false, false);
  const updateOp  = phaseOp(frame, PH.u_in, PH.u_out, false, false);
  const loopOp    = phaseOp(frame, PH.l_in, PH.l_out, false, true);

  const activeTab = updateOp > 0.5 ? 3 : protectOp > 0.5 ? 2 : 1;

  return (
    <AbsoluteFill style={{ background: '#070C0B', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 42%, #0f2420 0%, #070C0B 65%)' }} />

      {/* Teal halo behind panel */}
      <div style={{
        position: 'absolute',
        width: PANEL_W + 280,
        height: PANEL_H + 280,
        left: PANEL_LEFT - 140 + floatX,
        top: PANEL_TOP - 140 + floatY + panelY,
        background: 'radial-gradient(ellipse at center, rgba(42,180,174,0.07) 0%, transparent 55%)',
        filter: 'blur(50px)',
        opacity: panelIn,
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Wordmark */}
      <div style={{ position: 'absolute', top: 48, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: panelIn, zIndex: 20 }}>
        <HeirloomWordmark dark size={20} />
      </div>

      {/* THE PANEL */}
      <div style={{
        position: 'absolute',
        width: PANEL_W,
        height: PANEL_H,
        left: PANEL_LEFT + floatX,
        top: PANEL_TOP + floatY + panelY,
        transform: `perspective(1200px) rotateY(${ROT_Y}deg) rotateX(${ROT_X}deg) scale(${panelScale})`,
        transformOrigin: '50% 50%',
        borderRadius: 40,
        overflow: 'hidden',
        opacity: panelIn,
        boxShadow: `
          0 0 0 1px rgba(42,180,174,0.14),
          0 0 0 1px rgba(255,255,255,0.04) inset,
          0 24px 60px rgba(0,0,0,0.65),
          0 60px 120px rgba(0,0,0,0.40),
          0 0 60px rgba(42,180,174,0.07)
        `,
        zIndex: 10,
      }}>
        <MobileShell activeTab={activeTab}>
          <div style={{ position: 'relative', height: '100%', background: C.paperWarm }}>
            <Layer opacity={createOp}><MCreatePhase localFrame={frame - PH.c_in} /></Layer>
            <Layer opacity={reviewOp}><MReviewPhase localFrame={frame - PH.r_in} /></Layer>
            <Layer opacity={protectOp}><MProtectPhase localFrame={frame - PH.p_in} /></Layer>
            <Layer opacity={updateOp}><MUpdatePhase localFrame={frame - PH.u_in} /></Layer>
            <Layer opacity={loopOp}><MCreatePhase localFrame={0} /></Layer>
          </div>
        </MobileShell>
      </div>

      {/* Bottom vignette */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(7,12,11,0.7) 0%, transparent 20%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />
    </AbsoluteFill>
  );
};
