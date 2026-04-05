import { useState, useEffect, useCallback } from 'react';
import { SavedFilter, ShowFilter } from '@/src/types';
import {
  getSavedFilters,
  saveFilter as saveFilterApi,
  deleteFilter as deleteFilterApi,
} from '@/src/data/filterStorage';

export interface UseSavedFiltersReturn {
  filters: SavedFilter[];
  isLoading: boolean;
  save: (name: string, filter: ShowFilter) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useSavedFilters(): UseSavedFiltersReturn {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await getSavedFilters();
        if (mounted) setFilters(saved);
      } catch {
        // Ignore load errors, start with empty
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const save = useCallback(async (name: string, filter: ShowFilter) => {
    const newFilter = await saveFilterApi(name, filter);
    setFilters((prev) => [...prev, newFilter]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteFilterApi(id);
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { filters, isLoading, save, remove };
}
