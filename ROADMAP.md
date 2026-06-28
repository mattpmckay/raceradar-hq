# RaceRadarHQ — Product Roadmap

This is the single source of truth for the product direction of RaceRadarHQ. Update this document whenever a sprint is completed, the roadmap changes, a major architectural decision is made, or a feature is added or removed.

---

## Product Vision

RaceRadarHQ exists to become the world's most trusted platform for discovering, comparing, planning, and participating in fitness events.

We are building the platform athletes visit before every race.

---

## Mission Statement

Become the best fitness event discovery and planning platform in Asia Pacific.

---

## Target Users

**Primary:** Amateur and competitive athletes in Asia Pacific who participate in fitness events — HYROX, CrossFit, Spartan Race, Ironman, Triathlon, Marathon, Trail Running, Deka Fit, Tough Mudder, and other endurance disciplines.

**Secondary (future):** Gym coaches and team managers who plan group attendance at events.

**Tertiary (future):** Event organisers who want to reach athletes directly.

---

## Product Positioning

RaceRadarHQ is **not** a social network. Athletes already have Facebook, WhatsApp, Instagram, and Discord.

RaceRadarHQ is a **structured planning platform** — the tool athletes open when they want to find, compare, save, and prepare for their next race. We compete with scattered Instagram posts, Facebook Events, and event-organiser websites — not with social networks.

Our edge: structured data, APAC coverage, premium UX, and planning tools that no existing platform provides in one place.

---

## Core Design Principles

See [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md) for full detail.

Summary:
1. Athlete first
2. Planning over social networking
3. Premium simplicity
4. Mobile first
5. Performance matters
6. SEO is a feature
7. Consistency
8. No technical debt by default
9. Architectural decisions must support the long-term vision

---

## Completed Sprints

### Sprint 1 — Foundation (2026-06-25 to 2026-06-27)
Full project scaffold: Next.js 16, Supabase, Tailwind, Vercel. Premium homepage, events listing, event detail pages, sports/locations/guides discovery, race guides, shared header/footer, admin scaffold, user auth, SEO metadata, JSON-LD, 50+ APAC events seeded.

### Sprint 2 — Design System Unification (2026-06-28)
Full token migration from legacy (`surface-card`, `brand-*`, `gray-*`) to premium (`panel`, `wire`, `mint`, `ink*`) across all public pages. Ghost macOS duplicate files removed.

### Sprint 3 — Homepage Sport Discovery Rows (2026-06-28)
Replaced tabbed filter homepage with permanent sport rows (Featured, HYROX, CrossFit, Spartan, Ironman, Marathon, Trail Running). Server component, rows with zero events hidden automatically.

### Sprint 4a — Event Detail: Sticky CTA, Countdown, Plan Your Trip, iCal (2026-06-28)
Sticky mobile Register Now bar. Countdown timer in sidebar. Plan Your Trip upgraded from "Coming Soon" to real venue/airport/climate/transport cards for 13 APAC cities. iCal export endpoint.

### Sprint 6 — Events Page Discovery Upgrade (2026-06-28)
Heart save button on every event card (overlay link pattern). Multi-field search (title, city, country, discipline) with 350ms debounce. Month window filter (This month / Next 3 / Next 6). Event counts on discipline pills. `loading.tsx` skeleton. Better empty state with Reset Filters. `useFavourite` shared hook. Product documentation created (ROADMAP, CHANGELOG, PRODUCT_PRINCIPLES).

### Sprint 5 — Save / Favourites (2026-06-28)
Toggle API at `POST /api/favourites`. SaveButton client component with optimistic UI. Wired into event detail sidebar with server-prefetched initial state. Dashboard token migration.

---

## Current Sprint

### Sprint 7 — TBD
To be defined. Leading candidates are listed under Next Planned Sprint below.

---

## Next Planned Sprint

### Sprint 7 — TBD
To be defined after Sprint 6. Leading candidates:
- Events listing pagination / "Load more" (currently capped at 48)
- User profile page (edit name, avatar, preferences)
- Registration status badge on events (requires DB migration)
- Admin event CRUD improvements

---

## Product Backlog

Items approved for the product but not yet scheduled into a sprint.

| Priority | Feature | Notes |
|---|---|---|
| High | Registration status badge | Requires `registration_status` enum migration + admin field |
| High | Events pagination / Load More | 48-event cap is fine now, will hit limits as DB grows |
| High | User profile page | Edit display name, avatar, sport preferences |
| Medium | Admin event CRUD improvements | Currently read-only stubs |
| Medium | Track / circuit directory pages | `/tracks/[slug]` template exists, needs content |
| Medium | Championship / series pages | `/championships/[slug]` template exists, needs content |
| Medium | Sort toggle on events page | Soonest first / Furthest out |
| Low | iCal export polish | Multi-day event handling, timezone hints |
| Low | "You might also like" on event detail | Cross-discipline suggestions |

---

## Technical Debt

Known shortcuts and areas that need attention.

| Item | Location | Notes |
|---|---|---|
| Plan Your Trip city data is hardcoded | `events/[slug]/page.tsx` — `CITY_DATA` | Works for 13 APAC cities; will need DB table or CMS as cities expand |
| Dashboard pages use `user!.id` (non-null assertion) | `dashboard/page.tsx`, `dashboard/favourites/page.tsx` | Safe because middleware protects these routes, but fragile if middleware config changes |
| Homepage event cards have no saved state | `components/home/EventsSection.tsx` | Homepage uses its own inline EventCard — not updated in Sprint 6 |
| No pagination on events listing | `events/page.tsx` | Capped at 48 — fine for current scale |

---

## Phase 2 Roadmap (Future — Do Not Build Yet)

These features are intentionally postponed. Keep them in mind when making architectural decisions so we don't paint ourselves into a corner.

### Gym Profiles
- Dedicated gym pages with logo, description, location, coaches
- Upcoming and past events per gym
- Athlete count, verified badge
- Requires: `gyms` table, `gym_athletes` join table

### "Who's Going?"
- Per-event athlete attendance count
- Which gyms are attending and how many athletes per gym
- Requires: `event_attendance` table (separate from `favourites`)

### Find a Partner
- Match athletes for HYROX Doubles / Mixed Doubles / Relay
- Filters: location, division, experience level, finish time, gym
- Requires: athlete profiles with sport preferences and stats

### Team Planning
- Team organiser tools, shared attendance lists
- Shared accommodation and transport coordination
- Team schedules and announcements

### Expanded Venue Pages
- Hotels, parking, airports, restaurants, public transport per venue
- History of past events at each venue
- Currently served by hardcoded `CITY_DATA`; will need structured DB

### Expanded Athlete Dashboard
- Race history, results, personal records, badges
- Upcoming calendar view
- Race reminders and registration deadline alerts

### Gym Dashboard (Premium Feature)
- Athlete registrations per event
- Team attendance management
- Featured listing for gyms
- Event planning and announcements

---

## Phase 3 Roadmap (Long-Term Vision)

- AI-powered event recommendations based on athlete history
- AI season planner ("Based on your goals, here's your 2027 race calendar")
- Community reviews and ratings on events
- Results and standings tracking
- Organiser accounts with analytics dashboard
- iCal integration (sync saved events to Google / Apple Calendar)
- API for third-party integrations
- Premium athlete memberships
- Gym subscriptions

---

## Future Monetisation

**Athletes (free tier):**
- Unlimited saved events
- Personal race calendar
- Race reminders
- Results tracking

**Athletes (premium — future):**
- Advanced search and filtering
- AI season planner
- Early access to new events

**Gyms (subscription — future):**
- Verified gym profile
- Team management tools
- Event planning dashboard
- Featured listing in discovery
- Athlete analytics

**Event Organisers (future):**
- Promoted event listings
- Analytics on athlete views and saves
- Direct registration integration

---

## Key Product Decisions

Architectural and strategic decisions worth recording for posterity.

| Date | Decision | Reason |
|---|---|---|
| 2026-06-28 | `favourites` table uses polymorphic `entity_type` + `entity_id` | Allows favouriting events, tracks, and championships without separate tables |
| 2026-06-28 | Plan Your Trip city data hardcoded, not in DB | Avoids premature DB migration; good enough for 13 APAC cities at current scale |
| 2026-06-28 | iCal uses all-day DATE format, not DATETIME | Eliminates timezone complications across Google Calendar, Apple Calendar, Outlook |
| 2026-06-28 | Homepage sport rows are server components, no client tabs | Enables SSR and removes unnecessary client JS |
| 2026-06-27 | Single dynamic `[slug]` route for all events | Static per-event pages were deleted after they shadowed the dynamic route and blocked new features |
| 2026-06-28 | RaceRadarHQ is a planning platform, not a social network | Platform should not rebuild Facebook/WhatsApp/Discord — focus on structured event data and planning tools |

---

## Features Deliberately Postponed

| Feature | Reason |
|---|---|
| Registration status badge | Needs DB migration + admin field; low value until statuses are populated |
| Social feed / activity stream | Out of scope — Facebook and Instagram already do this |
| Direct messaging | Out of scope — WhatsApp/Discord already do this |
| Weather API | Nice to have; climate data by month is sufficient at current scale |
| Community reviews | Needs moderation infrastructure; Phase 2 |
| Results and standings tracking | Needs results data pipeline; Phase 2/3 |
| AI recommendations | Needs user history data first; Phase 3 |

---

## Ideas Parked for Later

- Save multiple "race wishlists" (e.g. "2027 A-Races", "Bucket List")
- Athlete-to-athlete follow (Strava-style)
- "I'm going" button separate from "Save" (enables Who's Going feature)
- Team / group planning tools
- Venue pages with hotel recommendations
- Relay and doubles partner matching
- Race reminders via email / push notifications
- In-app calendar view (month grid of saved events)
- CSV / PDF export of saved race calendar
- Embed widget for event organisers (show event on their website via RaceRadar)
