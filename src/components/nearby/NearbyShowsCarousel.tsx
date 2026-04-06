import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { RankedNearbyShow } from '@/src/types';
import { NearbyShowCard } from './NearbyShowCard';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { ShimmerPlaceholder } from '@/src/components/ui/ShimmerPlaceholder';
import { colors, typography, spacing, screen } from '@/src/theme';
import { Search } from 'lucide-react-native';

const CARD_WIDTH = 160;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

const CardSeparator = () => <View style={{ width: CARD_GAP }} />;

const getItemLayout = (_: any, index: number) => ({
  length: CARD_WIDTH,
  offset: SNAP_INTERVAL * index,
  index,
});

interface NearbyShowsCarouselProps {
  shows: RankedNearbyShow[];
  isLoading: boolean;
  onSeeAll: () => void;
}

const keyExtractor = (item: RankedNearbyShow) => item.result.show.id;

const renderItem = ({ item, index }: { item: RankedNearbyShow; index: number }) => (
  <NearbyShowCard show={item} index={index} />
);

export function NearbyShowsCarousel({
  shows,
  isLoading,
  onSeeAll,
}: NearbyShowsCarouselProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SectionHeader title="NEAR YOU" />
        </View>
        <View style={styles.shimmerRow}>
          {[0, 1, 2].map((i) => (
            <ShimmerPlaceholder key={i} width={CARD_WIDTH} height={220} borderRadius={16} />
          ))}
        </View>
      </View>
    );
  }

  if (shows.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SectionHeader title="NEAR YOU" />
        </View>
        <View style={styles.emptyContainer}>
          <Search size={24} color={colors.textMuted} />
          <Text style={styles.emptyText}>No shows nearby this week</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader
          title="NEAR YOU"
          action={{ label: 'See All', onPress: onSeeAll }}
        />
      </View>
      <FlatList
        data={shows}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={CardSeparator}
        getItemLayout={getItemLayout}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: screen.paddingH,
  },
  listContent: {
    paddingHorizontal: screen.paddingH,
  },
  shimmerRow: {
    flexDirection: 'row',
    paddingHorizontal: screen.paddingH,
    gap: CARD_GAP,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
});
