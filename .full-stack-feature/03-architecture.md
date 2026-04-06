# Frontend Architecture: Design Refresh + Location-Based Show Discovery

## Table of Contents

1. [Design System Evolution](#1-design-system-evolution)
2. [Location Feature Architecture](#2-location-feature-architecture)
3. [Screen-by-Screen Redesign](#3-screen-by-screen-redesign)
4. [New Components](#4-new-components)
5. [Animation Architecture](#5-animation-architecture)
6. [State Management & Data Flow](#6-state-management--data-flow)
7. [Routing Changes](#7-routing-changes)
8. [Error Handling](#8-error-handling)
9. [Performance Strategy](#9-performance-strategy)
10. [File Manifest](#10-file-manifest)

---

## 1. Design System Evolution

The current theme has solid foundations. The problem is not the palette — it is that everything uses the same flat glass cards with uniform styling, creating visual monotony. The refresh introduces **depth layering**, **animated gradients**, **glow effects**, and **richer micro-interactions** to break that monotony.

### 1.1 Theme Token Additions (`src/theme/colors.ts`)

```typescript
// ADD to existing colors object:

// Glow / effect colors
glowPurple: 'rgba(139, 92, 246, 0.35)',
glowTeal: 'rgba(20, 184, 166, 0.25)',
glowPink: 'rgba(236, 72, 153, 0.20)',
glowAmber: 'rgba(245, 158, 11, 0.20)',

// Surface layers (for depth hierarchy)
bgSurface0: '#07070A',    // deepest — screen bg (same as bgPrimary)
bgSurface1: '#0D0D14',    // raised — section bg
bgSurface2: '#12121A',    // card (same as bgCard)
bgSurface3: '#1A1A26',    // elevated card / modal

// Gradient mesh points (for animated mesh gradients)
meshPurple: '#4C1D95',
meshIndigo: '#312E81',
meshTeal: '#134E4A',
meshSlate: '#0F172A',

// ADD to existing gradients object:

// Hero/feature gradients (3+ color stops for richness)
heroMesh: ['#4C1D95', '#312E81', '#134E4A', '#07070A'] as const,
nearbyGlow: ['rgba(139, 92, 246, 0.4)', 'rgba(20, 184, 166, 0.2)', 'transparent'] as const,
shimmer: ['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent'] as const,

// Card accent gradients (top-border glow effect)
cardGlowPurple: ['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0)'] as const,
cardGlowTeal: ['rgba(20, 184, 166, 0.3)', 'rgba(20, 184, 166, 0)'] as const,

// Section header accent line
sectionAccent: [colors.accentPrimary, colors.accentTertiary] as const,
```

### 1.2 Typography Additions (`src/theme/typography.ts`)

```typescript
// ADD: Display type for hero sections — larger, tighter tracking
display: {
  fontFamily: 'Inter_700Bold',
  fontSize: 36,
  lineHeight: 40,
  letterSpacing: -0.8,
} as TextStyle,

// ADD: Overline for section labels
overline: {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 11,
  lineHeight: 14,
  letterSpacing: 1.5,
  textTransform: 'uppercase' as const,
} as TextStyle,
```

### 1.3 Spacing Additions (`src/theme/spacing.ts`)

```typescript
// ADD to spacing:
'6xl': 48,
'8xl': 64,

// ADD to screen:
sectionGap: 40,   // between major home screen sections
cardGap: 16,      // between cards in a list
```

### 1.4 New Theme Export: Effects (`src/theme/effects.ts`)

```typescript
import { ViewStyle } from 'react-native';
import { colors } from './colors';

/**
 * Reusable shadow/glow presets.
 * Applied via style arrays, NOT nested components — keeps the tree flat.
 */
export const effects = {
  /** Soft purple underglow for featured/primary cards */
  glowPurple: {
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  /** Teal underglow for nearby/location-related elements */
  glowTeal: {
    shadowColor: colors.accentTertiary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,

  /** Subtle card lift for standard interactive cards */
  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,

  /** Pressed state shadow (use with scale-down) */
  cardPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
} as const;
```

Re-export from `src/theme/index.ts`.

### 1.5 Design Philosophy: What Makes It Premium

The difference between "dark mode app" and "premium nightlife app":

1. **Depth layering** — Not every card sits at the same elevation. Featured content glows. Background content recedes. The eye is drawn to what matters.
2. **Animated gradient backgrounds** — The home screen hero has a slow-moving mesh gradient, not a static color. This creates ambient life without demanding attention.
3. **Accent glow bleeds** — When a card has a purple gradient accent, a soft glow bleeds below it (via shadow tokens). This simulates light emission, which dark UIs need to feel alive.
4. **Section rhythm** — Large spacing between sections (`sectionGap: 40`), tight spacing within them. Gives the scroll a breathing rhythm.
5. **Progressive disclosure via animation** — Items don't just appear. They arrive with staggered springs. But crucially, animations are fast (150-300ms) and only fire once per mount. No looping animations on content (except the avatar ring, which is intentional personality).

---

## 2. Location Feature Architecture

### 2.1 New Types (`src/types/location.ts`)

```typescript
import { Coordinate, ShowSearchResult } from './show';

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

export type DistanceUnit = 'mi' | 'km';

export interface DistanceInfo {
  distanceKm: number;
  displayText: string;        // "2.3 mi" or "< 1 mi"
  isApproximate: boolean;     // true when using default location
}

export interface NearbyRankingWeights {
  proximity: number;          // 0.40
  timeUrgency: number;        // 0.30
  socialSignal: number;       // 0.20
  // popularity fills remaining 0.10
}

export interface RankedNearbyShow {
  result: ShowSearchResult;
  distance: DistanceInfo;
  score: number;
  hasFollowedDj: boolean;
}
```

Re-export all from `src/types/index.ts`.

### 2.2 Type Modifications

**`src/types/show.ts` — ShowFilter:**
```typescript
export interface ShowFilter {
  // ... existing fields unchanged ...
  maxDistanceKm?: number;         // ADD: radius filter
  followedDjsOnly?: boolean;      // ADD: social filter
}
```

**`src/types/show.ts` — ShowSortField:**
```typescript
export type ShowSortField = 'date' | 'distance' | 'popularity' | 'nearby_rank';
```

**`src/types/show.ts` — ShowSearchResult:**
```typescript
export interface ShowSearchResult {
  // ... existing fields unchanged ...
  distanceInfo?: DistanceInfo;    // ADD: formatted distance
}
```

**`src/types/index.ts` — FeedItem:**
```typescript
export interface FeedItem {
  // ... existing fields unchanged ...
  type: 'new_mix' | 'upcoming_show' | 'collab' | 'announcement' | 'nearby_show' | 'followed_dj_nearby';  // EXTEND
  showId?: string;                // ADD
  distanceInfo?: DistanceInfo;    // ADD
  venueName?: string;             // ADD
}
```

**`src/types/index.ts` — DJ:**
```typescript
export interface DJ {
  // ... existing fields unchanged ...
  homeCoordinate?: Coordinate;    // ADD
}
```

### 2.3 LocationContext (`src/context/LocationContext.tsx`)

```typescript
interface LocationContextValue {
  state: LocationState;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  /** Always returns a coordinate — GPS if granted, DEFAULT_LOCATION as fallback */
  effectiveLocation: Coordinate;
  /** Human-readable city string, or null if using default */
  cityLabel: string | null;
}
```

**Provider placement** — wraps the app in `app/_layout.tsx`, inside `GestureHandlerRootView`, outside `ShowSearchProvider`:

```
GestureHandlerRootView
  UserProvider
    LocationProvider          ← NEW
      ShowSearchProvider      ← receives location from context
        Stack
```

**Key behaviors:**
- On mount: check permission status (does NOT auto-request)
- If already granted: silently fetch GPS
- If undetermined: wait for explicit user action
- If denied: use `DEFAULT_LOCATION` with `isApproximate: true`
- Stores last-known location in AsyncStorage for instant display on next app open
- Updates location every 5 minutes while app is foregrounded (via `watchPositionAsync` with `distanceInterval: 500` meters)

### 2.4 useUserLocation Hook (`src/hooks/useUserLocation.ts`)

This hook encapsulates all expo-location interaction. The LocationContext consumes it.

```typescript
interface UseUserLocationReturn {
  state: LocationState;
  requestPermission: () => Promise<LocationPermissionStatus>;
  refreshLocation: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationReturn
```

**Implementation details:**
- Uses `expo-location` APIs: `requestForegroundPermissionsAsync()`, `getCurrentPositionAsync()`, `watchPositionAsync()`
- Accuracy: `Location.Accuracy.Balanced` (good enough for city-level, low battery)
- Caches last coordinate in AsyncStorage key `@mixr/last_location`
- On mount, reads cached location immediately (instant display), then refreshes via GPS

### 2.5 useNearbyShows Hook (`src/hooks/useNearbyShows.ts`)

Consumes LocationContext, returns ranked shows for the home screen carousel.

```typescript
interface UseNearbyShowsReturn {
  shows: RankedNearbyShow[];
  isLoading: boolean;
  hasLocation: boolean;        // true if GPS, false if default
  error: Error | null;
  refresh: () => void;
}

export function useNearbyShows(options?: {
  maxResults?: number;           // default 8
  maxDistanceKm?: number;        // default 50
  followedDjIds?: string[];      // for social signal scoring
}): UseNearbyShowsReturn
```

**Ranking algorithm** (implemented in `src/data/nearbyService.ts`):
1. Filter shows within `maxDistanceKm` of user
2. Filter out past shows
3. Score each show: `0.4 * proximity + 0.3 * timeUrgency + 0.2 * socialSignal + 0.1 * popularity`
4. Sort by composite score descending
5. Return top N results

### 2.6 Nearby Service (`src/data/nearbyService.ts`)

Pure functions, no side effects, easily testable.

```typescript
export function rankNearbyShows(
  shows: ShowSearchResult[],
  userLocation: Coordinate,
  followedDjIds: string[],
  weights?: Partial<NearbyRankingWeights>,
): RankedNearbyShow[]

export function computeProximityScore(distanceKm: number, maxKm: number): number
export function computeTimeUrgencyScore(showDate: string, showStartTime: string): number
export function computeSocialScore(djIds: string[], followedDjIds: string[]): number
```

### 2.7 geoUtils Additions (`src/data/geoUtils.ts`)

```typescript
// ADD to existing file:

export function formatDistance(km: number, unit?: DistanceUnit): string
// "< 1 mi", "2.3 mi", "15 mi" — rounds intelligently

export function createDistanceInfo(
  km: number,
  isApproximate: boolean,
  unit?: DistanceUnit,
): DistanceInfo

export const LOCATION_PRESETS: Record<string, Coordinate> = {
  los_angeles: { latitude: 34.0522, longitude: -118.2437 },
  new_york:    { latitude: 40.7128, longitude: -74.0060 },
  miami:       { latitude: 25.7617, longitude: -80.1918 },
  chicago:     { latitude: 41.8781, longitude: -87.6298 },
  atlanta:     { latitude: 33.7490, longitude: -84.3880 },
};

// Reverse geocode city from coordinate (mock implementation)
export function getCityFromCoordinate(coord: Coordinate): string | null
```

### 2.8 ShowSearchProvider Integration

The `ShowSearchProvider` currently receives `userLocation` as an optional prop but it is never passed. After this change:

```typescript
// In app/_layout.tsx, ShowSearchProvider reads from LocationContext:
function ConnectedShowSearchProvider({ children }: { children: React.ReactNode }) {
  const { effectiveLocation } = useLocationContext();
  return (
    <ShowSearchProvider userLocation={effectiveLocation}>
      {children}
    </ShowSearchProvider>
  );
}
```

The `useShowSearch` hook already accepts `userLocation` and passes it to `searchShows` — no changes needed in that hook. The `showService.ts` needs the new `maxDistanceKm` filter step and `nearby_rank` sort added.

---

## 3. Screen-by-Screen Redesign

### 3.1 Home Screen (`app/(tabs)/index.tsx`)

**Current state:** Static header ("mixr" + streak badge), then a flat vertical scroll of feed cards. All cards look identical. No hierarchy.

**Redesign:**

```
┌─────────────────────────┐
│  mixr        🔥7   ⚙️   │  ← Header (unchanged structurally)
├─────────────────────────┤
│                         │
│  [Animated mesh gradient│  ← Hero section: slow-animating purple/teal
│   background]           │     mesh gradient behind featured content
│                         │
│  Featured Show Card     │  ← Largest nearby show, full-width, with
│  (tonight or soonest)   │     glow effect + "TONIGHT" badge
│                         │
├─────────────────────────┤
│  NEAR YOU        See All│  ← Section header with gradient accent line
│ ┌──────┐ ┌──────┐ ┌──  │
│ │ Show │ │ Show │ │ Sh  │  ← Horizontal carousel of NearbyShowCards
│ │ Card │ │ Card │ │ Ca  │     (compact vertical cards, 160w x 200h)
│ └──────┘ └──────┘ └──  │
├─────────────────────────┤
│  YOUR FEED              │  ← Section header
│ ┌───────────────────┐   │
│ │ Feed Card         │   │  ← Existing feed cards, enhanced
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ Feed Card         │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**Key changes:**
1. **Hero section with mesh gradient** — A `LinearGradient` with 4 color stops (`heroMesh` preset) fills the top 200px behind the featured show. Uses `useAnimatedGradient` hook to slowly shift gradient positions (see Animation section).
2. **Featured show card** — The soonest nearby show (or highest-scored `RankedNearbyShow`) gets a large, full-width card with image, glow shadow, and a "TONIGHT" or "TOMORROW" urgency badge. Tapping navigates to `/show/[id]`.
3. **"Near You" carousel** — Horizontal `FlatList` of `NearbyShowCard` components. Shows distance badge, date badge, DJ name. If location permission is undetermined, shows an inline `LocationPermissionPrompt` instead of the carousel.
4. **Feed section** — Existing feed cards, but with enhanced visual treatment (see component changes below).
5. **ScrollView → Animated.ScrollView** — For parallax effects on the hero section.

**Data flow:**
```
HomeFeedScreen
  ├── useNearbyShows() → featuredShow, nearbyShows[]
  ├── useLocationContext() → permission status (for prompt)
  └── feedItems (existing mock data)
```

### 3.2 Discover Screen (`app/(tabs)/discover.tsx`)

**Current state:** Title + subtitle, fake search bar, horizontal genre scroll, vertical DJ card list. DJ cards are horizontal row layout (avatar + name + follow button). Functional but visually flat.

**Redesign:**

```
┌─────────────────────────┐
│  Discover               │
│  Find your next fav DJ  │
├─────────────────────────┤
│  [Search Bar]           │  ← Real text input (connect to DJ filtering)
├─────────────────────────┤
│  Genre Pills (horiz)    │  ← Same structure, enhanced with glow on active
├─────────────────────────┤
│  TRENDING DJS           │
│ ┌───────────────────┐   │
│ │ ┌────┐            │   │  ← Enhanced DJ Card: taller, with image background
│ │ │ DJ │  Name      │   │     gradient overlay, genre pills visible,
│ │ │img │  Location  │   │     follower count, subtle glow on followed DJs
│ │ │    │  [genres]  │   │
│ │ └────┘   [Follow] │   │
│ └───────────────────┘   │
│ ┌───────────────────┐   │
│ │ (next DJ card)    │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**Key changes:**
1. **Search bar becomes functional** — `TextInput` with filtering, reusing the `SearchBar` component from shows (or a shared version).
2. **DJ card visual upgrade** — Keep the horizontal row layout (it works well for scanning), but:
   - Add a subtle gradient accent on the left edge of each card matching the DJ's primary genre color
   - Show follower count (`"2.4K followers"`) below location
   - Followed DJs get a faint teal glow border (indicates relationship)
3. **Genre pill active state** — Active genre pill gets a soft glow shadow matching its color (using `effects.glowPurple` pattern but with genre color).
4. **Section header** — "Trending DJs" gets the `SectionHeader` treatment with gradient accent line.

**No structural data changes needed** — all data already exists in mock data.

### 3.3 Shows Tab (`app/(tabs)/shows.tsx`)

**Current state:** "Shows" title, search bar, filter chips, sort pills, view toggle, results list. Uses `DEFAULT_LOCATION` hardcoded. Functional but not location-aware in UX.

**Redesign:**

```
┌─────────────────────────┐
│  Shows                  │
│  📍 Los Angeles, CA     │  ← LocationHeader: city from GPS, or prompt
├─────────────────────────┤
│  [Search Bar]           │
├─────────────────────────┤
│  Filter Chips           │
├─────────────────────────┤
│  Nearby | Date | Popular│  ← Sort: "Nearby" as new default (was "Date")
│                  🗺️/📋  │
├─────────────────────────┤
│  12 shows nearby        │  ← Results count with "nearby" language
├─────────────────────────┤
│  [Show cards with       │  ← Each card now shows DistanceBadge
│   distance badges]      │     "2.3 mi" in teal accent color
│                         │
│  Map view shows user    │  ← Map view centers on user, shows blue dot
│  location marker        │
└─────────────────────────┘
```

**Key changes:**
1. **LocationHeader** — Below the title, shows detected city. If permission is undetermined, shows a compact prompt ("Enable location for nearby shows" with a button). If denied, shows "Location unavailable" with option to open settings.
2. **Default sort changes to `nearby_rank`** — When location is available, default sort is `nearby_rank` instead of `date`. Falls back to `date` if no location.
3. **Sort pill rename** — "Distance" becomes "Nearby" (which uses the composite `nearby_rank` sort, not raw distance).
4. **DistanceBadge on ShowCard** — Each show card displays distance in a small teal badge: `"2.3 mi"`. This replaces the inline `(2.3 mi)` text currently appended to venue name.
5. **Map view enhancement** — `showsUserLocation={true}` when GPS available. Map centers on user location by default.
6. **Location integration** — `useShowSearch` receives real `userLocation` from `LocationContext` instead of `DEFAULT_LOCATION`.

**Data flow change:**
```typescript
// BEFORE:
const search = useShowSearch(DEFAULT_LOCATION);

// AFTER:
const { effectiveLocation } = useLocationContext();
const search = useShowSearch(effectiveLocation);
```

### 3.4 Profile Screen (`app/(tabs)/profile.tsx`)

**Current state:** Centered layout. Animated avatar with ring, name/handle, streak badge, stats row (3 StatCards), achievements list, settings menu. Visually correct but lacks hierarchy — everything is the same visual weight.

**Redesign:**

```
┌─────────────────────────┐
│          Profile        │
├─────────────────────────┤
│      [Mesh gradient     │  ← Subtle gradient background behind avatar
│       background]       │
│     ┌──────────┐        │
│     │ Animated │        │
│     │  Avatar  │        │  ← Larger: 110px (was 96px)
│     └──────────┘        │
│      John Doe           │
│      @johndoe           │
│      🔥 7 day streak    │
├─────────────────────────┤
│  ┌──────┬──────┬──────┐ │
│  │  12  │  48  │   5  │ │  ← Stats row: add subtle glow to stat value
│  │Follow│Liked │Level │ │     Number animates up with countUp
│  └──────┴──────┴──────┘ │
├─────────────────────────┤
│  ACHIEVEMENTS           │  ← Section header with accent line
│  ┌─────────────────┐    │
│  │ 🌟 First Follow ✓│   │  ← Earned: accent border glow
│  ├─────────────────┤    │
│  │ 🎵 Mix Master  ✓│   │
│  ├─────────────────┤    │
│  │ 🌙 Night Owl  3m│   │  ← Unearned: dimmer, progress text
│  └─────────────────┘    │
├─────────────────────────┤
│  SETTINGS               │
│  Edit Profile      >    │
│  Notifications     >    │
│  Privacy           >    │
│  Help & Support    >    │
│  Log Out                │
└─────────────────────────┘
```

**Key changes:**
1. **Gradient backdrop** behind avatar section — A subtle `LinearGradient` (heroMesh preset, very low opacity) creates a focal point. Fades to `bgPrimary` below.
2. **Larger avatar** — 110px with ring (was 96px).
3. **Stats row glow** — StatCard values get a faint text shadow in accent color.
4. **Achievement cards** — Earned achievements get a 1px left-border accent in `accentPrimary`. Unearned remain dimmer. Single GlassCard wrapping all achievements (grouped, not individual cards) with dividers between items. Reduces visual clutter.
5. **Section headers** — Use the new `SectionHeader` component with gradient accent line.
6. **Settings grouped** — All settings in one GlassCard with dividers (like iOS settings).

### 3.5 DJ Detail Screen (`app/dj/[id].tsx`)

**Current state:** Parallax hero (320px), name/location, stats row, genre pills, follow/message, activity list. Good structure. Needs richer visual treatment.

**Redesign changes:**
1. **Richer hero gradient** — Replace 2-stop `heroFade` with 3-stop: `['transparent', 'rgba(7, 7, 10, 0.6)', colors.bgPrimary]`. The middle stop creates a softer, more cinematic fade.
2. **Hero height increase** — 360px (was 320px). More dramatic.
3. **Back button** — Glass-style with BlurView instead of `rgba(0,0,0,0.4)`.
4. **Stats row** — Add purple glow shadow to the row container.
5. **"Upcoming Shows" section** — NEW. Below activity, show upcoming shows for this DJ using `getUpcomingShowsForDj()`. Displayed as compact `ShowCard` components. This cross-links DJ profiles to shows (currently no connection in the UI).
6. **Activity cards** — Add a faint accent-colored left border matching the activity type.

### 3.6 Show Detail Screen (`app/show/[id].tsx`)

**Current state:** Parallax hero, date/time info, genre pills, description, venue card, lineup card, details card, related shows. Well-structured.

**Redesign changes:**
1. **Same hero gradient treatment** as DJ detail — 3-stop for cinematic fade.
2. **"Get Tickets" CTA** — Sticky bottom bar with `GradientButton` (full-width). Even though purchasing is out of scope, having the CTA makes the screen feel complete. Opens a "Coming soon" toast.
3. **Distance in venue card** — Show distance from user to venue when location is available.
4. **DJ avatars in lineup** — Add a subtle ring glow on followed DJs.

---

## 4. New Components

### 4.1 Location Components

#### `LocationPermissionPrompt` (`src/components/location/LocationPermissionPrompt.tsx`)

A graceful, non-modal prompt for location permission. Two variants:

```typescript
interface LocationPermissionPromptProps {
  variant: 'inline' | 'banner';
  onRequestPermission: () => void;
  onDismiss?: () => void;
}
```

- **`inline`** — Used in the "Near You" section of home screen when permission is undetermined. Shows an illustration-style prompt with explanation text and a `GradientButton`:
  ```
  ┌─────────────────────────────┐
  │  📍 Discover shows nearby   │
  │  Enable location to find    │
  │  shows happening around you │
  │  [Enable Location]          │
  └─────────────────────────────┘
  ```
- **`banner`** — Used at the top of the Shows tab. Compact single-line with dismiss button:
  ```
  ┌─────────────────────────────────────┐
  │ 📍 Enable location for nearby shows  [Enable]  ✕ │
  └─────────────────────────────────────┘
  ```

Both use GlassCard with a teal accent glow to draw attention.

#### `LocationHeader` (`src/components/location/LocationHeader.tsx`)

Displays the user's detected city in the Shows tab header.

```typescript
interface LocationHeaderProps {
  cityLabel: string | null;
  permission: LocationPermissionStatus;
  onRequestPermission: () => void;
  isLoading: boolean;
}
```

Renders:
- Granted + city resolved: `"📍 Los Angeles, CA"` in `textSecondary`
- Granted + loading: shimmer placeholder
- Undetermined: `LocationPermissionPrompt` variant `banner`
- Denied: `"📍 Location unavailable"` with "Enable in Settings" text button

#### `DistanceBadge` (`src/components/location/DistanceBadge.tsx`)

Small inline badge showing distance.

```typescript
interface DistanceBadgeProps {
  distanceInfo: DistanceInfo;
  size?: 'sm' | 'md';           // sm for card inline, md for detail page
}
```

Renders: Teal-colored text with MapPin icon. `"2.3 mi"` or `"< 1 mi"`. When `isApproximate`, shows a `~` prefix.

### 4.2 Nearby Show Components

#### `NearbyShowsCarousel` (`src/components/nearby/NearbyShowsCarousel.tsx`)

Horizontal carousel for the home screen "Near You" section.

```typescript
interface NearbyShowsCarouselProps {
  shows: RankedNearbyShow[];
  isLoading: boolean;
  onSeeAll: () => void;
}
```

- Uses `FlatList` with `horizontal`, `snapToInterval`, `decelerationRate="fast"`, `showsHorizontalScrollIndicator={false}`
- Snap interval = card width (160) + gap (12) = 172
- `contentContainerStyle` with `paddingHorizontal: screen.paddingH` for edge-to-edge feel
- Loading state: 3 shimmer placeholder cards
- Empty state (no nearby shows): single card saying "No shows nearby this week"

#### `NearbyShowCard` (`src/components/nearby/NearbyShowCard.tsx`)

Compact vertical card for the carousel.

```typescript
interface NearbyShowCardProps {
  show: RankedNearbyShow;
  index: number;
  onPress: () => void;
}
```

Layout (160w x 220h):
```
┌──────────────┐
│              │
│  [Show img]  │  ← 160 x 120, rounded top corners
│              │
│  Date badge  │  ← Overlaid on bottom-left of image
├──────────────┤
│ Show Name    │  ← typography.label, 1 line
│ DJ Name      │  ← typography.caption, textSecondary
│ 📍 2.3 mi    │  ← DistanceBadge, teal
└──────────────┘
```

- `GlassCard` wrapper with `borderRadius: 16`
- Stagger entrance animation with `useStaggerEntrance(index, 60)` — faster stagger for carousel items
- Press animation: scale 0.97 on press-in, spring back
- Navigation: `router.push(/show/${show.result.show.id})`

#### `FeaturedShowCard` (`src/components/nearby/FeaturedShowCard.tsx`)

Large hero card for the top nearby show on the home screen.

```typescript
interface FeaturedShowCardProps {
  show: RankedNearbyShow;
  onPress: () => void;
}
```

Layout (full-width, ~240h):
```
┌────────────────────────────────┐
│                                │
│  [Full-width show image]       │
│                                │
│  ┌──────────┐                  │
│  │ TONIGHT  │   Show Name      │  ← Urgency badge + title overlaid
│  └──────────┘   DJ1 x DJ2     │
│                 📍 Venue · 2mi  │
│                                │
│  [gradient overlay]            │
└────────────────────────────────┘
```

- Purple glow shadow (`effects.glowPurple`)
- Urgency badge: "TONIGHT" (amber), "TOMORROW" (teal), or date
- Full-bleed image with 3-stop gradient overlay
- Haptic feedback on press

### 4.3 Shared UI Enhancements

#### `SectionHeader` (`src/components/ui/SectionHeader.tsx`)

Consistent section header with optional gradient accent line and "See All" action.

```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  accentLine?: boolean;          // default true
}
```

Renders:
```
── ━━━━━━━                        ← 2px gradient line, 40px wide
NEAR YOU                See All → 
```

The gradient accent line is a 2px-high `LinearGradient` (sectionAccent preset), 40px wide, positioned above the title. This small detail creates visual rhythm between sections.

#### `ShimmerPlaceholder` (`src/components/ui/ShimmerPlaceholder.tsx`)

Animated loading placeholder with traveling shine effect.

```typescript
interface ShimmerPlaceholderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}
```

Uses `useAnimatedShimmer` hook (see Animation section). A `LinearGradient` with the `shimmer` preset translates horizontally across the placeholder in a loop. Background is `bgSurface1`.

#### Enhanced `GlassCard` — Add `glowColor` prop

```typescript
interface GlassCardProps {
  // ... existing props ...
  glowColor?: string;            // ADD: optional glow shadow color
  glowIntensity?: number;        // ADD: 0-1, default 0.25
}
```

When `glowColor` is provided, applies a colored shadow matching the pattern in `effects.glowPurple` but with the custom color. This allows cards to emit colored light.

---

## 5. Animation Architecture

### 5.1 New Animation Hooks

#### `useAnimatedGradient` (`src/hooks/useAnimatedGradient.ts`)

Slowly animates gradient stop positions for the home screen hero background.

```typescript
interface UseAnimatedGradientReturn {
  start: SharedValue<{ x: number; y: number }>;
  end: SharedValue<{ x: number; y: number }>;
}

export function useAnimatedGradient(options?: {
  duration?: number;     // default 8000ms (slow, ambient)
  enabled?: boolean;     // default true
}): UseAnimatedGradientReturn
```

Animates `start` and `end` points of a `LinearGradient` in a slow, looping pattern. Uses `withRepeat` + `withTiming` with `Easing.inOut(Easing.sine)` for smooth oscillation. The gradient appears to slowly breathe.

**Performance note:** This runs a single animation on shared values that drive gradient props. The gradient itself re-renders, but since it is a single full-screen view with no children, the cost is minimal.

#### `useAnimatedShimmer` (`src/hooks/useAnimatedShimmer.ts`)

Drives the shimmer loading effect for `ShimmerPlaceholder`.

```typescript
export function useAnimatedShimmer(): {
  translateX: SharedValue<number>;
}
```

A looping `translateX` from -width to +width over 1200ms. Uses `withRepeat` + `withTiming` + `Easing.linear`.

#### `usePressAnimation` (`src/hooks/usePressAnimation.ts`)

Reusable press feedback for any card/button. Consolidates the pattern used in `GradientButton`, `HeartButton`, `FollowButton`.

```typescript
interface UsePressAnimationReturn {
  animatedStyle: AnimatedStyleProp<ViewStyle>;
  handlers: {
    onPressIn: () => void;
    onPressOut: () => void;
  };
}

export function usePressAnimation(options?: {
  scaleDown?: number;     // default 0.97
  haptic?: boolean;       // default true
  hapticStyle?: 'light' | 'medium' | 'heavy';  // default 'light'
}): UsePressAnimationReturn
```

Every card in the app should use this hook for consistent press feedback. Currently, each component re-implements scale spring logic. Centralizing it ensures:
- Consistent feel across all interactive elements
- Single place to tune spring parameters
- Haptic feedback included by default

### 5.2 Enhanced Existing Hooks

#### `useStaggerEntrance` — Add `once` behavior

The current hook runs the animation on every mount. This is fine for lists, but for the home screen sections, items should only animate on the initial render, not when scrolling back up.

Add an optional `once` parameter (default `true`) that tracks whether the animation has played via a ref. If `once` is true and the animation already played, return a static style `{ opacity: 1, transform: [{ translateY: 0 }] }`.

#### `useParallax` — Currently unused

The hook exists but is not imported anywhere. The DJ detail and Show detail screens implement parallax manually with `scrollY * 0.5`. Refactor those screens to use `useParallax` for consistency.

### 5.3 Screen Transitions

Use Expo Router's built-in screen transition configuration. No custom `SharedTransition` for now (complex, fragile on New Architecture).

```typescript
// In app/_layout.tsx, for show/[id] and dj/[id]:
<Stack.Screen
  name="show/[id]"
  options={{
    headerShown: false,
    presentation: 'card',
    animation: 'slide_from_right',   // ADD: explicit, snappy
    animationDuration: 250,           // ADD: faster than default
  }}
/>
```

### 5.4 Tab Transition

The existing custom tab bar has a sliding pill indicator. Enhance:
- Add a subtle scale bounce when a tab icon is pressed (1 -> 0.85 -> 1 spring over 200ms)
- The active icon should have a faint glow behind it (a 20x20 circle of `accentGlow` centered behind the icon)

### 5.5 Performance Rules for Animations

1. **No `useAnimatedStyle` in FlatList items** where avoidable — use `useStaggerEntrance` which runs once and settles. Avoid continuously-driven animations on list items.
2. **`useNativeDriver` is implicit** with react-native-reanimated — all animation hooks already run on the UI thread. No additional config needed.
3. **Cap stagger count** — `useStaggerEntrance` should cap the delay at `index * delay` where `index` is clamped to max 8. Items beyond index 8 appear immediately (they are below the fold anyway).
4. **Gradient animations** — Only the home screen hero uses `useAnimatedGradient`. No animated gradients on scrolling list items.
5. **Shimmer animations** — Share a single `useAnimatedShimmer` instance per screen via context or a module-level shared value. Do not create one per placeholder.

---

## 6. State Management & Data Flow

### 6.1 Context Architecture

```
App
├── GestureHandlerRootView
│   ├── UserProvider (existing — user profile state)
│   │   ├── LocationProvider (NEW — GPS + permission state)
│   │   │   ├── ShowSearchProvider (existing — wired to LocationContext)
│   │   │   │   ├── Stack Navigator
│   │   │   │   │   ├── (tabs)
│   │   │   │   │   │   ├── Home      ← reads LocationContext + useNearbyShows
│   │   │   │   │   │   ├── Discover   ← no location dependency
│   │   │   │   │   │   ├── Shows      ← reads LocationContext + ShowSearchContext
│   │   │   │   │   │   └── Profile    ← no location dependency
│   │   │   │   │   ├── show/[id]     ← reads LocationContext for distance
│   │   │   │   │   ├── dj/[id]       ← no location dependency (yet)
│   │   │   │   │   └── filter-modal
```

### 6.2 Data Flow Diagram

```
                    ┌──────────────────┐
                    │   expo-location   │
                    └────────┬─────────┘
                             │ GPS coordinate
                    ┌────────▼─────────┐
                    │ useUserLocation() │
                    │ (permission, GPS, │
                    │  cache, fallback) │
                    └────────┬─────────┘
                             │ LocationState
                    ┌────────▼─────────┐
                    │ LocationContext    │
                    │ (effectiveLocation│
                    │  cityLabel,       │
                    │  requestPermission│
                    └──┬─────┬─────┬───┘
                       │     │     │
          ┌────────────┘     │     └────────────┐
          ▼                  ▼                   ▼
  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐
  │useNearbyShows │  │useShowSearch │  │  Shows Tab     │
  │(home carousel)│  │(shows tab    │  │  LocationHeader│
  │               │  │ search)      │  │  DistanceBadge │
  └───────┬───────┘  └──────┬───────┘  └────────────────┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌──────────────┐
  │nearbyService  │  │ showService  │
  │.rankNearby()  │  │.searchShows()│
  └───────────────┘  └──────────────┘
```

### 6.3 State Ownership

| State | Owner | Consumers |
|-------|-------|-----------|
| Location permission | LocationContext | Home, Shows, LocationHeader |
| GPS coordinate | LocationContext | useNearbyShows, useShowSearch, ShowMapView |
| City label | LocationContext | Shows tab LocationHeader |
| Nearby show rankings | useNearbyShows (local) | Home screen |
| Show search results | ShowSearchContext | Shows tab |
| Follow state | Component-local useState | Discover, DJ Detail (mock) |
| Like state | Component-local useState | Home feed (mock) |

### 6.4 Why No Global Follow State

Follow/like state is currently local to each screen. This means following a DJ on Discover does not update their state on the DJ detail page. This is intentional for now — introducing a global follow store adds complexity that is not justified while using mock data. When a real backend arrives, follow state will be server-authoritative and fetched per-screen.

---

## 7. Routing Changes

### 7.1 No New Routes Needed

The existing route structure covers all screens. The redesign adds sections within existing screens (nearby carousel on home, location header on shows), not new screens.

### 7.2 Navigation Additions

- **"See All" on nearby carousel** → navigates to Shows tab with `nearby_rank` sort pre-selected. Implementation: `router.push('/(tabs)/shows')` and rely on Shows tab reading location context for default sort.
- **Featured show card tap** → `router.push(/show/${id})`
- **Nearby show card tap** → `router.push(/show/${id})`
- **DJ upcoming shows (on DJ detail)** → `router.push(/show/${id})`

### 7.3 Tab Configuration

No changes to tab configuration. The 4-tab structure (Feed, Discover, Shows, Profile) is correct.

---

## 8. Error Handling

### 8.1 Location Permission Flow

```
App Launch
  │
  ├─ Check permission status (silent, no prompt)
  │
  ├─ UNDETERMINED:
  │   ├─ Home: show LocationPermissionPrompt (inline) in "Near You" section
  │   ├─ Shows: show LocationPermissionPrompt (banner) below title
  │   ├─ Both use DEFAULT_LOCATION for any distance calculations
  │   └─ On user tap "Enable": call requestPermission()
  │       ├─ GRANTED → fetch GPS, update context, re-render
  │       └─ DENIED → update context, show fallback state
  │
  ├─ GRANTED:
  │   ├─ Fetch GPS silently
  │   ├─ If GPS fails (timeout, airplane mode):
  │   │   ├─ Use cached location if available
  │   │   └─ Fall back to DEFAULT_LOCATION with isApproximate: true
  │   └─ Display real location data
  │
  └─ DENIED:
      ├─ Home: hide "Near You" section entirely (don't show permission prompt
      │   for denied — user already said no. Show feed without nearby section)
      ├─ Shows: show "Location unavailable" with "Open Settings" link
      └─ All distance calculations use DEFAULT_LOCATION with isApproximate
```

### 8.2 GPS Failure Handling

```typescript
// In useUserLocation:
try {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    timeout: 10000,  // 10 second timeout
  });
  // success path
} catch (error) {
  // 1. Try cached location from AsyncStorage
  const cached = await getCachedLocation();
  if (cached) {
    setState({ ...state, userLocation: { ...cached, source: 'default' } });
    return;
  }
  // 2. Fall back to DEFAULT_LOCATION
  setState({
    ...state,
    userLocation: {
      coordinate: DEFAULT_LOCATION,
      timestamp: Date.now(),
      source: 'default',
    },
    error: 'Could not determine location',
  });
}
```

### 8.3 Empty States

| Scenario | Behavior |
|----------|----------|
| No nearby shows within 50km | Carousel shows "No shows nearby this week" card |
| No shows match search filter | Existing empty state in ShowListView (unchanged) |
| Location loading | Shimmer placeholders in carousel and LocationHeader |
| GPS timeout | Use cached/default location silently — no error shown to user |

---

## 9. Performance Strategy

### 9.1 FlatList Optimization

**Home screen nearby carousel:**
- `horizontal={true}`
- `getItemLayout` — each card is 160w + 12 gap = 172 per item. This enables `initialScrollIndex` and skips measurement.
- `windowSize={5}` — render 5 screens worth (plenty for an 8-item carousel)
- `maxToRenderPerBatch={4}`
- `keyExtractor={(item) => item.result.show.id}`

**Shows tab list (existing ShowListView):**
- Already well-optimized with `windowSize={5}`, `maxToRenderPerBatch={10}`, `removeClippedSubviews={false}` (correct — `true` causes bugs on iOS with reanimated)
- ADD: `getItemLayout` with estimated item height of 340px (matches existing `ITEM_HEIGHT`)

### 9.2 Image Loading

**Current:** Raw `<Image source={{ uri }}` /> with no caching strategy. Works but causes visible loading flashes.

**Enhancement:** Use `expo-image` (add as dependency) which provides:
- Built-in memory + disk caching
- Blurhash/thumbhash placeholder support
- Smooth fade-in transition
- Better performance than RN Image on large lists

```typescript
// Replace Image imports in high-frequency components:
import { Image } from 'expo-image';

// Usage stays the same, add transition:
<Image
  source={uri}
  style={styles.image}
  transition={200}
  contentFit="cover"
  placeholder={blurhash}  // optional, if we generate blurhashes
/>
```

Priority files for `expo-image` migration: `ShowCard`, `NearbyShowCard`, `FeaturedShowCard`, `FeedCard`. Lower priority: `DJCard`, avatars (small, less visible loading).

### 9.3 Memoization Strategy

**Already memoized (keep):**
- `ShowCard` — `React.memo` with custom equality check
- `ShowListView` — `React.memo`

**Add `React.memo`:**
- `NearbyShowCard` — displayed in horizontal FlatList, must be memoized
- `FeaturedShowCard` — only one instance, memo is cheap insurance
- `DistanceBadge` — rendered per card, receives primitive props
- `SectionHeader` — rendered multiple times on home screen

**Do NOT memo:**
- Screen components (Home, Discover, etc.) — they are route-level, never re-rendered by a parent
- `LocationPermissionPrompt` — rendered once, no re-render pressure
- `GlassCard`, `GradientButton` — internal state drives their animations, memo would not help

### 9.4 Avoiding Re-renders

**LocationContext split:** The `LocationContext` provides both `state` (changes on GPS update) and `requestPermission` (stable callback). To avoid re-rendering the entire tree on every GPS update:
- Wrap `requestPermission` and `effectiveLocation` in `useMemo`
- `effectiveLocation` only changes when the coordinate actually changes (debounce at 500m — already handled by `watchPositionAsync` config)
- Screens that only need `requestPermission` (e.g., the prompt component) do not re-render when GPS updates

### 9.5 Bundle Impact

New dependencies to add:
- `expo-location` — required for GPS
- `expo-image` — recommended for image performance

Both are Expo managed-workflow compatible. No native module changes needed.

---

## 10. File Manifest

### New Files

| File | Purpose |
|------|---------|
| `src/types/location.ts` | Location-related TypeScript types |
| `src/theme/effects.ts` | Shadow/glow presets |
| `src/context/LocationContext.tsx` | Location state provider + hook |
| `src/hooks/useUserLocation.ts` | expo-location integration hook |
| `src/hooks/useNearbyShows.ts` | Ranked nearby shows for home screen |
| `src/hooks/useAnimatedGradient.ts` | Slow-moving gradient animation |
| `src/hooks/useAnimatedShimmer.ts` | Shimmer loading animation |
| `src/hooks/usePressAnimation.ts` | Reusable press feedback |
| `src/data/nearbyService.ts` | Nearby show ranking algorithm |
| `src/components/location/LocationPermissionPrompt.tsx` | Permission request UI |
| `src/components/location/LocationHeader.tsx` | City display + permission banner |
| `src/components/location/DistanceBadge.tsx` | Distance display badge |
| `src/components/nearby/NearbyShowsCarousel.tsx` | Home screen horizontal carousel |
| `src/components/nearby/NearbyShowCard.tsx` | Compact show card for carousel |
| `src/components/nearby/FeaturedShowCard.tsx` | Large hero show card |
| `src/components/ui/SectionHeader.tsx` | Consistent section header with accent |
| `src/components/ui/ShimmerPlaceholder.tsx` | Loading placeholder with animation |

### Modified Files

| File | Changes |
|------|---------|
| `src/theme/colors.ts` | Add glow colors, surface layers, mesh colors, new gradient presets |
| `src/theme/typography.ts` | Add `display` and `overline` styles |
| `src/theme/spacing.ts` | Add `6xl`, `8xl`, `sectionGap`, `cardGap` |
| `src/theme/index.ts` | Re-export `effects` |
| `src/types/index.ts` | Extend DJ (homeCoordinate), FeedItem (nearby types) |
| `src/types/show.ts` | Extend ShowFilter, ShowSortField, ShowSearchResult |
| `src/data/geoUtils.ts` | Add formatDistance, createDistanceInfo, LOCATION_PRESETS, getCityFromCoordinate |
| `src/data/mockData.ts` | Add homeCoordinate to DJs |
| `src/data/showService.ts` | Add maxDistanceKm filter, nearby_rank sort, distanceInfo on results |
| `src/components/ui/GlassCard.tsx` | Add glowColor, glowIntensity props |
| `src/components/shows/ShowCard.tsx` | Add DistanceBadge, replace inline distance text |
| `src/hooks/useStaggerEntrance.ts` | Add `once` parameter, cap stagger at index 8 |
| `app/_layout.tsx` | Add LocationProvider, wire to ShowSearchProvider |
| `app/(tabs)/index.tsx` | Full redesign: hero section, nearby carousel, enhanced feed |
| `app/(tabs)/shows.tsx` | Add LocationHeader, change default sort, integrate location |
| `app/(tabs)/discover.tsx` | Enhanced DJ cards, functional search, section headers |
| `app/(tabs)/profile.tsx` | Gradient backdrop, grouped achievements, section headers |
| `app/(tabs)/_layout.tsx` | Tab icon press animation, active glow |
| `app/dj/[id].tsx` | Richer hero, glass back button, upcoming shows section |
| `app/show/[id].tsx` | Richer hero, distance in venue card |
| `package.json` | Add expo-location, expo-image |

### Dependency Changes

```json
{
  "dependencies": {
    "expo-location": "~18.0.0",    // ADD: GPS + permission
    "expo-image": "~3.1.0"         // ADD: performant image loading
  }
}
```

---

## Implementation Order

The recommended build sequence, respecting dependencies:

**Phase 1 — Foundation (no visual changes yet)**
1. Add new types (`location.ts`, extend `show.ts`, `index.ts`)
2. Add theme tokens (`effects.ts`, extend `colors.ts`, `typography.ts`, `spacing.ts`)
3. Add `geoUtils.ts` extensions
4. Add `nearbyService.ts`
5. Add `useUserLocation` hook
6. Add `LocationContext`
7. Wire `LocationProvider` into `app/_layout.tsx`
8. Update `showService.ts` with distance filter + nearby_rank sort
9. Install `expo-location`, `expo-image`

**Phase 2 — Shared UI Components**
10. `SectionHeader`
11. `ShimmerPlaceholder` + `useAnimatedShimmer`
12. `usePressAnimation`
13. Enhance `GlassCard` (glowColor prop)
14. `DistanceBadge`
15. `LocationPermissionPrompt`
16. `LocationHeader`

**Phase 3 — Location-Specific Components**
17. `useNearbyShows` hook
18. `NearbyShowCard`
19. `FeaturedShowCard`
20. `NearbyShowsCarousel`

**Phase 4 — Screen Redesigns**
21. Home screen redesign (hero, nearby section, enhanced feed)
22. Shows tab redesign (LocationHeader, default sort, distance badges)
23. Discover screen enhancement (functional search, DJ card upgrades)
24. Profile screen enhancement (gradient backdrop, grouped sections)
25. DJ Detail enhancement (richer hero, upcoming shows)
26. Show Detail enhancement (distance, richer hero)

**Phase 5 — Polish**
27. `useAnimatedGradient` for home hero
28. Tab bar animation enhancements
29. Screen transition tuning
30. `useStaggerEntrance` improvements (once, cap)
31. `expo-image` migration on key components
32. Final visual QA pass
