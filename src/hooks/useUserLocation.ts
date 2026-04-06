import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationState, LocationPermissionStatus, UserLocation } from '@/src/types';
import { Coordinate } from '@/src/types';
import { DEFAULT_LOCATION } from '@/src/data/geoUtils';

const CACHE_KEY = '@mixr/last_location';

async function getCachedLocation(): Promise<Coordinate | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

async function setCachedLocation(coord: Coordinate): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(coord));
  } catch {}
}

export interface UseUserLocationReturn {
  state: LocationState;
  coordinate: Coordinate | null;
  requestPermission: () => Promise<LocationPermissionStatus>;
  refreshLocation: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationReturn {
  const [state, setState] = useState<LocationState>({
    permission: 'undetermined',
    userLocation: null,
    isLoading: true,
  });

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  const fetchGPS = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const userLocation: UserLocation = {
        coordinate: coord,
        accuracy: location.coords.accuracy ?? undefined,
        timestamp: Date.now(),
        source: 'gps',
      };
      setState((prev) => ({
        ...prev,
        userLocation,
        isLoading: false,
        error: undefined,
      }));
      await setCachedLocation(coord);
    } catch (err) {
      // Try cached location
      const cached = await getCachedLocation();
      if (cached) {
        setState((prev) => ({
          ...prev,
          userLocation: {
            coordinate: cached,
            timestamp: Date.now(),
            source: 'default',
          },
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          userLocation: {
            coordinate: DEFAULT_LOCATION,
            timestamp: Date.now(),
            source: 'default',
          },
          isLoading: false,
          error: 'Could not determine location',
        }));
      }
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Load cached location immediately for instant display
        const cached = await getCachedLocation();
        if (cached && mounted) {
          setState((prev) => ({
            ...prev,
            userLocation: {
              coordinate: cached,
              timestamp: Date.now(),
              source: 'default',
            },
          }));
        }

        // Check current permission status (no prompt)
        const { status } = await Location.getForegroundPermissionsAsync();
        const permission: LocationPermissionStatus =
          status === Location.PermissionStatus.GRANTED
            ? 'granted'
            : status === Location.PermissionStatus.DENIED
            ? 'denied'
            : 'undetermined';

        if (!mounted) return;
        setState((prev) => ({ ...prev, permission }));

        if (permission === 'granted') {
          await fetchGPS();
        } else {
          // Use cached or default
          setState((prev) => ({
            ...prev,
            isLoading: false,
            userLocation: prev.userLocation ?? {
              coordinate: DEFAULT_LOCATION,
              timestamp: Date.now(),
              source: 'default',
            },
          }));
        }
      } catch {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            userLocation: {
              coordinate: DEFAULT_LOCATION,
              timestamp: Date.now(),
              source: 'default',
            },
          }));
        }
      }
    }

    init();
    return () => { mounted = false; };
  }, [fetchGPS]);

  const requestPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permission: LocationPermissionStatus =
      status === Location.PermissionStatus.GRANTED
        ? 'granted'
        : status === Location.PermissionStatus.DENIED
        ? 'denied'
        : 'undetermined';

    setState((prev) => ({ ...prev, permission }));

    if (permission === 'granted') {
      setState((prev) => ({ ...prev, isLoading: true }));
      await fetchGPS();
    }

    return permission;
  }, [fetchGPS]);

  const refreshLocation = useCallback(async () => {
    if (state.permission === 'granted') {
      setState((prev) => ({ ...prev, isLoading: true }));
      await fetchGPS();
    }
  }, [state.permission, fetchGPS]);

  // Cleanup watch subscription on unmount
  useEffect(() => {
    return () => {
      watchSubscription.current?.remove();
    };
  }, []);

  return {
    state,
    coordinate: state.userLocation?.coordinate ?? null,
    requestPermission,
    refreshLocation,
  };
}
