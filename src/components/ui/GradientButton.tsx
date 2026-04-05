import React from 'react';
import { StyleSheet, Pressable, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, gradients, typography } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  height?: number;
  gradientColors?: readonly [string, string, ...string[]];
}

export function GradientButton({
  title,
  onPress,
  icon,
  style,
  height = 52,
  gradientColors = gradients.accentPrimary,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { height, borderRadius: height / 2 }]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
      {/* Glow shadow */}
      <View style={[styles.glow, { height, borderRadius: height / 2 }]} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  icon: {
    marginRight: 2,
  },
  glow: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    backgroundColor: colors.accentGlow,
    zIndex: -1,
    opacity: 0.5,
  },
});
