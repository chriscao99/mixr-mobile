import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

const burstSpring: WithSpringConfig = {
  damping: 10,
  stiffness: 400,
  mass: 0.6,
};

/**
 * Animation Spec #2: Heart Burst
 * On press: scale pops 1→1.3→1 with spring, opacity burst.
 * Color transitions from textMuted to red when liked.
 */
export function useHeartBurst() {
  const scale = useSharedValue(1);
  const liked = useSharedValue(0); // 0 = not liked, 1 = liked
  const isLiked = useSharedValue(false);

  const toggleLike = useCallback(() => {
    const nextLiked = liked.value === 0 ? 1 : 0;
    isLiked.value = nextLiked === 1;
    liked.value = withTiming(nextLiked, { duration: 250 });

    // Scale burst
    scale.value = withSequence(
      withSpring(1.3, burstSpring),
      withSpring(1, burstSpring),
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: interpolateColor(
      liked.value,
      [0, 1],
      [colors.textMuted, colors.red],
    ),
  }));

  return { animatedStyle, isLiked, toggleLike };
}
