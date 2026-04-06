import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { colors, typography, spacing, radius, screen } from '../../src/theme';
import { DJ } from '../../src/types';
import { djs, genres } from '../../src/data/mockData';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GenrePill } from '../../src/components/ui/GenrePill';
import { FollowButton } from '../../src/components/ui/FollowButton';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { SearchBar } from '../../src/components/shows/SearchBar';
import { useStaggerEntrance } from '../../src/hooks/useStaggerEntrance';

function formatFollowers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K followers`;
  }
  return `${count} followers`;
}

function getGenreColor(genreName: string): string {
  const genre = genres.find((g) => g.name === genreName);
  return genre?.color ?? colors.accentPrimary;
}

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
  const primaryGenreColor = dj.genres.length > 0 ? getGenreColor(dj.genres[0]) : colors.accentPrimary;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={() => router.push(`/dj/${dj.id}` as any)}>
        <GlassCard borderRadius={radius.lg} padding={0}>
          <View style={styles.cardInner}>
            {/* Left accent border */}
            <View style={[styles.leftAccent, { backgroundColor: primaryGenreColor }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardRow}>
                <Image source={{ uri: dj.imageUrl }} style={styles.avatar} />
                <View style={styles.cardCenter}>
                  <Text style={styles.djName} numberOfLines={1}>
                    {dj.name}
                  </Text>
                  <Text style={styles.djLocation} numberOfLines={1}>
                    {dj.location}
                  </Text>
                  <Text style={styles.followerCount}>
                    {formatFollowers(dj.followers)}
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
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [followState, setFollowState] = useState<Record<string, boolean>>(() =>
    djs.reduce(
      (acc, dj) => ({ ...acc, [dj.id]: dj.isFollowing }),
      {} as Record<string, boolean>,
    ),
  );

  const filteredDJs = useMemo(() => {
    let result = djs;
    if (selectedGenre) {
      result = result.filter((dj) => dj.genres.includes(selectedGenre));
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((dj) => dj.name.toLowerCase().includes(q));
    }
    return result;
  }, [selectedGenre, searchQuery]);

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
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search DJs, genres..."
        />
      </View>

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
      <View style={styles.sectionHeaderContainer}>
        <SectionHeader title="Trending DJs" accentLine />
      </View>
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
  searchBarContainer: {
    marginTop: spacing.lg,
  },
  genreScroll: {
    marginTop: spacing.xl,
  },
  genreScrollContent: {
    gap: 10,
  },
  sectionHeaderContainer: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  djList: {
    gap: spacing.md,
  },
  cardInner: {
    flexDirection: 'row',
  },
  leftAccent: {
    width: 3,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
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
  followerCount: {
    ...typography.caption,
    color: colors.textMuted,
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
