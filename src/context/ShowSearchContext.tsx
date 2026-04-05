import React, { createContext, useContext } from 'react';
import { UseShowSearchReturn, useShowSearch } from '@/src/hooks/useShowSearch';
import { UseSavedFiltersReturn, useSavedFilters } from '@/src/hooks/useSavedFilters';
import { Coordinate } from '@/src/types';

interface ShowSearchContextValue extends UseShowSearchReturn {
  savedFilters: UseSavedFiltersReturn;
}

const ShowSearchContext = createContext<ShowSearchContextValue | null>(null);

export function ShowSearchProvider({
  children,
  userLocation,
}: {
  children: React.ReactNode;
  userLocation?: Coordinate | null;
}) {
  const search = useShowSearch(userLocation);
  const savedFilters = useSavedFilters();

  return (
    <ShowSearchContext.Provider value={{ ...search, savedFilters }}>
      {children}
    </ShowSearchContext.Provider>
  );
}

export function useShowSearchContext(): ShowSearchContextValue {
  const ctx = useContext(ShowSearchContext);
  if (!ctx) {
    throw new Error('useShowSearchContext must be used within ShowSearchProvider');
  }
  return ctx;
}
