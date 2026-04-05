import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors, gradients, typography, spacing } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function FollowButton({
  isFollowing,
  onToggle,
  compact = false,
}: FollowButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const height = compact ? 32 : 38;
  const paddingH = compact ? spacing.md : spacing.lg;

  if (isFollowing) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.followingContainer,
          { height, paddingHorizontal: paddingH, borderRadius: height / 2 },
          animatedStyle,
        ]}
      >
        <Check size={compact ? 14 : 16} color={colors.textSecondary} />
        <Text
          style={[
            compact ? styles.compactText : styles.text,
            { color: colors.textSecondary },
          ]}
        >
          Following
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <LinearGradient
        colors={[...gradients.accentPrimary] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.followContainer,
          { height, paddingHorizontal: paddingH, borderRadius: height / 2 },
        ]}
      >
        <Text
          style={[
            compact ? styles.compactText : styles.text,
            { color: colors.white },
          ]}
        >
          Follow
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  followContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  followingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  text: {
    ...typography.label,
  },
  compactText: {
    ...typography.labelSm,
  },
});
