import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { LocationPermissionPrompt } from './LocationPermissionPrompt';
import { ShimmerPlaceholder } from '@/src/components/ui/ShimmerPlaceholder';
import { LocationPermissionStatus } from '@/src/types';
import { colors, typography, spacing } from '@/src/theme';

interface LocationHeaderProps {
  cityLabel: string | null;
  permission: LocationPermissionStatus;
  onRequestPermission: () => void;
  isLoading: boolean;
}

export function LocationHeader({
  cityLabel,
  permission,
  onRequestPermission,
  isLoading,
}: LocationHeaderProps) {
  if (permission === 'undetermined') {
    return (
      <View style={styles.container}>
        <LocationPermissionPrompt
          variant="banner"
          onRequestPermission={onRequestPermission}
        />
      </View>
    );
  }

  if (permission === 'granted' && isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <MapPin size={14} color={colors.accentTertiary} />
          <ShimmerPlaceholder width={120} height={14} borderRadius={4} />
        </View>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={styles.deniedText}>Location unavailable</Text>
          <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
            <Text style={styles.settingsLink}>Enable in Settings</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Granted with city
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MapPin size={14} color={colors.accentTertiary} />
        <Text style={styles.cityText}>{cityLabel ?? 'Nearby'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  deniedText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  settingsLink: {
    ...typography.labelSm,
    color: colors.accentTertiary,
    marginLeft: spacing.xs,
  },
});
