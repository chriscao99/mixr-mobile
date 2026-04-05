import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography } from '@/src/theme';

interface ShowMapPinProps {
  price?: number;
  isSelected?: boolean;
  genreColor?: string;
}

export const ShowMapPin = React.memo(
  function ShowMapPin({
    price,
    isSelected = false,
    genreColor = colors.accentPrimary,
  }: ShowMapPinProps) {
    const label =
      price === undefined
        ? '?'
        : price === 0
          ? 'FREE'
          : `$${price}`;

    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.pin,
            { backgroundColor: isSelected ? colors.accentPrimary : colors.bgCard },
            isSelected && styles.pinSelected,
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: isSelected ? colors.white : genreColor },
            ]}
          >
            {label}
          </Text>
        </View>
        <View
          style={[
            styles.arrow,
            {
              borderTopColor: isSelected ? colors.accentPrimary : colors.bgCard,
            },
          ]}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.price === next.price &&
    prev.isSelected === next.isSelected &&
    prev.genreColor === next.genreColor
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  pin: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    minWidth: 36,
    alignItems: 'center',
  },
  pinSelected: {
    borderColor: colors.accentPrimary,
    transform: [{ scale: 1.15 }],
  },
  label: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
