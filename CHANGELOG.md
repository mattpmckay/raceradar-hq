# RaceRadarHQ — Changelog

All significant changes to the product are recorded here. Format: sprint number, date, features added, files affected, breaking changes, deployment status.

---

## Sprint 8 — Admin Event CRUD
**Date:** 2026-06-29
**Status:** Deployed ✓

### Features Added
- **Create event** — `/admin/events/new` page with full `EventForm`. Auto-generates slug from title (using existing `slugify` util); slug is editable. All event fields: title, slug, discipline, event_type, start/end/deadline dates, registration_status, country/region/city, organiser, description, website_url, image_url, is_published, is_featured.
- **Edit event** — `/admin/events/[id]/edit` page prefetches event from DB and renders `EventForm` with all fields pre-filled. "View live" link for published events.
- **Delete event** — Confirm-dialog delete button on edit page; hard deletes the row.
- **`EventForm` client component** — Shared between create and edit. Optimistic slug generation on title keystroke; stops auto-updating slug once user manually edits it. Submits to Route Handler; shows inline error on conflict (duplicate slug) or server error. Redirects to `/admin/events` on success.
- **API routes** — `POST /api/admin/events` (create), `PATCH /api/admin/events/[id]` (update), `DELETE /api/admin/events/[id]`. All routes check session + admin role before using service-role client. Returns 409 with friendly message on slug uniqueness violation.
- **Admin token migration** — `layout.tsx`, `page.tsx`, and `events/page.tsx` migrated from legacy tokens (surface-border, surface-card, brand-500, gray-400, text-white) to premium tokens (wire, panel, mint, ink, ink-muted).
- **`form-input` CSS class** — Added as alias for `.input` in `globals.css` for use in admin forms.
- **DB migration applied** — `20260628000001_add_registration_status.sql` applied to production Supabase project.

### Files Added / Modified
- `src/app/api/admin/events/route.ts` *(new)*
- `src/app/api/admin/events/[id]/route.ts` *(new)*
- `src/components/admin/EventForm.tsx` *(new)*
- `src/app/admin/events/new/page.tsx` *(new)*
- `src/app/admin/events/[id]/edit/page.tsx` *(new)*
- `src/app/admin/layout.tsx` — premium token migration
- `src/app/admin/page.tsx` — premium token migration
- `src/app/admin/events/page.tsx` — premium token migration
- `src/app/globals.css` — added `.form-input` alias
- `ROADMAP.md`, `CHANGELOG.md` — updated

### Breaking Changes
None.

---

## Sprint 7 — Registration Status, Save Counts, Homepage Hearts, Profile Page
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- **Registration status badge** — `registration_status` column added to `events` table (nullable, 4 values: open / closing_soon / sold_out / coming_soon). `RegistrationStatusBadge` component renders in sidebar with per-status colour and animated pulse dot. Only renders when a status is set — zero impact on existing events.
- **"X athletes saved this" count** — `get_event_save_count(uuid)` RPC function with `SECURITY DEFINER` bypasses RLS to count total saves across all users without exposing individual rows. Count shown below Save button on event detail sidebar.
- **Homepage card hearts** — Homepage inline `EventCard` (in `EventsSection.tsx`) converted to overlay link pattern + `HeartButton`. `EventsSectionServer.tsx` fetches user session + saved IDs in parallel; zero extra queries for guests.
- **Profile page** — `/dashboard/profile` page with `ProfileForm` client component (display name + username). `PATCH /api/profile` validates username format and handles unique constraint violations with friendly error copy.
- **Dashboard layout migration** — All legacy tokens replaced with premium tokens; "Profile" added to sidebar nav.

### Files Added / Modified
- `supabase/migrations/20260628000001_add_registration_status.sql` *(new)*
- `src/app/api/profile/route.ts` *(new)*
- `src/components/dashboard/ProfileForm.tsx` *(new)*
- `src/app/dashboard/profile/page.tsx` *(new)*
- `src/types/supabase.ts` — `registration_status` + `get_event_save_count` RPC added
- `src/app/(public)/events/[slug]/page.tsx`
- `src/components/home/EventsSection.tsx`
- `src/components/home/EventsSectionServer.tsx`
- `src/app/dashboard/layout.tsx`

### Breaking Changes
None.

### Action Required
The migration `20260628000001_add_registration_status.sql` must be applied to the Supabase project before `registration_status` and `get_event_save_count` are available in production. Apply via Supabase dashboard SQL editor or `npx supabase migration up`.

---

## Sprint 6 — Events Page Discovery Upgrade
**Date:** 2026-06-28
**Status:** Deployed ✓

### Features Added
- **Save/heart on event cards** — Heart button (icon-only) on every event card using an overlay link pattern. The card `<Link>` becomes an invisible absolute overlay; heart sits above it via `z-10`. Stops propagation to prevent card navigation on heart click. Correct saved/unsaved state server-prefetched per user.
- **Multi-field search** — Search now covers title, city, country, and discipline. Previously title-only; searching "Sydney" returned zero results.
- **Debounced live search** — 350ms debounce after keystroke; immediate clear when input emptied. Removed Enter/blur triggers.
- **Month window filter** — "This month / Next 3 months / Next 6 months" dropdown. Translates to Supabase date range on the server. Works alongside all other filters.
- **Event counts on discipline pills** — Live count of matching events per discipline (e.g. "HYROX 23"). Counts respect the active time window but not the active discipline filter.
- **`loading.tsx` skeleton** — Full-page skeleton (hero + pills + filter bar + 8 card skeletons) shown during navigation to the events page.
- **Better empty state** — Contextual copy depending on which filters are active; "Reset filters" button preserves discipline when clearing secondary filters.
- **Active filter chips for all three filters** — Search query, country, and time window each get a removable chip.
- **`useFavourite` shared hook** — Extracted toggle logic shared between `SaveButton` (sidebar) and `HeartButton` (cards).
- **Favourites page** — Cards now show filled heart (initialSaved={true}).
- **Product documentation** — ROADMAP.md, CHANGELOG.md, PRODUCT_PRINCIPLES.md created.

### Files Affected
- `src/hooks/useFavourite.ts` *(new)*
- `src/components/events/HeartButton.tsx` *(new)*
- `src/app/(public)/events/loading.tsx` *(new)*
- `ROADMAP.md` *(new)*
- `CHANGELOG.md` *(new)*
- `PRODUCT_PRINCIPLES.md` *(new)*
- `src/components/events/SaveButton.tsx`
- `src/components/events/EventCard.tsx`
- `src/app/(public)/events/page.tsx`
- `src/components/events/EventFilters.tsx`
- `src/app/dashboard/favourites/page.tsx`

### Breaking Changes
None. `EventCard` gained an optional `initialSaved` prop (default `false`) — existing call sites without the prop continue to work.

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
