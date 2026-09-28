// Heirloom design tokens — exact values from the production codebase
// Source: tailwind.config.ts + design-system/tokens.css

export const C = {
  // Brand teal
  teal:       '#2AB4AE',
  tealDeep:   '#1A7D79',
  tealLight:  '#EDF8F8',
  tealSoft:   '#D6F0EF',
  tealHover:  '#239E99',
  tealGlow:   'rgba(42,180,174,0.3)',

  // Neutrals
  ink:        '#0E1514',
  neutral:    '#8A9B99',
  paper:      '#FFFFFF',
  paperWarm:  '#F7F9F9',
  line:       '#DDE8E7',
  lineSoft:   'rgba(14,21,20,0.06)',

  // Marketing hero (dark)
  heroBg:     '#0A1211',
  heroSub:    '#8AADAA',
  heroLine:   'rgba(255,255,255,0.10)',

  // Asset palette (matches dashboard ASSET_CFG)
  propertyFg: '#2AB4AE', propertyBg: '#EDF8F8',
  vehicleFg:  '#3B82F6', vehicleBg:  '#EFF6FF',
  bankFg:     '#10B981', bankBg:     '#F0FDF4',
  superFg:    '#F59E0B', superBg:    '#FFFBEB',
  sharesFg:   '#8B5CF6', sharesBg:   '#F5F3FF',
  insureFg:   '#EC4899', insureBg:   '#FDF2F8',
  docFg:      '#6366F1', docBg:      '#EEF2FF',
} as const;

export const F = {
  sans:  '"DM Sans", system-ui, -apple-system, sans-serif',
  serif: '"Instrument Serif", Georgia, "Times New Roman", serif',
} as const;

export const R = {
  btn:  8,
  card: 10,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// Shadow tokens
export const S = {
  card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(0,0,0,0.08)',
  btn:    '0 1px 3px rgba(0,0,0,0.08)',
  teal:   '0 4px 14px rgba(42,180,174,0.32)',
  hero:   '0 0 0 1px rgba(42,180,174,0.12), 0 0 24px rgba(42,180,174,0.14), 0 0 70px rgba(26,125,121,0.16)',
  doc:    '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
} as const;

// Apple-style spring easing — use with interpolate extrapolation
export const SPRING_CONFIG: Record<'gentle' | 'snappy' | 'bouncy', { damping: number; mass: number; stiffness: number }> = {
  gentle: { damping: 20, mass: 1, stiffness: 80 },
  snappy: { damping: 15, mass: 1, stiffness: 150 },
  bouncy: { damping: 12, mass: 1, stiffness: 120 },
};

// Total frame budget: 540 frames @ 30fps = 18s
export const FPS = 30;
export const TOTAL_FRAMES = 540;

// Global scene timeline (frame numbers)
export const TIMELINE = {
  // Scene 1 — Hero entry (dark bg, CTA)
  s1Start:    0,
  s1End:      90,    // 3s, cursor animates, clicks at ~f70

  // Scene 2 — Will questions (light platform UI)
  s2Start:    70,    // 20f crossfade overlap
  s2End:      225,   // 5.5s total visible

  // Scene 3 — Document assembles
  s3Start:    205,
  s3End:      315,   // 3.7s total visible

  // Scene 4 — Vault reveals
  s4Start:    295,
  s4End:      405,   // 3.7s total visible

  // Scene 5 — Life event
  s5Start:    385,
  s5End:      495,   // 3.7s total visible

  // Scene 6 — Loop return (dark hero, identical to frame 0)
  s6Start:    475,
  s6End:      540,   // 2.2s to settle back to start
} as const;

// Crossfade duration (frames) applied to each scene enter/exit
export const XFADE = 25;
