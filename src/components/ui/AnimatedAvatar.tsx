import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, gradients, typography } from '../../theme';

interface AnimatedAvatarProps {
  imageUrl?: string;
  initials?: string;
  size?: number;
  showRing?: boolean;
}

export function AnimatedAvatar({
  imageUrl,
  initials,
  size = 48,
  showRing = false,
}: AnimatedAvatarProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (showRing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [showRing]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ringSize = size + 6;
  const innerSize = size;

  return (
    <View style={[styles.wrapper, { width: ringSize, height: ringSize }]}>
      {showRing && (
        <Animated.View
          style={[
            styles.ringContainer,
            { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
            ringStyle,
          ]}
        >
          <LinearGradient
            colors={[...gradients.accentPrimary, colors.accentTertiary] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ring,
              { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
            ]}
          />
        </Animated.View>
      )}
      <View
        style={[
          styles.avatarContainer,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          />
        ) : (
          <LinearGradient
            colors={[...gradients.accentPrimary] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.initialsContainer,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.initials,
                { fontSize: innerSize * 0.36 },
              ]}
            >
              {initials?.toUpperCase() ?? '?'}
            </Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  ring: {
    flex: 1,
  },
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Inter_700Bold',
    color: colors.white,
  },
});
