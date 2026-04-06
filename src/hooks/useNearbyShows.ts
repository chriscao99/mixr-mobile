import { useState, useEffect, useCallback } from 'react';
import { RankedNearbyShow } from '@/src/types';
import { useLocationContext } from '@/src/context/LocationContext';
import { useUserContext } from '@/src/context/UserContext';
import { rankNearbyShows } from '@/src/data/nearbyService';

interface UseNearbyShowsReturn {
  shows: RankedNearbyShow[];
  isLoading: boolean;
  hasLocation: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useNearbyShows(options?: {
  maxResults?: number;
  maxDistanceKm?: number;
}): UseNearbyShowsReturn {
  const { effectiveLocation, isApproximate, isLoading: locationLoading } = useLocationContext();
  const { followedDjIds } = useUserContext();
  const [shows, setShows] = useState<RankedNearbyShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNearby = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const ranked = rankNearbyShows(effectiveLocation, followedDjIds, {
        maxDistanceKm: options?.maxDistanceKm ?? 50,
        maxResults: options?.maxResults ?? 8,
        isApproximate,
      });
      setShows(ranked);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load nearby shows'));
    } finally {
      setIsLoading(false);
    }
  }, [effectiveLocation.latitude, effectiveLocation.longitude, followedDjIds, isApproximate, options?.maxDistanceKm, options?.maxResults]);

  useEffect(() => {
    if (!locationLoading) {
      fetchNearby();
    }
  }, [locationLoading, fetchNearby]);

  return {
    shows,
    isLoading: isLoading || locationLoading,
    hasLocation: !isApproximate,
    error,
    refresh: fetchNearby,
  };
}
