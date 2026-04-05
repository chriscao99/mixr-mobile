import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { X, Save } from 'lucide-react-native';

import { colors, typography, spacing, radius, screen } from '../src/theme';
import {
  ShowFilter,
  DateRangePreset,
  Genre,
  Venue,
  City,
  SavedFilter,
} from '../src/types';
import { genres as allGenres } from '../src/data/mockData';
import { getVenues, getCities } from '../src/data/showService';
import { getSavedFilters, saveFilter, deleteFilter } from '../src/data/filterStorage';
import { GlassCard } from '../src/components/ui/GlassCard';
import { GenrePill } from '../src/components/ui/GenrePill';
import { GradientButton } from '../src/components/ui/GradientButton';
import { FilterPresetPicker } from '../src/components/shows/FilterPresetPicker';

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_weekend', label: 'This Weekend' },
  { value: 'next_week', label: 'Next Week' },
  { value: 'this_month', label: 'This Month' },
];

const PRICE_PRESETS = [
  { value: 0, label: 'Free' },
  { value: 25, label: 'Under $25' },
  { value: 50, label: 'Under $50' },
  { value: 100, label: 'Under $100' },
  { value: undefined as number | undefined, label: 'Any' },
];

export default function FilterModalScreen() {
  // Local filter state (applied on submit)
  const [dateRange, setDateRange] = useState<DateRangePreset | undefined>(undefined);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [excludeSoldOut, setExcludeSoldOut] = useState(false);

  // Data for pickers
  const [venues, setVenues] = useState<Venue[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  useEffect(() => {
    (async () => {
      const [v, c, sf] = await Promise.all([
        getVenues(),
        getCities(),
        getSavedFilters(),
      ]);
      setVenues(v);
      setCities(c);
      setSavedFilters(sf);
    })();
  }, []);

  const buildFilter = (): ShowFilter => {
    const filter: ShowFilter = {};
    if (dateRange) filter.dateRange = dateRange;
    if (selectedGenreIds.length > 0) filter.genreIds = selectedGenreIds;
    if (selectedCities.length > 0) filter.cities = selectedCities;
    if (selectedVenueIds.length > 0) filter.venueIds = selectedVenueIds;
    if (priceMax !== undefined) filter.priceMax = priceMax;
    if (excludeSoldOut) filter.excludeSoldOut = true;
    return filter;
  };

  const handleApply = () => {
    // The filter will be read from route params or a global store.
    // For now we navigate back; the shows screen will re-render.
    // In a full implementation, this would use context.
    router.back();
  };

  const handleClear = () => {
    setDateRange(undefined);
    setSelectedGenreIds([]);
    setSelectedCities([]);
    setSelectedVenueIds([]);
    setPriceMax(undefined);
    setExcludeSoldOut(false);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName]
    );
  };

  const toggleVenue = (venueId: string) => {
    setSelectedVenueIds((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  const applyPreset = (filter: ShowFilter) => {
    if (typeof filter.dateRange === 'string') {
      setDateRange(filter.dateRange as DateRangePreset);
    } else {
      setDateRange(undefined);
    }
    setSelectedGenreIds(filter.genreIds ?? []);
    setSelectedCities(filter.cities ?? []);
    setSelectedVenueIds(filter.venueIds ?? []);
    setPriceMax(filter.priceMax);
    setExcludeSoldOut(filter.excludeSoldOut ?? false);
  };

  const handleSaveFilter = async () => {
    if (!saveFilterName.trim()) return;
    try {
      const newFilter = await saveFilter(saveFilterName.trim(), buildFilter());
      setSavedFilters((prev) => [...prev, newFilter]);
      setShowSaveInput(false);
      setSaveFilterName('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await deleteFilter(id);
      setSavedFilters((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Filter venues by selected cities
  const filteredVenues =
    selectedCities.length > 0
      ? venues.filter((v) => selectedCities.includes(v.city))
      : venues;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable onPress={handleClear} hitSlop={12}>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved presets */}
        {savedFilters.length > 0 && (
          <View style={styles.section}>
            <FilterPresetPicker
              presets={savedFilters}
              onApply={applyPreset}
              onDelete={handleDeletePreset}
            />
          </View>
        )}

        {/* Date range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.pillRow}>
            {DATE_PRESETS.map((preset) => (
              <Pressable
                key={preset.value}
                style={[
                  styles.pill,
                  dateRange === preset.value && styles.pillActive,
                ]}
                onPress={() =>
                  setDateRange((prev) =>
                    prev === preset.value ? undefined : preset.value
                  )
                }
              >
                <Text
                  style={[
                    styles.pillText,
                    dateRange === preset.value && styles.pillTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.pillRow}>
            {allGenres.map((genre) => (
              <GenrePill
                key={genre.id}
                name={genre.name}
                color={genre.color}
                isSelected={selectedGenreIds.includes(genre.id)}
                onPress={() => toggleGenre(genre.id)}
              />
            ))}
          </View>
        </View>

        {/* Cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City</Text>
          <View style={styles.pillRow}>
            {cities.map((city) => (
              <Pressable
                key={`${city.name}-${city.state}`}
                style={[
                  styles.pill,
                  selectedCities.includes(city.name) && styles.pillActive,
                ]}
                onPress={() => toggleCity(city.name)}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedCities.includes(city.name) && styles.pillTextActive,
                  ]}
                >
                  {city.name}, {city.state} ({city.showCount})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Venues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <View style={styles.pillRow}>
            {filteredVenues.map((venue) => (
              <Pressable
                key={venue.id}
                style={[
                  styles.pill,
                  selectedVenueIds.includes(venue.id) && styles.pillActive,
                ]}
                onPress={() => toggleVenue(venue.id)}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedVenueIds.includes(venue.id) &&
                      styles.pillTextActive,
                  ]}
                >
                  {venue.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.pillRow}>
            {PRICE_PRESETS.map((preset) => (
              <Pressable
                key={preset.label}
                style={[
                  styles.pill,
                  priceMax === preset.value && styles.pillActive,
                ]}
                onPress={() => setPriceMax(preset.value)}
              >
                <Text
                  style={[
                    styles.pillText,
                    priceMax === preset.value && styles.pillTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sold out toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Hide sold out shows</Text>
              <Switch
                value={excludeSoldOut}
                onValueChange={setExcludeSoldOut}
                trackColor={{
                  false: colors.bgElevated,
                  true: colors.accentPrimary,
                }}
                thumbColor={colors.white}
              />
            </View>
          </GlassCard>
        </View>

        {/* Save preset input */}
        {showSaveInput && (
          <View style={styles.section}>
            <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
              <Text style={styles.saveLabel}>Preset Name</Text>
              <View style={styles.saveInputRow}>
                <TextInput
                  style={styles.saveInput}
                  value={saveFilterName}
                  onChangeText={setSaveFilterName}
                  placeholder="My filter preset"
                  placeholderTextColor={colors.textMuted}
                  maxLength={50}
                  autoFocus
                />
                <Pressable onPress={handleSaveFilter} style={styles.saveButton}>
                  <Save size={18} color={colors.accentPrimary} />
                </Pressable>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Spacer for footer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.savePresetButton}
          onPress={() => setShowSaveInput((prev) => !prev)}
        >
          <Save size={16} color={colors.accentPrimary} />
          <Text style={styles.savePresetText}>Save Preset</Text>
        </Pressable>
        <View style={styles.applyButtonWrapper}>
          <GradientButton title="Apply Filters" onPress={handleApply} />
        </View>
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
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  clearText: {
    ...typography.label,
    color: colors.accentPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screen.paddingH,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.accentPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  saveLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  saveInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  saveInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
    paddingVertical: spacing.sm,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: screen.paddingH,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    backgroundColor: colors.bgNav,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
  },
  savePresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  savePresetText: {
    ...typography.labelSm,
    color: colors.accentPrimary,
  },
  applyButtonWrapper: {
    flex: 1,
  },
});
