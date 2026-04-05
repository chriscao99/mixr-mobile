import { DJ, Genre } from './index';

// --- Venue ---

export type VenueType = 'club' | 'warehouse' | 'festival_grounds' | 'rooftop' | 'bar' | 'arena';

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  capacity?: number;
  venueType: VenueType;
}

// --- Show ---

export interface Show {
  id: string;
  name: string;
  description?: string;
  djIds: string[];
  venueId: string;
  genreIds: string[];
  imageUrl: string;
  date: string;
  startTime: string;
  endTime?: string;
  doorsOpen?: string;
  priceMin?: number;
  priceMax?: number;
  isSoldOut: boolean;
  popularity: number;
  tags?: string[];
}

// --- City (derived, not stored) ---

export interface City {
  name: string;
  state: string;
  showCount: number;
}

// --- Filter & Search ---

export type DateRangePreset = 'today' | 'this_week' | 'this_weekend' | 'next_week' | 'this_month';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export interface ShowFilter {
  query?: string;
  dateRange?: DateRangePreset | CustomDateRange;
  genreIds?: string[];
  venueIds?: string[];
  cities?: string[];
  djIds?: string[];
  priceMax?: number;
  excludeSoldOut?: boolean;
}

export type ShowSortField = 'date' | 'distance' | 'popularity';
export type ShowSortDirection = 'asc' | 'desc';

export interface ShowSortOption {
  field: ShowSortField;
  direction: ShowSortDirection;
}

// --- Search Result ---

export interface ShowSearchResult {
  show: Show;
  venue: Venue;
  djs: DJ[];
  genres: Genre[];
  distance?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --- Saved Filter ---

export interface SavedFilter {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  filter: ShowFilter;
  isDefault?: boolean;
}

// --- Geo ---

export interface Coordinate {
  latitude: number;
  longitude: number;
}
