# Mixr Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Mixr app with a clean minimal dark aesthetic, wire up all disconnected features (search, filters, state sharing), and consolidate hooks -- all with mock data.

**Architecture:** Replace glass/blur components with solid dark surfaces. Add `UserContext` for global follow/like state. Wire `ShowSearchContext` between filter modal and Shows tab. Refactor hooks to accept external state. Add settings screens and bottom sheet.

**Tech Stack:** Expo SDK 54, React Native 0.81, expo-router v6, react-native-reanimated 4, react-native-gesture-handler 2, lucide-react-native, expo-linear-gradient, expo-haptics

**Note:** No test runner is configured in this project. Steps focus on implementation and visual verification via `npx expo start`.

---

## File Structure

### Files to Create
- `src/components/ui/Card.tsx` -- solid dark card replacing GlassCard
- `src/components/ui/SearchInput.tsx` -- real text input with search icon
- `src/components/ui/BottomSheet.tsx` -- gesture-driven bottom sheet
- `src/components/ui/ProgressBar.tsx` -- animated progress bar for achievements
- `src/components/ui/ShareButton.tsx` -- share via RN Share API
- `src/components/ui/EmptyState.tsx` -- consistent empty state with icon + message
- `src/context/UserContext.tsx` -- global follow/like state
- `app/settings/edit-profile.tsx` -- placeholder settings screen
- `app/settings/notifications.tsx` -- placeholder settings screen
- `app/settings/privacy.tsx` -- placeholder settings screen
- `app/settings/help.tsx` -- placeholder settings screen
- `app/settings/_layout.tsx` -- settings stack layout

### Files to Modify
- `src/components/ui/GlassCard.tsx` -- keep as re-export of Card for backwards compat
- `src/components/ui/GradientButton.tsx` -- remove glow shadow
- `src/components/ui/AnimatedAvatar.tsx` -- use `useRingRotation` hook
- `src/components/ui/FollowButton.tsx` -- accept external state, use animation hook
- `src/components/ui/HeartButton.tsx` -- accept external state, use animation hook
- `src/components/ui/StatCard.tsx` -- use `useCountUp` hook, use Card
- `src/components/ui/StreakBadge.tsx` -- use `useStreakPulse` hook
- `src/components/ui/GenrePill.tsx` -- use `useGenrePillMorph` hook
- `src/hooks/useHeartBurst.ts` -- accept external `isLiked` boolean
- `src/hooks/useFollowMorph.ts` -- accept external `isFollowing` boolean
- `app/_layout.tsx` -- wrap with UserContext
- `app/(tabs)/_layout.tsx` -- remove BlurView, use solid bgNav, use `useTabMorph`
- `app/(tabs)/index.tsx` -- use Card, connect likes to UserContext
- `app/(tabs)/discover.tsx` -- add real SearchInput, connect follows to UserContext
- `app/(tabs)/shows.tsx` -- wrap with ShowSearchProvider
- `app/(tabs)/profile.tsx` -- connect to UserContext, add ProgressBar, wire confetti, wire settings nav
- `app/dj/[id].tsx` -- use `useParallax` hook, connect follow to UserContext, add upcoming shows
- `app/show/[id].tsx` -- use `useParallax` hook, add ShareButton
- `app/filter-modal.tsx` -- convert to use ShowSearchContext for state passing

---

## Task 1: Card Component (replaces GlassCard)

**Files:**
- Create: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/GlassCard.tsx`

- [ ] **Step 1: Create Card component**

```tsx
// src/components/ui/Card.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  padding?: number;
  variant?: 'default' | 'elevated';
}

export function Card({
  children,
  style,
  borderRadius = 24,
  padding = 0,
  variant = 'default',
}: CardProps) {
  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          padding,
          backgroundColor: variant === 'elevated' ? colors.bgElevated : colors.bgCard,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
```

- [ ] **Step 2: Update GlassCard to re-export Card**

Replace `src/components/ui/GlassCard.tsx` entirely:

```tsx
// src/components/ui/GlassCard.tsx
// Backwards-compatible re-export — GlassCard is now Card with solid background
export { Card as GlassCard } from './Card';
```

This ensures all existing imports of `GlassCard` continue to work without changing every import site immediately.

- [ ] **Step 3: Update theme index to export Card**

Check if `src/components/ui/index.ts` exists. If it does, add Card export. If not, no action needed -- components are imported directly by path.

- [ ] **Step 4: Verify**

Run `npx expo start` and check that all screens render correctly with solid card backgrounds instead of blur.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/GlassCard.tsx
git commit -m "feat: replace GlassCard with solid Card component

Remove BlurView dependency in favor of solid dark surfaces.
GlassCard re-exports Card for backwards compatibility."
```

---

## Task 2: Update GradientButton -- Remove Glow Shadow

**Files:**
- Modify: `src/components/ui/GradientButton.tsx:40,49`

- [ ] **Step 1: Remove glow View and its style**

In `src/components/ui/GradientButton.tsx`, remove line 40 (the glow `<View>`) and the `glow` style definition at line 49.

Remove this line from the render:
```tsx
        <View style={[styles.glow, { height, borderRadius: height / 2 }]} />
```

Remove this from the StyleSheet:
```tsx
    glow: { position: 'absolute', top: 4, left: 0, right: 0, backgroundColor: colors.accentGlow, zIndex: -1, opacity: 0.5 },
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/GradientButton.tsx
git commit -m "fix: remove glow shadow from GradientButton for cleaner look"
```

---

## Task 3: Update Tab Bar -- Solid Background + useTabMorph

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Replace BlurView with solid background**

In `app/(tabs)/_layout.tsx`, remove the `BlurView` import (line 4) and the `<BlurView>` element (line 50).

Remove:
```tsx
import { BlurView } from 'expo-blur';
```

Remove this line from the render inside `CustomTabBar`:
```tsx
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
```

The `tabBarContainer` style already has `backgroundColor: colors.bgNav` so it will look correct.

- [ ] **Step 2: Wire useTabMorph hook**

Replace the manual indicator logic (lines 28-46) with the `useTabMorph` hook.

Add import:
```tsx
import { useTabMorph } from '../../src/hooks/useTabMorph';
```

Replace the `CustomTabBar` function's indicator logic:

```tsx
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [measuredTabWidth, setMeasuredTabWidth] = React.useState(0);
  const activeIndex = state.index;

  const { indicatorStyle } = useTabMorph(activeIndex, tabs.length, measuredTabWidth);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarInner}>
        <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
          <View style={styles.indicator} />
        </Animated.View>

        {tabs.map((tab, index) => {
          const isFocused = activeIndex === index;
          const Icon = tab.icon;
          const color = isFocused ? colors.accentPrimary : colors.textMuted;

          return (
            <Pressable
              key={tab.name}
              style={styles.tab}
              onLayout={(e) => {
                if (index === 0 && measuredTabWidth === 0) {
                  setMeasuredTabWidth(e.nativeEvent.layout.width);
                }
              }}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[index].key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  Haptics.selectionAsync();
                  navigation.navigate(state.routes[index].name);
                }
              }}
            >
              <Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
              <Animated.Text style={[styles.tabLabel, { color }]}>
                {tab.label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
```

Remove the unused `useSharedValue` import if no longer needed.

- [ ] **Step 3: Verify**

Run `npx expo start`. Check that tab switching animates the pill indicator smoothly without blur background.

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: solid tab bar background + useTabMorph hook"
```

---

## Task 4: Refactor Hooks to Accept External State

**Files:**
- Modify: `src/hooks/useHeartBurst.ts`
- Modify: `src/hooks/useFollowMorph.ts`

- [ ] **Step 1: Refactor useHeartBurst to accept external isLiked**

Replace `src/hooks/useHeartBurst.ts` entirely:

```tsx
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

const burstSpring: WithSpringConfig = {
  damping: 10,
  stiffness: 400,
  mass: 0.6,
};

/**
 * Animation for heart burst effect.
 * Accepts external isLiked state (from context).
 * Returns animatedStyle for the heart icon + a burst trigger.
 */
export function useHeartBurst(isLiked: boolean) {
  const scale = useSharedValue(1);
  const liked = useSharedValue(isLiked ? 1 : 0);

  useEffect(() => {
    const target = isLiked ? 1 : 0;
    liked.value = withTiming(target, { duration: 250 });

    // Only burst on like (not unlike)
    if (isLiked) {
      scale.value = withSequence(
        withSpring(1.3, burstSpring),
        withSpring(1, burstSpring),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isLiked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: interpolateColor(
      liked.value,
      [0, 1],
      [colors.textMuted, colors.red],
    ),
  }));

  return { animatedStyle };
}
```

- [ ] **Step 2: Refactor useFollowMorph to accept external isFollowing**

Replace `src/hooks/useFollowMorph.ts` entirely:

```tsx
import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  WithSpringConfig,
} from 'react-native-reanimated';
import { colors } from '../theme';

const morphSpring: WithSpringConfig = {
  damping: 15,
  stiffness: 180,
  mass: 0.8,
};

const FOLLOW_WIDTH = 100;
const FOLLOWING_WIDTH = 120;

/**
 * Animation for follow button morph.
 * Accepts external isFollowing state (from context).
 * Returns morphStyle for the button container.
 */
export function useFollowMorph(isFollowing: boolean) {
  const progress = useSharedValue(isFollowing ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFollowing ? 1 : 0, morphSpring);
  }, [isFollowing]);

  const morphStyle = useAnimatedStyle(() => ({
    width: FOLLOW_WIDTH + progress.value * (FOLLOWING_WIDTH - FOLLOW_WIDTH),
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.accentPrimary, 'transparent'],
    ),
    borderWidth: withTiming(progress.value > 0.5 ? 1.5 : 0, { duration: 200 }),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', colors.accentPrimary],
    ),
  }));

  return { morphStyle };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useHeartBurst.ts src/hooks/useFollowMorph.ts
git commit -m "refactor: hooks accept external state instead of managing their own"
```

---

## Task 5: UserContext -- Global Follow/Like State

**Files:**
- Create: `src/context/UserContext.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create UserContext**

```tsx
// src/context/UserContext.tsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import { userProfile, djs, feedItems } from '../data/mockData';
import type { UserProfile } from '../types';

interface UserState {
  profile: UserProfile;
  followedDjIds: Set<string>;
  likedFeedItemIds: Set<string>;
  toggleFollow: (djId: string) => void;
  toggleLike: (feedItemId: string) => void;
  isFollowing: (djId: string) => boolean;
  isLiked: (feedItemId: string) => boolean;
}

const UserContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile] = useState<UserProfile>(userProfile);

  // Initialize from mock data
  const [followedDjIds, setFollowedDjIds] = useState<Set<string>>(
    () => new Set(djs.filter((dj) => dj.isFollowing).map((dj) => dj.id))
  );
  const [likedFeedItemIds, setLikedFeedItemIds] = useState<Set<string>>(
    () => new Set(feedItems.filter((item) => item.isLiked).map((item) => item.id))
  );

  const toggleFollow = useCallback((djId: string) => {
    setFollowedDjIds((prev) => {
      const next = new Set(prev);
      if (next.has(djId)) {
        next.delete(djId);
      } else {
        next.add(djId);
      }
      return next;
    });
  }, []);

  const toggleLike = useCallback((feedItemId: string) => {
    setLikedFeedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(feedItemId)) {
        next.delete(feedItemId);
      } else {
        next.add(feedItemId);
      }
      return next;
    });
  }, []);

  const isFollowing = useCallback(
    (djId: string) => followedDjIds.has(djId),
    [followedDjIds]
  );

  const isLiked = useCallback(
    (feedItemId: string) => likedFeedItemIds.has(feedItemId),
    [likedFeedItemIds]
  );

  return (
    <UserContext.Provider
      value={{ profile, followedDjIds, likedFeedItemIds, toggleFollow, toggleLike, isFollowing, isLiked }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserState {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Wrap app in UserProvider**

In `app/_layout.tsx`, add UserProvider inside the GestureHandlerRootView:

Add import:
```tsx
import { UserProvider } from '../src/context/UserContext';
```

Wrap the Stack:
```tsx
<GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
  <UserProvider>
    <Stack screenOptions={{ ... }}>
      ...
    </Stack>
  </UserProvider>
</GestureHandlerRootView>
```

- [ ] **Step 3: Commit**

```bash
git add src/context/UserContext.tsx app/_layout.tsx
git commit -m "feat: add UserContext for global follow/like state"
```

---

## Task 6: Update HeartButton to Use Context + Hook

**Files:**
- Modify: `src/components/ui/HeartButton.tsx`

- [ ] **Step 1: Rewrite HeartButton**

Replace `src/components/ui/HeartButton.tsx` entirely:

```tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useHeartBurst } from '../../hooks/useHeartBurst';
import { colors } from '../../theme';

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

interface HeartButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: number;
}

export function HeartButton({ isLiked, onToggle, size = 24 }: HeartButtonProps) {
  const { animatedStyle } = useHeartBurst(isLiked);

  return (
    <Pressable onPress={onToggle} hitSlop={8} style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Heart
          size={size}
          color={isLiked ? colors.red : colors.textMuted}
          fill={isLiked ? colors.red : 'transparent'}
          strokeWidth={2}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/HeartButton.tsx
git commit -m "feat: HeartButton uses useHeartBurst hook with external state"
```

---

## Task 7: Update FollowButton to Use Hook

**Files:**
- Modify: `src/components/ui/FollowButton.tsx`

- [ ] **Step 1: Rewrite FollowButton**

Replace `src/components/ui/FollowButton.tsx` entirely:

```tsx
import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, gradients, typography } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function FollowButton({ isFollowing, onToggle, compact = false }: FollowButtonProps) {
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const height = compact ? 32 : 38;
  const paddingH = compact ? 14 : 18;

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  if (isFollowing) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[scaleStyle, styles.followingButton, { height, paddingHorizontal: paddingH }]}
      >
        <Check size={compact ? 14 : 16} color={colors.accentPrimary} strokeWidth={2.5} />
        <Text style={[compact ? styles.compactText : styles.text, { color: colors.accentPrimary }]}>
          Following
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={scaleStyle}
    >
      <LinearGradient
        colors={gradients.accentPrimary as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.followButton, { height, paddingHorizontal: paddingH, borderRadius: height / 2 }]}
      >
        <Text style={compact ? styles.compactText : styles.text}>Follow</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  followingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
    backgroundColor: 'transparent',
  },
  text: {
    ...typography.label,
    color: colors.white,
  },
  compactText: {
    ...typography.labelSm,
    color: colors.white,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/FollowButton.tsx
git commit -m "feat: FollowButton accepts external isFollowing state"
```

---

## Task 8: Update StatCard to Use Card + useCountUp

**Files:**
- Modify: `src/components/ui/StatCard.tsx`

- [ ] **Step 1: Rewrite StatCard**

Replace `src/components/ui/StatCard.tsx` with a version that uses `Card` and `useCountUp`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { Card } from './Card';
import { useCountUp } from '../../hooks/useCountUp';
import { colors, typography } from '../../theme';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface StatCardProps {
  value: number;
  label: string;
  delay?: number;
}

function formatValue(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return Math.round(val).toString();
}

export function StatCard({ value, label, delay = 0 }: StatCardProps) {
  const { displayValue } = useCountUp(value, delay);

  const animatedProps = useAnimatedProps(() => ({
    text: formatValue(displayValue.value),
  }));

  return (
    <Card style={styles.card} padding={12} borderRadius={16}>
      <AnimatedText
        style={styles.value}
        // @ts-ignore -- animatedProps for text
        animatedProps={animatedProps}
      />
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  value: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  label: {
    ...typography.statLabel,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/StatCard.tsx
git commit -m "feat: StatCard uses Card + useCountUp hook"
```

---

## Task 9: Update AnimatedAvatar + StreakBadge to Use Hooks

**Files:**
- Modify: `src/components/ui/AnimatedAvatar.tsx`
- Modify: `src/components/ui/StreakBadge.tsx`

- [ ] **Step 1: Wire useRingRotation into AnimatedAvatar**

In `src/components/ui/AnimatedAvatar.tsx`, find the inline rotation animation code (the `useEffect` with `withRepeat(withTiming(360, { duration: 4000 }))`). Replace it with:

Add import:
```tsx
import { useRingRotation } from '../../hooks/useRingRotation';
```

Replace the inline rotation shared value and animated style with:
```tsx
const { ringStyle } = useRingRotation();
```

Use `ringStyle` on the ring `Animated.View` instead of the inline `animatedRingStyle`.

Remove the old `rotation` shared value, `useEffect` that drives it, and `animatedRingStyle`.

- [ ] **Step 2: Wire useStreakPulse into StreakBadge**

In `src/components/ui/StreakBadge.tsx`, find the inline pulse animation. Replace with:

Add import:
```tsx
import { useStreakPulse } from '../../hooks/useStreakPulse';
```

Replace inline shared values and animated styles with:
```tsx
const { pulseStyle } = useStreakPulse();
```

Apply `pulseStyle` to the outer `Animated.View`. Remove old `pulseScale`, `useEffect`, and `pulseAnimatedStyle`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/AnimatedAvatar.tsx src/components/ui/StreakBadge.tsx
git commit -m "refactor: AnimatedAvatar and StreakBadge use shared hooks"
```

---

## Task 10: SearchInput Component

**Files:**
- Create: `src/components/ui/SearchInput.tsx`

- [ ] **Step 1: Create SearchInput**

```tsx
// src/components/ui/SearchInput.tsx
import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChangeText, placeholder = 'Search...' }: SearchInputProps) {
  const focused = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focused.value,
      [0, 1],
      [colors.borderSubtle, colors.accentPrimary],
    ),
  }));

  return (
    <AnimatedView style={[styles.container, containerStyle]}>
      <Search size={18} color={colors.textMuted} strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => { focused.value = withTiming(1, { duration: 200 }); }}
        onBlur={() => { focused.value = withTiming(0, { duration: 200 }); }}
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <X size={18} color={colors.textMuted} strokeWidth={2} />
        </Pressable>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SearchInput.tsx
git commit -m "feat: add SearchInput component with animated focus border"
```

---

## Task 11: ProgressBar + EmptyState + ShareButton Components

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/ShareButton.tsx`

- [ ] **Step 1: Create ProgressBar**

```tsx
// src/components/ui/ProgressBar.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = colors.accentPrimary, height = 4 }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.bar, { height, borderRadius: height / 2 }, barStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
```

- [ ] **Step 2: Create EmptyState**

```tsx
// src/components/ui/EmptyState.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: {
    marginTop: spacing.xl,
  },
});
```

- [ ] **Step 3: Create ShareButton**

```tsx
// src/components/ui/ShareButton.tsx
import React from 'react';
import { Pressable, Share, StyleSheet } from 'react-native';
import { Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';

interface ShareButtonProps {
  title: string;
  message: string;
  size?: number;
}

export function ShareButton({ title, message, size = 22 }: ShareButtonProps) {
  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({ title, message });
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8} style={styles.container}>
      <Share2 size={size} color={colors.textSecondary} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ProgressBar.tsx src/components/ui/EmptyState.tsx src/components/ui/ShareButton.tsx
git commit -m "feat: add ProgressBar, EmptyState, and ShareButton components"
```

---

## Task 12: BottomSheet Component

**Files:**
- Create: `src/components/ui/BottomSheet.tsx`

- [ ] **Step 1: Create BottomSheet**

```tsx
// src/components/ui/BottomSheet.tsx
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85;

interface BottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onDismiss, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(MAX_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200, mass: 0.8 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(MAX_HEIGHT, { damping: 20, stiffness: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 500) {
        translateY.value = withSpring(MAX_HEIGHT, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backdropOpacity.value, [0, 1], [0, 0.5], Extrapolation.CLAMP),
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.sheet, { maxHeight: MAX_HEIGHT, paddingBottom: insets.bottom + 16 }, sheetStyle]}
        >
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderSubtle,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/BottomSheet.tsx
git commit -m "feat: add gesture-driven BottomSheet component"
```

---

## Task 13: Wire ShowSearchContext into Shows Tab

**Files:**
- Modify: `app/(tabs)/shows.tsx`
- Modify: `app/filter-modal.tsx`

- [ ] **Step 1: Wrap Shows tab with ShowSearchProvider**

In `app/(tabs)/shows.tsx`, wrap the screen content with `ShowSearchProvider` and replace the direct `useShowSearch` call with `useShowSearchContext`:

Add import:
```tsx
import { ShowSearchProvider, useShowSearchContext } from '@/src/context/ShowSearchContext';
```

Split the component: create an inner `ShowsContent` that uses the context, and wrap it:

```tsx
function ShowsContent() {
  const { query, filter, sort, results, total, hasMore, isLoading, setQuery, setFilter, updateFilter, clearFilter, setSort, loadMore, refresh, savedFilters } = useShowSearchContext();
  // ... rest of existing render logic, replacing the old useShowSearch() references
}

export default function ShowsScreen() {
  return (
    <ShowSearchProvider>
      <ShowsContent />
    </ShowSearchProvider>
  );
}
```

Remove the old `useShowSearch` import and direct call.

- [ ] **Step 2: Update filter modal to use ShowSearchContext**

In `app/filter-modal.tsx`, the modal currently manages its own local filter state and just calls `router.back()` on Apply. Change it to read/write from `ShowSearchContext`:

Wrap the filter modal screen with the same `ShowSearchProvider` or -- since the modal is a separate route -- pass filter state via `expo-router` params or lift the provider higher.

**Best approach:** Move `ShowSearchProvider` up to the tab layout so both Shows and the filter modal share it.

In `app/(tabs)/_layout.tsx`, wrap the `Tabs` component:
```tsx
import { ShowSearchProvider } from '@/src/context/ShowSearchContext';

export default function TabLayout() {
  return (
    <ShowSearchProvider>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        ...
      </Tabs>
    </ShowSearchProvider>
  );
}
```

Then in `app/filter-modal.tsx`:
- Import `useShowSearchContext`
- On mount, read current filter from context to populate the form
- On "Apply Filters", call `setFilter(localFilterState)` then `router.back()`
- On "Clear All", call `clearFilter()` and reset local form state

Replace the Apply button's `onPress`:
```tsx
const { filter, setFilter, clearFilter } = useShowSearchContext();

// In handleApply:
const handleApply = () => {
  setFilter(localFilter);
  router.back();
};

// In handleClear:
const handleClear = () => {
  clearFilter();
  setLocalFilter({});
};
```

**Note:** The filter modal is rendered as a Stack screen (not inside tabs), so the provider in `_layout.tsx` (tab layout) won't cover it. Instead, move `ShowSearchProvider` to `app/_layout.tsx` (root layout) alongside `UserProvider`:

```tsx
<UserProvider>
  <ShowSearchProvider>
    <Stack>...</Stack>
  </ShowSearchProvider>
</UserProvider>
```

Then both Shows tab and filter-modal can access the same context.

- [ ] **Step 3: Update Shows tab to use context**

In `app/(tabs)/shows.tsx`, remove the direct `useShowSearch` hook call and use `useShowSearchContext()` instead. The hook provides the same interface, so the rest of the code stays the same.

- [ ] **Step 4: Verify**

Run `npx expo start`. Navigate to Shows tab, open filters, select some filters, press Apply. Verify the Shows list updates to reflect the applied filters.

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx app/(tabs)/_layout.tsx app/(tabs)/shows.tsx app/filter-modal.tsx
git commit -m "feat: wire ShowSearchContext between Shows tab and filter modal"
```

---

## Task 14: Redesign Feed Tab

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Update FeedCard to use Card and connect to UserContext**

In `app/(tabs)/index.tsx`:

Add imports:
```tsx
import { Card } from '@/src/components/ui/Card';
import { ShareButton } from '@/src/components/ui/ShareButton';
import { useUser } from '@/src/context/UserContext';
```

Replace `GlassCard` usage in `FeedCard` with `Card`. Connect like state to `UserContext`:

In `HomeFeedScreen`, replace local like state with context:
```tsx
const { isLiked, toggleLike } = useUser();
```

Remove the old `likedItems` useState. In FeedCard, pass:
```tsx
<HeartButton
  isLiked={isLiked(item.id)}
  onToggle={() => toggleLike(item.id)}
/>
```

Replace `GlassCard` with `Card` in FeedCard's render. Increase image height to 240.

Add `ShareButton` to the action bar:
```tsx
<ShareButton title={item.title} message={`Check out "${item.title}" on Mixr`} />
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: Feed tab uses Card, UserContext for likes, adds ShareButton"
```

---

## Task 15: Redesign Discover Tab with Real Search

**Files:**
- Modify: `app/(tabs)/discover.tsx`

- [ ] **Step 1: Add real search and connect follows to UserContext**

In `app/(tabs)/discover.tsx`:

Add imports:
```tsx
import { SearchInput } from '@/src/components/ui/SearchInput';
import { Card } from '@/src/components/ui/Card';
import { useUser } from '@/src/context/UserContext';
```

Replace the fake search bar (the `GlassCard` with `Search` icon and placeholder text) with:
```tsx
<SearchInput
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search DJs, genres, cities..."
/>
```

Add search state:
```tsx
const [searchQuery, setSearchQuery] = useState('');
```

Filter DJs by search query in the `useMemo`:
```tsx
const filteredDJs = useMemo(() => {
  let filtered = selectedGenre
    ? djs.filter((dj) => dj.genres.includes(selectedGenre))
    : djs;
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (dj) =>
        dj.name.toLowerCase().includes(q) ||
        dj.location.toLowerCase().includes(q) ||
        dj.genres.some((g) => g.toLowerCase().includes(q))
    );
  }
  return filtered;
}, [selectedGenre, searchQuery]);
```

Connect follows to UserContext:
```tsx
const { isFollowing, toggleFollow } = useUser();
```

In DJCard, replace local follow state:
```tsx
<FollowButton
  isFollowing={isFollowing(dj.id)}
  onToggle={() => toggleFollow(dj.id)}
  compact
/>
```

Replace `GlassCard` references with `Card`.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/discover.tsx
git commit -m "feat: Discover tab with real search, UserContext follows, Card component"
```

---

## Task 16: Redesign Profile Tab with Gamification

**Files:**
- Modify: `app/(tabs)/profile.tsx`

- [ ] **Step 1: Connect to UserContext and add gamification**

In `app/(tabs)/profile.tsx`:

Add imports:
```tsx
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { useUser } from '@/src/context/UserContext';
import { useConfetti } from '@/src/hooks/useConfetti';
import { useRouter } from 'expo-router';
```

Connect to context:
```tsx
const { profile, followedDjIds } = useUser();
const { trigger: triggerConfetti, ParticleView } = useConfetti();
const router = useRouter();
```

Update stats to use real counts:
```tsx
<StatCard value={followedDjIds.size} label="Following" />
```

Add `ProgressBar` to incomplete achievements. In the `AchievementCard` component, parse progress string (e.g., "3/5") and render:
```tsx
{!achievement.earned && achievement.progress && (
  <ProgressBar
    progress={parseProgress(achievement.progress)}
    color={colors.accentPrimary}
    height={3}
  />
)}
```

Add helper:
```tsx
function parseProgress(progress: string): number {
  const parts = progress.split('/');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) / parseInt(parts[1], 10);
  }
  return 0;
}
```

Wire settings menu navigation:
```tsx
<MenuItem icon={User} title="Edit Profile" onPress={() => router.push('/settings/edit-profile')} />
<MenuItem icon={Bell} title="Notifications" onPress={() => router.push('/settings/notifications')} />
<MenuItem icon={Shield} title="Privacy" onPress={() => router.push('/settings/privacy')} />
<MenuItem icon={HelpCircle} title="Help & Support" onPress={() => router.push('/settings/help')} />
```

Add confetti `ParticleView` at the top level of the screen (absolutely positioned).

Replace all `GlassCard` with `Card`.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: Profile tab with gamification, ProgressBar, confetti, settings nav"
```

---

## Task 17: Update DJ Detail Screen

**Files:**
- Modify: `app/dj/[id].tsx`

- [ ] **Step 1: Use useParallax, UserContext, add upcoming shows**

In `app/dj/[id].tsx`:

Add imports:
```tsx
import { useParallax } from '@/src/hooks/useParallax';
import { useUser } from '@/src/context/UserContext';
import { Card } from '@/src/components/ui/Card';
import { getUpcomingShowsForDj } from '@/src/data/showService';
```

Replace inline parallax:
```tsx
const scrollY = useSharedValue(0);
const { imageStyle, contentStyle } = useParallax(scrollY);
```

Connect follow to UserContext:
```tsx
const { isFollowing, toggleFollow } = useUser();
```

Pass to FollowButton:
```tsx
<FollowButton isFollowing={isFollowing(id)} onToggle={() => toggleFollow(id)} />
```

Remove the "Message" GradientButton (no backend to support it).

Add upcoming shows section:
```tsx
const [upcomingShows, setUpcomingShows] = useState<ShowSearchResult[]>([]);

useEffect(() => {
  getUpcomingShowsForDj(id).then(setUpcomingShows);
}, [id]);
```

Render below the genre pills:
```tsx
{upcomingShows.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Upcoming Shows</Text>
    {upcomingShows.map((result) => (
      <Pressable key={result.show.id} onPress={() => router.push(`/show/${result.show.id}`)}>
        <Card style={styles.showRow} padding={12} borderRadius={12}>
          <Text style={styles.showName}>{result.show.name}</Text>
          <Text style={styles.showVenue}>{result.venue.name}</Text>
        </Card>
      </Pressable>
    ))}
  </View>
)}
```

Replace all `GlassCard` with `Card`.

- [ ] **Step 2: Commit**

```bash
git add app/dj/[id].tsx
git commit -m "feat: DJ detail uses useParallax, UserContext, shows upcoming shows"
```

---

## Task 18: Update Show Detail Screen

**Files:**
- Modify: `app/show/[id].tsx`

- [ ] **Step 1: Use useParallax, add ShareButton, use Card**

In `app/show/[id].tsx`:

Add imports:
```tsx
import { useParallax } from '@/src/hooks/useParallax';
import { ShareButton } from '@/src/components/ui/ShareButton';
import { Card } from '@/src/components/ui/Card';
```

Replace inline parallax with `useParallax(scrollY)`.

Add ShareButton in the header area (absolute positioned, top-right, opposite the back button):
```tsx
<View style={styles.shareButton}>
  <ShareButton
    title={show.name}
    message={`Check out ${show.name} at ${venue.name} on Mixr!`}
  />
</View>
```

Style:
```tsx
shareButton: {
  position: 'absolute',
  top: 54,
  right: 16,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(0,0,0,0.5)',
  alignItems: 'center',
  justifyContent: 'center',
},
```

Replace all `GlassCard` with `Card`.

- [ ] **Step 2: Commit**

```bash
git add app/show/[id].tsx
git commit -m "feat: Show detail uses useParallax, Card, adds ShareButton"
```

---

## Task 19: Settings Screens

**Files:**
- Create: `app/settings/_layout.tsx`
- Create: `app/settings/edit-profile.tsx`
- Create: `app/settings/notifications.tsx`
- Create: `app/settings/privacy.tsx`
- Create: `app/settings/help.tsx`

- [ ] **Step 1: Create settings layout**

```tsx
// app/settings/_layout.tsx
import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
        headerShadowVisible: false,
      }}
    />
  );
}
```

- [ ] **Step 2: Create Edit Profile screen**

```tsx
// app/settings/edit-profile.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { AnimatedAvatar } from '@/src/components/ui/AnimatedAvatar';
import { Card } from '@/src/components/ui/Card';
import { useUser } from '@/src/context/UserContext';
import { colors, typography, spacing, screen } from '@/src/theme';

export default function EditProfileScreen() {
  const { profile } = useUser();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <View style={styles.avatarSection}>
        <AnimatedAvatar initials={profile.initials} size={80} showRing />
      </View>
      <Card padding={16} borderRadius={16} style={styles.card}>
        <InfoRow label="Name" value={profile.name} />
        <InfoRow label="Handle" value={profile.handle} />
        <InfoRow label="Level" value={`${profile.level} - ${profile.levelTitle}`} />
      </Card>
      <Text style={styles.hint}>Profile editing coming soon</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: screen.paddingH },
  avatarSection: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  card: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  label: { ...typography.bodySm, color: colors.textSecondary },
  value: { ...typography.bodyMedium, color: colors.textPrimary },
  hint: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
```

- [ ] **Step 3: Create Notifications screen**

```tsx
// app/settings/notifications.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/src/components/ui/Card';
import { colors, typography, spacing, screen } from '@/src/theme';

export default function NotificationsScreen() {
  const [showAlerts, setShowAlerts] = useState(true);
  const [newMixes, setNewMixes] = useState(true);
  const [eventReminders, setEventReminders] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Card padding={16} borderRadius={16}>
        <ToggleRow label="Show Alerts" value={showAlerts} onToggle={setShowAlerts} />
        <ToggleRow label="New Mixes" value={newMixes} onToggle={setNewMixes} />
        <ToggleRow label="Event Reminders" value={eventReminders} onToggle={setEventReminders} />
      </Card>
      <Text style={styles.hint}>Notification preferences are not persisted yet</Text>
    </View>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: colors.accentPrimary, false: colors.bgElevated }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: screen.paddingH, paddingTop: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { ...typography.body, color: colors.textPrimary },
  hint: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
```

- [ ] **Step 4: Create Privacy screen**

```tsx
// app/settings/privacy.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/src/components/ui/Card';
import { colors, typography, spacing, screen } from '@/src/theme';

export default function PrivacyScreen() {
  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy' }} />
      <Card padding={16} borderRadius={16}>
        <View style={styles.row}>
          <Text style={styles.label}>Public Profile</Text>
          <Switch value={profilePublic} onValueChange={setProfilePublic} trackColor={{ true: colors.accentPrimary, false: colors.bgElevated }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Show Activity</Text>
          <Switch value={showActivity} onValueChange={setShowActivity} trackColor={{ true: colors.accentPrimary, false: colors.bgElevated }} />
        </View>
      </Card>
      <Text style={styles.hint}>Privacy settings are not persisted yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: screen.paddingH, paddingTop: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  label: { ...typography.body, color: colors.textPrimary },
  hint: { ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
```

- [ ] **Step 5: Create Help screen**

```tsx
// app/settings/help.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/src/components/ui/Card';
import { colors, typography, spacing, screen } from '@/src/theme';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <Card padding={16} borderRadius={16} style={styles.card}>
        <Text style={styles.question}>What is Mixr?</Text>
        <Text style={styles.answer}>
          Mixr is your go-to app for discovering DJs, browsing mixes, and finding upcoming shows in your city.
        </Text>
      </Card>
      <Card padding={16} borderRadius={16} style={styles.card}>
        <Text style={styles.question}>How do I follow a DJ?</Text>
        <Text style={styles.answer}>
          Tap the Follow button on any DJ's profile or from the Discover tab.
        </Text>
      </Card>
      <Card padding={16} borderRadius={16} style={styles.card}>
        <Text style={styles.question}>Need more help?</Text>
        <Text style={styles.answer}>
          Contact us at support@mixr.app
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary, paddingHorizontal: screen.paddingH, paddingTop: spacing.lg },
  card: { marginBottom: spacing.md },
  question: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm },
  answer: { ...typography.body, color: colors.textSecondary },
});
```

- [ ] **Step 6: Register settings routes in root layout**

In `app/_layout.tsx`, add the settings stack screen if not auto-discovered by expo-router's file-based routing. Since we're using a `settings/_layout.tsx`, expo-router should pick it up automatically. But verify the root Stack includes it -- it may need an explicit entry:

```tsx
<Stack.Screen name="settings" options={{ headerShown: false }} />
```

- [ ] **Step 7: Commit**

```bash
git add app/settings/_layout.tsx app/settings/edit-profile.tsx app/settings/notifications.tsx app/settings/privacy.tsx app/settings/help.tsx app/_layout.tsx
git commit -m "feat: add settings screens (edit profile, notifications, privacy, help)"
```

---

## Task 20: Final Integration Pass + Cleanup

**Files:**
- Multiple files for cleanup

- [ ] **Step 1: Remove unused imports across all modified files**

Check each modified screen for unused imports (e.g., `BlurView` imports that are no longer needed after Card replacement, old hook imports).

- [ ] **Step 2: Update spacing between sections**

In each tab screen, ensure `gap: 32` (the new `screen.gap` value) is used between major sections. Update `src/theme/spacing.ts`:

```tsx
export const screen = {
  paddingH: 20,
  statusBarHeight: 62,
  tabBarHeight: 95,
  gap: 32, // increased from 28
} as const;
```

- [ ] **Step 3: Remove legacy modal.tsx**

Delete `app/modal.tsx` -- it's unused boilerplate from the Expo template. Also remove the Stack.Screen entry for it in `app/_layout.tsx` if present.

- [ ] **Step 4: Clean up +not-found.tsx**

Update `app/+not-found.tsx` to use the Mixr design system instead of legacy `@/components/Themed`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgPrimary },
  title: { ...typography.h3, color: colors.textPrimary },
  link: { marginTop: spacing.xl },
  linkText: { ...typography.body, color: colors.accentPrimary },
});
```

- [ ] **Step 5: Verify full app**

Run `npx expo start`. Test each flow:
1. Feed: scroll cards, like/unlike, verify heart animation
2. Discover: search DJs, filter by genre, follow/unfollow
3. Shows: search, apply filters from modal, switch list/map view, sort
4. Profile: view stats, achievements with progress bars, navigate all settings
5. DJ Detail: parallax scroll, follow persists from Discover, upcoming shows listed
6. Show Detail: parallax, share button, get directions, lineup navigation

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: cleanup unused imports, update spacing, remove legacy files"
```

---

## Parallelization Guide for Fullstack Team

These tasks can be parallelized across agents:

**Agent 1 (Design System + Core Components):** Tasks 1, 2, 3, 10, 11, 12
- File ownership: `src/components/ui/*`, `src/theme/*`, `app/(tabs)/_layout.tsx`

**Agent 2 (State + Hooks):** Tasks 4, 5, 6, 7, 8, 9, 13
- File ownership: `src/hooks/*`, `src/context/*`, `app/_layout.tsx`

**Agent 3 (Screens):** Tasks 14, 15, 16, 17, 18, 19, 20
- File ownership: `app/(tabs)/index.tsx`, `app/(tabs)/discover.tsx`, `app/(tabs)/profile.tsx`, `app/dj/*`, `app/show/*`, `app/settings/*`, `app/filter-modal.tsx`
- **Blocked by:** Tasks 1, 4, 5, 10, 11 (needs Card, hooks, UserContext, SearchInput, ProgressBar)

**Dependency order:**
1. Tasks 1-2 (Card, GradientButton) -- no dependencies
2. Tasks 4-5 (hook refactors, UserContext) -- no dependencies
3. Task 3 (tab bar) -- depends on nothing
4. Tasks 6-9 (component updates) -- depend on Tasks 4 (hooks)
5. Tasks 10-12 (new components) -- no dependencies
6. Task 13 (ShowSearchContext wiring) -- depends on Task 5
7. Tasks 14-19 (screen updates) -- depend on Tasks 1, 4-12
8. Task 20 (cleanup) -- depends on all above
