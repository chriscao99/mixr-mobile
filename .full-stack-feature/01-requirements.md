# Requirements: Search & Filtering for Shows/Events

## Problem Statement
Users want to find shows near them or filter by date/venue but currently have no way to narrow down upcoming events. The app lacks event planning tools — users can't search for specific shows or filter the event catalog to find what's relevant to them.

## Acceptance Criteria
- [ ] Users can search shows by keyword (DJ name, venue name, event name)
- [ ] Users can filter by date range (today, this week, this weekend, custom range)
- [ ] Users can filter by city/venue/location
- [ ] Users can filter by genre
- [ ] Users can sort results by distance, date, or popularity
- [ ] Users can save filter presets for quick reuse
- [ ] Map view shows nearby shows with pins on a map
- [ ] Results update in real-time as filters change
- [ ] Search and filters integrate into the existing Discover tab and potentially a new Shows/Events tab

## Scope

### In Scope
- Text search across shows (DJ name, venue, event name)
- Date range filtering (presets + custom)
- Location/venue filtering
- Genre filtering
- Sort by distance/date/popularity
- Saved filter presets (persisted locally)
- Map view of nearby shows (using react-native-maps)
- Integration with existing Discover tab
- Extending mock data system for shows/events

### Out of Scope
- Ticket purchasing or checkout flows
- Social features (sharing results, friends going, collaborative playlists)
- AI/ML-powered recommendations or "shows you might like"
- Real backend/API — all data will use mock data system

## Technical Constraints
- No backend — extend existing mock data in `src/data/mockData.ts`
- All data is local/mock for now; design data layer so it can be swapped for a real API later
- Must work within existing Expo SDK 54 + React Native 0.81 constraints

## Technology Stack
- **Frontend**: Expo SDK 54, React Native 0.81, Expo Router v6
- **UI**: Existing Mixr theme system (`src/theme/`), `expo-blur`, `expo-linear-gradient`, `lucide-react-native`
- **Animations**: `react-native-reanimated`, `react-native-gesture-handler`
- **Maps**: `react-native-maps` (new dependency)
- **State**: Local state + AsyncStorage for saved presets
- **Data**: Mock data system (`src/data/mockData.ts`)
- **Database**: None (mock data only)

## Dependencies
- Extends the existing Discover tab (`app/(tabs)/discover.tsx`)
- May add a new Shows/Events tab to the tab bar
- Uses existing UI components from `src/components/ui/`
- Extends existing type definitions in `src/types/`
- Extends mock data in `src/data/mockData.ts`

## Configuration
- Stack: expo-react-native
- API Style: rest (mock data layer)
- Complexity: medium
