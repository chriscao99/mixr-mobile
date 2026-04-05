import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';

import { colors, typography, spacing, radius, screen } from '../../src/theme';
import { DJ } from '../../src/types';
import { djs, genres } from '../../src/data/mockData';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GenrePill } from '../../src/components/ui/GenrePill';
import { FollowButton } from '../../src/components/ui/FollowButton';
import { useStaggerEntrance } from '../../src/hooks/useStaggerEntrance';

function DJCard({
  dj,
  index,
  isFollowing,
  onToggleFollow,
}: {
  dj: DJ;
  index: number;
  isFollowing: boolean;
  onToggleFollow: () => void;
}) {
  const animatedStyle = useStaggerEntrance(index);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={() => router.push(`/dj/${dj.id}` as any)}>
        <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
          <View style={styles.cardRow}>
            <Image source={{ uri: dj.imageUrl }} style={styles.avatar} />
            <View style={styles.cardCenter}>
              <Text style={styles.djName} numberOfLines={1}>
                {dj.name}
              </Text>
              <Text style={styles.djLocation} numberOfLines={1}>
                {dj.location}
              </Text>
              <View style={styles.genreTagsRow}>
                {dj.genres.slice(0, 2).map((genre) => (
                  <View key={genre} style={styles.genreTag}>
                    <Text style={styles.genreTagText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
            <FollowButton
              isFollowing={isFollowing}
              onToggle={onToggleFollow}
              compact
            />
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [followState, setFollowState] = useState<Record<string, boolean>>(() =>
    djs.reduce(
      (acc, dj) => ({ ...acc, [dj.id]: dj.isFollowing }),
      {} as Record<string, boolean>,
    ),
  );

  const filteredDJs = useMemo(() => {
    if (!selectedGenre) return djs;
    return djs.filter((dj) => dj.genres.includes(selectedGenre));
  }, [selectedGenre]);

  const toggleFollow = (djId: string) => {
    setFollowState((prev) => ({ ...prev, [djId]: !prev[djId] }));
  };

  const handleGenrePress = (genreName: string) => {
    setSelectedGenre((prev) => (prev === genreName ? null : genreName));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your next favorite DJ</Text>
      </View>

      {/* Search Bar */}
      <GlassCard borderRadius={radius.full} padding={0}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search DJs, genres...</Text>
        </View>
      </GlassCard>

      {/* Genre Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genreScroll}
        contentContainerStyle={styles.genreScrollContent}
      >
        {genres.map((genre) => (
          <GenrePill
            key={genre.id}
            name={genre.name}
            color={genre.color}
            isSelected={selectedGenre === genre.name}
            onPress={() => handleGenrePress(genre.name)}
          />
        ))}
      </ScrollView>

      {/* DJ List */}
      <Text style={styles.sectionTitle}>Trending DJs</Text>
      <View style={styles.djList}>
        {filteredDJs.map((dj, index) => (
          <DJCard
            key={dj.id}
            dj={dj}
            index={index}
            isFollowing={!!followState[dj.id]}
            onToggleFollow={() => toggleFollow(dj.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: screen.paddingH,
    paddingBottom: screen.tabBarHeight,
  },
  header: {
    paddingTop: screen.statusBarHeight,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  genreScroll: {
    marginTop: spacing.xl,
  },
  genreScrollContent: {
    gap: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  djList: {
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgCard,
  },
  cardCenter: {
    flex: 1,
    marginLeft: 14,
  },
  djName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  djLocation: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  genreTagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  genreTag: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  genreTagText: {
    ...typography.caption,
    color: colors.accentPrimary,
  },
});
