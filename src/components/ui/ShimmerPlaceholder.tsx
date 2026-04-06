import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, gradients } from '@/src/theme';

interface ShimmerPlaceholderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ShimmerPlaceholder = React.memo(function ShimmerPlaceholder({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerPlaceholderProps) {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.bgSurface1,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[...gradients.shimmer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { width: 200 }, shimmerStyle]}
      />
    </View>
  );
});
