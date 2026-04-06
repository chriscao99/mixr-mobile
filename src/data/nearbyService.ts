import { Coordinate, ShowSearchResult, RankedNearbyShow, NearbyRankingWeights, DistanceInfo } from '@/src/types';
import { shows, venues, djs, genres } from './mockData';
import { haversine, createDistanceInfo } from './geoUtils';
import { daysFromNow } from './dateUtils';

const DEFAULT_WEIGHTS: NearbyRankingWeights = {
  proximity: 0.40,
  timeUrgency: 0.30,
  socialSignal: 0.20,
};

function resolveShowResult(show: typeof shows[number], userCoord: Coordinate): ShowSearchResult & { distanceKm: number } {
  const venue = venues.find((v) => v.id === show.venueId)!;
  const showDjs = djs.filter((d) => show.djIds.includes(d.id));
  const showGenres = genres.filter((g) => show.genreIds.includes(g.id));
  const distanceKm = haversine(userCoord.latitude, userCoord.longitude, venue.latitude, venue.longitude);
  return {
    show,
    venue,
    djs: showDjs,
    genres: showGenres,
    distance: distanceKm,
    distanceKm,
  };
}

export function computeProximityScore(distanceKm: number, maxKm: number = 50): number {
  return Math.max(0, 100 * (1 - distanceKm / maxKm));
}

export function computeTimeUrgencyScore(showDate: string, showStartTime: string): number {
  const showStart = new Date(showStartTime).getTime();
  const now = Date.now();
  const hoursUntil = (showStart - now) / 3600000;
  if (hoursUntil < 0) return 0; // past show
  if (hoursUntil <= 2) return 100;
  if (hoursUntil <= 24) return 80;
  if (hoursUntil <= 72) return 50;
  if (hoursUntil <= 168) return 20;
  return 5;
}

export function computeSocialScore(djIds: string[], followedDjIds: string[]): number {
  const followedCount = djIds.filter((id) => followedDjIds.includes(id)).length;
  if (followedCount === 0) return 0;
  return Math.min(100, 50 + followedCount * 25);
}

export function rankNearbyShows(
  userCoord: Coordinate,
  followedDjIds: string[],
  options?: {
    maxDistanceKm?: number;
    maxResults?: number;
    weights?: Partial<NearbyRankingWeights>;
    isApproximate?: boolean;
  },
): RankedNearbyShow[] {
  const maxDist = options?.maxDistanceKm ?? 50;
  const maxResults = options?.maxResults ?? 8;
  const weights = { ...DEFAULT_WEIGHTS, ...(options?.weights ?? {}) };
  const popularityWeight = Math.max(0, 1 - weights.proximity - weights.timeUrgency - weights.socialSignal);
  const isApproximate = options?.isApproximate ?? false;
  const today = daysFromNow(0);

  // Filter and resolve shows
  const results = shows
    .filter((s) => s.date >= today)
    .map((s) => resolveShowResult(s, userCoord))
    .filter((r) => r.distanceKm <= maxDist);

  // Score and rank
  const ranked: RankedNearbyShow[] = results.map((r) => {
    const proximityScore = computeProximityScore(r.distanceKm, maxDist);
    const timeScore = computeTimeUrgencyScore(r.show.date, r.show.startTime);
    const socialScore = computeSocialScore(r.show.djIds, followedDjIds);
    const popularityScore = r.show.popularity;
    const hasFollowedDj = r.show.djIds.some((id) => followedDjIds.includes(id));

    const score =
      proximityScore * weights.proximity +
      timeScore * weights.timeUrgency +
      socialScore * weights.socialSignal +
      popularityScore * popularityWeight;

    const distance: DistanceInfo = createDistanceInfo(r.distanceKm, isApproximate);

    return {
      result: { show: r.show, venue: r.venue, djs: r.djs, genres: r.genres, distance: r.distance, distanceInfo: distance },
      distance,
      score,
      hasFollowedDj,
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, maxResults);
}
