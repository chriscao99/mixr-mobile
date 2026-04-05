# Deployment & Infrastructure: Search & Filtering

## 1. New Dependency Installation

### react-native-maps

Install via Expo-compatible package:

```bash
npx expo install react-native-maps
```

This installs the version pinned to Expo SDK 54. Do NOT use `npm install react-native-maps` directly, as it may pull an incompatible version.

#### iOS (Apple Maps — zero config)

No additional setup required. Apple Maps works out of the box in the Expo managed workflow. No API key needed. No CocoaPods config changes needed beyond the standard `npx expo prebuild` step (if using a development build).

If running in Expo Go: `react-native-maps` is included in Expo Go for SDK 54, so no development build is required for basic testing.

#### Android (Google Maps — requires API key)

Google Maps on Android requires a Google Maps API key. Add the following to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

To obtain the key:
1. Go to the Google Cloud Console (console.cloud.google.com).
2. Enable the "Maps SDK for Android" API.
3. Create a credential (API key) restricted to your Android app's package name.
4. Store the key securely — do not commit it to the repository. Use EAS Secrets or environment variables (see section 4).

**Important:** For development builds, run `npx expo prebuild` after modifying `app.json` to regenerate the native Android project with the key embedded.

### expo-location

```bash
npx expo install expo-location
```

Already available in Expo SDK 54. The app requests foreground permission on demand (when the user first opens the map view or sorts by distance), not at launch. No `app.json` plugin entry is required for foreground-only usage — the permission prompt is triggered by the `expo-location` API at runtime.

### Optional: react-native-map-clustering

Defer this dependency until the app has more than 20 shows. When needed:

```bash
npm install react-native-map-clustering
```

This is a pure JS library with no native modules, so it requires no additional linking.

---

## 2. Test Runner Setup

### Running Tests Locally

The test suite uses Jest with ts-jest. The following was added during development:

- `jest.config.js` at the project root
- `@types/jest`, `jest`, and `ts-jest` as devDependencies
- `"test": "jest"` script in `package.json`

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npx jest src/__tests__/showService.test.ts
```

Run with coverage:

```bash
npx jest --coverage
```

### Test Files

| File | Tests | Covers |
|------|-------|--------|
| `src/__tests__/dateUtils.test.ts` | 20 | daysFromNow, resolveDateRange, isDateInRange |
| `src/__tests__/geoUtils.test.ts` | 9 | haversine, DEFAULT_LOCATION |
| `src/__tests__/showService.test.ts` | 40+ | All filter dimensions, sorting, pagination, entity resolution |
| `src/__tests__/filterStorage.test.ts` | 20+ | CRUD, limits, defaults, validation |

### CI Integration

Add a test job to your CI pipeline (GitHub Actions example):

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test -- --ci --coverage
```

Notes:
- Tests are pure unit tests against mock data and utility functions. They do not require a simulator, emulator, or native build.
- No environment variables or secrets are needed to run the test suite.
- Consider adding a coverage threshold to prevent regressions (e.g., `--coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'`).

---

## 3. App Store Considerations

### app.json Changes

#### Location Permission Strings

When `expo-location` is used, app store review requires a reason string explaining why the app needs location access. Add the `expo-location` plugin to `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Mixr uses your location to show nearby events and sort shows by distance.",
          "locationWhenInUsePermission": "Mixr uses your location to show nearby events and sort shows by distance."
        }
      ]
    ]
  }
}
```

Only foreground (when-in-use) permission is requested. The `Always` string is included as a fallback but the code never requests background location.

#### Android Google Maps Key

As described in section 1, add `android.config.googleMaps.apiKey` to `app.json`. For production, use a key restricted to your production package name and SHA-1 certificate fingerprint.

#### iOS Info.plist (Automatic)

The `expo-location` plugin automatically adds `NSLocationWhenInUseUsageDescription` to the iOS Info.plist during prebuild. No manual plist editing is needed.

#### Version Bump

Before submitting a new build to TestFlight or Play Store, increment the version:

```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

Or use EAS Build versioning: `eas build --auto-submit --platform all` with auto-incrementing build numbers.

---

## 4. Feature Flag Approach

Since this is a mobile app with no backend, feature flags are implemented client-side. The recommended approach for gradually rolling out the Shows tab:

### Simple Local Feature Flag

Create `src/config/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  SHOWS_TAB_ENABLED: true, // Set to false to hide the Shows tab
} as const;
```

In `app/(tabs)/_layout.tsx`, conditionally render the Shows tab:

```typescript
import { FEATURE_FLAGS } from '@/src/config/featureFlags';

// Inside the tab layout, conditionally include the Shows tab:
{FEATURE_FLAGS.SHOWS_TAB_ENABLED && (
  <Tabs.Screen name="shows" options={{ title: 'SHOWS', ... }} />
)}
```

### Staged Rollout Strategy

1. **Internal testing (alpha):** Flag enabled. Distribute via EAS internal distribution or TestFlight internal group.
2. **Beta testers:** Flag enabled. Submit to TestFlight external testing or Google Play internal testing track.
3. **Phased production rollout:**
   - iOS: Use App Store Connect's phased release (1% -> 2% -> 5% -> 10% -> 20% -> 50% -> 100% over 7 days).
   - Android: Use Google Play's staged rollout (start at 5-10%, increase over a week).
4. **Kill switch:** If issues are found, submit a hotfix build with the flag set to `false`. Since the flag is compile-time, this requires a new binary — see section 6 for rollback details.

### Future Enhancement: Remote Feature Flags

For runtime flag control without app updates, consider integrating a remote config service (e.g., Firebase Remote Config, Statsig, LaunchDarkly) in a future iteration. This is out of scope for the current mock-data-only phase.

---

## 5. Pre-Release Checklist

### Before Submitting to TestFlight / Play Store

- [ ] **All critical/high bugs from testing audit are fixed** (see 07-testing.md Action Items):
  - [ ] Fix `executeSearch` stale closure in useShowSearch.ts
  - [ ] Fix useEffect dependency array in useShowSearch.ts
  - [ ] Wrap renderItem in useCallback in ShowListView.tsx
  - [ ] Remove unused cross-fade animation values in shows.tsx
  - [ ] Fix ShowCard memo comparator to include compact and distance
- [ ] **All tests pass:** `npm test` exits with 0
- [ ] **No TypeScript errors:** `npx tsc --noEmit` exits with 0
- [ ] **Test on physical devices:**
  - [ ] iOS device (not just simulator) — verify maps render, location permission prompt appears, gestures work
  - [ ] Android device (not just emulator) — verify Google Maps renders with API key, back gesture works
- [ ] **Location permission flow tested:**
  - [ ] Permission granted: distance sorting and map user dot work
  - [ ] Permission denied: app falls back to default location (downtown LA), no crash
  - [ ] Permission prompt not yet shown: map view and distance sort trigger the prompt
- [ ] **Offline/edge cases:**
  - [ ] Empty search results show EmptyState component
  - [ ] Saved filter limit (20) shows error message
  - [ ] Filter name length limit (50 chars) enforced
- [ ] **Performance check:**
  - [ ] Show list scrolls at 60fps on older devices (iPhone SE / mid-range Android)
  - [ ] Map view with all pins does not lag
  - [ ] Tab switching is smooth
- [ ] **app.json updated:**
  - [ ] Location permission strings added (expo-location plugin)
  - [ ] Google Maps API key configured for Android (production key, restricted)
  - [ ] Version and build number incremented
- [ ] **Dependencies locked:** `package-lock.json` committed and up to date
- [ ] **Feature flag set correctly:** `SHOWS_TAB_ENABLED` set to desired value for the release
- [ ] **EAS Build succeeds:**
  ```bash
  eas build --platform ios --profile production
  eas build --platform android --profile production
  ```
- [ ] **App Store metadata updated:** If the Shows tab adds new screenshots or a changed description, update the store listing.

---

## 6. Rollback Plan

### Scenario: Critical Bug Found After Release

Since this is a native mobile app, rollback is more constrained than web deployment. There is no instant revert — a new binary must be built and submitted.

#### Immediate Mitigation (No New Build)

1. **Disable the feature flag:** If using a remote config service (future enhancement), disable the `SHOWS_TAB_ENABLED` flag remotely. The Shows tab disappears on next app launch.
2. **Since we use compile-time flags today**, immediate mitigation is limited. Proceed to the hotfix build.

#### Hotfix Build (Same Day)

1. Set `SHOWS_TAB_ENABLED = false` in `src/config/featureFlags.ts`.
2. Increment the build number (not the version — keep version at 1.1.0, bump buildNumber/versionCode).
3. Build and submit:
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   eas submit --platform ios
   eas submit --platform android
   ```
4. **iOS:** Request expedited review from App Store Connect if the bug is severe. Typical expedited review: 24-48 hours.
5. **Android:** Google Play review is typically faster (hours). Use staged rollout at 100% to replace the previous version.

#### Rollback to Previous Version

If the hotfix with the flag disabled is not sufficient and a full rollback is needed:

1. Check out the last known-good commit (before the Search & Filtering feature was merged):
   ```bash
   git log --oneline  # find the commit before the feature merge
   git checkout <commit-hash>
   ```
2. Increment the build number beyond the current production build.
3. Build, submit, and request expedited review.

#### Post-Incident

1. Document what went wrong and the root cause.
2. Fix the issue on the feature branch.
3. Re-run the full test suite and device testing checklist (section 5).
4. Re-enable the flag and submit a new build through the normal release process.

### Prevention

- Use phased/staged rollout (section 4) so issues are caught at low user percentages.
- Monitor crash reports via EAS or a crash reporting service (e.g., Sentry, Firebase Crashlytics).
- Ensure the Shows tab feature is fully isolated — if the tab is hidden via the feature flag, no code from the feature should execute on app launch, preventing crashes from new code paths.
