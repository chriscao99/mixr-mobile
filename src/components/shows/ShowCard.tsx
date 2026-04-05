import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { MapPin, Clock, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';

import { colors, typography, spacing, radius } from '@/src/theme';
import { ShowSearchResult } from '@/src/types';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GenrePill } from '@/src/components/ui/GenrePill';
import { ShowDateBadge } from './ShowDateBadge';
import { useStaggerEntrance } from '@/src/hooks/useStaggerEntrance';

interface ShowCardProps {
  result: ShowSearchResult;
  index: number;
  compact?: boolean;
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

function formatDistance(km?: number): string | null {
  if (km === undefined) return null;
  const mi = km * 0.621371;
  return `${mi.toFixed(1)} mi`;
}

export const ShowCard = React.memo(
  function ShowCard({ result, index, compact = false }: ShowCardProps) {
    const { show, venue, djs, genres, distance } = result;
    const staggerStyle = useStaggerEntrance(index);
    const distanceStr = formatDistance(distance);

    const handlePress = () => {
      router.push(`/show/${show.id}` as any);
    };

    if (compact) {
      return (
        <Pressable onPress={handlePress} style={styles.compactWrapper}>
          <GlassCard borderRadius={radius.lg} padding={spacing.md}>
            <View style={styles.compactRow}>
              <Image source={{ uri: show.imageUrl }} style={styles.compactImage} />
              <View style={styles.compactContent}>
                <Text style={styles.compactTitle} numberOfLines={1}>
                  {show.name}
                </Text>
                <Text style={styles.compactVenue} numberOfLines={1}>
                  {venue.name}
                </Text>
                <ShowDateBadge date={show.date} compact />
              </View>
            </View>
          </GlassCard>
        </Pressable>
      );
    }

    return (
      <Animated.View style={staggerStyle}>
        <Pressable onPress={handlePress}>
          <GlassCard borderRadius={radius.xl} padding={0}>
            {/* Hero image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: show.imageUrl }} style={styles.image} />
              {show.isSoldOut && (
                <View style={styles.soldOutBadge}>
                  <Text style={styles.soldOutText}>SOLD OUT</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title row */}
              <View style={styles.titleRow}>
                <ShowDateBadge date={show.date} />
                <View style={styles.titleContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {show.name}
                  </Text>
                  <Text style={styles.djNames} numberOfLines={1}>
                    {djs.map((d) => d.name).join(' x ')}
                  </Text>
                </View>
              </View>

              {/* Info row */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MapPin size={13} color={colors.textMuted} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {venue.name}
                    {distanceStr ? ` (${distanceStr})` : ''}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={13} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    {formatTime(show.startTime)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <DollarSign size={13} color={colors.textMuted} />
                  <Text style={styles.infoText}>
                    {formatPrice(show.priceMin, show.priceMax)}
                  </Text>
                </View>
              </View>

              {/* Genre pills */}
              <View style={styles.genreRow}>
                {genres.slice(0, 3).map((genre) => (
                  <GenrePill
                    key={genre.id}
                    name={genre.name}
                    color={genre.color}
                  />
                ))}
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.result.show.id === next.result.show.id &&
    prev.index === next.index &&
    prev.compact === next.compact &&
    prev.result.distance === next.result.distance
);

const styles = StyleSheet.create({
  imageContainer: {
    height: 160,
    overflow: 'hidden',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  soldOutBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  titleContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  djNames: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    ...typography.bodySm,
    color: colors.textMuted,
    flexShrink: 1,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Compact variant
  compactWrapper: {
    width: 260,
  },
  compactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  compactImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
  },
  compactContent: {
    flex: 1,
    gap: 3,
  },
  compactTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  compactVenue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
