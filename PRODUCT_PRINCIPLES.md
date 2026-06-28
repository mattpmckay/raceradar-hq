# RaceRadarHQ — Product Principles

These principles define how RaceRadarHQ should evolve. Every feature decision, architectural choice, and sprint scope should be tested against them.

---

## 1. Athlete First

Every feature must make life easier for athletes. We are not building for gyms, event organisers, or sponsors first — we are building for the person who wants to find their next race and show up prepared.

Ask before shipping: *Does this make the athlete's experience better?*

---

## 2. Planning Over Social Networking

RaceRadarHQ is not a social network. Athletes already have Facebook, WhatsApp, Instagram, and Discord. We should not rebuild those.

Instead, RaceRadarHQ should become the best place to:
- **Discover** events
- **Compare** events
- **Plan** a race season
- **Prepare** for an event
- **Save** events of interest
- **Register** for events

If a feature is better handled by an existing social platform, don't build it — unless RaceRadarHQ can provide unique, structured value that those platforms cannot (e.g. event-specific data, race guides, venue intelligence).

---

## 3. Premium Simplicity

Fewer polished features beat many average ones. A single well-crafted event page builds more trust than ten half-finished features.

- Finish what you start before starting something new
- Cut scope rather than ship something mediocre
- Every UI element should feel intentional

---

## 4. Mobile First

Most athletes discover events on their phones, often during training, between sets, or immediately after a race. Every feature must work perfectly on mobile before being considered done.

Test on small screens. Use fixed bottom CTAs where relevant. Avoid hover-only interactions.

---

## 5. Performance Matters

Slow platforms lose athletes. Every sprint should consider perceived performance:
- Use skeletons and streaming over blank loading screens
- Prefer server components and SSR over client-side fetching
- Minimise unnecessary re-renders and client bundles

---

## 6. SEO Is a Feature

Search traffic is one of the most valuable long-term growth channels. Athletes searching "HYROX Sydney 2026" or "Ironman New Zealand" should find RaceRadarHQ before any competitor.

- Every public page must have proper `<title>`, `<meta description>`, and Open Graph tags
- Dynamic pages must use `generateMetadata`
- Event and discipline pages are landing pages — treat them accordingly
- Structured data (JSON-LD / Schema.org) should be present on all event pages

---

## 7. Consistency

Every page should feel like it belongs to one premium product. Athletes should not notice when they navigate between pages.

- Use the design token system exclusively — never hardcode colours or spacing
- Reuse existing components before creating new ones
- Match heading styles, card layouts, and interaction patterns across the platform

---

## 8. No Technical Debt by Default

Build it right the first time or explicitly flag it as temporary. Technical debt accumulates faster than it gets paid down.

- Prefer server components; add `"use client"` only when required
- Use generated Supabase types — never ad-hoc DB types
- No inline styles unless a design token equivalent doesn't exist
- If a shortcut is taken, note it in this file under Technical Debt in ROADMAP.md

---

## 9. Architectural Decisions Must Support the Long-Term Vision

RaceRadarHQ will eventually include gym profiles, athlete dashboards, team planning, and partner-finding tools. Architectural decisions today should not close those doors.

- Keep tables extensible and polymorphic where appropriate
- Avoid coupling UI logic to current data shapes
- When in doubt, refer to the Phase 2/3 roadmap in ROADMAP.md
