import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Music,
  Moon,
  Check,
  User,
  Bell,
  Shield,
  CircleHelp,
  LogOut,
} from 'lucide-react-native';
import { colors, gradients, typography, spacing, screen, radius } from '../../src/theme';
import { Achievement } from '../../src/types';
import { userProfile } from '../../src/data/mockData';
import {
  GlassCard,
  AnimatedAvatar,
  StreakBadge,
  StatCard,
  MenuItem,
} from '../../src/components/ui';
import { SectionHeader } from '../../src/components/ui/SectionHeader';

const ACHIEVEMENT_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  star: Star,
  music: Music,
  moon: Moon,
};

function AchievementRow({ achievement, isLast }: { achievement: Achievement; isLast: boolean }) {
  const IconComponent = ACHIEVEMENT_ICONS[achievement.icon] ?? Star;

  return (
    <View>
      <View style={styles.achievementRowOuter}>
        {/* Left accent for earned achievements */}
        {achievement.earned && (
          <View style={styles.earnedAccent} />
        )}
        <View style={[styles.achievementRow, achievement.earned && styles.achievementRowEarned]}>
          <View style={styles.achievementIconCircle}>
            <IconComponent size={20} color={colors.accentPrimary} />
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
          </View>
          {achievement.earned ? (
            <View style={styles.checkCircle}>
              <Check size={16} color={colors.white} />
            </View>
          ) : (
            <Text style={styles.progressText}>{achievement.progress}</Text>
          )}
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar Section with gradient backdrop */}
      <View style={styles.avatarSectionWrapper}>
        <LinearGradient
          colors={gradients.heroMesh}
          style={styles.avatarGradient}
        />
        <View style={styles.avatarSection}>
          <AnimatedAvatar
            size={110}
            showRing
            initials={userProfile.initials}
            imageUrl={userProfile.avatarUrl}
          />
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userHandle}>{userProfile.handle}</Text>
          <View style={styles.streakContainer}>
            <StreakBadge streak={userProfile.streak} />
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard value={userProfile.following} label="Following" delay={0} />
        <StatCard value={userProfile.liked} label="Liked" delay={100} />
        <StatCard value={userProfile.level} label="Level" delay={200} />
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <SectionHeader title="Achievements" accentLine />
        <View style={styles.sectionContentSpacing}>
          <GlassCard borderRadius={16} padding={spacing.lg}>
            {userProfile.achievements.map((achievement, index) => (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
                isLast={index === userProfile.achievements.length - 1}
              />
            ))}
          </GlassCard>
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.section}>
        <SectionHeader title="Settings" accentLine />
        <View style={styles.sectionContentSpacing}>
          <GlassCard borderRadius={16} padding={spacing.md}>
            <MenuItem
              icon={<User size={20} color={colors.accentPrimary} />}
              title="Edit Profile"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<Bell size={20} color={colors.accentPrimary} />}
              title="Notifications"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<Shield size={20} color={colors.accentPrimary} />}
              title="Privacy"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<CircleHelp size={20} color={colors.accentPrimary} />}
              title="Help & Support"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<LogOut size={20} color={colors.red} />}
              title="Log Out"
              onPress={() => {}}
            />
          </GlassCard>
        </View>
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
    paddingBottom: screen.tabBarHeight,
  },
  header: {
    paddingTop: screen.statusBarHeight,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  avatarSectionWrapper: {
    position: 'relative',
    marginTop: spacing['2xl'],
  },
  avatarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.3,
  },
  avatarSection: {
    alignItems: 'center',
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  userHandle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  streakContainer: {
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing['2xl'],
    paddingHorizontal: screen.paddingH,
    gap: spacing.md,
  },
  section: {
    marginTop: screen.gap,
    paddingHorizontal: screen.paddingH,
  },
  sectionContentSpacing: {
    marginTop: spacing.md,
  },
  achievementRowOuter: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  earnedAccent: {
    width: 3,
    backgroundColor: colors.accentPrimary,
    borderRadius: 1.5,
    marginRight: spacing.sm,
  },
  achievementRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  achievementRowEarned: {
    // No extra padding needed, accent provides visual cue
  },
  achievementIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  achievementDesc: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
});
