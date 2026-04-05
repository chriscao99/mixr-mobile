import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Send } from 'lucide-react-native';

import { colors, gradients, typography, spacing, screen } from '../../src/theme';
import { FeedItem } from '../../src/types';
import { feedItems, userProfile } from '../../src/data/mockData';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { HeartButton } from '../../src/components/ui/HeartButton';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { useStaggerEntrance } from '../../src/hooks/useStaggerEntrance';

function FeedCard({
  item,
  index,
  isLiked,
  onToggleLike,
}: {
  item: FeedItem;
  index: number;
  isLiked: boolean;
  onToggleLike: () => void;
}) {
  const staggerStyle = useStaggerEntrance(index);

  return (
    <Animated.View style={[styles.feedCardWrapper, staggerStyle]}>
      <GlassCard borderRadius={24}>
        {/* Hero image with gradient overlay */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', colors.bgPrimary] as [string, string]}
            style={styles.heroGradient}
          />

          {/* DJ info row at bottom of image */}
          <View style={styles.djInfoRow}>
            <Image source={{ uri: item.dj.imageUrl }} style={styles.djAvatar} />
            <Text style={styles.djName}>{item.dj.name}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          <View style={styles.actionLeft}>
            <HeartButton isLiked={isLiked} onToggle={onToggleLike} />
            <Pressable style={styles.actionItem} hitSlop={12}>
              <MessageCircle size={22} color={colors.textMuted} />
              <Text style={styles.actionCount}>{item.comments}</Text>
            </Pressable>
          </View>
          <Pressable hitSlop={12}>
            <Send size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function HomeFeedScreen() {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    feedItems.forEach((item) => {
      initial[item.id] = item.isLiked;
    });
    return initial;
  });

  const toggleLike = (id: string) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>mixr</Text>
        <StreakBadge streak={userProfile.streak} />
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {feedItems.map((item, index) => (
          <FeedCard
            key={item.id}
            item={item}
            index={index}
            isLiked={likedItems[item.id] ?? false}
            onToggleLike={() => toggleLike(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: screen.statusBarHeight,
    paddingHorizontal: screen.paddingH,
    paddingBottom: spacing.md,
  },
  logo: {
    ...typography.h2,
    color: colors.accentPrimary,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screen.paddingH,
    paddingBottom: screen.tabBarHeight + spacing.lg,
  },

  // Feed card
  feedCardWrapper: {
    marginBottom: spacing.xl,
  },

  // Hero image
  heroContainer: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // DJ info row
  djInfoRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  djAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  djName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginLeft: 'auto',
  },

  // Content
  contentArea: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionCount: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
});
