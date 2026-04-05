import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { House, Search, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { colors, typography } from '../../src/theme';

const TAB_BAR_HEIGHT = 85;

const tabs = [
  { name: 'index', label: 'FEED', icon: House },
  { name: 'discover', label: 'DISCOVER', icon: Search },
  { name: 'profile', label: 'PROFILE', icon: User },
] as const;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);

  const activeIndex = state.index;

  React.useEffect(() => {
    if (tabWidth.value > 0) {
      indicatorX.value = withSpring(activeIndex * tabWidth.value, {
        damping: 20,
        stiffness: 200,
        mass: 0.5,
      });
    }
  }, [activeIndex, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth.value,
  }));

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarInner}>
        {/* Sliding pill indicator */}
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
                if (index === 0) {
                  tabWidth.value = e.nativeEvent.layout.width;
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
              <Animated.Text
                style={[
                  styles.tabLabel,
                  { color },
                ]}
              >
                {tab.label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.bgNav,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    overflow: 'hidden',
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    ...typography.tabLabel,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  indicator: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.accentPrimary,
  },
});
