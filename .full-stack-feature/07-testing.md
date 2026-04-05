# Testing & Validation: Search & Filtering

## Test Suite

### Files Created
- `jest.config.js` — Jest config with ts-jest and @/ path alias
- `src/__tests__/dateUtils.test.ts` — 20 tests (daysFromNow, resolveDateRange, isDateInRange)
- `src/__tests__/geoUtils.test.ts` — 9 tests (haversine, DEFAULT_LOCATION)
- `src/__tests__/showService.test.ts` — 40+ tests (filter chain, sorting, pagination, entity resolution, all 6 service functions)
- `src/__tests__/filterStorage.test.ts` — 20+ tests (CRUD, limits, defaults, validation)

### Coverage Areas
- Date utilities: all presets, edge cases (Sunday boundary, leap year, year boundary)
- Geo utilities: known distances, symmetry, antipodal points
- Show service: every filter dimension individually and in combination, all sort options, pagination, entity resolution
- Filter storage: CRUD, 50-char name limit, 20-filter max, default preset protection

### Modified
- `package.json` — Added jest, ts-jest, @types/jest devDependencies, "test" script

## Security Findings

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | Medium | filterStorage.ts:50 | Unsafe JSON.parse without schema validation |
| 2 | Medium | showService.ts:30-36 | No input sanitization on search query (problematic with real API) |
| 3 | Medium | showService.ts:50-56 | No validation on filter parameters (page, pageSize, array lengths) |
| 4 | Medium | filterStorage.ts:4 | Unencrypted AsyncStorage for user preferences |
| 5 | Low | filterStorage.ts:39-41 | Predictable ID generation (Date.now + Math.random) |
| 6 | Low | show/[id].tsx:68 | Route parameter not validated before service call |
| 7 | Low | show/[id].tsx:138 | Venue name not URI-encoded in maps URL |
| 8 | Low | filter-modal.tsx:148 | Raw error messages exposed to UI |
| 9 | Low | filter-modal.tsx:141 | Missing save-in-progress guard (duplicate saves) |
| 10 | Info | showService.ts:20 | Non-null assertion on venue lookup |
| 11 | Info | filter-modal.tsx:88 | Filter modal doesn't pass filters back via context (functional bug) |

**Positive patterns:** Generation counter prevents stale responses, cleanup flags prevent unmounted updates, debounced search, default presets protected, name length capped.

## Performance Findings

| # | Impact | Location | Issue |
|---|--------|----------|-------|
| 1 | Critical | useShowSearch.ts:52-98 | `executeSearch` closes over stale `effectiveFilter` |
| 2 | High | useShowSearch.ts:101-104 | useEffect missing `executeSearch` in dependency array |
| 3 | High | ShowListView.tsx:35-39 | `renderItem` recreated every render, defeats FlatList memo |
| 4 | High | shows.tsx:95-113 | Unused cross-fade animation values (wasted worklets) |
| 5 | High | ShowCard.tsx:147 | Memo comparator ignores `compact` and `distance` props |
| 6 | Medium | showService.ts:83 | Eager entity resolution before filtering |
| 7 | Medium | ShowListView.tsx:74-89 | `getItemLayout` defined but not wired up |
| 8 | Medium | ShowCard.tsx:51 | useStaggerEntrance runs for compact/recycled cards |
| 9 | Medium | ShowMapView.tsx:85-128 | Custom markers without `tracksViewChanges={false}` |
| 10 | Medium | ShowMapView.tsx:44-49 | Uncleaned setTimeout in useEffect |
| 11 | Low | shows.tsx:92,146,224 | searchKey remounts entire FlatList on sort change |
| 12 | Low | ShowCard.tsx:85 | No image caching (Image vs expo-image) |
| 13 | Low | ShowMapView.tsx:13 | Unused SCREEN_HEIGHT constant |

## Action Items (Critical/High — must fix before delivery)

### Performance (must fix)
1. **CRITICAL:** Fix `executeSearch` stale closure in useShowSearch.ts — move effectiveFilter construction inside callback or use refs
2. **HIGH:** Fix useEffect dependency array in useShowSearch.ts — include executeSearch or restructure trigger pattern
3. **HIGH:** Wrap renderItem in useCallback in ShowListView.tsx
4. **HIGH:** Remove unused cross-fade animation values in shows.tsx
5. **HIGH:** Fix ShowCard memo comparator to include compact and distance

### Security (recommended before API migration)
6. **MEDIUM:** Add schema validation on AsyncStorage JSON.parse in filterStorage.ts
7. **MEDIUM:** Add input length validation on search query (max 200 chars)
8. **MEDIUM:** Add parameter validation in showService (page >= 0, pageSize 1-50, array caps)
