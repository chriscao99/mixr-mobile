# Database/Data Layer Implementation: Design Refresh + Location-Based Show Discovery

## New Files Created

| File | Purpose |
|------|---------|
| `src/types/location.ts` | Location types: UserLocation, LocationState, DistanceInfo, NearbyRankingWeights, RankedNearbyShow |
| `src/theme/effects.ts` | Shadow/glow presets: glowPurple, glowTeal, cardLift, cardPressed |
| `src/data/nearbyService.ts` | Nearby show ranking with composite scoring algorithm |

## Modified Files

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added homeCoordinate to DJ, extended FeedItem with nearby types, location type re-exports |
| `src/types/show.ts` | Added maxDistanceKm/followedDjsOnly to ShowFilter, nearby_rank to ShowSortField, distanceInfo to ShowSearchResult |
| `src/theme/colors.ts` | Added glow colors, surface layers, gradient mesh points, 6 new gradient presets |
| `src/theme/typography.ts` | Added display and overline text styles |
| `src/theme/spacing.ts` | Added 6xl/8xl spacing, sectionGap/cardGap screen values |
| `src/theme/index.ts` | Added effects re-export |
| `src/data/geoUtils.ts` | Added LOCATION_PRESETS, formatDistance, createDistanceInfo, getCityFromCoordinate |
| `src/data/mockData.ts` | Added homeCoordinate to all 6 DJs |
| `src/data/showService.ts` | Added distance filter, followed-DJs-only filter, nearby_rank sort |

## Key Implementation Details

- All type changes are additive (no breaking changes)
- Nearby ranking uses composite score: 40% proximity + 30% time urgency + 20% social signal + 10% popularity
- Distance formatting in miles by default, supports < 1 mi display
- Mock reverse geocoding via proximity to preset city coordinates (within 50km)
- Show service filter chain extended with steps 8.5 (distance) and 8.6 (followed DJs)
- TypeScript compilation: zero errors in changed files
