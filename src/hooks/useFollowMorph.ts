import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

const morphSpring: WithSpringConfig = {
  damping: 15,
  stiffness: 180,
  mass: 0.8,
};

const FOLLOW_WIDTH = 100;
const FOLLOWING_WIDTH = 120;

/**
 * Animation Spec #5: Follow Button Morph
 * Width morphs between "Follow" (narrow) and "Following" (wider).
 * Background color transitions; border appears/disappears.
 */
export function useFollowMorph() {
  const progress = useSharedValue(0); // 0 = not following, 1 = following
  const isFollowing = useSharedValue(false);

  const toggleFollow = useCallback(() => {
    const next = progress.value === 0 ? 1 : 0;
    isFollowing.value = next === 1;
    progress.value = withSpring(next, morphSpring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const morphStyle = useAnimatedStyle(() => {
    return {
      width: FOLLOW_WIDTH + progress.value * (FOLLOWING_WIDTH - FOLLOW_WIDTH),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.accentPrimary, 'transparent'],
      ),
      borderWidth: withTiming(progress.value > 0.5 ? 1.5 : 0, { duration: 200 }),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', colors.accentPrimary],
      ),
    };
  });

  return { morphStyle, isFollowing, toggleFollow };
}
