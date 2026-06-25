# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RaceRadar is a motorsport intelligence platform that helps racers, teams, and fans discover race events, track days, championships, and motorsport opportunities. It is a public-facing discovery platform with an admin dashboard and user accounts.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |

## Architecture

### Next.js App Router structure

```
src/
  app/
    (public)/           # Public-facing pages (events, tracks, championships)
    (auth)/             # Auth flows (login, signup, password reset)
    admin/              # Admin dashboard — protected by middleware
    api/                # Route handlers for mutations and webhooks
  components/
    ui/                 # Primitives: buttons, inputs, cards, badges
    layout/             # Header, footer, nav, page shells
    events/             # Event-specific components
    tracks/             # Track-specific components
    championships/      # Championship-specific components
  lib/
    supabase/           # Supabase client (server + browser), typed helpers
    utils/              # Shared pure utilities
  types/                # Shared TypeScript types and Supabase generated types
```

### Data model (Supabase / PostgreSQL)

Core tables:
- `events` — race events, track days, and motorsport opportunities
- `tracks` — circuit/venue directory
- `championships` — series and championships
- `event_types` — lookup: race, track day, hillclimb, rally, etc.
- `profiles` — extends Supabase `auth.users` with display name, avatar, preferences
- `favourites` — user-saved events, tracks, championships (polymorphic via `entity_type` + `entity_id`)

Row-level security (RLS) is enabled on all tables. Public read is allowed on published records; writes require auth. Admin operations use a service-role client only in Route Handlers, never in client components.

### Auth

Supabase Auth handles sessions. Middleware at `src/middleware.ts` protects `/admin` routes by checking the session cookie. User-facing protected routes (favourites, profile) redirect to `/login` via the middleware.

Two Supabase clients must exist:
- `src/lib/supabase/server.ts` — for Server Components and Route Handlers (uses `createServerClient` from `@supabase/ssr`)
- `src/lib/supabase/client.ts` — for Client Components (uses `createBrowserClient` from `@supabase/ssr`)

### SEO

Each public page exports `generateMetadata` with title, description, and Open Graph fields. Dynamic pages (event detail, track detail) generate metadata from the fetched record. A `sitemap.ts` and `robots.ts` live in `src/app/`.

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

Database:
```bash
npx supabase start          # Start local Supabase stack
npx supabase db reset       # Reset local DB and run migrations
npx supabase gen types typescript --local > src/types/supabase.ts  # Regenerate DB types
npx supabase migration new <name>  # Create a new migration
```

## Coding Standards

### TypeScript

- Always use the generated Supabase types from `src/types/supabase.ts` — never write ad-hoc DB types.
- Prefer `type` over `interface` for data shapes; use `interface` only for extensible contracts.
- All async Server Component data fetches must handle the Supabase `error` return and throw or redirect appropriately.

### Components

- Server Components by default. Add `"use client"` only when interactivity or browser APIs are required.
- Co-locate a component's Tailwind variants with the component — do not create separate CSS files.
- Use `next/image` for all images; always provide `width`, `height` or `fill` with a sized container.
- Use `next/link` for all internal navigation.

### Data fetching

- Fetch data in Server Components or Route Handlers — not in Client Components via `useEffect`.
- For client-side mutations (favourites toggling, form submissions), use Route Handlers (`/api/...`) called with `fetch`, not direct Supabase client writes from the browser (keeps service-role logic server-side).
- Use `unstable_cache` or `revalidatePath`/`revalidateTag` for ISR where appropriate.

### Tailwind

- Mobile-first: base styles target mobile, use `md:` and `lg:` breakpoints for larger screens.
- Define design tokens (brand colours, font sizes) in `tailwind.config.ts` under `theme.extend` — do not hardcode arbitrary colour values in components.

### Admin dashboard

- All admin routes live under `src/app/admin/` and are protected at the middleware level.
- Admin data operations use the Supabase service-role client, imported only in Route Handlers or Server Actions — never shipped to the browser.

## Roadmap

### v1 — Core platform (current focus)
- [ ] Event directory with search and filtering (discipline, date range, location, series)
- [ ] Event detail pages with SEO metadata
- [ ] Track/circuit directory
- [ ] Championship/series directory
- [ ] User accounts: sign up, login, profile
- [ ] Favourites: save events, tracks, championships
- [ ] Admin dashboard: CRUD for events, tracks, championships
- [ ] Mobile-responsive design throughout
- [ ] Sitemap and robots.txt

### v2 — Engagement
- [ ] Event submission by organisers (with admin approval workflow)
- [ ] Email notifications / alerts for saved searches
- [ ] Results and standings tracking
- [ ] Comments and community discussion

### v3 — Intelligence layer
- [ ] Personalised recommendations
- [ ] Calendar integration (iCal export)
- [ ] API for third-party integrations
- [ ] Organiser accounts with analytics dashboard
