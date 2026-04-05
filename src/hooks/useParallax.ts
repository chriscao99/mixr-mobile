import {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';

/**
 * Animation Spec #6: Parallax Hero
 * Image translates at 0.5x scroll speed, content at 1x.
 * Header opacity fades as user scrolls down.
 */
export function useParallax(scrollY: SharedValue<number>) {
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-200, 0, 300],
          [-100, 0, 150], // 0.5x rate
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-200, 0, 300],
          [-200, 0, 300], // 1x rate
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const headerOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, 150, 250],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return { imageStyle, contentStyle, headerOpacity };
}
