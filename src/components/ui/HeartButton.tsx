import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { colors } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HeartButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: number;
}

export function HeartButton({ isLiked, onToggle, size = 24 }: HeartButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 8, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.container, animatedStyle]}
      hitSlop={12}
    >
      <Heart
        size={size}
        color={isLiked ? '#EF4444' : colors.textMuted}
        fill={isLiked ? '#EF4444' : 'transparent'}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
