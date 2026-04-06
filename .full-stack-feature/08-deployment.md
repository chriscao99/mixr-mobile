# Deployment: Design Refresh + Location-Based Show Discovery

## Context
This is a frontend-only Expo managed workflow app. There is no backend, no CI/CD pipeline, and no production deployment infrastructure yet. Deployment consists of running the app on simulators/devices via Expo.

## New Dependencies Added
- `expo-location` — requires `NSLocationWhenInUseUsageDescription` in Info.plist (Expo handles this automatically via app.json config plugin)
- `expo-image` — drop-in image component, no native config needed

## App Configuration
Add the following to `app.json` under `expo.plugins` if not already present:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Mixr uses your location to find shows happening nearby."
        }
      ]
    ]
  }
}
```

## Testing on Device
1. `npm start` — start Expo dev server
2. `npm run ios` — launch on iOS simulator
3. iOS Simulator location: Features > Location > Custom Location (set to LA: 34.0522, -118.2437)
4. Test permission flow: Settings > Privacy > Location Services

## Pre-Production Checklist (for when backend is added)
- [ ] Replace mock data with real API calls
- [ ] Migrate AsyncStorage location cache to expo-secure-store
- [ ] Add error logging for location failures
- [ ] Add guard clauses for data resolution (venue/DJ lookups)
- [ ] Memo-wrap FeedCard when feed grows beyond mock data
- [ ] Add EAS Build configuration for production builds
- [ ] Configure OTA updates via EAS Update

## Rollback
Since this is local development, rollback is `git checkout` to the previous commit.
