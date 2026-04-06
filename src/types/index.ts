import { Coordinate } from './show';
import { DistanceInfo } from './location';

export interface DJ {
  id: string;
  name: string;
  location: string;
  genres: string[];
  imageUrl: string;
  followers: number;
  shows: number;
  rating: number;
  isFollowing: boolean;
  homeCoordinate?: Coordinate;
}

export interface FeedItem {
  id: string;
  dj: DJ;
  type: 'new_mix' | 'upcoming_show' | 'collab' | 'announcement' | 'nearby_show' | 'followed_dj_nearby';
  title: string;
  subtitle: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
  showId?: string;
  distanceInfo?: DistanceInfo;
  venueName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  initials: string;
  level: number;
  levelTitle: string;
  streak: number;
  following: number;
  liked: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  gradientColors: [string, string];
}

export type {
  Venue,
  VenueType,
  Show,
  City,
  DateRangePreset,
  CustomDateRange,
  ShowFilter,
  ShowSortField,
  ShowSortDirection,
  ShowSortOption,
  ShowSearchResult,
  PaginatedResult,
  SavedFilter,
  Coordinate,
} from './show';

export type {
  LocationPermissionStatus,
  UserLocation,
  LocationState,
  DistanceUnit,
  DistanceInfo,
  NearbyRankingWeights,
  RankedNearbyShow,
} from './location';
