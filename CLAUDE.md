# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mixr is a mobile app for discovering and following DJs, browsing mixes, and tracking upcoming shows. Built with Expo SDK 54, React Native 0.81, and Expo Router v6 (file-based routing with typed routes).

## Commands

- `npm start` — start Expo dev server
- `npm run ios` — start on iOS simulator
- `npm run android` — start on Android emulator
- `npm run web` — start web version

No test runner or linter is currently configured beyond the single test file at `components/__tests__/`.

## Architecture

### Routing (`app/`)
File-based routing via Expo Router. The root layout (`app/_layout.tsx`) loads fonts, manages splash screen, and wraps the app in a `ThemeProvider` (light/dark via React Navigation themes). Tab navigation lives in `app/(tabs)/` with three tabs: Home (`index.tsx`), Discover (`discover.tsx`), and Profile (`profile.tsx`). Additional routes include a DJ detail screen (`app/dj/[id].tsx`) and a modal (`app/modal.tsx`).

### Source Code (`src/`)
Feature code lives in `src/`, separate from the Expo template scaffolding in the root:

- **`src/types/`** — TypeScript interfaces for domain models: `DJ`, `FeedItem`, `UserProfile`, `Achievement`, `Genre`
- **`src/theme/`** — Design tokens (colors, typography, spacing) matching the "Mixr v5" design system. Dark-first palette with glass/blur aesthetic and purple/indigo/teal accents.
- **`src/components/ui/`** — Reusable UI primitives: `GlassCard`, `GradientButton`, `AnimatedAvatar`, `FollowButton`, `GenrePill`, `HeartButton`, `MenuItem`, `StatCard`, `StreakBadge`. Uses `expo-blur` and `expo-linear-gradient`.
- **`src/data/mockData.ts`** — Mock data for DJs, feed items, user profile, genres
- **`src/hooks/`** — Custom animation hooks: `useStaggerEntrance`, `useParallax`, `useConfetti`, `useCountUp`, `useFollowMorph`, `useGenrePillMorph`, `useHeartBurst`, `useRingRotation`, `useStreakPulse`, `useTabMorph`

### Legacy Template Code (root-level)
`components/`, `constants/Colors.ts` — original Expo template files. New work should go in `src/`.

### Two Color Systems
- **`constants/Colors.ts`** — Expo template light/dark theme colors (used by root tab layout)
- **`src/theme/colors.ts`** — Mixr v5 design tokens (dark-first, glass/blur aesthetic with purple/indigo/teal accents). New components should use `src/theme/`.

## Key Conventions

- Path alias: `@/*` maps to the project root (configured in `tsconfig.json`)
- New Architecture enabled (`newArchEnabled: true` in app.json)
- Icons: `lucide-react-native` for new components, `@expo/vector-icons/FontAwesome` in template code
- Animations: `react-native-reanimated` for animations, `react-native-gesture-handler` for gestures
- Portrait orientation only
- TypeScript strict mode
