# Backend/Service Layer Implementation: Search & Filtering

## Note
Since this feature uses mock data only (no real backend), the service layer was implemented as part of Step 4 (Data Layer). The service layer in `src/data/showService.ts` serves as the "backend" — all business logic (filtering, sorting, pagination, entity resolution) lives there.

## Service Layer Summary

### showService.ts
- `searchShows(filter, sort, page, pageSize, userLocation?)` — Main search with 10-step filter chain
- `getShowById(id)` — Single show detail with resolved entities
- `getVenues()` — All venues for filter picker
- `getCities()` — Derived cities with show counts
- `getUpcomingShowsForDj(djId)` — Shows for DJ detail screen
- `getShowsAtVenue(venueId)` — Shows at a specific venue

### filterStorage.ts
- `getSavedFilters()` — Read all presets from AsyncStorage
- `saveFilter(name, filter)` — Create new preset
- `updateFilter(id, updates)` — Update existing preset
- `deleteFilter(id)` — Remove preset (default presets protected)

All functions async, consistent return types, ready for API swap.
