import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ViewStyle } from 'react-native';

interface UsePressAnimationOptions {
  scaleDown?: number;
  haptic?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

const HAPTIC_MAP = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
} as const;

export function usePressAnimation(options?: UsePressAnimationOptions) {
  const scaleDown = options?.scaleDown ?? 0.97;
  const haptic = options?.haptic ?? true;
  const hapticStyle = options?.hapticStyle ?? 'light';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
    if (haptic) {
      Haptics.impactAsync(HAPTIC_MAP[hapticStyle]);
    }
  }, [scaleDown, haptic, hapticStyle]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  return {
    animatedStyle,
    handlers: { onPressIn, onPressOut },
  };
}
