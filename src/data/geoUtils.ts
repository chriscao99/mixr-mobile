import { Coordinate } from '@/src/types';
import { DistanceInfo, DistanceUnit } from '@/src/types/location';

/**
 * Computes the great-circle distance between two points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Default user location: downtown Los Angeles */
export const DEFAULT_LOCATION: Coordinate = {
  latitude: 34.0522,
  longitude: -118.2437,
};

export const LOCATION_PRESETS: Record<string, Coordinate> = {
  los_angeles: { latitude: 34.0522, longitude: -118.2437 },
  new_york: { latitude: 40.7128, longitude: -74.0060 },
  miami: { latitude: 25.7617, longitude: -80.1918 },
  chicago: { latitude: 41.8781, longitude: -87.6298 },
  atlanta: { latitude: 33.7490, longitude: -84.3880 },
};

const KM_TO_MI = 0.621371;

export function formatDistance(km: number, unit: DistanceUnit = 'mi'): string {
  const value = unit === 'mi' ? km * KM_TO_MI : km;
  if (value < 1) return `< 1 ${unit}`;
  if (value < 10) return `${value.toFixed(1)} ${unit}`;
  return `${Math.round(value)} ${unit}`;
}

export function createDistanceInfo(
  km: number,
  isApproximate: boolean,
  unit: DistanceUnit = 'mi',
): DistanceInfo {
  return {
    distanceKm: km,
    displayText: isApproximate ? `~${formatDistance(km, unit)}` : formatDistance(km, unit),
    isApproximate,
  };
}

export function getCityFromCoordinate(coord: Coordinate): string | null {
  // Simple reverse geocode using presets — checks which preset city is closest
  let closest: { name: string; dist: number } | null = null;
  const cityNames: Record<string, string> = {
    los_angeles: 'Los Angeles, CA',
    new_york: 'New York, NY',
    miami: 'Miami, FL',
    chicago: 'Chicago, IL',
    atlanta: 'Atlanta, GA',
  };
  for (const [key, preset] of Object.entries(LOCATION_PRESETS)) {
    const dist = haversine(coord.latitude, coord.longitude, preset.latitude, preset.longitude);
    if (!closest || dist < closest.dist) {
      closest = { name: cityNames[key], dist };
    }
  }
  // Only return a city name if within 50km
  return closest && closest.dist < 50 ? closest.name : null;
}
