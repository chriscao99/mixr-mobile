import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, SlidersHorizontal } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '@/src/theme';
import { ShowFilter, DateRangePreset, CustomDateRange } from '@/src/types';

interface FilterChipsProps {
  filter: ShowFilter;
  onRemoveFilter: (key: keyof ShowFilter) => void;
  onOpenFilterModal: () => void;
  genreNames?: Record<string, string>;
  venueNames?: Record<string, string>;
}

interface ChipData {
  key: keyof ShowFilter;
  label: string;
}

function getDateLabel(dateRange: DateRangePreset | CustomDateRange): string {
  if (typeof dateRange === 'string') {
    const labels: Record<DateRangePreset, string> = {
      today: 'Today',
      this_week: 'This Week',
      this_weekend: 'This Weekend',
      next_week: 'Next Week',
      this_month: 'This Month',
    };
    return labels[dateRange];
  }
  return `${dateRange.startDate} - ${dateRange.endDate}`;
}

function buildChips(
  filter: ShowFilter,
  genreNames?: Record<string, string>,
  venueNames?: Record<string, string>
): ChipData[] {
  const chips: ChipData[] = [];

  if (filter.dateRange) {
    chips.push({ key: 'dateRange', label: getDateLabel(filter.dateRange) });
  }
  if (filter.genreIds && filter.genreIds.length > 0) {
    const names = filter.genreIds
      .map((id) => genreNames?.[id] ?? id)
      .join(', ');
    chips.push({ key: 'genreIds', label: names });
  }
  if (filter.cities && filter.cities.length > 0) {
    chips.push({ key: 'cities', label: filter.cities.join(', ') });
  }
  if (filter.venueIds && filter.venueIds.length > 0) {
    const names = filter.venueIds
      .map((id) => venueNames?.[id] ?? id)
      .join(', ');
    chips.push({ key: 'venueIds', label: names });
  }
  if (filter.priceMax !== undefined) {
    chips.push({
      key: 'priceMax',
      label: filter.priceMax === 0 ? 'Free' : `Under $${filter.priceMax}`,
    });
  }
  if (filter.excludeSoldOut) {
    chips.push({ key: 'excludeSoldOut', label: 'Hide Sold Out' });
  }

  return chips;
}

export const FilterChips = React.memo(function FilterChips({
  filter,
  onRemoveFilter,
  onOpenFilterModal,
  genreNames,
  venueNames,
}: FilterChipsProps) {
  const chips = buildChips(filter, genreNames, venueNames);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* Filters button always visible */}
      <Pressable style={styles.filterButton} onPress={onOpenFilterModal}>
        <SlidersHorizontal size={14} color={colors.accentPrimary} />
        <Text style={styles.filterButtonText}>Filters</Text>
      </Pressable>

      {chips.map((chip) => (
        <View key={chip.key} style={styles.chip}>
          <Text style={styles.chipText} numberOfLines={1}>
            {chip.label}
          </Text>
          <Pressable onPress={() => onRemoveFilter(chip.key)} hitSlop={8}>
            <X size={12} color={colors.textSecondary} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentMuted,
  },
  filterButtonText: {
    ...typography.labelSm,
    color: colors.accentPrimary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    backgroundColor: colors.bgGlass,
    maxWidth: 180,
  },
  chipText: {
    ...typography.labelSm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
});
