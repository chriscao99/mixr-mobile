import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { Bookmark, Trash2 } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '@/src/theme';
import { SavedFilter, ShowFilter } from '@/src/types';

interface FilterPresetPickerProps {
  presets: SavedFilter[];
  onApply: (filter: ShowFilter) => void;
  onDelete?: (id: string) => void;
}

export const FilterPresetPicker = React.memo(function FilterPresetPicker({
  presets,
  onApply,
  onDelete,
}: FilterPresetPickerProps) {
  if (presets.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Bookmark size={14} color={colors.textMuted} />
        <Text style={styles.headerLabel}>Saved Filters</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {presets.map((preset) => (
          <Pressable
            key={preset.id}
            style={styles.preset}
            onPress={() => onApply(preset.filter)}
          >
            <Text style={styles.presetText}>{preset.name}</Text>
            {!preset.isDefault && onDelete && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  onDelete(preset.id);
                }}
                hitSlop={8}
              >
                <Trash2 size={12} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerLabel: {
    ...typography.labelSm,
    color: colors.textMuted,
  },
  scrollContent: {
    gap: spacing.sm,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  presetText: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
});
