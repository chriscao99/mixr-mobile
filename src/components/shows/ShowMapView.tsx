import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/src/theme';
import { ShowSearchResult, Coordinate } from '@/src/types';
import { ShowCard } from './ShowCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

let MapView: any = null;
let Marker: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch {
  // react-native-maps not installed
}

interface ShowMapViewProps {
  results: ShowSearchResult[];
  userLocation?: Coordinate | null;
}

export function ShowMapView({ results, userLocation }: ShowMapViewProps) {
  const mapRef = useRef<any>(null);
  const [selectedShow, setSelectedShow] = useState<ShowSearchResult | null>(null);

  // Fit map to results when they change
  useEffect(() => {
    if (!mapRef.current || results.length === 0) return;

    const coordinates = results.map((r) => ({
      latitude: r.venue.latitude,
      longitude: r.venue.longitude,
    }));

    setTimeout(() => {
      mapRef.current?.fitToCoordinates?.(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 200, left: 60 },
        animated: true,
      });
    }, 300);
  }, [results]);

  if (!MapView) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Map View</Text>
        <Text style={styles.fallbackText}>
          react-native-maps is not installed.{'\n'}
          Install it to see shows on a map.
        </Text>
        <Text style={styles.fallbackCount}>
          {results.length} shows in results
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: userLocation?.latitude ?? 34.0522,
    longitude: userLocation?.longitude ?? -118.2437,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        onPress={() => setSelectedShow(null)}
      >
        {results.map((result) => {
          const isSelected = selectedShow?.show.id === result.show.id;
          return (
            <Marker
              key={result.show.id}
              coordinate={{
                latitude: result.venue.latitude,
                longitude: result.venue.longitude,
              }}
              title={result.show.name}
              onPress={() => setSelectedShow(result)}
            >
              <View style={styles.markerWrapper}>
                <View
                  style={[
                    styles.marker,
                    isSelected && styles.markerSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.markerText,
                      isSelected && styles.markerTextSelected,
                    ]}
                  >
                    {result.show.priceMin === 0
                      ? 'FREE'
                      : `$${result.show.priceMin ?? '?'}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.markerArrow,
                    {
                      borderTopColor: isSelected
                        ? colors.accentPrimary
                        : colors.bgCard,
                    },
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Bottom preview card */}
      {selectedShow && (
        <View style={styles.previewContainer}>
          <ShowCard result={selectedShow} index={0} compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    minHeight: 300,
  },
  fallbackTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  fallbackText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fallbackCount: {
    ...typography.label,
    color: colors.accentPrimary,
    marginTop: spacing.md,
  },
  previewContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  marker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    minWidth: 36,
    alignItems: 'center',
  },
  markerSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.accentPrimary,
  },
  markerTextSelected: {
    color: colors.white,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.bgCard,
    marginTop: -1,
  },
});
