import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../theme';
import { GlassCard } from './GlassCard';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface StatCardProps {
  value: number;
  label: string;
  delay?: number;
}

export function StatCard({ value, label, delay = 0 }: StatCardProps) {
  const animatedValue = useSharedValue(0);

  const displayValue = useDerivedValue(() => {
    return Math.round(animatedValue.value);
  });

  useEffect(() => {
    animatedValue.value = withDelay(
      delay,
      withTiming(value, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, [value, delay]);

  // We use a ReText-style approach with animated props
  const animatedProps = useAnimatedProps(() => {
    const num = Math.round(animatedValue.value);
    const formatted =
      num >= 1000000
        ? (num / 1000000).toFixed(1) + 'M'
        : num >= 1000
        ? (num / 1000).toFixed(1) + 'K'
        : String(num);
    return {
      text: formatted,
      // defaultValue is needed for Android
      defaultValue: formatted,
    } as any;
  });

  return (
    <GlassCard style={styles.card} padding={spacing.lg}>
      <AnimatedText
        style={styles.value}
        animatedProps={animatedProps}
      />
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  label: {
    ...typography.statLabel,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
