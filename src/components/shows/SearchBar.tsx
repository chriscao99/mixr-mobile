import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '@/src/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = React.memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search shows, DJs, venues...',
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const focus = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [colors.borderGlass, colors.accentPrimary]
    );
    return { borderColor };
  });

  const handleFocus = () => {
    focus.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleBlur = () => {
    focus.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <AnimatedView style={[styles.container, containerStyle]}>
      <Search size={18} color={colors.textMuted} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={12}>
          <X size={18} color={colors.textMuted} />
        </Pressable>
      )}
    </AnimatedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bgGlass,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
});
