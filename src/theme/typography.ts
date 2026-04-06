/**
 * Mixr v5 Typography System
 * Inter for everything — clean, modern, iOS-native feel
 */

import { TextStyle } from 'react-native';

export const typography = {
  // Headings
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  } as TextStyle,
  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
  } as TextStyle,
  h4: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  } as TextStyle,

  // Body
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,

  // Labels
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,
  labelSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  // UI
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
  } as TextStyle,
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // Data display
  stat: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
  } as TextStyle,
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
  } as TextStyle,

  // Display
  display: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  } as TextStyle,

  // Overline
  overline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  } as TextStyle,
} as const;
