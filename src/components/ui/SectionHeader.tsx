import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { colors, gradients, typography, spacing } from '@/src/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  accentLine?: boolean;
}

export const SectionHeader = React.memo(function SectionHeader({
  title,
  subtitle,
  action,
  accentLine = true,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      {accentLine && (
        <LinearGradient
          colors={gradients.sectionAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
      )}
      <View style={styles.row}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {action && (
          <Pressable onPress={action.onPress} style={styles.action} hitSlop={8}>
            <Text style={styles.actionText}>{action.label}</Text>
            <ChevronRight size={14} color={colors.accentPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  accentLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    ...typography.labelSm,
    color: colors.accentPrimary,
  },
});
