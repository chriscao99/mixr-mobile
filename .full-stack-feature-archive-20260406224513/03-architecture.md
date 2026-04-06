# Frontend Architecture: Search & Filtering for Shows/Events

## 1. Service Layer Architecture

### 1.1 File Structure

```
src/
  data/
    mockData.ts              # Existing -- extend with venues[] and shows[]
    showService.ts           # NEW -- main service layer
    filterStorage.ts         # NEW -- AsyncStorage CRUD for SavedFilter
    dateUtils.ts             # NEW -- daysFromNow(), date range resolution
    geoUtils.ts              # NEW -- haversine(), default location
```

### 1.2 showService.ts

All functions return Promises to maintain the async boundary for future API swap. Internally they operate on in-memory arrays imported from `mockData.ts`.

```typescript
// --- Public API ---

searchShows(
  filter: ShowFilter,
  sort: ShowSortOption,
  page: number,
  pageSize: number,
  userLocation?: Coordinate
): Promise<PaginatedResult<ShowSearchResult>>

getShowById(id: string): Promise<ShowSearchResult | null>

getVenues(): Promise<Venue[]>

getCities(): Promise<City[]>

getUpcomingShowsForDj(djId: string): Promise<ShowSearchResult[]>

getShowsAtVenue(venueId: string): Promise<ShowSearchResult[]>
```

**`searchShows` internals** (applied in order):

1. **Default date gate**: If no `dateRange` is set, exclude shows with `date < today`.
2. **Text search**: Case-insensitive substring match against show name, tags, resolved DJ names, resolved venue name. Any match passes.
3. **Date range resolution**: Convert `DateRangePreset` to concrete `{startDate, endDate}` using `dateUtils.ts`. "this_weekend" resolves to the coming Saturday 00:00 through Sunday 23:59. Filter `show.date` to fall within range.
4. **Genre filter**: Intersection check -- `show.genreIds` vs `filter.genreIds`.
5. **Venue/City filter**: Match `show.venueId` against `filter.venueIds` OR resolved venue city against `filter.cities`.
6. **DJ filter**: Intersection check -- `show.djIds` vs `filter.djIds`.
7. **Price filter**: Pass if `show.priceMin <= filter.priceMax`.
8. **Sold out filter**: If `filter.excludeSoldOut`, remove `isSoldOut === true`.
9. **Entity resolution**: For each surviving show, resolve `venue`, `djs[]`, `genres[]` from the mock arrays. Compute `distance` if `userLocation` is provided.
10. **Sort**: By `field` and `direction`. Distance sort falls back to date sort when no user location.
11. **Paginate**: Slice array, return `PaginatedResult` envelope.

Internal helper functions (not exported):

- `resolveShow(show: Show): ShowSearchResult` -- joins show with venue, DJs, genres.
- `matchesTextQuery(result: ShowSearchResult, query: string): boolean`
- `resolveDateRange(preset: DateRangePreset): { startDate: string; endDate: string }`

### 1.3 filterStorage.ts

Thin wrapper around AsyncStorage under key `@mixr/saved-filters`.

```typescript
getSavedFilters(): Promise<SavedFilter[]>
saveFilter(name: string, filter: ShowFilter): Promise<SavedFilter>
updateFilter(id: string, updates: Partial<Pick<SavedFilter, 'name' | 'filter'>>): Promise<SavedFilter>
deleteFilter(id: string): Promise<void>
```

On first load, if the storage key is empty, seed with the 3 default presets ("This Weekend", "Nearby Tonight", "Free Shows") with `isDefault: true`.

Enforces max 20 filters and max 50-char names. Throws typed errors (see section 4.1).

### 1.4 dateUtils.ts

```typescript
daysFromNow(n: number): string           // Returns ISO date string
resolveDateRange(preset: DateRangePreset): { startDate: string; endDate: string }
isDateInRange(date: string, start: string, end: string): boolean
formatShowDate(isoDate: string): string   // "Sat, Apr 11"
formatShowTime(isoDatetime: string): string // "10:00 PM"
```

### 1.5 geoUtils.ts

```typescript
haversine(lat1: number, lon1: number, lat2: number, lon2: number): number  // km
formatDistance(km: number): string  // "2.4 mi" or "0.3 mi"

const DEFAULT_LOCATION: Coordinate = { latitude: 34.0522, longitude: -118.2437 }; // downtown LA
```

### 1.6 Data Flow Diagram

```
Component (e.g., ShowsScreen)
  |
  |-- calls searchShows(filter, sort, page, pageSize, userLocation)
  |
  v
showService.ts
  |
  |-- reads from mockData.ts (shows[], venues[], djs[], genres[])
  |-- applies filter chain
  |-- resolves relationships (joins)
  |-- sorts and paginates
  |
  v
Returns Promise<PaginatedResult<ShowSearchResult>>
  |
  v
Component receives data, updates state, renders
```

---

## 2. Frontend Architecture

### 2.1 Component Hierarchy & File Paths

#### New Routes (app/)

```
app/
  (tabs)/
    _layout.tsx              # MODIFY -- add 4th tab: "Shows" (Calendar icon)
    shows.tsx                # NEW -- Shows tab screen (search + results)
    discover.tsx             # MODIFY -- add "Upcoming Shows" section linking to Shows tab
  show/
    [id].tsx                 # NEW -- Show detail screen (push from list/map)
  venue/
    [id].tsx                 # NEW -- Venue detail screen (push from show detail)
  filter-modal.tsx           # NEW -- Full filter panel (presented as modal)
```

#### New Source Components (src/)

```
src/
  components/
    shows/
      ShowCard.tsx             # Presentational card for a single show result
      ShowListView.tsx         # Virtualized FlatList of ShowCard items
      ShowMapView.tsx          # Map with show pins, bottom sheet preview
      ShowSearchBar.tsx        # Active text input with clear button
      ShowSortPicker.tsx       # Horizontal pill row: Date / Distance / Popular
      FilterChipBar.tsx        # Horizontal scroll of active filter summary chips
      FilterPanel.tsx          # Full filter form (genre, date, city, venue, price)
      DateRangePicker.tsx      # Date preset pills + custom date range
      SavedFilterList.tsx      # List of saved presets with apply/delete
      SaveFilterModal.tsx      # Name input dialog for saving current filter
      ShowMapPin.tsx           # Custom map marker (price badge or genre dot)
      ShowMapPreview.tsx       # Bottom sheet card shown when a pin is tapped
      ViewToggle.tsx           # List/Map toggle button
    ui/
      Chip.tsx                 # NEW -- general-purpose removable chip (for active filters)
      EmptyState.tsx           # NEW -- illustrated empty state for no results
      SkeletonCard.tsx         # NEW -- loading placeholder for show cards
```

#### New Hooks (src/hooks/)

```
src/hooks/
  useShowSearch.ts           # Core hook: manages filter/sort/pagination state, calls showService
  useSavedFilters.ts         # CRUD wrapper around filterStorage with loading state
  useUserLocation.ts         # expo-location permission + coordinates
  useDebounce.ts             # Generic debounce for search query (300ms)
  useMapRegion.ts            # Map region state derived from search results
```

### 2.2 State Management

No external state library. State lives in hooks and is lifted to screen-level components. This matches the existing pattern (see `discover.tsx` and `index.tsx` using `useState` at screen level).

#### useShowSearch Hook (central state owner)

This is the main hook consumed by `app/(tabs)/shows.tsx`. It encapsulates all search/filter/sort/pagination state.

```typescript
interface UseShowSearchReturn {
  // State
  query: string;
  filter: ShowFilter;
  sort: ShowSortOption;
  results: ShowSearchResult[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: ServiceError | null;

  // Actions
  setQuery: (q: string) => void;          // debounced internally (300ms)
  setFilter: (f: ShowFilter) => void;     // resets page to 0, triggers search
  updateFilter: (partial: Partial<ShowFilter>) => void;
  clearFilter: () => void;
  setSort: (s: ShowSortOption) => void;   // resets page, triggers search
  loadMore: () => void;                   // increments page, appends results
  refresh: () => void;                    // resets to page 0, re-fetches
}
```

**Internal behavior:**

- `setQuery` uses `useDebounce` (300ms). On debounced value change, calls `searchShows` with page 0.
- `setFilter` / `updateFilter` / `setSort` immediately reset page to 0 and trigger a new search.
- `loadMore` increments page counter and appends results to the existing array (infinite scroll).
- `refresh` clears results and re-fetches from page 0.
- All searches call `searchShows(filter, sort, page, PAGE_SIZE, userLocation)`.
- `userLocation` comes from `useUserLocation` passed as a parameter to the hook.

**Page size:** 10 items.

#### useSavedFilters Hook

```typescript
interface UseSavedFiltersReturn {
  filters: SavedFilter[];
  isLoading: boolean;
  save: (name: string, filter: ShowFilter) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, updates: ...) => Promise<void>;
}
```

Loads on mount via `useEffect`. Exposes CRUD operations that update local state optimistically and persist to AsyncStorage.

#### useUserLocation Hook

```typescript
interface UseUserLocationReturn {
  location: Coordinate | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}
```

Uses `expo-location`. Requests `foregroundPermission` on demand (not on mount -- triggered by first distance sort or map view open). Falls back to `DEFAULT_LOCATION` from `geoUtils.ts` if denied.

#### State Location Summary

| State | Owner | Persistence |
|---|---|---|
| Search query | `useShowSearch` (in `shows.tsx`) | None (ephemeral) |
| Active filter | `useShowSearch` | None (ephemeral) |
| Sort option | `useShowSearch` | None (ephemeral) |
| Search results | `useShowSearch` | None (ephemeral) |
| Pagination cursor | `useShowSearch` | None (ephemeral) |
| Saved filter presets | `useSavedFilters` | AsyncStorage |
| User location | `useUserLocation` | None (re-requested each session) |
| List/Map view toggle | `useState` in `shows.tsx` | None |
| Map region | `useMapRegion` | None (derived from results) |

### 2.3 Routing

#### New Tab: Shows

Add a 4th tab to `app/(tabs)/_layout.tsx`:

```
tabs array becomes:
  { name: 'index',    label: 'FEED',     icon: House }
  { name: 'discover', label: 'DISCOVER', icon: Search }
  { name: 'shows',    label: 'SHOWS',    icon: Calendar }
  { name: 'profile',  label: 'PROFILE',  icon: User }
```

The `Calendar` icon comes from `lucide-react-native`.

#### New Stack Screens

Add to `app/_layout.tsx` Stack:

```tsx
<Stack.Screen name="show/[id]" options={{ headerShown: false, presentation: 'card' }} />
<Stack.Screen name="venue/[id]" options={{ headerShown: false, presentation: 'card' }} />
<Stack.Screen name="filter-modal" options={{ presentation: 'modal', headerShown: false }} />
```

#### Navigation Flows

1. **Shows tab** -> tap show card -> `router.push('/show/${id}')` -> Show detail (card push)
2. **Shows tab** -> tap "Filters" button -> `router.push('/filter-modal')` -> Filter modal
3. **Show detail** -> tap venue name -> `router.push('/venue/${venueId}')` -> Venue detail
4. **Show detail** -> tap DJ avatar -> `router.push('/dj/${djId}')` -> existing DJ detail
5. **Discover tab** -> "Upcoming Shows" section -> tap "See All" -> switches to Shows tab via `router.navigate('/(tabs)/shows')`
6. **Filter modal** -> apply -> `router.back()` (passes filter via shared hook state, not params)

### 2.4 Service Layer Integration

#### Pattern: Hook Calls Service, Component Reads Hook

Components never import `showService` directly. They consume `useShowSearch` which handles:

- Calling `searchShows()` on filter/sort/query changes
- Managing loading/error/data states
- Pagination (load more)
- Debouncing text search

This is consistent with how the existing app works -- screens own state via `useState`/`useMemo`, data comes from mock imports. The hook simply adds an async layer.

#### Loading States

Three loading states per the hook:

| State | UI Treatment |
|---|---|
| Initial load (`results.length === 0 && isLoading`) | 3 `SkeletonCard` placeholders |
| Filtering/sorting (`results.length > 0 && isLoading`) | Existing results stay visible, subtle spinner in header |
| Load more (`hasMore && isLoading`) | Spinner at bottom of FlatList (`ListFooterComponent`) |

#### Error States

| Error | UI Treatment |
|---|---|
| Service error (unexpected) | `EmptyState` with retry button |
| No results for filter | `EmptyState` with "No shows match your filters" + "Clear filters" button |
| Location permission denied | Toast/banner: "Enable location for distance sorting", falls back to default location |
| SavedFilter limit reached | Inline error in `SaveFilterModal`: "Maximum 20 presets reached" |

### 2.5 Map Integration

#### Setup

- Add `react-native-maps` dependency.
- No native config changes needed for Expo managed workflow with SDK 54 (Apple Maps on iOS, Google Maps on Android with API key in `app.json`).
- For initial development (mock data, iOS focus), Apple Maps works out of the box with zero config.

#### ShowMapView Component

```
ShowMapView
  |-- MapView (react-native-maps)
  |     |-- Marker[] (one per ShowSearchResult, positioned at venue coordinates)
  |     |     |-- ShowMapPin (custom marker: small circle with genre color)
  |     |-- optional: user location dot (if location available)
  |
  |-- ShowMapPreview (absolute-positioned bottom sheet)
        |-- ShowCard (compact variant, shown when a pin is tapped)
        |-- "View Details" button -> navigates to show/[id]
```

#### Map Region Logic (useMapRegion)

- On initial render: fit all result pins with padding using `mapRef.fitToCoordinates()`.
- When results change (new search): animate to fit new coordinates.
- When a pin is tapped: animate to center on that pin, open bottom preview.
- When user pans manually: do NOT reset region (respect user control). Only reset on new search.

#### User Location on Map

- If `useUserLocation` has coordinates, show a blue dot via `MapView.showsUserLocation={true}`.
- The user location dot is native to `react-native-maps` and requires no custom component.

---

## 3. Screen-by-Screen Breakdown

### 3.1 Shows Tab (`app/(tabs)/shows.tsx`)

The primary screen. Composes all search/filter/list/map components.

```
SafeAreaView
  |-- Header ("Shows" title)
  |-- ShowSearchBar
  |-- FilterChipBar (horizontal scroll of active filters, tap to remove)
  |     |-- Chip("This Weekend") | Chip("House") | Chip("< $50") | [+ Filters] button
  |-- ShowSortPicker (Date | Distance | Popular)
  |-- ViewToggle (List | Map)
  |
  |-- if listView:
  |     ShowListView (FlatList)
  |       |-- ShowCard (repeated)
  |       |-- ListFooterComponent (load more spinner or end-of-list)
  |
  |-- if mapView:
        ShowMapView
          |-- MapView with pins
          |-- ShowMapPreview (bottom sheet on pin tap)
```

**State ownership:** `shows.tsx` calls `useShowSearch()`, `useSavedFilters()`, `useUserLocation()`, and passes data down as props. A `useState<'list' | 'map'>` controls the view toggle.

### 3.2 Filter Modal (`app/filter-modal.tsx`)

Full-screen modal for detailed filtering. Opened from the `[+ Filters]` chip or a filter icon.

```
ScrollView
  |-- Header ("Filters" + Close button + "Clear All")
  |
  |-- SavedFilterList (horizontal scroll of preset pills)
  |     |-- "This Weekend" | "Nearby Tonight" | "Free Shows" | user presets...
  |
  |-- Section: Date Range
  |     DateRangePicker
  |       |-- Preset pills: Today | This Week | This Weekend | Next Week | This Month
  |       |-- Custom range: Start date / End date (native date picker)
  |
  |-- Section: Genres
  |     GenrePill[] (reuse existing component, multi-select)
  |
  |-- Section: City
  |     Chip[] (derived from getCities(), multi-select)
  |
  |-- Section: Venue
  |     Chip[] (from getVenues(), multi-select, shown after city selected)
  |
  |-- Section: Price
  |     Slider or preset pills: Free | Under $25 | Under $50 | Under $100 | Any
  |
  |-- Section: Other
  |     Toggle: "Hide sold out shows"
  |
  |-- Footer (sticky)
        |-- "Save Preset" button -> opens SaveFilterModal
        |-- "Show N Results" GradientButton -> applies filter + router.back()
```

**Communication pattern:** The filter modal does NOT receive/return filter state via route params. Instead, the `useShowSearch` hook is instantiated in `shows.tsx` and the filter modal receives the current filter and a `setFilter` callback through React context. Specifically:

- Create a `ShowSearchContext` that wraps the Shows tab and its modal.
- The context provides `{ filter, setFilter, sort, setSort }`.
- The filter modal reads from and writes to this context.
- When the modal calls `setFilter`, the hook in `shows.tsx` triggers a new search automatically.

### 3.3 Show Detail (`app/show/[id].tsx`)

Follows the same pattern as `app/dj/[id].tsx` -- parallax hero image, scrollable content.

```
ScrollView
  |-- Hero image (show flyer) with gradient overlay + parallax
  |-- Back button (absolute)
  |
  |-- Show name (h1)
  |-- Date + Time row (formatted via dateUtils)
  |-- GenrePill[] row
  |
  |-- GlassCard: Venue info
  |     |-- Venue name, address
  |     |-- Mini MapView (static, single pin, tap opens full map/directions)
  |     |-- "View Venue" link -> venue/[id]
  |
  |-- GlassCard: Lineup
  |     |-- DJ avatar + name rows (tap -> dj/[id])
  |
  |-- GlassCard: Details
  |     |-- Price range
  |     |-- Doors open time
  |     |-- Sold out badge (if applicable)
  |
  |-- GlassCard: More shows at this venue (from getShowsAtVenue)
```

### 3.4 Venue Detail (`app/venue/[id].tsx`)

```
ScrollView
  |-- Hero image (venue photo) with gradient overlay
  |-- Back button
  |
  |-- Venue name (h1)
  |-- Address, city, capacity, venue type
  |
  |-- MapView (medium height, single pin, shows directions intent)
  |
  |-- "Upcoming Shows" section
  |     ShowCard[] (from getShowsAtVenue)
```

### 3.5 Discover Tab Modifications (`app/(tabs)/discover.tsx`)

Add a new section below the existing DJ list:

```
... existing content ...

|-- Section: "Upcoming Shows" (h3)
|     |-- Horizontal ScrollView of compact ShowCards (first 5 results, sorted by date)
|     |-- "See All Shows ->" link (navigates to Shows tab)
```

This section calls `searchShows` with default filter (upcoming, sorted by date, page 0, pageSize 5) on mount.

---

## 4. Cross-Cutting Concerns

### 4.1 Error Handling

#### Typed Error Hierarchy

```typescript
// src/data/errors.ts
type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'STORAGE_FULL'
  | 'INVALID_FILTER'
  | 'LOCATION_DENIED'
  | 'UNKNOWN';

interface ServiceError {
  code: ServiceErrorCode;
  message: string;        // human-readable, safe to display
}
```

#### Flow: Service -> Hook -> Component

1. Service functions throw `ServiceError` objects (not raw Error).
2. Hooks catch errors in their async calls and store them in `error` state.
3. Components read `error` from the hook and render the appropriate UI:
   - `NOT_FOUND`: Show detail screen renders "Show not found" with back button.
   - `STORAGE_FULL`: SaveFilterModal shows inline error text.
   - `INVALID_FILTER`: Unlikely with the UI, but FilterPanel would show validation message.
   - `LOCATION_DENIED`: Banner in ShowMapView offering to use default location.
   - `UNKNOWN`: EmptyState with "Something went wrong" and retry button.

Since this is mock data, most errors will not occur in practice. The error architecture exists so that the real API swap has a clean error surface.

### 4.2 Animations

All animations use `react-native-reanimated` and follow the existing patterns in the codebase (spring physics, `useSharedValue`, `useAnimatedStyle`).

#### Search Bar Focus

- On focus: search bar expands slightly in width, border color animates from `borderGlass` to `accentPrimary` (using `interpolateColor`).
- On blur with empty query: reverse animation.

#### Filter Chip Enter/Exit

- When a filter chip appears: scale from 0 to 1 with spring (`damping: 15, stiffness: 300`), simultaneous fade in.
- When removed: scale to 0 with faster spring, fade out. Uses `Layout.springify()` from Reanimated layout animations.

#### View Toggle (List <-> Map)

- Shared element transition is not needed (too complex for the gain).
- Instead: cross-fade. The outgoing view fades out (opacity 1 -> 0, 200ms), incoming view fades in (opacity 0 -> 1, 200ms). Use `Animated.View` with `useAnimatedStyle` toggled by the view state.

#### Show Card Stagger

- Reuse existing `useStaggerEntrance` hook for the FlatList. Apply to each `ShowCard` with its index.
- On filter change (results replace entirely): reset stagger by keying the FlatList on a search generation counter.

#### Map Pin Tap

- When a pin is tapped, the `ShowMapPreview` bottom sheet slides up from below using `withSpring` translateY animation (from `screen height` to target position).
- Pin itself scales up 1.0 -> 1.3 with spring to indicate selection.

#### Filter Modal

- Uses Expo Router's built-in modal presentation animation (slide up). No custom animation needed.

#### Sort Pill Selection

- Active pill gets a background color transition from transparent to `accentMuted` using `interpolateColor` driven by a shared value.
- Matches the existing `GenrePill` pattern.

### 4.3 Performance

#### Debounced Search

- Text input debounced at 300ms using `useDebounce` hook.
- Filter/sort changes are NOT debounced (they are discrete actions, not continuous typing).

#### Virtualized Lists

- `ShowListView` uses `FlatList` (not `ScrollView`) for the results list.
  - `getItemLayout` for fixed-height `ShowCard` items -- enables jump-to-index and improves scroll performance.
  - `windowSize={5}` to limit off-screen rendering.
  - `maxToRenderPerBatch={10}`.
  - `removeClippedSubviews={true}` on Android.
  - `keyExtractor={(item) => item.show.id}`.

#### Memoization Strategy

| Component | Memo Strategy |
|---|---|
| `ShowCard` | `React.memo` with custom comparator (compares `show.id` only -- show data is immutable in mock) |
| `GenrePill` | Already uses Reanimated; wrap in `React.memo` |
| `FilterChipBar` | `React.memo` -- re-renders only when active filter changes |
| `ShowMapPin` | `React.memo` -- re-renders only when selection state changes |
| `resolveShow` results | `useMemo` in `useShowSearch` keyed on the raw show array and filter |

#### Map Performance

- Cluster pins when zoomed out and there are > 20 shows in a region (use `react-native-map-clustering` or manual clustering). For the initial 15-20 mock shows, clustering is not strictly necessary but the architecture should accommodate it.
- Map markers use lightweight custom views (small colored circles), not complex components.
- Bottom sheet preview renders only the selected show, not all shows.

#### Image Optimization

- Show flyer images in `ShowCard` use `Image` with a fixed size and `resizeMode="cover"`.
- Consider `expo-image` (already available in SDK 54) for better caching and progressive loading if image performance becomes an issue.

#### Pagination

- Page size of 10 keeps initial render fast.
- `loadMore` appends to the existing array -- no re-fetch of previous pages.
- FlatList's `onEndReached` with `onEndReachedThreshold={0.5}` triggers `loadMore`.

---

## 5. Context Provider Structure

A single context wraps the Shows tab and its associated modals to share search state without prop drilling across route boundaries.

```
// src/context/ShowSearchContext.tsx

ShowSearchProvider
  |-- provides: {
  |     query, filter, sort, results, total, hasMore, isLoading, error,
  |     setQuery, setFilter, updateFilter, clearFilter, setSort, loadMore, refresh,
  |     savedFilters, saveFilter, deleteFilter,
  |     userLocation, requestLocationPermission
  |   }
```

**Mounting point:** Wrap in `app/(tabs)/shows.tsx` so the context is available to the shows tab and any modals navigated from it. Since Expo Router modals are siblings in the Stack (not children of the tab), the provider must be placed in `app/_layout.tsx` instead, wrapping the entire Stack. This is acceptable because the provider is lightweight (just passes through hook values) and only initializes data when the shows tab mounts.

Alternative: Use a module-level store (simple pub/sub outside React) shared between `shows.tsx` and `filter-modal.tsx`. This avoids context overhead but adds complexity. Recommendation: start with context in `_layout.tsx`, extract to module store only if performance profiling shows re-render issues.

---

## 6. New Type Definitions

All new types go in `src/types/index.ts` (extend the existing file):

- `Venue`, `VenueType`
- `Show`
- `City`
- `SavedFilter`
- `ShowFilter`, `DateRangePreset`, `CustomDateRange`
- `ShowSortField`, `ShowSortDirection`, `ShowSortOption`
- `ShowSearchResult`
- `PaginatedResult<T>`
- `Coordinate` (`{ latitude: number; longitude: number }`)
- `ServiceError`, `ServiceErrorCode`

These are copied directly from the database design doc (section 2) with no modifications.

---

## 7. New Dependencies

| Package | Purpose | Notes |
|---|---|---|
| `react-native-maps` | Map view for show locations | Apple Maps on iOS (zero config), Google Maps on Android (needs API key in app.json) |
| `expo-location` | User location for distance sorting | Already in Expo SDK 54, just needs install |
| `react-native-map-clustering` | Pin clustering at low zoom | Optional, defer until > 20 shows |

No other new dependencies. AsyncStorage is already available via Expo. Date manipulation uses plain JS `Date` (no moment/dayjs needed for the simple operations required).

---

## 8. Migration Readiness

The architecture is designed so swapping mock data for a real API requires changes in exactly two files:

1. **`src/data/showService.ts`**: Replace in-memory filter/sort/paginate logic with `fetch()` calls. Function signatures stay identical.
2. **`src/data/filterStorage.ts`**: No change needed (saved filters are inherently local-first).

Everything else -- types, hooks, components, routes -- remains untouched. The `useShowSearch` hook does not know or care whether `searchShows` filters in memory or hits a server.
