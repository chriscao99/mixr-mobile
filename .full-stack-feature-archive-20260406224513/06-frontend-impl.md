# Frontend Implementation: Search & Filtering

## Files Created (16)

### Hooks (3)
- `src/hooks/useDebounce.ts` — Generic debounce hook (300ms default)
- `src/hooks/useShowSearch.ts` — Core search hook: query, filter, sort, pagination, loading/error state, debounced search, loadMore
- `src/hooks/useSavedFilters.ts` — CRUD wrapper around filterStorage

### Context (1)
- `src/context/ShowSearchContext.tsx` — React context combining useShowSearch + useSavedFilters for cross-route state sharing

### Show Components (10)
- `src/components/shows/SearchBar.tsx` — Animated search input with focus color animation, clear button
- `src/components/shows/FilterChips.tsx` — Horizontal scroll of active filter chips with remove/clear
- `src/components/shows/ViewToggle.tsx` — List/Map toggle
- `src/components/shows/ShowDateBadge.tsx` — Date display badge (SAT / APR 11 format)
- `src/components/shows/ShowCard.tsx` — Show card with image, date, DJs, venue, time, price, genres. React.memo optimized.
- `src/components/shows/ShowListView.tsx` — FlatList with pagination, empty state, loading states
- `src/components/shows/ShowMapView.tsx` — Map view with custom markers, pin selection, bottom preview card
- `src/components/shows/ShowMapPin.tsx` — Custom map marker with price label
- `src/components/shows/FilterPresetPicker.tsx` — Saved filter preset pills
- `src/components/shows/index.ts` — Barrel export

### Route Screens (3)
- `app/(tabs)/shows.tsx` — Shows tab with search, filters, sort, view toggle, results
- `app/show/[id].tsx` — Show detail with parallax hero, DJ lineup, venue card, related shows
- `app/filter-modal.tsx` — Full filter modal with all filter dimensions + saved presets

## Files Modified (2)
- `app/(tabs)/_layout.tsx` — Added Shows tab (4th tab) with Calendar icon
- `app/_layout.tsx` — Added Stack.Screen entries for show/[id] and filter-modal

## Key Patterns
- Dark theme with glass/blur aesthetic using src/theme/ tokens
- lucide-react-native icons throughout
- react-native-reanimated for search focus, filter chip, and view toggle animations
- Reuses existing UI components (GlassCard, GenrePill, GradientButton)
- All data via showService (never imports mockData directly)
- Map view with graceful fallback if react-native-maps not installed
