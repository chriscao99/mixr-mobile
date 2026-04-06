import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { colors, gradients, typography, spacing } from '@/src/theme';

interface LocationPermissionPromptProps {
  variant: 'inline' | 'banner';
  onRequestPermission: () => void;
  onDismiss?: () => void;
}

export function LocationPermissionPrompt({
  variant,
  onRequestPermission,
  onDismiss,
}: LocationPermissionPromptProps) {
  if (variant === 'banner') {
    return (
      <GlassCard borderRadius={12}>
        <View style={styles.banner}>
          <MapPin size={16} color={colors.accentTertiary} />
          <Text style={styles.bannerText} numberOfLines={1}>
            Enable location for nearby shows
          </Text>
          <Pressable onPress={onRequestPermission} hitSlop={8}>
            <Text style={styles.enableText}>Enable</Text>
          </Pressable>
          {onDismiss && (
            <Pressable onPress={onDismiss} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </GlassCard>
    );
  }

  // Inline variant
  return (
    <GlassCard borderRadius={20}>
      <View style={styles.inline}>
        <View style={styles.iconCircle}>
          <MapPin size={24} color={colors.accentTertiary} />
        </View>
        <Text style={styles.inlineTitle}>Discover shows nearby</Text>
        <Text style={styles.inlineSubtitle}>
          Enable location to find shows happening around you
        </Text>
        <Pressable onPress={onRequestPermission} style={styles.enableButton}>
          <LinearGradient
            colors={[...gradients.accentTeal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enableButtonGradient}
          >
            <Text style={styles.enableButtonText}>Enable Location</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  // Banner variant
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bannerText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  enableText: {
    ...typography.label,
    color: colors.accentTertiary,
  },

  // Inline variant
  inline: {
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  inlineTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  inlineSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  enableButton: {
    marginTop: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  enableButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  enableButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
});
