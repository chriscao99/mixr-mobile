/**
 * Mixr v5 Design Tokens — Colors
 * Matches the v5 design system from Pencil designs
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#07070A',
  bgCard: '#12121A',
  bgCardAlt: '#16161F',
  bgElevated: '#1E1E2A',
  bgNav: '#0C0C12',
  bgGlass: 'rgba(255, 255, 255, 0.03)',

  // Accents
  accentPrimary: '#8B5CF6',
  accentSecondary: '#6366F1',
  accentTertiary: '#14B8A6',
  accentGlow: 'rgba(139, 92, 246, 0.25)',
  accentMuted: 'rgba(139, 92, 246, 0.1)',

  // Text
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',

  // Borders
  borderGlass: 'rgba(255, 255, 255, 0.07)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',

  // Semantic
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
  white: '#FFFFFF',
  black: '#000000',

  // Glow / effect colors
  glowPurple: 'rgba(139, 92, 246, 0.35)',
  glowTeal: 'rgba(20, 184, 166, 0.25)',
  glowPink: 'rgba(236, 72, 153, 0.20)',
  glowAmber: 'rgba(245, 158, 11, 0.20)',

  // Surface layers
  bgSurface0: '#07070A',
  bgSurface1: '#0D0D14',
  bgSurface2: '#12121A',
  bgSurface3: '#1A1A26',

  // Gradient mesh points
  meshPurple: '#4C1D95',
  meshIndigo: '#312E81',
  meshTeal: '#134E4A',
  meshSlate: '#0F172A',
} as const;

// Gradient presets
export const gradients = {
  accentPrimary: [colors.accentPrimary, colors.accentSecondary] as const,
  accentTeal: [colors.accentPrimary, colors.accentTertiary] as const,
  cardOverlay: ['transparent', 'rgba(7, 7, 10, 0.85)', colors.bgPrimary] as const,
  heroFade: ['transparent', colors.bgPrimary] as const,
  heroMesh: ['#4C1D95', '#312E81', '#134E4A', '#07070A'] as const,
  nearbyGlow: ['rgba(139, 92, 246, 0.4)', 'rgba(20, 184, 166, 0.2)', 'transparent'] as const,
  shimmer: ['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent'] as const,
  cardGlowPurple: ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0)'] as const,
  cardGlowTeal: ['rgba(20, 184, 166, 0.3)', 'rgba(20, 184, 166, 0)'] as const,
  sectionAccent: ['#8B5CF6', '#14B8A6'] as const,
} as const;
