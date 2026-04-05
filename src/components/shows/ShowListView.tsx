import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SearchX } from 'lucide-react-native';
import { colors, typography, spacing, screen } from '@/src/theme';
import { ShowSearchResult } from '@/src/types';
import { ShowCard } from './ShowCard';

interface ShowListViewProps {
  results: ShowSearchResult[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  listKey?: number;
}

const ITEM_HEIGHT = 340; // Approximate card height for getItemLayout

export const ShowListView = React.memo(function ShowListView({
  results,
  total,
  hasMore,
  isLoading,
  onLoadMore,
  onRefresh,
  listKey,
}: ShowListViewProps) {
  const renderItem = useCallback(
    ({ item, index }: { item: ShowSearchResult; index: number }) => (
      <View style={styles.cardWrapper}>
        <ShowCard result={item} index={index} />
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    if (isLoading && results.length > 0) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      );
    }
    return null;
  }, [hasMore, isLoading, results.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={styles.emptyText}>Finding shows...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <SearchX size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No shows found</Text>
        <Text style={styles.emptyText}>
          Try adjusting your filters or search query
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <FlatList
      key={listKey}
      data={results}
      renderItem={renderItem}
      keyExtractor={(item) => item.show.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      windowSize={5}
      maxToRenderPerBatch={10}
      removeClippedSubviews={false}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: screen.tabBarHeight + spacing.lg,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
