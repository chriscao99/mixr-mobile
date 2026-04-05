# Mixr

A mobile app for discovering and following DJs, browsing mixes, and tracking upcoming shows.

Built with [Expo](https://expo.dev) SDK 54, React Native 0.81, and [Expo Router](https://docs.expo.dev/router/introduction/) v6.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in a web browser
npm run web
```

## Project Structure

```
app/                    # Expo Router file-based routes
  (tabs)/               # Tab navigation (Home, Discover, Profile)
  dj/[id].tsx           # DJ detail screen
  modal.tsx             # Modal route
src/
  components/ui/        # Reusable UI primitives (GlassCard, GradientButton, etc.)
  data/mockData.ts      # Mock data for DJs, feed items, genres
  hooks/                # Custom animation hooks (stagger, parallax, confetti, etc.)
  theme/                # Design tokens — colors, typography, spacing
  types/                # TypeScript interfaces (DJ, FeedItem, UserProfile, etc.)
```

## Tech Stack

- **Framework:** Expo SDK 54 / React Native 0.81
- **Routing:** Expo Router v6 (file-based, typed routes)
- **Animations:** React Native Reanimated + Gesture Handler
- **Icons:** Lucide React Native
- **Fonts:** Inter (via `@expo-google-fonts/inter`)
- **UI Effects:** `expo-blur` and `expo-linear-gradient` for glass/blur aesthetic
- **TypeScript:** Strict mode enabled

## Design System

Mixr uses a dark-first design palette with glass/blur effects and purple/indigo/teal accents. Design tokens live in `src/theme/` covering colors, typography, and spacing.

## License

Private
