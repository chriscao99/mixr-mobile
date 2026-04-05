import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';

const tabSpring: WithSpringConfig = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

/**
 * Animation Spec #8: Tab Bar Morph
 * Active tab indicator (pill) slides between tab positions with spring physics.
 */
export function useTabMorph(
  activeIndex: number,
  tabCount: number,
  tabWidth: number,
) {
  const translateX = useSharedValue(activeIndex * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, tabSpring);
  }, [activeIndex, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  return { indicatorStyle };
}
