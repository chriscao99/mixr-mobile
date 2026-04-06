import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const effects = {
  glowPurple: {
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  glowTeal: {
    shadowColor: colors.accentTertiary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,

  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  cardPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
} as const;
