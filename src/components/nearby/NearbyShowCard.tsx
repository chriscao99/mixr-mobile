import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { RankedNearbyShow } from '@/src/types';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { DistanceBadge } from '@/src/components/location/DistanceBadge';
import { useStaggerEntrance } from '@/src/hooks/useStaggerEntrance';
import { usePressAnimation } from '@/src/hooks/usePressAnimation';
import { colors, typography, spacing } from '@/src/theme';

const CARD_WIDTH = 160;
const IMAGE_HEIGHT = 120;

interface NearbyShowCardProps {
  show: RankedNearbyShow;
  index: number;
}

export const NearbyShowCard = React.memo(function NearbyShowCard({
  show,
  index,
}: NearbyShowCardProps) {
  const router = useRouter();
  const staggerStyle = useStaggerEntrance(index, 60);
  const { animatedStyle: pressStyle, handlers } = usePressAnimation({ scaleDown: 0.97 });

  const { result, distance } = show;
  const djNames = result.djs.map((d) => d.name).join(' x ');

  // Format date for badge
  const date = new Date(result.show.date);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const day = date.getDate();

  return (
    <Animated.View style={[staggerStyle, { width: CARD_WIDTH }]}>
      <Animated.View style={pressStyle}>
        <Pressable
          onPress={() => router.push(`/show/${result.show.id}`)}
          {...handlers}
        >
          <GlassCard borderRadius={16} padding={0}>
            <View>
              {/* Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={result.show.imageUrl}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
                {/* Date badge overlay */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeWeekday}>{weekday}</Text>
                  <Text style={styles.dateBadgeDay}>{day}</Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{result.show.name}</Text>
                <Text style={styles.djs} numberOfLines={1}>{djNames}</Text>
                <DistanceBadge distanceInfo={distance} size="sm" />
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  imageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(7, 7, 10, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  dateBadgeWeekday: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  dateBadgeDay: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 18,
  },
  info: {
    padding: spacing.md,
    gap: 3,
  },
  name: {
    ...typography.label,
    color: colors.textPrimary,
  },
  djs: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
