import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { colors, typography, spacing, screen } from '../../src/theme';
import { ShowFilter, ShowSortField } from '../../src/types';
import { genres } from '../../src/data/mockData';
import { getVenues } from '../../src/data/showService';
import { useShowSearch } from '../../src/hooks/useShowSearch';
import { DEFAULT_LOCATION } from '../../src/data/geoUtils';

import { SearchBar } from '../../src/components/shows/SearchBar';
import { FilterChips } from '../../src/components/shows/FilterChips';
import { ViewToggle } from '../../src/components/shows/ViewToggle';
import { ShowListView } from '../../src/components/shows/ShowListView';
import { ShowMapView } from '../../src/components/shows/ShowMapView';

function SortPill({
  label,
  field,
  activeField,
  onPress,
}: {
  label: string;
  field: ShowSortField;
  activeField: ShowSortField;
  onPress: (field: ShowSortField) => void;
}) {
  const isActive = field === activeField;

  return (
    <Pressable
      onPress={() => onPress(field)}
      style={[
        sortStyles.pill,
        isActive && sortStyles.pillActive,
      ]}
    >
      <Text
        style={[
          sortStyles.pillText,
          isActive && sortStyles.pillTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const sortStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  pillActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentPrimary,
  },
  pillText: {
    ...typography.labelSm,
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.accentPrimary,
  },
});

export default function ShowsScreen() {
  const search = useShowSearch(DEFAULT_LOCATION);
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [venueMap, setVenueMap] = useState<Record<string, string>>({});
  const [searchKey, setSearchKey] = useState(0);

  // Load venue names for filter chips
  useEffect(() => {
    (async () => {
      const v = await getVenues();
      const map: Record<string, string> = {};
      v.forEach((venue) => {
        map[venue.id] = venue.name;
      });
      setVenueMap(map);
    })();
  }, []);

  // Genre name map for filter chips
  const genreMap = useMemo(() => {
    const map: Record<string, string> = {};
    genres.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, []);

  const handleRemoveFilter = (key: keyof ShowFilter) => {
    const updated = { ...search.filter };
    delete updated[key];
    search.setFilter(updated);
  };

  const handleSortChange = (field: ShowSortField) => {
    const direction = field === 'popularity' ? 'desc' as const : 'asc' as const;
    search.setSort({ field, direction });
    setSearchKey((k) => k + 1);
  };

  const handleOpenFilterModal = () => {
    router.push('/filter-modal' as any);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shows</Text>
        {search.isLoading && search.results.length > 0 && (
          <ActivityIndicator size="small" color={colors.accentPrimary} />
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={search.query}
          onChangeText={search.setQuery}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chipContainer}>
        <FilterChips
          filter={search.filter}
          onRemoveFilter={handleRemoveFilter}
          onOpenFilterModal={handleOpenFilterModal}
          genreNames={genreMap}
          venueNames={venueMap}
        />
      </View>

      {/* Sort + View toggle row */}
      <View style={styles.controlsRow}>
        <View style={sortStyles.row}>
          <SortPill
            label="Date"
            field="date"
            activeField={search.sort.field}
            onPress={handleSortChange}
          />
          <SortPill
            label="Distance"
            field="distance"
            activeField={search.sort.field}
            onPress={handleSortChange}
          />
          <SortPill
            label="Popular"
            field="popularity"
            activeField={search.sort.field}
            onPress={handleSortChange}
          />
        </View>
        <ViewToggle activeView={activeView} onToggle={setActiveView} />
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {search.total} {search.total === 1 ? 'show' : 'shows'}
        </Text>
      </View>

      {/* Content area */}
      <View style={styles.contentArea}>
        {activeView === 'list' ? (
          <View style={styles.viewContainer}>
            <ShowListView
              results={search.results}
              total={search.total}
              hasMore={search.hasMore}
              isLoading={search.isLoading}
              onLoadMore={search.loadMore}
              onRefresh={search.refresh}
              listKey={searchKey}
            />
          </View>
        ) : (
          <View style={styles.viewContainer}>
            <ShowMapView
              results={search.results}
              userLocation={DEFAULT_LOCATION}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: screen.statusBarHeight,
    paddingHorizontal: screen.paddingH,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: screen.paddingH,
  },
  chipContainer: {
    paddingHorizontal: screen.paddingH,
    marginTop: spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screen.paddingH,
    marginTop: spacing.md,
  },
  resultsRow: {
    paddingHorizontal: screen.paddingH,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultsCount: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: screen.paddingH,
  },
  viewContainer: {
    flex: 1,
  },
});
