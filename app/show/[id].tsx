import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  DoorOpen,
} from 'lucide-react-native';

import { colors, gradients, typography, spacing, radius } from '../../src/theme';
import { ShowSearchResult } from '../../src/types';
import { getShowById, getShowsAtVenue } from '../../src/data/showService';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GradientButton } from '../../src/components/ui/GradientButton';
import { GenrePill } from '../../src/components/ui/GenrePill';
import { ShowCard } from '../../src/components/shows/ShowCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(isoDatetime: string): string {
  const d = new Date(isoDatetime);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatPrice(priceMin?: number, priceMax?: number): string {
  if (priceMin === undefined && priceMax === undefined) return 'TBD';
  if (priceMin === 0 && priceMax === 0) return 'Free';
  if (priceMin === priceMax) return `$${priceMin}`;
  return `$${priceMin} - $${priceMax}`;
}

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [show, setShow] = useState<ShowSearchResult | null>(null);
  const [venueShows, setVenueShows] = useState<ShowSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }],
  }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getShowById(id);
        if (!mounted) return;
        setShow(result);

        if (result) {
          const related = await getShowsAtVenue(result.show.venueId);
          if (mounted) {
            // Exclude current show from related
            setVenueShows(related.filter((s) => s.show.id !== id));
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={colors.white} />
        </Pressable>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Show not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={colors.white} />
        </Pressable>
      </View>
    );
  }

  const { show: showData, venue, djs, genres } = show;

  const openDirections = () => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}?daddr=${venue.latitude},${venue.longitude}`,
      android: `${scheme}${venue.latitude},${venue.longitude}?q=${venue.latitude},${venue.longitude}(${venue.name})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero image with parallax */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: showData.imageUrl }}
            style={[styles.heroImage, heroImageStyle]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={gradients.heroFade}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.showName}>{showData.name}</Text>
            {showData.isSoldOut && (
              <View style={styles.soldOutBadge}>
                <Text style={styles.soldOutText}>SOLD OUT</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Calendar size={18} color={colors.accentPrimary} />
            <Text style={styles.infoLabel}>{formatDate(showData.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.accentPrimary} />
            <Text style={styles.infoLabel}>
              {formatTime(showData.startTime)}
              {showData.endTime ? ` - ${formatTime(showData.endTime)}` : ''}
            </Text>
          </View>
          {showData.doorsOpen && (
            <View style={styles.infoRow}>
              <DoorOpen size={18} color={colors.accentPrimary} />
              <Text style={styles.infoLabel}>
                Doors open at {formatTime(showData.doorsOpen)}
              </Text>
            </View>
          )}
        </View>

        {/* Genre pills */}
        <View style={styles.genreRow}>
          {genres.map((genre) => (
            <GenrePill key={genre.id} name={genre.name} color={genre.color} />
          ))}
        </View>

        {/* Description */}
        {showData.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{showData.description}</Text>
          </View>
        )}

        {/* Venue card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
            <View style={styles.venueRow}>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <View style={styles.infoRow}>
                  <MapPin size={14} color={colors.textMuted} />
                  <Text style={styles.venueAddress}>
                    {venue.address}, {venue.city}, {venue.state}
                  </Text>
                </View>
                {venue.capacity && (
                  <View style={styles.infoRow}>
                    <Users size={14} color={colors.textMuted} />
                    <Text style={styles.venueCapacity}>
                      Capacity: {venue.capacity.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <GradientButton
              title="Get Directions"
              onPress={openDirections}
              height={40}
              gradientColors={gradients.accentTeal}
              style={{ marginTop: spacing.md }}
            />
          </GlassCard>
        </View>

        {/* Lineup card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lineup</Text>
          <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
            <View style={styles.lineupList}>
              {djs.map((dj) => (
                <Pressable
                  key={dj.id}
                  style={styles.djRow}
                  onPress={() => router.push(`/dj/${dj.id}` as any)}
                >
                  <Image
                    source={{ uri: dj.imageUrl }}
                    style={styles.djAvatar}
                  />
                  <View style={styles.djInfo}>
                    <Text style={styles.djName}>{dj.name}</Text>
                    <Text style={styles.djLocation}>{dj.location}</Text>
                  </View>
                  <ChevronLeft
                    size={18}
                    color={colors.textMuted}
                    style={{ transform: [{ rotate: '180deg' }] }}
                  />
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Details card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <GlassCard borderRadius={radius.lg} padding={spacing.lg}>
            <View style={styles.detailRow}>
              <DollarSign size={18} color={colors.accentPrimary} />
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>
                {formatPrice(showData.priceMin, showData.priceMax)}
              </Text>
            </View>
            {showData.tags && showData.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {showData.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </GlassCard>
        </View>

        {/* More shows at this venue */}
        {venueShows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              More at {venue.name}
            </Text>
            <View style={styles.relatedList}>
              {venueShows.slice(0, 3).map((related, idx) => (
                <ShowCard
                  key={related.show.id}
                  result={related}
                  index={idx}
                  compact
                />
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Back button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={colors.white} />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: spacing.sm,
  },
  showName: {
    ...typography.h1,
    color: colors.white,
  },
  soldOutBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  soldOutText: {
    ...typography.caption,
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },

  // Back button
  backButton: {
    position: 'absolute',
    top: 54,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Genres
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 10,
  },

  // Description
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Venue
  venueRow: {
    flexDirection: 'row',
  },
  venueInfo: {
    flex: 1,
    gap: 2,
  },
  venueName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  venueAddress: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  venueCapacity: {
    ...typography.bodySm,
    color: colors.textMuted,
  },

  // Lineup
  lineupList: {
    gap: spacing.md,
  },
  djRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  djAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgCard,
  },
  djInfo: {
    flex: 1,
  },
  djName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  djLocation: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
  },
  tagText: {
    ...typography.caption,
    color: colors.accentPrimary,
  },

  // Related shows
  relatedList: {
    gap: spacing.md,
  },
});
