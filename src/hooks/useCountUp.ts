import { useEffect } from 'react';
import {
  useSharedValue,
  useDerivedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Animation Spec #7: Stats Roll-Up
 * Animates a number from 0 to targetValue over ~1200ms with easing.
 */
export function useCountUp(targetValue: number, delay = 0) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = 0;
    animatedValue.value = withDelay(
      delay,
      withTiming(targetValue, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [targetValue, delay]);

  const displayValue = useDerivedValue(() => {
    return Math.round(animatedValue.value);
  });

  return { displayValue };
}
