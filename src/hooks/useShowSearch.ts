import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShowFilter,
  ShowSortOption,
  ShowSearchResult,
  Coordinate,
} from '@/src/types';
import { searchShows } from '@/src/data/showService';
import { useDebounce } from './useDebounce';

const PAGE_SIZE = 10;

const DEFAULT_SORT: ShowSortOption = { field: 'date', direction: 'asc' };
const EMPTY_FILTER: ShowFilter = {};

export interface UseShowSearchReturn {
  query: string;
  filter: ShowFilter;
  sort: ShowSortOption;
  results: ShowSearchResult[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;

  setQuery: (q: string) => void;
  setFilter: (f: ShowFilter) => void;
  updateFilter: (partial: Partial<ShowFilter>) => void;
  clearFilter: () => void;
  setSort: (s: ShowSortOption) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useShowSearch(userLocation?: Coordinate | null): UseShowSearchReturn {
  const [query, setQueryRaw] = useState('');
  const [filter, setFilterRaw] = useState<ShowFilter>(EMPTY_FILTER);
  const [sort, setSortRaw] = useState<ShowSortOption>(DEFAULT_SORT);
  const [results, setResults] = useState<ShowSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);

  // Generation counter to invalidate stale responses
  const generation = useRef(0);

  const debouncedQuery = useDebounce(query, 300);

  // Refs to hold latest values so executeSearch never captures stale closures
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const debouncedQueryRef = useRef(debouncedQuery);
  debouncedQueryRef.current = debouncedQuery;
  const sortRef = useRef(sort);
  sortRef.current = sort;
  const userLocationRef = useRef(userLocation);
  userLocationRef.current = userLocation;

  const executeSearch = useCallback(
    async (searchPage: number, append: boolean) => {
      const gen = ++generation.current;
      setIsLoading(true);
      setError(null);

      // Read latest values from refs to avoid stale closures
      const effectiveFilter: ShowFilter = {
        ...filterRef.current,
        query: debouncedQueryRef.current || undefined,
      };
      const currentSort = sortRef.current;
      const currentLocation = userLocationRef.current;

      try {
        const result = await searchShows(
          effectiveFilter,
          currentSort,
          searchPage,
          PAGE_SIZE,
          currentLocation ?? undefined
        );

        // Ignore stale results
        if (gen !== generation.current) return;

        if (append) {
          setResults((prev) => [...prev, ...result.items]);
        } else {
          setResults(result.items);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        if (gen !== generation.current) return;
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        if (gen === generation.current) {
          setIsLoading(false);
        }
      }
    },
    [] // stable — reads from refs, no external deps
  );

  // Re-search when filter/sort/query changes
  useEffect(() => {
    setPage(0);
    executeSearch(0, false);
  }, [debouncedQuery, filter, sort, userLocation?.latitude, userLocation?.longitude, executeSearch]);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
  }, []);

  const setFilter = useCallback((f: ShowFilter) => {
    setFilterRaw(f);
    setPage(0);
  }, []);

  const updateFilter = useCallback((partial: Partial<ShowFilter>) => {
    setFilterRaw((prev) => ({ ...prev, ...partial }));
    setPage(0);
  }, []);

  const clearFilter = useCallback(() => {
    setFilterRaw(EMPTY_FILTER);
    setQueryRaw('');
    setPage(0);
  }, []);

  const setSort = useCallback((s: ShowSortOption) => {
    setSortRaw(s);
    setPage(0);
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(nextPage, true);
  }, [isLoading, hasMore, page, executeSearch]);

  const refresh = useCallback(() => {
    setPage(0);
    executeSearch(0, false);
  }, [executeSearch]);

  return {
    query,
    filter,
    sort,
    results,
    total,
    hasMore,
    isLoading,
    error,
    setQuery,
    setFilter,
    updateFilter,
    clearFilter,
    setSort,
    loadMore,
    refresh,
  };
}
