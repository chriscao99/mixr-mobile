# Data Model Design: Design Refresh + Location-Based Show Discovery

## 1. Core Type Additions

### 1.1 User Location State (`src/types/location.ts`)

```typescript
export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface UserLocation {
  coordinate: Coordinate;
  accuracy?: number;
  timestamp: number;
  source: 'gps' | 'default';
}

export interface LocationState {
  permission: LocationPermissionStatus;
  userLocation: UserLocation | null;
  isLoading: boolean;
  error?: string;
}
```

### 1.2 Distance & Proximity Types

```typescript
export type DistanceUnit = 'mi' | 'km';

export interface DistanceInfo {
  distanceKm: number;
  displayText: string;
  isApproximate: boolean;
}
```

### 1.3 Nearby Show Ranking

```typescript
export interface NearbyRankingWeights {
  proximity: number;    // default 0.40
  timeUrgency: number;  // default 0.30
  socialSignal: number; // default 0.20
  // popularity: remaining 0.10
}

export interface RankedNearbyShow {
  result: ShowSearchResult;
  distance: DistanceInfo;
  score: number;
  scoreBreakdown: {
    proximityScore: number;
    timeScore: number;
    socialScore: number;
    popularityBonus: number;
  };
  hasFollowedDj: boolean;
  followedDjCount: number;
}
```

## 2. Modifications to Existing Types

### ShowFilter — Add distance filtering
- `maxDistanceKm?: number` — max radius from user
- `followedDjsOnly?: boolean` — only shows with followed DJs

### ShowSortField — Add composite sort
- Add `'nearby_rank'` to existing union

### ShowSearchResult — Rich distance data
- `distanceInfo?: DistanceInfo` — formatted distance with approximate flag

### FeedItem — Location-based types
- Add types: `'nearby_show' | 'followed_dj_nearby'`
- Add fields: `showId?`, `distanceInfo?`, `venueName?`

### DJ — Add home coordinate
- `homeCoordinate?: Coordinate` — lat/lng for distance calc

## 3. Location Data Flow

```
Device GPS (expo-location)
  → useUserLocation() hook
    → LocationContext (React Context)
      → useShowSearch(userLocation)     // existing, add distance filter
      → useNearbyShows(userLocation)    // NEW: ranked nearby shows
      → Home Feed (nearby show cards)
      → Shows Tab (distance badges, proximity sort)
      → Map View (center on user)
```

## 4. Scoring Algorithm

Composite score = proximity(0.40) + timeUrgency(0.30) + socialSignal(0.20) + popularity(0.10)

- **Proximity**: 100 at 0km, linear decay to 0 at 50km
- **Time urgency**: 100 within 2hrs, 80 within 24hrs, 50 within 3 days, 20 within 7 days, 0 after
- **Social**: 75 if 1 followed DJ, +25 per additional, 0 if none
- **Popularity**: Direct from show.popularity (0-100)

## 5. Mock Data Enhancements

- Add `homeCoordinate` to all 6 DJs (mapped from their city)
- Add `LOCATION_PRESETS` for LA, NYC, Miami, Chicago, Atlanta
- Location-based feed items generated dynamically by nearbyService

## 6. New Files

| File | Purpose |
|------|---------|
| `src/types/location.ts` | All location-related types |
| `src/hooks/useUserLocation.ts` | Location permission + GPS hook |
| `src/data/nearbyService.ts` | Nearby show ranking service |
| `src/data/geoUtils.ts` | Distance calculation, formatting, presets |

## 7. Modified Files

| File | Change |
|------|--------|
| `src/types/show.ts` | Add maxDistanceKm, followedDjsOnly to ShowFilter; nearby_rank to ShowSortField; distanceInfo to ShowSearchResult |
| `src/types/index.ts` | Add fields to DJ, FeedItem; re-export location types |
| `src/data/mockData.ts` | Add homeCoordinate to DJs |
| `src/data/showService.ts` | Add distance filter step, nearby_rank sort |

All changes are additive — no breaking changes to existing interfaces.
