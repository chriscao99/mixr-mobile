import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { ChevronLeft, Music, MapPin, Users } from 'lucide-react-native';
import { colors, gradients, typography, spacing, effects } from '../../src/theme';
import { djs, genres as genreData } from '../../src/data/mockData';
import { getUpcomingShowsForDj } from '../../src/data/showService';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { FollowButton } from '../../src/components/ui/FollowButton';
import { StatCard } from '../../src/components/ui/StatCard';
import { GenrePill } from '../../src/components/ui/GenrePill';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { ShowCard } from '../../src/components/shows/ShowCard';
import { ShowSearchResult } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 360;

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
}

export default function DJProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dj = djs.find((d) => d.id === id);
  const [isFollowing, setIsFollowing] = useState(dj?.isFollowing ?? false);
  const [upcomingShows, setUpcomingShows] = useState<ShowSearchResult[]>([]);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (id) {
      getUpcomingShowsForDj(id).then(setUpcomingShows);
    }
  }, [id]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }],
  }));

  if (!dj) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>DJ not found</Text>
      </View>
    );
  }

  const getGenreColor = (genreName: string): string => {
    const genre = genreData.find((g) => g.name === genreName);
    return genre?.color ?? colors.accentPrimary;
  };

  const activities: ActivityItem[] = [
    {
      id: '1',
      icon: <Music size={24} color={colors.accentPrimary} />,
      text: 'New mixtape: Midnight Frequencies',
      time: '2h ago',
    },
    {
      id: '2',
      icon: <MapPin size={24} color={colors.accentPrimary} />,
      text: 'Playing at Warehouse tonight',
      time: '5h ago',
    },
    {
      id: '3',
      icon: <Users size={24} color={colors.accentPrimary} />,
      text: 'Collab with @MaxTempo',
      time: '1d ago',
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: dj.imageUrl }}
            style={[styles.heroImage, heroImageStyle]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(7, 7, 10, 0.6)', colors.bgPrimary]}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.djName}>{dj.name}</Text>
            <Text style={styles.djLocation}>{dj.location}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, effects.glowPurple]}>
          <StatCard value={dj.followers} label="Followers" delay={0} />
          <StatCard value={dj.shows} label="Shows" delay={100} />
          <StatCard value={dj.rating} label="Rating" delay={200} />
        </View>

        {/* Genre Tags */}
        <View style={styles.genresRow}>
          {dj.genres.map((genre) => (
            <GenrePill key={genre} name={genre} color={getGenreColor(genre)} />
          ))}
        </View>

        {/* Follow / Message Actions */}
        <View style={styles.actionsContainer}>
          <FollowButton
            isFollowing={isFollowing}
            onToggle={() => setIsFollowing((prev) => !prev)}
          />
          <GradientButton
            title="Message"
            gradientColors={gradients.accentTeal}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <SectionHeader title="Recent Activity" accentLine />
        </View>
        <View style={styles.activityList}>
          {activities.map((activity) => (
            <GlassCard key={activity.id} style={styles.activityCard} padding={spacing.lg}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>{activity.icon}</View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Upcoming Shows */}
        {upcomingShows.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionHeader title="Upcoming Shows" accentLine />
            </View>
            <View style={styles.showsList}>
              {upcomingShows.map((result, index) => (
                <ShowCard
                  key={result.show.id}
                  result={result}
                  index={index}
                  compact
                />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* Back Button (absolute, above scroll) */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
          <ChevronLeft size={28} color={colors.white} />
        </BlurView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },

  // Hero
  heroContainer: {
    height: HERO_HEIGHT,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT + 80,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.6,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  djName: {
    ...typography.h1,
    color: colors.white,
  },
  djLocation: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Back button
  backButton: {
    position: 'absolute',
    top: 54,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Genres
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 10,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Sections
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  activityList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  activityCard: {
    width: '100%',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  activityTime: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2,
  },
  showsList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});
