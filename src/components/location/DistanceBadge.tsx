import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { DistanceInfo } from '@/src/types';
import { colors, typography } from '@/src/theme';

interface DistanceBadgeProps {
  distanceInfo: DistanceInfo;
  size?: 'sm' | 'md';
}

export const DistanceBadge = React.memo(function DistanceBadge({
  distanceInfo,
  size = 'sm',
}: DistanceBadgeProps) {
  const iconSize = size === 'sm' ? 10 : 14;
  const textStyle = size === 'sm' ? styles.textSm : styles.textMd;

  return (
    <View style={styles.container}>
      <MapPin size={iconSize} color={colors.accentTertiary} />
      <Text style={textStyle}>{distanceInfo.displayText}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  textSm: {
    ...typography.caption,
    color: colors.accentTertiary,
  },
  textMd: {
    ...typography.labelSm,
    color: colors.accentTertiary,
  },
});
