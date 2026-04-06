# Service Layer Implementation: Design Refresh + Location-Based Show Discovery

## Dependencies Installed
- `expo-location` — GPS and permission handling
- `expo-image` — Performant cached image loading

## New Files Created

| File | Purpose |
|------|---------|
| `src/context/UserContext.tsx` | Mock user profile + followed DJ tracking with toggleFollow |
| `src/context/LocationContext.tsx` | Location state provider — effectiveLocation, cityLabel, permission controls |
| `src/hooks/useUserLocation.ts` | expo-location integration — GPS, permissions, caching, fallback |
| `src/hooks/useNearbyShows.ts` | Ranked nearby shows hook consuming LocationContext + UserContext |

## Modified Files

| File | Changes |
|------|---------|
| `app/_layout.tsx` | Added LocationProvider + ConnectedShowSearchProvider to tree; slide_from_right transitions |

## Context Provider Tree
```
GestureHandlerRootView
  └── UserProvider (profile, followedDjIds)
      └── LocationProvider (GPS, permission, effectiveLocation)
          └── ConnectedShowSearchProvider (bridges location → ShowSearchProvider)
              └── Stack Navigator
```

## Key Behaviors
- Location permission checked silently on mount (no auto-prompt)
- Cached last-known location from AsyncStorage for instant display
- Falls back to DEFAULT_LOCATION (downtown LA) if no GPS
- cityLabel derived via mock reverse geocoding
- ShowSearchProvider now receives real effectiveLocation instead of undefined
- Screen transitions: 250ms slide_from_right for show/DJ detail screens
