import { useEffect, useRef } from 'react';
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

const MAX_STAGGER_INDEX = 8;

/**
 * Animation Spec #1: Stagger Entrance
 * Feed cards cascade in with spring physics.
 * 80ms delay between each card.
 */
export function useStaggerEntrance(index: number, delay = 80, once = true) {
  const hasPlayed = useRef(false);
  const translateY = useSharedValue(once && hasPlayed.current ? 0 : 40);
  const opacity = useSharedValue(once && hasPlayed.current ? 1 : 0);

  useEffect(() => {
    if (once && hasPlayed.current) return;
    hasPlayed.current = true;

    // Cap stagger delay — items beyond MAX_STAGGER_INDEX appear immediately
    const cappedIndex = Math.min(index, MAX_STAGGER_INDEX);
    const itemDelay = cappedIndex * delay;
    translateY.value = withDelay(itemDelay, withSpring(0, springConfig));
    opacity.value = withDelay(itemDelay, withSpring(1, { damping: 20, stiffness: 150 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}
