import {
  Show,
  Venue,
  City,
  ShowFilter,
  ShowSortOption,
  ShowSearchResult,
  PaginatedResult,
  Coordinate,
  CustomDateRange,
  DateRangePreset,
} from '@/src/types';
import { shows, venues, djs, genres } from './mockData';
import { daysFromNow, resolveDateRange, isDateInRange } from './dateUtils';
import { haversine } from './geoUtils';
import { computeProximityScore, computeTimeUrgencyScore, computeSocialScore } from './nearbyService';

// --- Internal helpers ---

function resolveShow(show: Show, userLocation?: Coordinate): ShowSearchResult {
  const venue = venues.find((v) => v.id === show.venueId)!;
  const showDjs = djs.filter((d) => show.djIds.includes(d.id));
  const showGenres = genres.filter((g) => show.genreIds.includes(g.id));
  const distance = userLocation
    ? haversine(userLocation.latitude, userLocation.longitude, venue.latitude, venue.longitude)
    : undefined;
  return { show, venue, djs: showDjs, genres: showGenres, distance };
}

function matchesTextQuery(result: ShowSearchResult, query: string): boolean {
  const q = query.toLowerCase();
  if (result.show.name.toLowerCase().includes(q)) return true;
  if (result.show.tags?.some((t) => t.toLowerCase().includes(q))) return true;
  if (result.djs.some((d) => d.name.toLowerCase().includes(q))) return true;
  if (result.venue.name.toLowerCase().includes(q)) return true;
  return false;
}

function isPreset(
  dateRange: DateRangePreset | CustomDateRange
): dateRange is DateRangePreset {
  return typeof dateRange === 'string';
}

// --- Public API ---

/**
 * Main search entry point. Applies filters, sorts, paginates, and resolves related entities.
 * Filter chain order follows the architecture spec exactly.
 */
export async function searchShows(
  filter: ShowFilter,
  sort: ShowSortOption,
  page: number,
  pageSize: number,
  userLocation?: Coordinate
): Promise<PaginatedResult<ShowSearchResult>> {
  const today = daysFromNow(0);

  // Start with all shows
  let filtered = [...shows];

  // 1. Default date gate: if no dateRange, exclude past shows
  if (!filter.dateRange) {
    filtered = filtered.filter((s) => s.date >= today);
  }

  // 2. Date range filtering
  if (filter.dateRange) {
    let startDate: string;
    let endDate: string;
    if (isPreset(filter.dateRange)) {
      const range = resolveDateRange(filter.dateRange);
      startDate = range.startDate;
      endDate = range.endDate;
    } else {
      startDate = filter.dateRange.startDate;
      endDate = filter.dateRange.endDate;
    }
    filtered = filtered.filter((s) => isDateInRange(s.date, startDate, endDate));
  }

  // Resolve all remaining shows to full search results for text matching
  let results = filtered.map((s) => resolveShow(s, userLocation));

  // 3. Text search
  if (filter.query && filter.query.trim().length > 0) {
    results = results.filter((r) => matchesTextQuery(r, filter.query!));
  }

  // 4. Genre filter
  if (filter.genreIds && filter.genreIds.length > 0) {
    results = results.filter((r) =>
      r.show.genreIds.some((gid) => filter.genreIds!.includes(gid))
    );
  }

  // 5. Venue/City filter
  if (filter.venueIds && filter.venueIds.length > 0) {
    results = results.filter((r) => filter.venueIds!.includes(r.show.venueId));
  }
  if (filter.cities && filter.cities.length > 0) {
    results = results.filter((r) => filter.cities!.includes(r.venue.city));
  }

  // 6. DJ filter
  if (filter.djIds && filter.djIds.length > 0) {
    results = results.filter((r) =>
      r.show.djIds.some((did) => filter.djIds!.includes(did))
    );
  }

  // 7. Price filter
  if (filter.priceMax !== undefined) {
    results = results.filter(
      (r) => r.show.priceMin === undefined || r.show.priceMin <= filter.priceMax!
    );
  }

  // 8. Sold out filter
  if (filter.excludeSoldOut) {
    results = results.filter((r) => !r.show.isSoldOut);
  }

  // 8.5 Distance filter
  if (filter.maxDistanceKm !== undefined && userLocation) {
    results = results.filter(
      (r) => r.distance !== undefined && r.distance <= filter.maxDistanceKm!
    );
  }

  // 8.6 Followed DJs only
  if (filter.followedDjsOnly) {
    const followedIds = new Set(djs.filter((d) => d.isFollowing).map((d) => d.id));
    results = results.filter(
      (r) => r.show.djIds.some((id) => followedIds.has(id))
    );
  }

  // 9. Sort
  results = sortResults(results, sort, userLocation);

  // 10. Paginate
  const total = results.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const paged = results.slice(start, end);

  return {
    items: paged,
    total,
    page,
    pageSize,
    hasMore: end < total,
  };
}

function sortResults(
  results: ShowSearchResult[],
  sort: ShowSortOption,
  userLocation?: Coordinate
): ShowSearchResult[] {
  const sorted = [...results];
  const dir = sort.direction === 'asc' ? 1 : -1;

  switch (sort.field) {
    case 'date':
      sorted.sort((a, b) => dir * a.show.startTime.localeCompare(b.show.startTime));
      break;
    case 'popularity':
      sorted.sort((a, b) => dir * (a.show.popularity - b.show.popularity));
      break;
    case 'distance':
      if (userLocation) {
        sorted.sort((a, b) => dir * ((a.distance ?? Infinity) - (b.distance ?? Infinity)));
      } else {
        // Fall back to date sort (ascending) when no location
        sorted.sort((a, b) => a.show.startTime.localeCompare(b.show.startTime));
      }
      break;
    case 'nearby_rank':
      if (userLocation) {
        const followedDjIds = djs.filter((d) => d.isFollowing).map((d) => d.id);
        sorted.sort((a, b) => {
          const scoreA = computeNearbyRank(a, userLocation, followedDjIds);
          const scoreB = computeNearbyRank(b, userLocation, followedDjIds);
          return dir * (scoreB - scoreA);
        });
      } else {
        sorted.sort((a, b) => a.show.startTime.localeCompare(b.show.startTime));
      }
      break;
  }

  return sorted;
}

function computeNearbyRank(
  result: ShowSearchResult,
  userLocation: Coordinate,
  followedDjIds: string[],
): number {
  const distKm = result.distance ?? 999;
  return (
    computeProximityScore(distKm) * 0.40 +
    computeTimeUrgencyScore(result.show.date, result.show.startTime) * 0.30 +
    computeSocialScore(result.show.djIds, followedDjIds) * 0.20 +
    result.show.popularity * 0.10
  );
}

/**
 * Single show detail with resolved venue/DJs/genres.
 */
export async function getShowById(id: string): Promise<ShowSearchResult | null> {
  const show = shows.find((s) => s.id === id);
  if (!show) return null;
  return resolveShow(show);
}

/**
 * All venues (for filter picker).
 */
export async function getVenues(): Promise<Venue[]> {
  return [...venues];
}

/**
 * Derived unique cities with show counts (for filter picker).
 */
export async function getCities(): Promise<City[]> {
  const today = daysFromNow(0);
  const upcomingShows = shows.filter((s) => s.date >= today);

  const cityMap = new Map<string, City>();

  for (const show of upcomingShows) {
    const venue = venues.find((v) => v.id === show.venueId);
    if (!venue) continue;

    const key = `${venue.city}, ${venue.state}`;
    const existing = cityMap.get(key);
    if (existing) {
      existing.showCount++;
    } else {
      cityMap.set(key, { name: venue.city, state: venue.state, showCount: 1 });
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => b.showCount - a.showCount);
}

/**
 * Shows for a specific DJ, sorted by date ascending.
 */
export async function getUpcomingShowsForDj(djId: string): Promise<ShowSearchResult[]> {
  const today = daysFromNow(0);
  return shows
    .filter((s) => s.djIds.includes(djId) && s.date >= today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => resolveShow(s));
}

/**
 * Shows at a specific venue, sorted by date ascending.
 */
export async function getShowsAtVenue(venueId: string): Promise<ShowSearchResult[]> {
  const today = daysFromNow(0);
  return shows
    .filter((s) => s.venueId === venueId && s.date >= today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((s) => resolveShow(s));
}
