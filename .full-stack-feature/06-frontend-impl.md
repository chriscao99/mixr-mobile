# Frontend Implementation: Design Refresh + Location-Based Show Discovery

## New Components Created

### Shared UI Components
| File | Purpose |
|------|---------|
| `src/components/ui/SectionHeader.tsx` | Section header with gradient accent line + "See All" action |
| `src/components/ui/ShimmerPlaceholder.tsx` | Animated shimmer loading placeholder |
| `src/hooks/usePressAnimation.ts` | Reusable press feedback hook (scale + haptics) |

### Location Components
| File | Purpose |
|------|---------|
| `src/components/location/DistanceBadge.tsx` | Inline distance display with MapPin icon |
| `src/components/location/LocationPermissionPrompt.tsx` | Permission request UI (inline + banner variants) |
| `src/components/location/LocationHeader.tsx` | City display + permission state handling |

### Nearby Show Components
| File | Purpose |
|------|---------|
| `src/components/nearby/NearbyShowCard.tsx` | Compact 160x220 card for carousel |
| `src/components/nearby/FeaturedShowCard.tsx` | Full-width hero card with urgency badge + glow |
| `src/components/nearby/NearbyShowsCarousel.tsx` | Horizontal carousel with section header |

## Modified Components
| File | Changes |
|------|---------|
| `src/components/ui/GlassCard.tsx` | Added glowColor + glowIntensity props |
| `src/hooks/useStaggerEntrance.ts` | Added `once` param, capped stagger at index 8 |

## Screen Redesigns

### Home (Feed) — `app/(tabs)/index.tsx`
- Hero section with mesh gradient background
- FeaturedShowCard (top ranked nearby show)
- "Near You" carousel with location permission handling
- "Your Feed" section with SectionHeader
- expo-image for feed card images
- sectionGap spacing between sections

### Shows Tab — `app/(tabs)/shows.tsx`
- Uses ShowSearchContext (wired to LocationContext) instead of direct hook call
- LocationHeader below title showing detected city
- "Nearby" sort pill (nearby_rank) replaces "Distance"
- Defaults to nearby_rank sort when location available
- Map view centers on user location

### Discover — `app/(tabs)/discover.tsx`
- Functional search bar (filters DJs by name)
- SectionHeader for "Trending DJs"
- Follower count on DJ cards
- Genre-colored left border accent on cards
- expo-image for avatars

### Profile — `app/(tabs)/profile.tsx`
- Gradient backdrop behind avatar section
- Avatar increased to 110px
- SectionHeaders for all sections
- Grouped achievements in single GlassCard with dividers
- Grouped settings in single GlassCard with dividers
- Earned achievement accent border

### DJ Detail — `app/dj/[id].tsx`
- Hero height 360px (was 320)
- 3-stop cinematic gradient overlay
- BlurView back button
- Purple glow on stats row
- "Upcoming Shows" section with ShowCard
- SectionHeaders for all sections

## TypeScript Status
Zero new errors. All files compile cleanly.
