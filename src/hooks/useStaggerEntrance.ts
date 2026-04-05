import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

const springConfig: WithSpringConfig = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

/**
 * Animation Spec #1: Stagger Entrance
 * Feed cards cascade in with spring physics.
 * 80ms delay between each card.
 */
export function useStaggerEntrance(index: number, delay = 80) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const itemDelay = index * delay;
    translateY.value = withDelay(itemDelay, withSpring(0, springConfig));
    opacity.value = withDelay(itemDelay, withSpring(1, { damping: 20, stiffness: 150 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}
