import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { List, Map } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '@/src/theme';

interface ViewToggleProps {
  activeView: 'list' | 'map';
  onToggle: (view: 'list' | 'map') => void;
}

export const ViewToggle = React.memo(function ViewToggle({
  activeView,
  onToggle,
}: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, activeView === 'list' && styles.activeButton]}
        onPress={() => onToggle('list')}
      >
        <List
          size={16}
          color={activeView === 'list' ? colors.accentPrimary : colors.textMuted}
        />
        <Text
          style={[
            styles.label,
            activeView === 'list' && styles.activeLabel,
          ]}
        >
          List
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, activeView === 'map' && styles.activeButton]}
        onPress={() => onToggle('map')}
      >
        <Map
          size={16}
          color={activeView === 'map' ? colors.accentPrimary : colors.textMuted}
        />
        <Text
          style={[
            styles.label,
            activeView === 'map' && styles.activeLabel,
          ]}
        >
          Map
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgGlass,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  activeButton: {
    backgroundColor: colors.accentMuted,
  },
  label: {
    ...typography.labelSm,
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.accentPrimary,
  },
});
