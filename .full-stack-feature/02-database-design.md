# Data Model Design: Search & Filtering for Shows/Events

## 1. Entity Design

### New Entities

**Show** -- The central entity. Represents a single performance event at a venue.

**Venue** -- A physical location where shows happen. Separated from Show so multiple shows can reference the same venue without duplicating address/coordinate data.

**City** -- Lightweight lookup entity for location-based filtering. Derived from venue data rather than stored separately, but formalized as a type for filter UIs.

**SavedFilter** -- A persisted filter preset the user can name and reuse. Stored in AsyncStorage.

**SearchResult** -- A union wrapper returned by the search/filter layer. Not persisted; runtime only.

### Relationships

```
Genre (existing)
  |
  +--< Show.genreIds (many-to-many via ID array)

DJ (existing)
  |
  +--< Show.djIds (many-to-many via ID array; a show can feature multiple DJs)

Venue (new)
  |
  +--< Show.venueId (many-to-one; each show has exactly one venue)

City (derived)
  |
  +--< Venue.city (each venue is in one city)
```

Key design decisions:
- Shows reference DJs and Genres by ID arrays (not embedded objects) to keep data normalized and make filtering by ID straightforward.
- A Show can have multiple DJs (b2b sets, multi-lineup events).
- Venue is its own entity because the map view needs coordinates, and venues are a first-class filter dimension.

---

## 2. Data Schema

### Venue

```typescript
export interface Venue {
  id: string;
  name: string;                    // "Warehouse Project"
  address: string;                 // "123 Main St"
  city: string;                    // "Los Angeles"
  state: string;                   // "CA"
  zipCode: string;                 // "90012"
  latitude: number;                // 34.0522
  longitude: number;               // -118.2437
  imageUrl?: string;               // hero photo of the venue
  capacity?: number;               // optional, for UI display
  venueType: VenueType;            // club, warehouse, festival, rooftop, bar
}

export type VenueType = 'club' | 'warehouse' | 'festival_grounds' | 'rooftop' | 'bar' | 'arena';
```

### Show

```typescript
export interface Show {
  id: string;
  name: string;                    // "Midnight Frequencies"
  description?: string;            // longer blurb
  djIds: string[];                 // references DJ.id (1+)
  venueId: string;                 // references Venue.id
  genreIds: string[];              // references Genre.id (1+)
  imageUrl: string;                // event flyer / hero image
  date: string;                    // ISO 8601 date: "2026-04-11"
  startTime: string;               // ISO 8601 datetime: "2026-04-11T22:00:00"
  endTime?: string;                // ISO 8601 datetime: "2026-04-12T04:00:00"
  doorsOpen?: string;              // ISO 8601 datetime
  priceMin?: number;               // in USD, lowest tier
  priceMax?: number;               // in USD, highest tier
  isSoldOut: boolean;
  popularity: number;              // 0-100 score, used for sorting
  tags?: string[];                 // freeform tags for search: ["late-night", "b2b", "album-release"]
}
```

Design notes on `Show`:
- `date` is a plain date string for easy date-range comparisons. `startTime`/`endTime` are full datetimes for display.
- `popularity` is a precomputed score (in a real system it would come from ticket sales, RSVPs, social signals). For mock data we assign it manually.
- `djIds` is an array, not a single ID, because multi-DJ lineups are common in the electronic music world.
- `tags` provides a free-text search surface beyond DJ name and venue name.

### City (derived, not stored)

```typescript
export interface City {
  name: string;        // "Los Angeles"
  state: string;       // "CA"
  showCount: number;   // computed: how many upcoming shows
}
```

This is computed at runtime from the venues of all shows, not stored in mock data. It powers the city filter dropdown.

### SavedFilter

```typescript
export interface SavedFilter {
  id: string;                          // uuid
  name: string;                        // user-provided label: "Weekend Techno"
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
  filter: ShowFilter;                  // the actual filter state (see below)
}
```

### ShowFilter (filter state object)

```typescript
export interface ShowFilter {
  query?: string;                      // free-text search term
  dateRange?: DateRangePreset | CustomDateRange;
  genreIds?: string[];                 // filter by genre
  venueIds?: string[];                 // filter by specific venues
  cities?: string[];                   // filter by city name
  djIds?: string[];                    // filter by specific DJs
  priceMax?: number;                   // max ticket price
  excludeSoldOut?: boolean;            // hide sold-out shows
}

export type DateRangePreset = 'today' | 'this_week' | 'this_weekend' | 'next_week' | 'this_month';

export interface CustomDateRange {
  startDate: string;                   // ISO 8601 date
  endDate: string;                     // ISO 8601 date
}
```

### ShowSortOption

```typescript
export type ShowSortField = 'date' | 'distance' | 'popularity';
export type ShowSortDirection = 'asc' | 'desc';

export interface ShowSortOption {
  field: ShowSortField;
  direction: ShowSortDirection;
}
```

### SearchResult (runtime only)

```typescript
export interface ShowSearchResult {
  show: Show;
  venue: Venue;          // resolved from show.venueId
  djs: DJ[];             // resolved from show.djIds
  genres: Genre[];        // resolved from show.genreIds
  distance?: number;     // km from user, computed if location available
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

---

## 3. Mock Data Design

### Venues (8-10 entries)

Spread across 4-5 cities that overlap with existing DJ locations:
- Los Angeles (2 venues): a warehouse and a rooftop
- New York (2 venues): a club and an arena
- Miami (2 venues): a club and festival grounds
- Chicago (1 venue): a bar/club
- Atlanta (1 venue): a club

Each venue gets realistic coordinates for map view testing.

### Shows (15-20 entries)

Designed to exercise every filter dimension:
- Dates spanning from "yesterday" (past, should be filtered out by default) through the next 30 days, with clustering around the upcoming weekend for "this weekend" filter testing.
- Each show references 1-3 existing DJs from the `djs` array.
- Genre coverage: every genre from the existing `genres` array appears on at least 2 shows.
- Price range: some free (priceMin = 0), some mid-range ($20-50), some premium ($75-150).
- 1-2 shows marked `isSoldOut: true` to test the `excludeSoldOut` filter.
- Popularity scores spread across the full 0-100 range to make popularity sort meaningful.
- A few shows share the same venue (to test venue-based filtering).
- A few shows share the same DJ (to test DJ-based filtering).

### Date generation strategy

Mock data will use relative date helpers rather than hardcoded ISO strings. A utility function `daysFromNow(n: number): string` returns an ISO date string offset from today. This ensures the mock data always has "upcoming" shows regardless of when the app is opened.

```
daysFromNow(0)   -> today
daysFromNow(1)   -> tomorrow
daysFromNow(-1)  -> yesterday (for testing past-show filtering)
daysFromNow(5)   -> this weekend (approx)
```

### Linking to existing data

- Shows reference `djs[0].id` through `djs[5].id` -- the 6 existing DJs.
- Shows reference `genres[0].id` through `genres[4].id` -- the 5 existing genres.
- No changes to existing DJ or Genre interfaces are required. The `DJ.shows` count field semantically aligns (it counts how many shows a DJ has played).

---

## 4. Data Access Patterns

All data access goes through a service layer (`src/data/showService.ts`) that mimics an async API. Every function returns a `Promise` even though the data is local, ensuring the API-swap path is seamless.

### Core Functions

| Function | Signature | Description |
|---|---|---|
| `searchShows` | `(filter: ShowFilter, sort: ShowSortOption, page: number, pageSize: number, userLocation?: Coordinate) => Promise<PaginatedResult<ShowSearchResult>>` | Main search entry point. Applies filter, sorts, paginates, and resolves related entities. |
| `getShowById` | `(id: string) => Promise<ShowSearchResult \| null>` | Single show detail with resolved venue/DJs/genres. |
| `getVenues` | `() => Promise<Venue[]>` | All venues (for filter picker). |
| `getCities` | `() => Promise<City[]>` | Derived unique cities with show counts (for filter picker). |
| `getUpcomingShowsForDj` | `(djId: string) => Promise<ShowSearchResult[]>` | Shows for a specific DJ (for DJ detail screen). |
| `getShowsAtVenue` | `(venueId: string) => Promise<ShowSearchResult[]>` | Shows at a specific venue (for venue detail). |

### Search algorithm (inside `searchShows`)

Applied in this order:

1. **Text search** (`filter.query`): Case-insensitive substring match against: show name, show tags, DJ names (resolved), venue name (resolved). A show matches if any of these fields contain the query.

2. **Date range**: Convert preset to concrete start/end dates, then filter `show.date` to be within range. Custom range uses the provided dates directly. Default behavior (no date filter) returns only shows with `date >= today`.

3. **Genre filter**: Show matches if its `genreIds` array intersects with the filter's `genreIds`.

4. **Venue/City filter**: Show matches if its `venueId` is in the filter's `venueIds`, or if its venue's city is in the filter's `cities`.

5. **DJ filter**: Show matches if its `djIds` array intersects with the filter's `djIds`.

6. **Price filter**: Show matches if `priceMin <= filter.priceMax` (show is affordable at its cheapest tier).

7. **Sold out**: If `excludeSoldOut` is true, remove shows where `isSoldOut === true`.

8. **Sorting**:
   - `date` -- sort by `show.startTime` (asc = soonest first, desc = latest first)
   - `popularity` -- sort by `show.popularity` (desc = most popular first by default)
   - `distance` -- sort by haversine distance from `userLocation` to venue coordinates. If no user location provided, fall back to date sort.

9. **Pagination**: Slice the sorted array by `page * pageSize` to `(page + 1) * pageSize`. Return total count and `hasMore` flag.

### Distance calculation

A pure `haversine(lat1, lon1, lat2, lon2): number` utility computes distance in km. For mock purposes, a hardcoded "user location" default (e.g., downtown LA) can be used when the device does not provide location.

---

## 5. Filter Preset Storage

### Storage key

```
@mixr/saved-filters
```

### Schema (AsyncStorage value)

Stored as a JSON-serialized array of `SavedFilter` objects:

```typescript
// What gets stored in AsyncStorage
type StoredFilters = SavedFilter[];
```

### Access functions

| Function | Signature | Description |
|---|---|---|
| `getSavedFilters` | `() => Promise<SavedFilter[]>` | Read all saved presets from AsyncStorage. Returns `[]` if none exist. |
| `saveFilter` | `(name: string, filter: ShowFilter) => Promise<SavedFilter>` | Create a new preset. Generates UUID and timestamps. Appends to stored array. Returns the created preset. |
| `updateFilter` | `(id: string, updates: Partial<Pick<SavedFilter, 'name' \| 'filter'>>) => Promise<SavedFilter>` | Update name or filter criteria of an existing preset. Updates `updatedAt`. |
| `deleteFilter` | `(id: string) => Promise<void>` | Remove a preset by ID. |

### Limits

- Maximum 20 saved filters (enforce on `saveFilter`; surface error to UI if exceeded).
- Filter names max 50 characters.
- No duplication detection -- users can save identical filters with different names.

### Default presets

Ship 2-3 built-in presets that cannot be deleted (flagged with an `isDefault?: boolean` field on `SavedFilter`):

| Name | Filter |
|---|---|
| "This Weekend" | `{ dateRange: 'this_weekend' }` |
| "Nearby Tonight" | `{ dateRange: 'today' }` (distance sort implied by UI) |
| "Free Shows" | `{ priceMax: 0 }` |

---

## 6. Migration Path to a Real API

The design is structured so that swapping mock data for a real backend requires changing only the service layer, not the UI or type system.

### Abstraction boundary

All UI code imports from `src/data/showService.ts` and never touches the raw mock arrays directly. The service functions are async and return the same `PaginatedResult<ShowSearchResult>` shape that a REST API would.

### What stays the same

- All TypeScript interfaces (`Show`, `Venue`, `ShowFilter`, `ShowSortOption`, `SavedFilter`, `ShowSearchResult`, `PaginatedResult`).
- All function signatures in the service layer.
- The `SavedFilter` AsyncStorage layer (saved filters are inherently local).

### What changes

| Layer | Mock (now) | Real API (later) |
|---|---|---|
| `searchShows` | Filters/sorts in-memory arrays | `GET /api/shows?q=...&genre=...&sort=...&page=...` |
| `getShowById` | Array `.find()` | `GET /api/shows/:id` |
| `getVenues` | Returns static array | `GET /api/venues` |
| `getCities` | Derives from venue array | `GET /api/cities` or server-side aggregation |
| Distance sort | Client-side haversine | Server accepts `lat`/`lng` params, sorts server-side |
| Pagination | Array slicing | Server returns paginated response |

### Recommended migration steps

1. Create an `ApiShowService` that implements the same function signatures using `fetch`.
2. Introduce a service provider (React Context or simple module-level toggle) that selects between `MockShowService` and `ApiShowService` based on an environment variable.
3. The `ShowFilter` interface maps cleanly to query parameters: each field becomes a query param (arrays become comma-separated values).
4. `PaginatedResult` maps to a standard paginated API response envelope.
5. `SavedFilter` storage stays in AsyncStorage even with a real backend (local-first UX), but could optionally sync to a user preferences endpoint.

### API contract sketch

For future backend teams, the mock data layer implies this REST contract:

```
GET /api/shows
  ?q=string
  &dateStart=ISO8601&dateEnd=ISO8601
  &genreIds=id,id
  &venueIds=id,id
  &cities=name,name
  &djIds=id,id
  &priceMax=number
  &excludeSoldOut=boolean
  &sort=date|distance|popularity
  &sortDir=asc|desc
  &lat=number&lng=number        (for distance sort)
  &page=number&pageSize=number

Response: {
  items: ShowSearchResult[],
  total: number,
  page: number,
  pageSize: number,
  hasMore: boolean
}
```

This keeps the URL structure flat and the response shape identical to `PaginatedResult<ShowSearchResult>`.
