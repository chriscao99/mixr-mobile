# Documentation: Design Refresh + Location-Based Show Discovery

## What Was Built

### Design Refresh
- **Theme evolution**: Added depth layering (4 surface levels), glow/shadow effect tokens, animated gradient presets, `display` and `overline` typography
- **All 5 screens redesigned**: Home, Discover, Shows, Profile, DJ Detail
- **Premium visual language**: Gradient accent lines, section rhythm, glass cards with glow, richer hero gradients
- **New shared components**: SectionHeader, ShimmerPlaceholder, enhanced GlassCard (glow support)
- **Animation improvements**: usePressAnimation hook, stagger entrance with `once` mode and index cap

### Location-Based Show Discovery
- **Device GPS integration** via expo-location with graceful permission handling
- **Nearby show ranking** using composite score: 40% proximity + 30% time urgency + 20% social signal + 10% popularity
- **Home screen**: Featured show card (top ranked) + "Near You" horizontal carousel
- **Shows tab**: LocationHeader with city detection, default sort changed to nearby_rank, distance badges on cards
- **Permission flow**: Silent check on mount, inline prompt when undetermined, fallback to LA when denied

## Architecture Decisions

### ADR 1: Frontend-Only Location with Mock Data
**Decision**: Implement location features entirely client-side with mock data, no real backend.
**Rationale**: Validates the UX and ranking algorithm without backend investment. Mock venues already have lat/lng coordinates. The nearbyService can be swapped to API calls later without changing the component layer.

### ADR 2: LocationContext Over Prop Drilling
**Decision**: Location state in React Context rather than prop drilling or per-screen hooks.
**Rationale**: Multiple screens (Home, Shows, Show Detail) need location data. Context provides a single source of truth with memoized values to prevent unnecessary re-renders. The ConnectedShowSearchProvider bridges location to the existing ShowSearchProvider.

### ADR 3: Composite Ranking Over Simple Distance Sort
**Decision**: Shows ranked by a weighted composite score, not just distance.
**Rationale**: Raw distance sorting surfaces far-away shows that happen to be close. The composite considers proximity, time urgency (tonight > next week), social signal (followed DJs), and popularity. This makes the "Near You" section genuinely useful rather than just a sorted list.

### ADR 4: Visual Depth Over Flat Glass
**Decision**: Introduce surface hierarchy (bgSurface0-3) and glow effects rather than redesigning the color palette.
**Rationale**: The existing purple/teal/dark palette is good. The problem was visual monotony — every card at the same elevation. Depth layering and selective glow create focal hierarchy without changing the brand identity.

## File Inventory

### 16 New Files
| File | Purpose |
|------|---------|
| `src/types/location.ts` | Location types |
| `src/theme/effects.ts` | Shadow/glow presets |
| `src/context/UserContext.tsx` | Mock user + followed DJ tracking |
| `src/context/LocationContext.tsx` | GPS + permission state provider |
| `src/hooks/useUserLocation.ts` | expo-location integration |
| `src/hooks/useNearbyShows.ts` | Ranked nearby shows |
| `src/hooks/usePressAnimation.ts` | Reusable press feedback |
| `src/data/nearbyService.ts` | Nearby show ranking algorithm |
| `src/components/ui/SectionHeader.tsx` | Section header with accent line |
| `src/components/ui/ShimmerPlaceholder.tsx` | Loading placeholder |
| `src/components/location/DistanceBadge.tsx` | Distance display badge |
| `src/components/location/LocationPermissionPrompt.tsx` | Permission request UI |
| `src/components/location/LocationHeader.tsx` | City display + permission state |
| `src/components/nearby/NearbyShowCard.tsx` | Compact carousel card |
| `src/components/nearby/FeaturedShowCard.tsx` | Hero show card |
| `src/components/nearby/NearbyShowsCarousel.tsx` | Horizontal carousel |

### 14 Modified Files
| File | Changes |
|------|---------|
| `src/types/index.ts` | Extended DJ, FeedItem; location type re-exports |
| `src/types/show.ts` | Extended ShowFilter, ShowSortField, ShowSearchResult |
| `src/theme/colors.ts` | Glow colors, surface layers, gradient presets |
| `src/theme/typography.ts` | display, overline styles |
| `src/theme/spacing.ts` | 6xl, 8xl, sectionGap, cardGap |
| `src/theme/index.ts` | effects re-export |
| `src/data/geoUtils.ts` | LOCATION_PRESETS, formatDistance, getCityFromCoordinate |
| `src/data/mockData.ts` | homeCoordinate on all DJs |
| `src/data/showService.ts` | Distance filter, nearby_rank sort |
| `src/components/ui/GlassCard.tsx` | glowColor, glowIntensity props |
| `src/hooks/useStaggerEntrance.ts` | once param, index cap |
| `app/_layout.tsx` | LocationProvider, ConnectedShowSearchProvider, transitions |
| `app/(tabs)/index.tsx` | Full redesign: hero + nearby + feed |
| `app/(tabs)/shows.tsx` | LocationHeader, nearby_rank sort, context integration |
| `app/(tabs)/discover.tsx` | Functional search, DJ card enhancements |
| `app/(tabs)/profile.tsx` | Gradient backdrop, grouped sections |
| `app/dj/[id].tsx` | Richer hero, upcoming shows section |

### 2 New Dependencies
- `expo-location` ~18.0.0
- `expo-image` ~3.1.0

## Known Limitations
- Mock data only — no real API, no persistence beyond AsyncStorage cache
- Follow/like state is per-screen (not global)
- Reverse geocoding uses simple nearest-preset-city logic (no real geocoding API)
- No push notifications for nearby shows
- No ticket purchasing flow
