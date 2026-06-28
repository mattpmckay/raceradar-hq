# RaceRadarHQ — Changelog

All significant changes to the product are recorded here. Format: sprint number, date, features added, files affected, breaking changes, deployment status.

---

## Sprint 5 — Save / Favourites
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- `POST /api/favourites` — toggle endpoint for saving/unsaving any entity (event, track, championship). Validates `entity_type` against DB enum. Returns `{ saved: boolean }`.
- `SaveButton` client component — animated heart icon, optimistic toggle, redirects unauthenticated users to `/login`.
- Event detail sidebar — server-prefetches user session and saved state; renders `SaveButton` below "Add to Calendar" with correct initial state (no flash).
- Dashboard token migration — `text-white`/`text-gray-400`/`text-brand-500` replaced with `text-ink`/`text-ink-muted`/`text-mint` across dashboard and favourites pages.

### Files Affected
- `src/app/api/favourites/route.ts` *(new)*
- `src/components/events/SaveButton.tsx` *(new)*
- `src/app/(public)/events/[slug]/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/favourites/page.tsx`

### Breaking Changes
None.

### Notes
- Static event pages for `airasia-hyrox-perth` and `byd-hyrox-sydney` were deleted in the same session — they were shadowing the dynamic `[slug]` route and blocking Sprint 4a features from rendering.

---

## Sprint 4a — Event Detail Page: Sticky CTA, Countdown, Plan Your Trip, iCal
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- Sticky mobile "Register Now" bar — fixed bottom, `lg:hidden`, shows event title + date. Uses `env(safe-area-inset-bottom)` for iPhone home bar.
- Countdown timer — server-rendered "X days to race day" in sidebar; large mint number; hides for past events.
- Plan Your Trip section — replaces "Coming Soon" placeholder with structured cards: venue + Google Maps link, nearest airport, public transport, climate by month, arrival timing, travel tip. Hardcoded data for 13 APAC cities.
- iCal export — `GET /api/events/[slug]/ical` generates RFC 5545-compliant `.ics` with all-day DATE values (no timezone complications). "Add to Calendar" button in sidebar.

### Files Affected
- `src/app/api/events/[slug]/ical/route.ts` *(new)*
- `src/app/(public)/events/[slug]/page.tsx`

### Breaking Changes
None.

---

## Sprint 3 — Homepage Sport Discovery Rows
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- Replaced tabbed filter homepage with permanent sport rows (Featured, HYROX, CrossFit, Spartan, Ironman, Marathon, Trail Running).
- Each row is independently filtered from Supabase, sorted by date, capped at 3 cards.
- Rows with zero events are silently hidden — no empty state clutter.
- `EventsSection` converted from client component (useState tabs) to server component.
- `EventsSectionSkeleton` updated to match the new row layout.

### Files Affected
- `src/components/home/EventsSection.tsx`
- `src/components/home/EventsSectionServer.tsx`
- `src/components/home/EventsSectionSkeleton.tsx`

### Breaking Changes
Removed tab-based filtering from homepage. Discipline filtering is now exclusive to `/events`.

---

## Sprint 2 — Design System Unification
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- Full migration from legacy tokens (`surface-card`, `surface-border`, `brand-*`, `gray-*`) to premium tokens (`panel`, `wire`, `mint`, `ink`, `ink-muted`, `ink-subtle`) across all public pages.
- Ghost/duplicate macOS files (`page 2.tsx`, `page 3.tsx`, etc.) deleted from public routes.
- Legacy public homepage at `(public)/page.tsx` deleted; premium homepage at `app/page.tsx` is canonical.

### Files Affected
- `src/app/(public)/sports/page.tsx`
- `src/app/(public)/locations/page.tsx`
- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/guides/how-to-choose-your-first-fitness-race/page.tsx`
- `src/app/(public)/guides/race-day-checklist/page.tsx`

### Breaking Changes
None. All legacy tokens had direct premium equivalents.

---

## Sprint 1 — Foundation
**Date:** 2026-06-25 – 2026-06-27
**Status:** Deployed ✓

### Features Built
- Next.js 16 App Router project scaffold with TypeScript strict mode, Tailwind CSS, Supabase integration.
- Premium dark homepage with live event stats, hero, discipline quick-links, and email capture.
- 50+ APAC fitness events seeded across HYROX, CrossFit, Spartan, Ironman, Marathon, Trail Running, Deka Fit, Tough Mudder.
- `/events` listing page with discipline pills, country filter, search, URL state.
- `/events/[slug]` — rich discipline-aware event detail pages with HYROX stations, Spartan formats, Ironman distances, FAQ sections, related events.
- `/sports`, `/locations`, `/guides` discovery pages.
- Two race guides: How to Choose Your First Race, Race Day Checklist.
- Shared premium `Header` and `Footer` across all public pages.
- JSON-LD structured data on all event pages.
- `generateMetadata` on all public pages.
- Admin dashboard scaffold (CRUD stubs for events, tracks, championships).
- User auth (Supabase Auth): signup, login, profile, middleware-protected routes.
- Supabase RLS on all tables.
- Vercel deployment configured.

### Files Affected
Entire project established. See `src/` directory.

### Breaking Changes
N/A (initial build).
