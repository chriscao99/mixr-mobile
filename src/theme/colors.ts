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
} as const;

// Gradient presets
export const gradients = {
  accentPrimary: [colors.accentPrimary, colors.accentSecondary] as const,
  accentTeal: [colors.accentPrimary, colors.accentTertiary] as const,
  cardOverlay: ['transparent', 'rgba(7, 7, 10, 0.85)', colors.bgPrimary] as const,
  heroFade: ['transparent', colors.bgPrimary] as const,
} as const;
