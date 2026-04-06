import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  intensity?: number;
  padding?: number;
  glowColor?: string;
  glowIntensity?: number;
}

export function GlassCard({
  children,
  style,
  borderRadius = 28,
  intensity = 20,
  padding = 0,
  glowColor,
  glowIntensity = 0.25,
}: GlassCardProps) {
  const glowStyle: ViewStyle | undefined = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: glowIntensity,
        shadowRadius: 20,
        elevation: 10,
      }
    : undefined;

  return (
    <View style={[styles.container, { borderRadius }, glowStyle, style]}>
      <BlurView intensity={intensity} tint="dark" style={[styles.blur, { borderRadius, padding }]}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  blur: {
    flex: 1,
  },
});
