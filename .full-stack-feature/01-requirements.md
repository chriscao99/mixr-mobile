# Requirements: Design Refresh + Location-Based Show Discovery

## Problem Statement

The Mixr app currently feels too generic/templated — it needs a distinctive, premium feel that matches the music/nightlife vibe. Additionally, users have no way to find nearby or upcoming shows automatically — they have to search manually, which kills engagement. Both problems are equally important and blocking growth.

## Acceptance Criteria

- [ ] App has a premium dark/glass aesthetic with smooth, attention-grabbing animations
- [ ] All screens feel sleek, modern, and cohesive — not like a stock template
- [ ] A "Nearby Shows" section appears on the home screen using device location
- [ ] Shows tab is redesigned with location-based discovery integrated into it
- [ ] Location permissions are requested gracefully with explanation
- [ ] Shows are sorted/surfaced by proximity and upcoming date
- [ ] The overall visual language feels like a high-end nightlife/music app

## Scope

### In Scope

- Visual redesign of all existing screens (Feed, Discover, Shows, Profile, DJ Detail)
- Premium animation upgrades (entrance animations, transitions, micro-interactions)
- Location-based show discovery on Home screen (nearby shows carousel)
- Shows tab redesign with location awareness (distance display, proximity sorting)
- Device location integration (permissions, geolocation)
- Distance calculation from user to venues
- Mock data with realistic lat/lng coordinates (already exists in venues)
- Enhanced glassmorphism, gradients, and depth effects
- Polished tab bar and navigation transitions

### Out of Scope

- Ticket purchasing / payment flows (link out to external sites if needed)
- Social features (sharing, commenting, social interactions around shows)
- Real backend API — keep using mock data, focus on UI/UX and location logic
- Push notifications for nearby shows
- User onboarding flow

## Technical Constraints

- No strong library preferences — use whatever works best within Expo managed workflow
- Must work within Expo SDK 54 managed workflow
- React Native 0.81 with New Architecture enabled
- Existing libraries: react-native-reanimated, react-native-gesture-handler, expo-blur, expo-linear-gradient, lucide-react-native
- Existing react-native-maps integration (optional dependency with fallback)
- Portrait orientation only
- Dark-first design (existing theme)

## Technology Stack

- **Framework**: Expo SDK 54 + React Native 0.81
- **Routing**: Expo Router v6 (file-based, typed routes)
- **UI**: Custom components with expo-blur, expo-linear-gradient
- **Animations**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **Icons**: lucide-react-native
- **Maps**: react-native-maps (already optional dep)
- **Location**: expo-location (to be added)
- **Data**: Mock data (no backend)
- **Language**: TypeScript strict mode

## Dependencies

- The existing Shows tab (from PR #3) should be reworked as part of this feature — integrate location-based discovery into it
- Existing UI components in src/components/ui/ should be enhanced, not replaced
- Existing theme tokens in src/theme/ should be evolved, not wholesale replaced
- Mock data in src/data/mockData.ts already has 9 venues with lat/lng and 18 shows

## Configuration

- Stack: expo-react-native
- API Style: rest (N/A — frontend only with mock data)
- Complexity: complex

## Current Codebase Context

### Existing Screens
- **Feed (Home)**: Vertical feed of content cards with hero images, DJ info, action buttons
- **Discover**: DJ cards with follow buttons, horizontal genre pill filter
- **Shows**: Search bar, filter chips, sort pills, list/map view toggle, pagination
- **Profile**: Animated avatar, stats cards, achievements, settings menu
- **DJ Detail**: Parallax hero, stats row, genre pills, follow/message buttons

### Existing Design Language
- Glassmorphism with BlurView (intensity 20)
- Purple/indigo/teal accent palette
- Spring physics for interactions (damping 12-20, stiffness 150-400)
- 1px subtle glass borders
- Dark backgrounds (#07070A primary)
- Inter font family with defined type scale

### Existing Animation Hooks
- useStaggerEntrance, useHeartBurst, useRingRotation, useCountUp, useStreakPulse, useTabMorph, useConfetti, useFollowMorph, useGenrePillMorph, useParallax

### Mock Data Available
- 6 DJs, 5 genres, 3 feed items, 9 venues (with lat/lng), 18 shows (with dates, prices, popularity)
