import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { RankedNearbyShow } from '@/src/types';
import { usePressAnimation } from '@/src/hooks/usePressAnimation';
import { colors, typography, spacing, effects } from '@/src/theme';

const CARD_HEIGHT = 240;

interface FeaturedShowCardProps {
  show: RankedNearbyShow;
}

function getUrgencyBadge(dateStr: string): { text: string; color: string } | null {
  const showDate = new Date(dateStr);
  const now = new Date();
  const diffHours = (showDate.getTime() - now.getTime()) / 3600000;

  if (diffHours < 0) return null;
  if (diffHours <= 12) return { text: 'TONIGHT', color: colors.amber };
  if (diffHours <= 36) return { text: 'TOMORROW', color: colors.accentTertiary };
  return null;
}

export const FeaturedShowCard = React.memo(function FeaturedShowCard({
  show,
}: FeaturedShowCardProps) {
  const router = useRouter();
  const { animatedStyle, handlers } = usePressAnimation({ scaleDown: 0.98, hapticStyle: 'medium' });
  const { result, distance } = show;
  const djNames = result.djs.map((d) => d.name).join(' x ');
  const urgency = getUrgencyBadge(result.show.date);

  return (
    <Animated.View style={[animatedStyle, effects.glowPurple]}>
      <Pressable
        onPress={() => router.push(`/show/${result.show.id}`)}
        {...handlers}
      >
        <View style={styles.card}>
          <Image
            source={result.show.imageUrl}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(7, 7, 10, 0.6)', colors.bgPrimary]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            <View style={styles.topRow}>
              {urgency && (
                <View style={[styles.urgencyBadge, { backgroundColor: urgency.color }]}>
                  <Text style={styles.urgencyText}>{urgency.text}</Text>
                </View>
              )}
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.showName} numberOfLines={1}>{result.show.name}</Text>
              <Text style={styles.djNames} numberOfLines={1}>{djNames}</Text>
              <View style={styles.venueRow}>
                <MapPin size={12} color={colors.accentTertiary} />
                <Text style={styles.venueText}>
                  {result.venue.name} · {distance.displayText}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
  },
  urgencyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  urgencyText: {
    ...typography.labelSm,
    color: colors.bgPrimary,
    fontFamily: 'Inter_700Bold',
  },
  bottomRow: {
    gap: 4,
  },
  showName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  djNames: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  venueText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
