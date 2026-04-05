import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing, radius } from '@/src/theme';

interface ShowDateBadgeProps {
  date: string; // ISO date string (YYYY-MM-DD)
  compact?: boolean;
}

function formatDateBadge(isoDate: string): { day: string; month: string; weekday: string } {
  const d = new Date(isoDate + 'T12:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate().toString();
  return { day, month, weekday };
}

export const ShowDateBadge = React.memo(function ShowDateBadge({
  date,
  compact = false,
}: ShowDateBadgeProps) {
  const { day, month, weekday } = formatDateBadge(date);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          {weekday} {month} {day}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.weekday}>{weekday}</Text>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.month}>{month}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 60,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    gap: 1,
  },
  weekday: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  day: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  month: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  compactContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
  },
  compactText: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
});
