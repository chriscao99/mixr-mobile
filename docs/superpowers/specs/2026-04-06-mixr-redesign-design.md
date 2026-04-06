# Mixr Redesign: Clean Minimal Dark + Full Feature Wiring

**Date:** 2026-04-06
**Status:** Approved

## Overview

Complete UI redesign of the Mixr mobile app toward a clean minimal dark aesthetic inspired by Duolingo, Partyful, and Airbnb. Simultaneously wire up all broken/disconnected features so the app is fully functional with mock data. Deploy via Expo Go / EAS dev builds for team testing.

## Design Principles

1. **Minimal but not sterile.** Strip glass/blur effects in favor of solid dark surfaces with subtle borders. Keep personality through purposeful micro-interactions and delightful animations.
2. **Image-first cards.** Hero imagery drives every card. Metadata is tight and secondary.
3. **First-class search/filter UX.** Real inputs, bottom sheets (not full modals), haptic feedback. Inspired by Airbnb's filter patterns.
4. **Playful gamification.** Streaks, achievements, and levels should feel rewarding (Duolingo-style).
5. **One source of truth.** All state (follows, likes, filters) flows through React Context so changes reflect everywhere instantly.

## Design System Changes

### Colors

Keep the existing dark palette but simplify accent usage:

- **Primary accent:** `#8B5CF6` (violet) -- interactive elements, indicators, active states only
- **Secondary accent:** `#6366F1` (indigo) -- gradients paired with violet for CTAs
- **Remove teal as a secondary accent.** Teal remains only as a genre color.
- **Surfaces:** `bgPrimary #07070A`, `bgCard #12121A`, `bgElevated #1E1E2A` -- elevation through background shade, not blur
- **Text hierarchy unchanged:** `textPrimary`, `textSecondary`, `textMuted`

### Typography

Keep Inter. Tighten the scale -- enforce strict hierarchy:

- Screen titles: `h2` (26px/700)
- Section headers: `h4` (18px/600)
- Body: `body` (15px/400)
- Metadata/captions: `bodySm` (13px/400) and `caption` (11px/400)
- Buttons: `button` (16px/600)
- Tab labels: `tabLabel` (10px/500, uppercase, tracked)

Remove `h1` (30px) usage from screens -- too large for mobile. `h2` is the max.

### Spacing

More generous vertical spacing between sections. Adopt `gap: 32` between major sections (up from 28). Card internal padding standardized to 16px.

### Components to Rebuild

| Current | New | Changes |
|---|---|---|
| `GlassCard` | `Card` | Solid `bgCard` background, 1px `borderSubtle` border, no `BlurView` dependency. Same `borderRadius` options. |
| `GradientButton` | `GradientButton` | Keep but reserve for primary CTAs only. Remove glow shadow layer. |
| Tab bar | `TabBar` | Replace `BlurView` background with solid `bgNav`. Keep sliding pill indicator and haptics. |
| `AnimatedAvatar` | `AnimatedAvatar` | Keep ring animation but use the `useRingRotation` hook instead of inline implementation. |
| `FollowButton` | `FollowButton` | Use `useFollowMorph` hook. State comes from `UserContext` instead of local state. |
| `HeartButton` | `HeartButton` | Use `useHeartBurst` hook. State comes from `UserContext`. |
| `StatCard` | `StatCard` | Use `useCountUp` hook instead of inline equivalent. Solid card background. |
| `StreakBadge` | `StreakBadge` | Use `useStreakPulse` hook. Make more prominent on profile screen. |
| `GenrePill` | `GenrePill` | Use `useGenrePillMorph` hook. No visual changes needed. |

### New Components

| Component | Purpose |
|---|---|
| `BottomSheet` | Reusable bottom sheet (replaces filter modal). Uses `react-native-gesture-handler` pan gesture + reanimated. |
| `SearchInput` | Real text input with search icon, clear button, and focus animation. Used on Discover and Shows. |
| `SettingsScreen` | Placeholder screens for Edit Profile, Notifications, Privacy, Help & Support. |
| `ShareButton` | Share show/DJ via `Share` API. |
| `ProgressBar` | For achievement progress (Duolingo-style). |
| `EmptyState` | Consistent empty state component with icon + message + optional CTA. |

## Screen Designs

### Feed Tab (`app/(tabs)/index.tsx`)

**Layout:**
- Header: "mixr" logo (left) + `StreakBadge` (right) -- unchanged
- Vertical `FlatList` of feed cards with `useStaggerEntrance`

**Feed Card redesign:**
- Hero image: 240px height, full card width, `borderRadius` top only
- Gradient overlay at bottom of image (name + timestamp overlay)
- Below image: title (h4), single-line subtitle (bodySm, textSecondary)
- Action bar: `HeartButton` + like count, comment icon + count, `ShareButton` -- right-aligned
- Card uses solid `Card` component (no blur)
- Like state from `UserContext`

### Discover Tab (`app/(tabs)/discover.tsx`)

**Layout:**
- Header: "Discover" (h2)
- `SearchInput` -- real TextInput, debounced 300ms, filters DJs by name/genre/location
- Genre pill row: horizontal scroll of `GenrePill` components
- "Trending DJs" section: horizontal scroll of large DJ cards (160px wide, image + name + genre)
- "All DJs" section: vertical list of DJ rows (avatar + name + location + genres + `FollowButton`)

**Functional changes:**
- Search actually filters the DJ list in real-time
- Follow state from `UserContext`, persists across screens
- DJ card press navigates to `/dj/[id]`

### Shows Tab (`app/(tabs)/shows.tsx`)

**Layout:** Mostly unchanged -- already well-built.

**Functional changes:**
- Wire `ShowSearchContext` as provider in the tab layout
- Filter modal becomes a `BottomSheet` (slide up from bottom, drag to dismiss)
- "Apply Filters" in the bottom sheet updates `ShowSearchContext` state directly
- Sort pills and search bar already functional -- keep as-is
- Map/list toggle already works -- keep as-is

### Profile Tab (`app/(tabs)/profile.tsx`)

**Layout redesign:**
- Large `AnimatedAvatar` (size 120, with ring) centered at top
- Name (h2) + handle (bodySm, textSecondary) centered below
- `StreakBadge` prominent below handle (larger size, centered)
- Stats row: three `StatCard` components with count-up animation
- "Achievements" section with `ProgressBar` on incomplete achievements
- Settings menu: `MenuItem` rows that navigate to placeholder screens
- "Log Out" at bottom with red text

**Gamification polish:**
- Trigger confetti (`useConfetti`) when viewing a newly earned achievement
- Animate progress bars on mount
- Level indicator with progress toward next level

### DJ Detail (`app/dj/[id].tsx`)

**Layout:** Keep parallax hero (use `useParallax` hook instead of inline).

**New sections:**
- "Upcoming Shows" section: list shows from `getUpcomingShowsForDj(djId)` as compact `ShowCard` rows
- Follow button state from `UserContext`
- Remove "Message" button (no backend to support it)
- Recent Activity section: keep but improve card styling

### Show Detail (`app/show/[id].tsx`)

**Layout:** Keep parallax hero (use `useParallax` hook).

**Additions:**
- `ShareButton` in header (absolute top-right)
- "Get Directions" already works via `Linking` -- keep
- Lineup DJ rows navigate to `/dj/[id]` -- already works, keep
- "More at [Venue]" section already works -- keep

### Filter Bottom Sheet (`app/filter-modal.tsx` → bottom sheet)

**Convert from modal to bottom sheet:**
- Slide up from bottom with drag handle
- Backdrop tap to dismiss
- Same filter sections (date, genres, city, venue, price, sold out toggle)
- "Apply" button updates `ShowSearchContext` directly and dismisses
- "Clear All" resets context filters
- Saved presets keep AsyncStorage persistence

### Settings Screens (new)

Placeholder screens for:
- `app/settings/edit-profile.tsx` -- display current profile info (read-only for now)
- `app/settings/notifications.tsx` -- toggle switches (visual only, not persisted)
- `app/settings/privacy.tsx` -- toggle switches (visual only)
- `app/settings/help.tsx` -- FAQ-style accordion or simple text

These are thin screens so the navigation works. Content is secondary.

## State Architecture

### UserContext

```typescript
interface UserState {
  profile: UserProfile;
  followedDjIds: Set<string>;
  likedFeedItemIds: Set<string>;
  // Actions
  toggleFollow: (djId: string) => void;
  toggleLike: (feedItemId: string) => void;
}
```

- Wraps the entire app in `app/_layout.tsx`
- Initialized from mock data
- All follow/like toggles go through this context
- Components read from context instead of local state

### ShowSearchContext (existing, needs wiring)

- Already defined in `src/context/ShowSearchContext.tsx`
- Wrap `app/(tabs)/shows.tsx` and the filter bottom sheet
- Filter modal reads/writes through context
- Shows tab reads results from context

### No backend, no AsyncStorage persistence for user actions

Follows/likes reset on app restart. This is intentional -- mock data layer, no persistence complexity.

## Hook Consolidation

Replace all inline animation implementations with the existing hooks:

| Component | Currently | Change to |
|---|---|---|
| `HeartButton` | Inline spring animation | `useHeartBurst()` |
| `FollowButton` | Inline spring + color | `useFollowMorph()` |
| `GenrePill` | Inline spring + color | `useGenrePillMorph()` |
| `StatCard` | Inline `useAnimatedProps` | `useCountUp()` |
| `AnimatedAvatar` | Inline `withRepeat` | `useRingRotation()` |
| `StreakBadge` | Inline `withRepeat` | `useStreakPulse()` |
| Tab bar | Inline spring translateX | `useTabMorph()` |
| DJ/Show detail | Inline `scrollY * 0.5` | `useParallax()` |

`useConfetti` gets wired to achievement unlocks on the profile screen.

**Important:** Several hooks (`useHeartBurst`, `useFollowMorph`) currently manage their own boolean state internally. Since follow/like state now lives in `UserContext`, these hooks need to be refactored to accept external state (e.g., `useHeartBurst(isLiked: boolean)`) and return only the animation styles, not state management. The context provides the state; the hooks provide the animation.

## Deployment

### Expo Go (quickest path)

1. `npx expo start` -- generates QR code
2. Teammates install Expo Go on their phones
3. Scan QR code on same network -- app loads instantly
4. Works for iOS and Android

### EAS Development Build (if Expo Go has limitations)

1. `npx eas-cli build --profile development --platform ios`
2. Distributes via QR code or direct install link
3. Supports native modules that Expo Go may not (e.g., `react-native-maps`)
4. Requires free Expo account

### Web Preview (bonus)

`npx expo start --web` serves a web version at localhost. Can be deployed to Vercel for remote access, but not the primary target.

## Out of Scope

- Real backend / API integration
- User authentication
- Push notifications (functional)
- App Store / TestFlight submission
- Payments or ticketing
- Real-time data or WebSocket connections
- Deep linking configuration
