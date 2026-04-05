import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GenrePillProps {
  name: string;
  color: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export function GenrePill({
  name,
  color,
  isSelected = false,
  onPress,
}: GenrePillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(isSelected ? 1.05 : 1, { damping: 12, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        isSelected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.bgGlass, borderColor: colors.borderGlass },
        isSelected && { transform: [{ scale: 1.05 }] },
        animatedStyle,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: isSelected ? colors.white : color }]} />
      <Text
        style={[
          styles.text,
          { color: isSelected ? colors.white : colors.textSecondary },
        ]}
      >
        {name}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    ...typography.labelSm,
  },
});
