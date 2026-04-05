import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  WithSpringConfig,
} from 'react-native-reanimated';

const pillSpring: WithSpringConfig = {
  damping: 14,
  stiffness: 250,
  mass: 0.6,
};

/**
 * Animation Spec #4: Genre Pill Morph
 * On selection: pill scales up (1→1.08) and fills with genre color.
 * On deselection: scales back, background fades.
 */
export function useGenrePillMorph(isSelected: boolean, color: string) {
  const progress = useSharedValue(isSelected ? 1 : 0);
  const scale = useSharedValue(isSelected ? 1.08 : 1);

  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, pillSpring);
    scale.value = withSpring(isSelected ? 1.08 : 1, pillSpring);
  }, [isSelected]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', color],
    ),
  }));

  return { pillStyle };
}
