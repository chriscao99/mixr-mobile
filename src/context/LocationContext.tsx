import React, { createContext, useContext, useMemo } from 'react';
import { useUserLocation, UseUserLocationReturn } from '@/src/hooks/useUserLocation';
import { Coordinate, LocationPermissionStatus } from '@/src/types';
import { DEFAULT_LOCATION, getCityFromCoordinate } from '@/src/data/geoUtils';

interface LocationContextValue {
  permission: LocationPermissionStatus;
  effectiveLocation: Coordinate;
  cityLabel: string | null;
  isLoading: boolean;
  isApproximate: boolean;
  requestPermission: () => Promise<LocationPermissionStatus>;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const location = useUserLocation();

  const coord = location.coordinate;
  const lat = coord?.latitude ?? DEFAULT_LOCATION.latitude;
  const lng = coord?.longitude ?? DEFAULT_LOCATION.longitude;
  const isApproximate = location.state.userLocation?.source !== 'gps';

  const effectiveLocation = useMemo<Coordinate>(
    () => coord ?? DEFAULT_LOCATION,
    [lat, lng]
  );

  const cityLabel = useMemo(
    () => getCityFromCoordinate(effectiveLocation),
    [lat, lng]
  );

  const value = useMemo<LocationContextValue>(
    () => ({
      permission: location.state.permission,
      effectiveLocation,
      cityLabel,
      isLoading: location.state.isLoading,
      isApproximate,
      requestPermission: location.requestPermission,
      refreshLocation: location.refreshLocation,
    }),
    [
      location.state.permission,
      effectiveLocation,
      cityLabel,
      location.state.isLoading,
      isApproximate,
      location.requestPermission,
      location.refreshLocation,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return ctx;
}
