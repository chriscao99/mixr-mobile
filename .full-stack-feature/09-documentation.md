# Search & Filtering Feature Documentation

## 1. Feature Overview

The Search & Filtering feature adds event discovery capabilities to the Mixr mobile app. Users can find upcoming DJ shows and events through text search, multi-dimensional filtering, sorting, and a map view -- all powered by a local mock data layer designed for seamless future API migration.

### User-Facing Capabilities

- **Text search** across show names, DJ names, venue names, and tags
- **Date filtering** with presets (Today, This Week, This Weekend, Next Week, This Month) and custom date ranges
- **Location filtering** by city and specific venue
- **Genre filtering** using the existing genre taxonomy
- **Price filtering** with a maximum price threshold
- **Sold-out filtering** to hide unavailable shows
- **Sorting** by date, distance from user, or popularity
- **Saved filter presets** persisted locally via AsyncStorage (up to 20, with 3 built-in defaults)
- **Map view** showing show locations as pins with a bottom-sheet preview on tap
- **List view** with infinite scroll pagination (10 items per page)
- **Show detail screen** with DJ lineup, venue info, and related shows
- **New "Shows" tab** in the bottom navigation (4th tab, Calendar icon)

---

## 2. Architecture Summary

### Data Flow

```
User Interaction (search, filter, sort, scroll)
       |
       v
useShowSearch hook (debounces query, manages state)
       |
       v
showService.ts (filter chain, sort, paginate, resolve entities)
       |
       v
mockData.ts (in-memory arrays: shows[], venues[], djs[], genres[])
       |
       v
Returns Promise<PaginatedResult<ShowSearchResult>>
       |
       v
Component renders results (list or map)
```

### Component Hierarchy

```
app/_layout.tsx (Stack — added show/[id] and filter-modal screens)
  |
  +-- app/(tabs)/_layout.tsx (Tabs — added 4th "Shows" tab)
  |     |
  |     +-- app/(tabs)/shows.tsx (Shows tab screen)
  |           |-- SearchBar
  |           |-- FilterChips (active filter summary)
  |           |-- ShowSortPicker (date / distance / popular)
  |           |-- ViewToggle (list / map)
  |           |-- ShowListView (FlatList with ShowCard items)
  |           +-- ShowMapView (MapView with ShowMapPin markers + ShowMapPreview)
  |
  +-- app/show/[id].tsx (Show detail — parallax hero, lineup, venue card)
  +-- app/filter-modal.tsx (Full filter panel — date, genre, city, venue, price, presets)
```

### Key Files

| Layer | File | Purpose |
|-------|------|---------|
| Types | `src/types/show.ts` | All new TypeScript interfaces |
| Types | `src/types/index.ts` | Re-exports (barrel file) |
| Service | `src/data/showService.ts` | Search, filter, sort, pagination logic |
| Service | `src/data/filterStorage.ts` | AsyncStorage CRUD for saved filters |
| Utilities | `src/data/dateUtils.ts` | Date arithmetic and formatting |
| Utilities | `src/data/geoUtils.ts` | Haversine distance calculation |
| Data | `src/data/mockData.ts` | Mock venues (9) and shows (18) |
| Hooks | `src/hooks/useShowSearch.ts` | Core search state management hook |
| Hooks | `src/hooks/useSavedFilters.ts` | Saved filter CRUD hook |
| Hooks | `src/hooks/useDebounce.ts` | Generic debounce hook |
| Context | `src/context/ShowSearchContext.tsx` | Cross-route state sharing |
| Components | `src/components/shows/*.tsx` | All show-related UI components |
| Screens | `app/(tabs)/shows.tsx` | Shows tab |
| Screens | `app/show/[id].tsx` | Show detail |
| Screens | `app/filter-modal.tsx` | Filter modal |

---

## 3. API/Service Documentation

### showService.ts

All functions return Promises to maintain an async boundary for future API migration.

#### `searchShows`

```typescript
searchShows(
  filter: ShowFilter,
  sort: ShowSortOption,
  page: number,
  pageSize: number,
  userLocation?: Coordinate
): Promise<PaginatedResult<ShowSearchResult>>
```

Main search entry point. Applies a 10-step filter chain in order:

1. **Default date gate** -- excludes past shows when no `dateRange` is set
2. **Text search** -- case-insensitive substring match against show name, tags, resolved DJ names, resolved venue name
3. **Date range** -- converts presets to concrete dates, filters `show.date` to range
4. **Genre filter** -- intersection of `show.genreIds` with `filter.genreIds`
5. **Venue/City filter** -- matches `venueId` or resolved venue city
6. **DJ filter** -- intersection of `show.djIds` with `filter.djIds`
7. **Price filter** -- passes if `show.priceMin <= filter.priceMax`
8. **Sold-out filter** -- removes sold-out shows when `excludeSoldOut` is true
9. **Entity resolution** -- resolves venue, DJs, genres; computes distance
10. **Sort and paginate** -- sorts by field/direction, slices for page

**Usage example:**

```typescript
import { searchShows } from '@/src/data/showService';

const results = await searchShows(
  { query: 'techno', dateRange: 'this_weekend', excludeSoldOut: true },
  { field: 'date', direction: 'asc' },
  0,  // page
  10, // pageSize
  { latitude: 34.0522, longitude: -118.2437 } // optional user location
);

// results.items: ShowSearchResult[]
// results.total: number
// results.hasMore: boolean
```

#### `getShowById`

```typescript
getShowById(id: string): Promise<ShowSearchResult | null>
```

Returns a single show with resolved venue, DJs, and genres. Returns `null` if the ID does not match any show.

**Usage example:**

```typescript
const show = await getShowById('show-1');
if (show) {
  console.log(show.show.name, show.venue.name, show.djs.map(d => d.name));
}
```

#### `getVenues`

```typescript
getVenues(): Promise<Venue[]>
```

Returns all venues. Used to populate the venue filter picker in the filter modal.

#### `getCities`

```typescript
getCities(): Promise<City[]>
```

Returns derived city objects with show counts. Cities are computed at runtime from venue data -- not stored separately. Used for the city filter dropdown.

**Return shape:**

```typescript
// { name: "Los Angeles", state: "CA", showCount: 5 }
```

#### `getUpcomingShowsForDj`

```typescript
getUpcomingShowsForDj(djId: string): Promise<ShowSearchResult[]>
```

Returns all upcoming shows (date >= today) for a specific DJ, sorted by date ascending. Intended for the DJ detail screen.

#### `getShowsAtVenue`

```typescript
getShowsAtVenue(venueId: string): Promise<ShowSearchResult[]>
```

Returns all upcoming shows at a specific venue, sorted by date ascending. Used in the venue detail and show detail screens.

### filterStorage.ts

Thin wrapper around AsyncStorage under key `@mixr/saved-filters`.

#### `getSavedFilters`

```typescript
getSavedFilters(): Promise<SavedFilter[]>
```

Returns all saved filter presets. On first call (empty storage), seeds 3 default presets: "This Weekend", "Nearby Tonight", and "Free Shows" (marked with `isDefault: true`).

#### `saveFilter`

```typescript
saveFilter(name: string, filter: ShowFilter): Promise<SavedFilter>
```

Creates a new preset. Generates a UUID and timestamps. Enforces a maximum of 20 saved filters and a 50-character name limit. Throws a `ServiceError` with code `STORAGE_FULL` if the limit is exceeded.

#### `updateFilter`

```typescript
updateFilter(
  id: string,
  updates: Partial<Pick<SavedFilter, 'name' | 'filter'>>
): Promise<SavedFilter>
```

Updates the name or filter criteria of an existing preset. Updates the `updatedAt` timestamp.

#### `deleteFilter`

```typescript
deleteFilter(id: string): Promise<void>
```

Removes a preset by ID. Default presets (those with `isDefault: true`) cannot be deleted.

### dateUtils.ts

```typescript
daysFromNow(n: number): string
// Returns ISO date string offset from today. daysFromNow(0) = today, daysFromNow(7) = one week from now.

datetimeFromNow(n: number, hour: number, minute: number): string
// Returns ISO datetime string for a specific time on a relative day.

resolveDateRange(preset: DateRangePreset): { startDate: string; endDate: string }
// Converts a preset like 'this_weekend' to concrete start/end ISO date strings.

isDateInRange(date: string, start: string, end: string): boolean
// Checks if an ISO date falls within a start/end range (inclusive).
```

### geoUtils.ts

```typescript
haversine(lat1: number, lon1: number, lat2: number, lon2: number): number
// Returns distance in kilometers between two coordinates.

formatDistance(km: number): string
// Formats as "2.4 mi" or "0.3 mi".

const DEFAULT_LOCATION: Coordinate = { latitude: 34.0522, longitude: -118.2437 }
// Downtown LA fallback when user location is unavailable.
```

---

## 4. Data Models

All types are defined in `src/types/show.ts` and re-exported from `src/types/index.ts`.

### Venue

Represents a physical location where shows happen.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Venue display name (e.g., "Warehouse Project") |
| `address` | `string` | Street address |
| `city` | `string` | City name (used for city filtering) |
| `state` | `string` | Two-letter state code |
| `zipCode` | `string` | Postal code |
| `latitude` | `number` | GPS latitude for map placement |
| `longitude` | `number` | GPS longitude for map placement |
| `imageUrl` | `string?` | Optional hero photo |
| `capacity` | `number?` | Optional venue capacity |
| `venueType` | `VenueType` | One of: `'club'`, `'warehouse'`, `'festival_grounds'`, `'rooftop'`, `'bar'`, `'arena'` |

### Show

Represents a single performance event.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `name` | `string` | Event name (e.g., "Midnight Frequencies") |
| `description` | `string?` | Optional longer description |
| `djIds` | `string[]` | References to DJ IDs (supports multi-DJ lineups) |
| `venueId` | `string` | Reference to Venue ID |
| `genreIds` | `string[]` | References to Genre IDs |
| `imageUrl` | `string` | Event flyer/hero image URL |
| `date` | `string` | ISO 8601 date string for date-range filtering |
| `startTime` | `string` | ISO 8601 datetime for display |
| `endTime` | `string?` | Optional ISO 8601 datetime |
| `doorsOpen` | `string?` | Optional ISO 8601 datetime |
| `priceMin` | `number?` | Lowest ticket price in USD |
| `priceMax` | `number?` | Highest ticket price in USD |
| `isSoldOut` | `boolean` | Whether the show is sold out |
| `popularity` | `number` | 0-100 score for popularity sorting |
| `tags` | `string[]?` | Freeform tags for search (e.g., "late-night", "b2b") |

### City (derived, not stored)

Computed at runtime from venue data.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | City name |
| `state` | `string` | State code |
| `showCount` | `number` | Number of upcoming shows in this city |

### SavedFilter

A persisted filter preset stored in AsyncStorage.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `name` | `string` | User-provided label (max 50 chars) |
| `createdAt` | `string` | ISO 8601 timestamp |
| `updatedAt` | `string` | ISO 8601 timestamp |
| `filter` | `ShowFilter` | The saved filter criteria |
| `isDefault` | `boolean?` | If true, preset is built-in and cannot be deleted |

### ShowFilter

The filter state object passed to `searchShows`.

| Field | Type | Description |
|-------|------|-------------|
| `query` | `string?` | Free-text search term |
| `dateRange` | `DateRangePreset \| CustomDateRange?` | Date filter |
| `genreIds` | `string[]?` | Filter by genre IDs |
| `venueIds` | `string[]?` | Filter by venue IDs |
| `cities` | `string[]?` | Filter by city names |
| `djIds` | `string[]?` | Filter by DJ IDs |
| `priceMax` | `number?` | Maximum ticket price |
| `excludeSoldOut` | `boolean?` | Hide sold-out shows |

### DateRangePreset

```typescript
type DateRangePreset = 'today' | 'this_week' | 'this_weekend' | 'next_week' | 'this_month';
```

### CustomDateRange

| Field | Type | Description |
|-------|------|-------------|
| `startDate` | `string` | ISO 8601 date |
| `endDate` | `string` | ISO 8601 date |

### ShowSortOption

| Field | Type | Description |
|-------|------|-------------|
| `field` | `ShowSortField` | One of: `'date'`, `'distance'`, `'popularity'` |
| `direction` | `ShowSortDirection` | `'asc'` or `'desc'` |

### ShowSearchResult (runtime only)

Returned by service functions with all entities resolved.

| Field | Type | Description |
|-------|------|-------------|
| `show` | `Show` | The show record |
| `venue` | `Venue` | Resolved from `show.venueId` |
| `djs` | `DJ[]` | Resolved from `show.djIds` |
| `genres` | `Genre[]` | Resolved from `show.genreIds` |
| `distance` | `number?` | Kilometers from user location (if available) |

### PaginatedResult<T>

| Field | Type | Description |
|-------|------|-------------|
| `items` | `T[]` | Page of results |
| `total` | `number` | Total matching results across all pages |
| `page` | `number` | Current zero-based page index |
| `pageSize` | `number` | Items per page |
| `hasMore` | `boolean` | Whether more pages exist |

### Coordinate

```typescript
interface Coordinate {
  latitude: number;
  longitude: number;
}
```

### ServiceError

```typescript
type ServiceErrorCode = 'NOT_FOUND' | 'STORAGE_FULL' | 'INVALID_FILTER' | 'LOCATION_DENIED' | 'UNKNOWN';

interface ServiceError {
  code: ServiceErrorCode;
  message: string;
}
```

---

## 5. Component Guide

All new components live in `src/components/shows/` and use the Mixr v5 design system (`src/theme/`).

### SearchBar (`SearchBar.tsx`)

Animated text input with focus color transition and clear button.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current search query |
| `onChangeText` | `(text: string) => void` | Called on text input |
| `placeholder` | `string?` | Placeholder text |

**When to use:** At the top of the Shows tab for keyword search. The `useShowSearch` hook handles debouncing internally.

### FilterChips (`FilterChips.tsx`)

Horizontal scroll of removable chips summarizing the active filter state.

| Prop | Type | Description |
|------|------|-------------|
| `filter` | `ShowFilter` | Current active filter |
| `onRemove` | `(key: string) => void` | Called when a chip is dismissed |
| `onClear` | `() => void` | Called when "Clear All" is tapped |
| `onOpenFilters` | `() => void` | Called when the "+ Filters" chip is tapped |

**When to use:** Below the search bar to show active filters at a glance and allow quick removal.

### ViewToggle (`ViewToggle.tsx`)

Toggle button switching between list and map views.

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'list' \| 'map'` | Current view mode |
| `onToggle` | `(mode: 'list' \| 'map') => void` | Called on toggle |

### ShowCard (`ShowCard.tsx`)

Presentational card for a single search result. Wrapped in `React.memo`.

| Prop | Type | Description |
|------|------|-------------|
| `result` | `ShowSearchResult` | Resolved show with venue, DJs, genres |
| `onPress` | `() => void` | Called on card tap (navigate to detail) |
| `compact` | `boolean?` | Compact variant for horizontal scroll lists |
| `distance` | `number?` | Distance to display |
| `index` | `number?` | Index for stagger entrance animation |

**When to use:** In `ShowListView` for search results, in `ShowMapPreview` for the map bottom sheet, and in the Discover tab "Upcoming Shows" horizontal scroll.

### ShowDateBadge (`ShowDateBadge.tsx`)

Compact date display badge showing day-of-week abbreviation and month/day.

| Prop | Type | Description |
|------|------|-------------|
| `date` | `string` | ISO date string |

### ShowListView (`ShowListView.tsx`)

Virtualized FlatList of ShowCard items with pagination support.

| Prop | Type | Description |
|------|------|-------------|
| `results` | `ShowSearchResult[]` | Array of search results |
| `isLoading` | `boolean` | Loading state |
| `hasMore` | `boolean` | Whether more pages exist |
| `onLoadMore` | `() => void` | Called when scrolled to end |
| `onShowPress` | `(id: string) => void` | Called when a ShowCard is tapped |

**Performance features:** `keyExtractor`, `getItemLayout` (defined but needs to be wired -- see Known Limitations), `windowSize={5}`, `maxToRenderPerBatch={10}`.

### ShowMapView (`ShowMapView.tsx`)

Map view with custom markers and a bottom-sheet preview card.

| Prop | Type | Description |
|------|------|-------------|
| `results` | `ShowSearchResult[]` | Show results to display as pins |
| `userLocation` | `Coordinate?` | User location for the blue dot |
| `onShowPress` | `(id: string) => void` | Called when "View Details" is tapped |

**Behavior:** Fits all pins on initial render. Animates to center on a pin when tapped. Shows `ShowMapPreview` bottom sheet for the selected pin. Falls back gracefully if `react-native-maps` is not installed.

### ShowMapPin (`ShowMapPin.tsx`)

Custom map marker displaying a price label or genre-colored dot.

| Prop | Type | Description |
|------|------|-------------|
| `show` | `Show` | Show data for price display |
| `isSelected` | `boolean` | Whether this pin is currently selected |

### FilterPresetPicker (`FilterPresetPicker.tsx`)

Horizontal scroll of saved filter preset pills.

| Prop | Type | Description |
|------|------|-------------|
| `presets` | `SavedFilter[]` | Available filter presets |
| `onSelect` | `(filter: ShowFilter) => void` | Called when a preset is tapped |
| `onDelete` | `(id: string) => void` | Called when delete is triggered |

### ShowSearchContext (`src/context/ShowSearchContext.tsx`)

React context that combines `useShowSearch` and `useSavedFilters` for cross-route state sharing between the Shows tab and the filter modal.

**Provided values:** `query`, `filter`, `sort`, `results`, `total`, `hasMore`, `isLoading`, `error`, `setQuery`, `setFilter`, `updateFilter`, `clearFilter`, `setSort`, `loadMore`, `refresh`, `savedFilters`, `saveFilter`, `deleteFilter`, `userLocation`, `requestLocationPermission`.

---

## 6. Testing Guide

### Running Tests

```bash
npm test
```

This runs Jest with `ts-jest` for TypeScript support. The Jest configuration is in `jest.config.js` with the `@/` path alias mapped.

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `src/__tests__/dateUtils.test.ts` | ~20 | `daysFromNow`, `resolveDateRange` (all 5 presets including Sunday boundary), `isDateInRange` (inclusive bounds, edge cases) |
| `src/__tests__/geoUtils.test.ts` | ~9 | `haversine` (known distances, symmetry, antipodal points, same-point), `DEFAULT_LOCATION` |
| `src/__tests__/showService.test.ts` | ~40 | Every filter dimension individually and in combination, all 3 sort options, pagination, entity resolution, all 6 service functions |
| `src/__tests__/filterStorage.test.ts` | ~20 | Full CRUD, 50-char name limit, 20-filter maximum, default preset seeding, default preset delete protection |

### What Is Covered

- **Date utilities:** All preset resolutions, leap year and year-boundary edge cases
- **Geo utilities:** Known city-pair distances, symmetry property, degenerate inputs
- **Show service filter chain:** Text search, date range, genre, venue, city, DJ, price, sold-out filters -- each tested in isolation and in combination
- **Show service sorting:** Date ascending/descending, popularity, distance (with and without user location fallback)
- **Show service pagination:** Page boundaries, `hasMore` flag, total count
- **Entity resolution:** Venue, DJ, and genre joins from IDs
- **Filter storage:** Create, read, update, delete operations; constraint enforcement

### What Is Not Covered

- React component rendering tests (no component test framework configured)
- Navigation flow integration tests
- Map view behavior
- Animation behavior
- AsyncStorage is mocked in tests (not tested against real storage)

### Adding New Tests

1. Create a test file in `src/__tests__/` following the naming convention `<module>.test.ts`.
2. Import the module under test using the `@/` path alias.
3. For service tests, the mock data is available directly -- no setup needed.
4. For storage tests, mock `@react-native-async-storage/async-storage` (Jest will auto-mock it).
5. Run `npm test` to execute.

---

## 7. Known Limitations

### Current Limitations

1. **Mock data only** -- All show, venue, and DJ data is local. There is no backend API. The 18 shows and 9 venues provide enough data for UI development but do not reflect real-world volume.

2. **No venue detail screen** -- `app/venue/[id].tsx` is specified in the architecture but was not implemented in the frontend phase. Show detail links to venues but the venue screen does not exist yet.

3. **Discover tab integration incomplete** -- The architecture specifies an "Upcoming Shows" section on the Discover tab linking to the Shows tab. This was not implemented.

4. **Map clustering not implemented** -- `react-native-map-clustering` is listed as an optional dependency. With only 18 mock shows, clustering is unnecessary, but it will be needed at scale.

5. **`getItemLayout` not wired** -- `ShowListView` defines a `getItemLayout` function but it is not connected to the FlatList, reducing scroll-to-index performance.

6. **`renderItem` not memoized** -- The `renderItem` callback in `ShowListView` is recreated on every render, which undermines the `React.memo` wrapper on `ShowCard`.

7. **Stale closure in `useShowSearch`** -- The `executeSearch` function closes over a stale `effectiveFilter` value. This is a critical bug that can cause searches to use outdated filter state.

8. **useEffect dependency array incomplete** -- In `useShowSearch`, the effect that triggers searches is missing `executeSearch` in its dependency array, which can cause missed re-executions.

9. **Map marker `tracksViewChanges`** -- Custom map markers in `ShowMapView` do not set `tracksViewChanges={false}` after initial render, causing unnecessary re-draws.

10. **ShowCard memo comparator incomplete** -- The comparator checks only `show.id` but ignores `compact` and `distance` props, potentially showing stale values.

11. **Filter modal context integration** -- The filter modal may not pass filters back correctly via context (noted as a functional bug in testing).

12. **No input sanitization** -- Search queries are not length-limited or sanitized. Safe with mock data but must be addressed before API migration.

13. **Unused animation values** -- `shows.tsx` contains cross-fade animation shared values that are allocated but never used, wasting Reanimated worklet resources.

### Planned Improvements

- Fix all critical and high-priority items from the testing phase (stale closure, dependency arrays, memoization)
- Implement venue detail screen (`app/venue/[id].tsx`)
- Add "Upcoming Shows" section to the Discover tab
- Add schema validation on AsyncStorage reads
- Add input length validation on search queries
- Add parameter validation in service functions (page >= 0, pageSize 1-50)
- Wire `getItemLayout` to FlatList
- Set `tracksViewChanges={false}` on map markers after mount
- Migrate to `expo-image` for better image caching
- Add map pin clustering for scale

---

## 8. Architecture Decision Records

### ADR 1: Mock Data Layer Instead of Real Backend

**Context:** The app needs show/event data for the search and filtering feature, but there is no backend infrastructure.

**Decision:** All data lives in `src/data/mockData.ts` as in-memory arrays. The service layer (`showService.ts`) performs filtering, sorting, and pagination on these arrays. All service functions return Promises even though operations are synchronous.

**Rationale:**
- Matches the existing pattern in the codebase (DJs, feed items, genres are already mock data)
- Allows full frontend development without backend dependencies
- The async Promise-based interface means the service layer can be swapped for real `fetch()` calls without changing any hooks, components, or types
- Mock data uses relative date helpers (`daysFromNow`) so shows are always "upcoming" regardless of when the app is opened

**Trade-offs:**
- No realistic latency simulation (Promises resolve instantly)
- No network error testing without manual injection
- In-memory filtering does not surface performance issues that would appear with large datasets

### ADR 2: Service Abstraction Layer

**Context:** Components need show data, but direct access to mock arrays would create tight coupling that prevents API migration.

**Decision:** All data access goes through `src/data/showService.ts`. Components and hooks never import from `mockData.ts` directly. The service defines 6 public functions with strict TypeScript signatures.

**Rationale:**
- Single file to change when migrating to a real API (`showService.ts` internals change, signatures stay the same)
- The `ShowSearchResult` type pre-resolves entity relationships (venue, DJs, genres from IDs), matching what a REST API with `?include=` would return
- `PaginatedResult<T>` envelope matches standard REST pagination patterns
- Function signatures map directly to REST endpoints (documented in the database design doc as an API contract sketch)

**Migration path:** Create an `ApiShowService` implementing the same signatures with `fetch()`. A module-level toggle or React Context selects between mock and real implementations based on an environment variable.

### ADR 3: Filter Preset Storage in AsyncStorage

**Context:** Users want to save filter presets for quick reuse. The app has no backend for user preferences.

**Decision:** Saved filters are stored locally in AsyncStorage under the key `@mixr/saved-filters` as a JSON-serialized array of `SavedFilter` objects.

**Rationale:**
- AsyncStorage is already available in Expo SDK 54
- Saved filters are inherently user-local (different users on different devices want different presets)
- Even with a real backend, local-first storage provides instant load times and offline access
- Simple CRUD operations with constraints (max 20 filters, 50-char names) enforced in the storage layer

**Constraints:**
- Maximum 20 saved filters to prevent unbounded storage growth
- 3 default presets ("This Weekend", "Nearby Tonight", "Free Shows") are seeded on first load and cannot be deleted
- No cross-device sync (would require a user preferences API endpoint in the future)

**Known weakness:** `JSON.parse` on stored data lacks schema validation. Corrupt or tampered storage could crash the app. Schema validation should be added before production release.

### ADR 4: Map Integration Approach

**Context:** Users want a map view showing nearby shows as pins.

**Decision:** Use `react-native-maps` with Apple Maps on iOS (zero configuration) and Google Maps on Android (requires API key). Custom markers display price labels. A bottom-sheet preview card appears on pin tap.

**Rationale:**
- `react-native-maps` is the standard React Native mapping library with strong Expo support
- Apple Maps on iOS requires no API key or configuration, reducing setup friction
- Custom markers (ShowMapPin) are lightweight colored circles with price text, avoiding heavy custom views
- Bottom-sheet pattern (ShowMapPreview) keeps context without navigating away from the map
- Map region auto-fits to search results using `fitToCoordinates()`, then respects user panning

**Deferred decisions:**
- Pin clustering (`react-native-map-clustering`) is not implemented. With 18 mock shows it is unnecessary, but the architecture accommodates it as a drop-in addition
- Google Maps API key for Android is not configured (iOS-first development)
- Directions integration (opening native maps app) is mentioned in the show detail screen but not fully implemented

**Graceful degradation:** `ShowMapView` includes a fallback if `react-native-maps` is not installed, ensuring the app does not crash if the dependency is missing.
