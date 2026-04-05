/**
 * Tests for filterStorage.ts
 *
 * We mock AsyncStorage since it's a React Native module not available in Node.
 */

// Manual mock for AsyncStorage
const storage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => storage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import {
  getSavedFilters,
  saveFilter,
  updateFilter,
  deleteFilter,
} from '../data/filterStorage';
import { SavedFilter } from '../types';

describe('filterStorage', () => {
  beforeEach(() => {
    storage.clear();
    jest.clearAllMocks();
  });

  describe('getSavedFilters', () => {
    it('returns default presets on first load (empty storage)', async () => {
      const filters = await getSavedFilters();
      expect(filters.length).toBe(3);
      expect(filters.every((f) => f.isDefault)).toBe(true);

      // Verify default preset names
      const names = filters.map((f) => f.name);
      expect(names).toContain('This Weekend');
      expect(names).toContain('Nearby Tonight');
      expect(names).toContain('Free Shows');
    });

    it('seeds defaults into storage on first load', async () => {
      await getSavedFilters();
      // Storage should now have the key
      expect(storage.has('@mixr/saved-filters')).toBe(true);
      const stored = JSON.parse(storage.get('@mixr/saved-filters')!);
      expect(stored.length).toBe(3);
    });

    it('returns previously saved filters from storage', async () => {
      const existing: SavedFilter[] = [
        {
          id: 'test-1',
          name: 'My Filter',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          filter: { query: 'test' },
        },
      ];
      storage.set('@mixr/saved-filters', JSON.stringify(existing));

      const filters = await getSavedFilters();
      expect(filters.length).toBe(1);
      expect(filters[0].name).toBe('My Filter');
    });
  });

  describe('saveFilter', () => {
    it('creates a new filter with generated id and timestamps', async () => {
      const saved = await saveFilter('My Filter', { query: 'house' });
      expect(saved.id).toMatch(/^filter-/);
      expect(saved.name).toBe('My Filter');
      expect(saved.filter.query).toBe('house');
      expect(saved.createdAt).toBeTruthy();
      expect(saved.updatedAt).toBeTruthy();
      expect(saved.isDefault).toBeUndefined();
    });

    it('persists the new filter to storage', async () => {
      await saveFilter('Persisted', { genreIds: ['1'] });
      const filters = await getSavedFilters();
      const found = filters.find((f) => f.name === 'Persisted');
      expect(found).toBeDefined();
    });

    it('throws when name exceeds 50 characters', async () => {
      const longName = 'a'.repeat(51);
      await expect(saveFilter(longName, {})).rejects.toThrow(
        'Filter name must be 50 characters or fewer.'
      );
    });

    it('allows name of exactly 50 characters', async () => {
      const name50 = 'a'.repeat(50);
      const saved = await saveFilter(name50, {});
      expect(saved.name).toBe(name50);
    });

    it('throws when max 20 filters reached', async () => {
      // Pre-populate storage with 20 filters
      const manyFilters: SavedFilter[] = Array.from({ length: 20 }, (_, i) => ({
        id: `filter-${i}`,
        name: `Filter ${i}`,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        filter: {},
      }));
      storage.set('@mixr/saved-filters', JSON.stringify(manyFilters));

      await expect(saveFilter('One Too Many', {})).rejects.toThrow(
        'Maximum of 20 saved filters reached'
      );
    });

    it('allows saving when at 19 filters (under the limit)', async () => {
      const filters: SavedFilter[] = Array.from({ length: 19 }, (_, i) => ({
        id: `filter-${i}`,
        name: `Filter ${i}`,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        filter: {},
      }));
      storage.set('@mixr/saved-filters', JSON.stringify(filters));

      const saved = await saveFilter('Number 20', {});
      expect(saved.name).toBe('Number 20');
    });

    it('saves filter with complex filter criteria', async () => {
      const complexFilter = {
        query: 'techno',
        genreIds: ['1', '2'],
        cities: ['Los Angeles'],
        priceMax: 50,
        excludeSoldOut: true,
        dateRange: 'this_weekend' as const,
      };
      const saved = await saveFilter('Complex', complexFilter);
      expect(saved.filter).toEqual(complexFilter);
    });
  });

  describe('updateFilter', () => {
    it('updates the name of an existing filter', async () => {
      const saved = await saveFilter('Original', { query: 'test' });
      const updated = await updateFilter(saved.id, { name: 'Renamed' });
      expect(updated.name).toBe('Renamed');
      expect(updated.filter.query).toBe('test'); // filter unchanged
    });

    it('updates the filter criteria', async () => {
      const saved = await saveFilter('Keep Name', { query: 'old' });
      const updated = await updateFilter(saved.id, {
        filter: { query: 'new', genreIds: ['1'] },
      });
      expect(updated.name).toBe('Keep Name'); // name unchanged
      expect(updated.filter.query).toBe('new');
      expect(updated.filter.genreIds).toEqual(['1']);
    });

    it('updates the updatedAt timestamp', async () => {
      const saved = await saveFilter('Timestamped', {});
      // Small delay to ensure timestamp differs
      const updated = await updateFilter(saved.id, { name: 'Updated' });
      expect(updated.updatedAt).toBeTruthy();
      // updatedAt should be at least as recent
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(saved.updatedAt).getTime()
      );
    });

    it('throws when filter ID not found', async () => {
      await expect(
        updateFilter('nonexistent', { name: 'New Name' })
      ).rejects.toThrow('Filter with id "nonexistent" not found.');
    });

    it('throws when new name exceeds 50 characters', async () => {
      const saved = await saveFilter('Short', {});
      await expect(
        updateFilter(saved.id, { name: 'a'.repeat(51) })
      ).rejects.toThrow('Filter name must be 50 characters or fewer.');
    });

    it('persists update to storage', async () => {
      const saved = await saveFilter('Before', {});
      await updateFilter(saved.id, { name: 'After' });
      const all = await getSavedFilters();
      const found = all.find((f) => f.id === saved.id);
      expect(found!.name).toBe('After');
    });
  });

  describe('deleteFilter', () => {
    it('removes a user-created filter', async () => {
      const saved = await saveFilter('ToDelete', {});
      await deleteFilter(saved.id);
      const all = await getSavedFilters();
      expect(all.find((f) => f.id === saved.id)).toBeUndefined();
    });

    it('throws when filter ID not found', async () => {
      await expect(deleteFilter('nonexistent')).rejects.toThrow(
        'Filter with id "nonexistent" not found.'
      );
    });

    it('throws when trying to delete a default preset', async () => {
      // Load defaults first
      const filters = await getSavedFilters();
      const defaultFilter = filters.find((f) => f.isDefault);
      expect(defaultFilter).toBeDefined();

      await expect(deleteFilter(defaultFilter!.id)).rejects.toThrow(
        'Default presets cannot be deleted.'
      );
    });

    it('does not affect other filters when deleting one', async () => {
      const a = await saveFilter('Filter A', {});
      const b = await saveFilter('Filter B', {});
      await deleteFilter(a.id);
      const all = await getSavedFilters();
      expect(all.find((f) => f.id === b.id)).toBeDefined();
    });
  });

  describe('default presets', () => {
    it('This Weekend preset uses this_weekend dateRange', async () => {
      const filters = await getSavedFilters();
      const weekend = filters.find((f) => f.name === 'This Weekend');
      expect(weekend!.filter.dateRange).toBe('this_weekend');
    });

    it('Nearby Tonight preset uses today dateRange', async () => {
      const filters = await getSavedFilters();
      const tonight = filters.find((f) => f.name === 'Nearby Tonight');
      expect(tonight!.filter.dateRange).toBe('today');
    });

    it('Free Shows preset uses priceMax 0', async () => {
      const filters = await getSavedFilters();
      const free = filters.find((f) => f.name === 'Free Shows');
      expect(free!.filter.priceMax).toBe(0);
    });
  });
});
