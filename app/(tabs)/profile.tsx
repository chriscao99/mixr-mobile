import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
import { colors, typography, spacing, screen } from '../../src/theme';
import { Achievement } from '../../src/types';
import { userProfile } from '../../src/data/mockData';
import {
  GlassCard,
  AnimatedAvatar,
  StreakBadge,
  StatCard,
  MenuItem,
} from '../../src/components/ui';

const ACHIEVEMENT_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  star: Star,
  music: Music,
  moon: Moon,
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const IconComponent = ACHIEVEMENT_ICONS[achievement.icon] ?? Star;

  return (
    <GlassCard borderRadius={16} padding={spacing.lg}>
      <View style={styles.achievementRow}>
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
    </GlassCard>
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

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <AnimatedAvatar
          size={96}
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

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard value={userProfile.following} label="Following" delay={0} />
        <StatCard value={userProfile.liked} label="Liked" delay={100} />
        <StatCard value={userProfile.level} label="Level" delay={200} />
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          {userProfile.achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuList}>
          <MenuItem
            icon={<User size={20} color={colors.accentPrimary} />}
            title="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Bell size={20} color={colors.accentPrimary} />}
            title="Notifications"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Shield size={20} color={colors.accentPrimary} />}
            title="Privacy"
            onPress={() => {}}
          />
          <MenuItem
            icon={<CircleHelp size={20} color={colors.accentPrimary} />}
            title="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon={<LogOut size={20} color={colors.red} />}
            title="Log Out"
            onPress={() => {}}
          />
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
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
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
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  achievementsList: {
    gap: 10,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuList: {
    gap: spacing.sm,
  },
});
