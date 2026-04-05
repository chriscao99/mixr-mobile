/**
 * Mixr v5 Spacing & Radius System
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,
} as const;

// Screen dimensions
export const screen = {
  paddingH: 20,
  statusBarHeight: 62,
  tabBarHeight: 95, // 62px pill + padding
  gap: 28,
} as const;
