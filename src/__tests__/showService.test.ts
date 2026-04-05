import {
  searchShows,
  getShowById,
  getVenues,
  getCities,
  getUpcomingShowsForDj,
  getShowsAtVenue,
} from '../data/showService';
import { shows, venues } from '../data/mockData';
import { ShowFilter, ShowSortOption, Coordinate } from '../types';

// Default sort: date ascending
const defaultSort: ShowSortOption = { field: 'date', direction: 'asc' };
const emptyFilter: ShowFilter = {};

describe('searchShows', () => {
  describe('default date gate', () => {
    it('excludes past shows when no dateRange is specified', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      // s17 is the past show (daysFromNow(-1))
      const ids = result.items.map((r) => r.show.id);
      expect(ids).not.toContain('s17');
    });

    it('includes today\'s show', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      // s11 is today (daysFromNow(0))
      const ids = result.items.map((r) => r.show.id);
      expect(ids).toContain('s11');
    });
  });

  describe('date range filtering', () => {
    it('filters by custom date range', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const startDate = tomorrow.toISOString().split('T')[0];
      const endDate = dayAfter.toISOString().split('T')[0];

      const result = await searchShows(
        { dateRange: { startDate, endDate } },
        defaultSort,
        0,
        100
      );

      // All returned shows should be within the range
      for (const item of result.items) {
        expect(item.show.date >= startDate).toBe(true);
        expect(item.show.date <= endDate).toBe(true);
      }
    });

    it('can include past shows when dateRange explicitly covers them', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = yesterday.toISOString().split('T')[0];

      const result = await searchShows(
        { dateRange: { startDate, endDate } },
        defaultSort,
        0,
        100
      );

      const ids = result.items.map((r) => r.show.id);
      expect(ids).toContain('s17'); // past show
    });

    it('filters by preset date range', async () => {
      const result = await searchShows(
        { dateRange: 'this_month' },
        defaultSort,
        0,
        100
      );

      // Should return at least some shows
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('text search', () => {
    it('matches show name', async () => {
      const result = await searchShows(
        { query: 'Midnight Frequencies' },
        defaultSort,
        0,
        100
      );
      expect(result.items.some((r) => r.show.id === 's1')).toBe(true);
    });

    it('matches DJ name', async () => {
      const result = await searchShows(
        { query: 'DJ Nova' },
        defaultSort,
        0,
        100
      );
      // DJ Nova (id 1) appears in s1, s2, s4, s7, s12
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.djIds).toContain('1');
      }
    });

    it('matches venue name', async () => {
      const result = await searchShows(
        { query: 'Warehouse Project' },
        defaultSort,
        0,
        100
      );
      // Shows at v1
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.venueId).toBe('v1');
      }
    });

    it('matches tags', async () => {
      const result = await searchShows(
        { query: 'underground' },
        defaultSort,
        0,
        100
      );
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.tags?.some((t) => t.toLowerCase().includes('underground'))).toBe(true);
      }
    });

    it('is case-insensitive', async () => {
      const upper = await searchShows({ query: 'MIDNIGHT' }, defaultSort, 0, 100);
      const lower = await searchShows({ query: 'midnight' }, defaultSort, 0, 100);
      expect(upper.total).toBe(lower.total);
    });

    it('ignores empty and whitespace-only query', async () => {
      const all = await searchShows({}, defaultSort, 0, 100);
      const empty = await searchShows({ query: '' }, defaultSort, 0, 100);
      const whitespace = await searchShows({ query: '   ' }, defaultSort, 0, 100);
      expect(empty.total).toBe(all.total);
      expect(whitespace.total).toBe(all.total);
    });

    it('returns empty when query matches nothing', async () => {
      const result = await searchShows(
        { query: 'xyznonexistent123' },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  describe('genre filter', () => {
    it('filters by single genre', async () => {
      // Genre 2 = Techno
      const result = await searchShows(
        { genreIds: ['2'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.genreIds).toContain('2');
      }
    });

    it('filters by multiple genres (OR logic)', async () => {
      // Genre 3 = Hip-Hop, Genre 5 = Afrobeats
      const result = await searchShows(
        { genreIds: ['3', '5'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        const hasEither =
          item.show.genreIds.includes('3') || item.show.genreIds.includes('5');
        expect(hasEither).toBe(true);
      }
    });

    it('returns empty for non-existent genre', async () => {
      const result = await searchShows(
        { genreIds: ['999'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBe(0);
    });
  });

  describe('venue and city filter', () => {
    it('filters by venue ID', async () => {
      const result = await searchShows(
        { venueIds: ['v1'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.venueId).toBe('v1');
      }
    });

    it('filters by city name', async () => {
      const result = await searchShows(
        { cities: ['New York'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.venue.city).toBe('New York');
      }
    });

    it('filters by multiple cities', async () => {
      const result = await searchShows(
        { cities: ['New York', 'Miami'] },
        defaultSort,
        0,
        100
      );
      for (const item of result.items) {
        expect(['New York', 'Miami']).toContain(item.venue.city);
      }
    });
  });

  describe('DJ filter', () => {
    it('filters by DJ ID', async () => {
      // DJ 4 = Luna Beats
      const result = await searchShows(
        { djIds: ['4'] },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.show.djIds).toContain('4');
      }
    });
  });

  describe('price filter', () => {
    it('filters by max price', async () => {
      const result = await searchShows(
        { priceMax: 20 },
        defaultSort,
        0,
        100
      );
      expect(result.total).toBeGreaterThan(0);
      for (const item of result.items) {
        // Shows without a priceMin are included (undefined <= any)
        if (item.show.priceMin !== undefined) {
          expect(item.show.priceMin).toBeLessThanOrEqual(20);
        }
      }
    });

    it('filters free shows with priceMax 0', async () => {
      const result = await searchShows(
        { priceMax: 0 },
        defaultSort,
        0,
        100
      );
      for (const item of result.items) {
        expect(item.show.priceMin).toBe(0);
      }
    });
  });

  describe('sold out filter', () => {
    it('excludes sold out shows when excludeSoldOut is true', async () => {
      const result = await searchShows(
        { excludeSoldOut: true },
        defaultSort,
        0,
        100
      );
      for (const item of result.items) {
        expect(item.show.isSoldOut).toBe(false);
      }
    });

    it('includes sold out shows by default', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      const hasSoldOut = result.items.some((r) => r.show.isSoldOut);
      expect(hasSoldOut).toBe(true);
    });
  });

  describe('combined filters', () => {
    it('applies text search AND genre filter together', async () => {
      const result = await searchShows(
        { query: 'DJ Nova', genreIds: ['2'] },
        defaultSort,
        0,
        100
      );
      for (const item of result.items) {
        expect(item.show.djIds).toContain('1'); // DJ Nova
        expect(item.show.genreIds).toContain('2'); // Techno
      }
    });

    it('applies genre + city + excludeSoldOut together', async () => {
      const result = await searchShows(
        { genreIds: ['2'], cities: ['Los Angeles'], excludeSoldOut: true },
        defaultSort,
        0,
        100
      );
      for (const item of result.items) {
        expect(item.show.genreIds).toContain('2');
        expect(item.venue.city).toBe('Los Angeles');
        expect(item.show.isSoldOut).toBe(false);
      }
    });
  });

  describe('sorting', () => {
    it('sorts by date ascending', async () => {
      const result = await searchShows({}, { field: 'date', direction: 'asc' }, 0, 100);
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].show.startTime >= result.items[i - 1].show.startTime).toBe(true);
      }
    });

    it('sorts by date descending', async () => {
      const result = await searchShows({}, { field: 'date', direction: 'desc' }, 0, 100);
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].show.startTime <= result.items[i - 1].show.startTime).toBe(true);
      }
    });

    it('sorts by popularity ascending', async () => {
      const result = await searchShows({}, { field: 'popularity', direction: 'asc' }, 0, 100);
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].show.popularity).toBeGreaterThanOrEqual(
          result.items[i - 1].show.popularity
        );
      }
    });

    it('sorts by popularity descending', async () => {
      const result = await searchShows({}, { field: 'popularity', direction: 'desc' }, 0, 100);
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].show.popularity).toBeLessThanOrEqual(
          result.items[i - 1].show.popularity
        );
      }
    });

    it('sorts by distance when user location provided', async () => {
      const userLocation: Coordinate = { latitude: 34.0522, longitude: -118.2437 }; // LA
      const result = await searchShows(
        {},
        { field: 'distance', direction: 'asc' },
        0,
        100,
        userLocation
      );
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].distance!).toBeGreaterThanOrEqual(result.items[i - 1].distance!);
      }
    });

    it('falls back to date sort when distance sort requested without location', async () => {
      const result = await searchShows(
        {},
        { field: 'distance', direction: 'asc' },
        0,
        100
      );
      // Should not throw, should fall back to date ascending
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i].show.startTime >= result.items[i - 1].show.startTime).toBe(true);
      }
    });
  });

  describe('pagination', () => {
    it('returns correct page size', async () => {
      const result = await searchShows({}, defaultSort, 0, 3);
      expect(result.items.length).toBeLessThanOrEqual(3);
      expect(result.pageSize).toBe(3);
      expect(result.page).toBe(0);
    });

    it('returns hasMore when there are more pages', async () => {
      const result = await searchShows({}, defaultSort, 0, 3);
      // There are 17 upcoming shows, so page of 3 should have more
      expect(result.hasMore).toBe(true);
    });

    it('returns hasMore false on last page', async () => {
      const all = await searchShows({}, defaultSort, 0, 100);
      const lastPage = await searchShows({}, defaultSort, 0, all.total);
      expect(lastPage.hasMore).toBe(false);
    });

    it('returns total count regardless of page', async () => {
      const page0 = await searchShows({}, defaultSort, 0, 3);
      const page1 = await searchShows({}, defaultSort, 1, 3);
      expect(page0.total).toBe(page1.total);
    });

    it('returns empty items when page is beyond results', async () => {
      const result = await searchShows({}, defaultSort, 999, 10);
      expect(result.items).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('second page starts where first page ended', async () => {
      const page0 = await searchShows({}, defaultSort, 0, 3);
      const page1 = await searchShows({}, defaultSort, 1, 3);
      const page0Ids = page0.items.map((r) => r.show.id);
      const page1Ids = page1.items.map((r) => r.show.id);
      // No overlap
      for (const id of page1Ids) {
        expect(page0Ids).not.toContain(id);
      }
    });
  });

  describe('resolved entities', () => {
    it('includes venue object in results', async () => {
      const result = await searchShows({}, defaultSort, 0, 1);
      expect(result.items[0].venue).toBeDefined();
      expect(result.items[0].venue.id).toBe(result.items[0].show.venueId);
    });

    it('includes DJs array in results', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      for (const item of result.items) {
        expect(item.djs.length).toBeGreaterThan(0);
        for (const dj of item.djs) {
          expect(item.show.djIds).toContain(dj.id);
        }
      }
    });

    it('includes genres array in results', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      for (const item of result.items) {
        for (const genre of item.genres) {
          expect(item.show.genreIds).toContain(genre.id);
        }
      }
    });

    it('includes distance when user location is provided', async () => {
      const userLocation: Coordinate = { latitude: 34.0522, longitude: -118.2437 };
      const result = await searchShows({}, defaultSort, 0, 100, userLocation);
      for (const item of result.items) {
        expect(item.distance).toBeDefined();
        expect(typeof item.distance).toBe('number');
      }
    });

    it('distance is undefined when no user location', async () => {
      const result = await searchShows({}, defaultSort, 0, 100);
      for (const item of result.items) {
        expect(item.distance).toBeUndefined();
      }
    });
  });
});

describe('getShowById', () => {
  it('returns resolved show for valid ID', async () => {
    const result = await getShowById('s1');
    expect(result).not.toBeNull();
    expect(result!.show.id).toBe('s1');
    expect(result!.show.name).toBe('Midnight Frequencies');
    expect(result!.venue).toBeDefined();
    expect(result!.djs.length).toBeGreaterThan(0);
    expect(result!.genres.length).toBeGreaterThan(0);
  });

  it('returns null for non-existent ID', async () => {
    const result = await getShowById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null for empty string ID', async () => {
    const result = await getShowById('');
    expect(result).toBeNull();
  });
});

describe('getVenues', () => {
  it('returns all venues', async () => {
    const result = await getVenues();
    expect(result.length).toBe(venues.length);
  });

  it('returns a copy (not the original array)', async () => {
    const result = await getVenues();
    result.push({} as any);
    const result2 = await getVenues();
    expect(result2.length).toBe(venues.length);
  });
});

describe('getCities', () => {
  it('returns cities with show counts', async () => {
    const result = await getCities();
    expect(result.length).toBeGreaterThan(0);
    for (const city of result) {
      expect(city.name).toBeTruthy();
      expect(city.state).toBeTruthy();
      expect(city.showCount).toBeGreaterThan(0);
    }
  });

  it('is sorted by showCount descending', async () => {
    const result = await getCities();
    for (let i = 1; i < result.length; i++) {
      expect(result[i].showCount).toBeLessThanOrEqual(result[i - 1].showCount);
    }
  });

  it('does not count past shows', async () => {
    const result = await getCities();
    // s17 is a past show at v9 (Los Angeles). The LA count should not include it.
    // We can verify the total matches only upcoming shows
    const totalFromCities = result.reduce((sum, c) => sum + c.showCount, 0);
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = shows.filter((s) => s.date >= today).length;
    expect(totalFromCities).toBe(upcomingCount);
  });
});

describe('getUpcomingShowsForDj', () => {
  it('returns shows for a valid DJ sorted by date', async () => {
    // DJ 1 = DJ Nova
    const result = await getUpcomingShowsForDj('1');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.show.djIds).toContain('1');
    }
    // Verify sorted by startTime ascending
    for (let i = 1; i < result.length; i++) {
      expect(result[i].show.startTime >= result[i - 1].show.startTime).toBe(true);
    }
  });

  it('excludes past shows', async () => {
    // DJ 1 has s17 which is a past show
    const result = await getUpcomingShowsForDj('1');
    const ids = result.map((r) => r.show.id);
    expect(ids).not.toContain('s17');
  });

  it('returns empty for non-existent DJ', async () => {
    const result = await getUpcomingShowsForDj('nonexistent');
    expect(result).toHaveLength(0);
  });
});

describe('getShowsAtVenue', () => {
  it('returns shows for a valid venue sorted by date', async () => {
    const result = await getShowsAtVenue('v1');
    expect(result.length).toBeGreaterThan(0);
    for (const item of result) {
      expect(item.show.venueId).toBe('v1');
    }
    // Verify sorted
    for (let i = 1; i < result.length; i++) {
      expect(result[i].show.startTime >= result[i - 1].show.startTime).toBe(true);
    }
  });

  it('returns empty for non-existent venue', async () => {
    const result = await getShowsAtVenue('nonexistent');
    expect(result).toHaveLength(0);
  });
});
