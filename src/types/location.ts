import { Coordinate, ShowSearchResult } from './show';

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface UserLocation {
  coordinate: Coordinate;
  accuracy?: number;
  timestamp: number;
  source: 'gps' | 'default';
}

export interface LocationState {
  permission: LocationPermissionStatus;
  userLocation: UserLocation | null;
  isLoading: boolean;
  error?: string;
}

export type DistanceUnit = 'mi' | 'km';

export interface DistanceInfo {
  distanceKm: number;
  displayText: string;
  isApproximate: boolean;
}

export interface NearbyRankingWeights {
  proximity: number;
  timeUrgency: number;
  socialSignal: number;
}

export interface RankedNearbyShow {
  result: ShowSearchResult;
  distance: DistanceInfo;
  score: number;
  hasFollowedDj: boolean;
}
