# RaceRadarHQ — Claude Code Instructions
## Import Real APAC Events + Fix Live Site Issues

---

## CONTEXT

The file `raceradarhq_apac_events_2026_27.csv` contains 50 real, verified upcoming APAC fitness events across HYROX, Spartan, Ironman, Marathon, Trail Running, and Deka Fit. These replace the 6 fake placeholder events currently on the site.

Work through the tasks below in order. Do not skip steps.

---

## TASK 1 — SUPABASE: CHECK EXISTING SCHEMA

First, inspect the existing Supabase events table schema before touching anything.

```
Run this query in Supabase SQL editor or via the client:
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'events' ORDER BY ordinal_position;
```

Note the existing column names. The CSV uses these columns:
- id, event_name, sport, city, country, start_date, end_date, venue, registration_url, format, status, source_verified

Map these to whatever column names already exist in the schema. Do not rename existing columns — adapt the import to match what's there.

---

## TASK 2 — SUPABASE: IMPORT THE CSV

Two options depending on what you find:

**Option A — Supabase Dashboard (fastest)**
1. Go to Supabase Dashboard → Table Editor → events table
2. Click Import CSV
3. Upload `raceradarhq_apac_events_2026_27.csv`
4. Map columns as needed
5. Confirm import

**Option B — Via code if direct import not available**
Create a script `/scripts/seed-events.ts` that:
1. Reads the CSV
2. Parses each row
3. Upserts into Supabase events table using the existing client setup
4. Logs success/failure per row

Use the existing Supabase client from the project (check `/lib/supabase.ts` or similar).

After import, verify with:
```sql
SELECT COUNT(*) FROM events;
SELECT event_name, start_date, country FROM events ORDER BY start_date LIMIT 10;
```

Expected result: 50 rows, first upcoming event should be HYROX Brisbane (already completed) or HYROX Sydney in July 2026.

---

## TASK 3 — HOMEPAGE: REMOVE FAKE STATS

Find the homepage component (likely `/app/page.tsx` or `/components/Hero.tsx`).

Remove or replace these three fake stats:
- "500+ upcoming events" → Remove entirely OR replace with "Growing fast"
- "12 countries" → Remove entirely  
- "10,000+ athletes" → Remove entirely

If the stats section is a nice design element worth keeping, replace with honest copy:
- "APAC's most complete race calendar"
- "Updated weekly"
- "Free forever"

Do NOT invent new numbers.

---

## TASK 4 — HOMEPAGE: UPDATE FEATURED EVENTS

The homepage currently shows 6 hardcoded placeholder events. Replace these with a dynamic query that pulls the next 6 upcoming events from Supabase, ordered by start_date ascending, where start_date >= today.

In the featured events section, update the data fetch to:
```typescript
const { data: featuredEvents } = await supabase
  .from('events')
  .select('*')
  .gte('start_date', new Date().toISOString())
  .order('start_date', { ascending: true })
  .limit(6)
```

This ensures the homepage always shows real upcoming events and never shows stale/past ones.

---

## TASK 5 — FOOTER: REMOVE PREMATURE NAV LINKS

Find the footer component (likely `/components/Footer.tsx`).

Remove these three links from the footer nav:
- Log in
- Sign up  
- Dashboard

These signal an unfinished product to visitors. They can be added back when the auth flow is production-ready.

---

## TASK 6 — SOCIAL LINKS: FIX PLACEHOLDERS

In the footer (or wherever social links appear), the current links point to:
- https://instagram.com (generic)
- https://strava.com (generic)
- https://youtube.com (generic)

**Option A** — If Matt has confirmed social accounts: update to the real RaceRadarHQ URLs.

**Option B** — If accounts don't exist yet: remove the social link icons entirely rather than showing broken/generic links. A missing icon is less damaging than a link that goes nowhere useful.

Ask Matt before proceeding with Option A. Default to Option B if unclear.

---

## TASK 7 — EVENTS PAGE: VERIFY FILTER WORKS

After the import, navigate to `/events` and confirm:
1. Events load from Supabase (not hardcoded)
2. Sport filter works (HYROX, Spartan, Ironman, etc.)
3. Country filter works (Australia, Japan, Singapore, etc.)
4. No events with past dates appear by default

If filters are hardcoded/broken, fix the query to pull from Supabase dynamically.

---

## TASK 8 — EMAIL CAPTURE: VERIFY BEEHIIV INTEGRATION

Find the email capture form component (likely on homepage and `/calendar` page).

Check if the form submission actually calls the Beehiiv API or just fires a fake success state.

Look for:
- A Beehiiv API key in `.env.local` (should be `BEEHIIV_API_KEY` or similar)
- A POST to `https://api.beehiiv.com/v2/publications/{pub_id}/subscriptions`

If the integration is missing or broken:
1. Check `.env.local` for existing Beehiiv keys
2. If keys exist, wire up the form to POST to Beehiiv
3. If keys don't exist, add a TODO comment and flag to Matt that Beehiiv needs to be connected

Do not leave the form showing a success state when no email is actually captured.

---

## NOTES ON THE CSV DATA

**Verified from official sources:**
- HYROX: All dates from hyrox.com/find-my-race (official)
- Spartan Australia: All dates from au.spartan.com (official)
- Ironman Australia/NZ: Dates from trimotivate.com.au and triathlete.com (cross-verified)
- Marathons: Official race websites
- Trail Running: UTMB World Series official site (utmb.world)

**Flagged as TBC (date not yet confirmed):**
- HYROX Melbourne — listed on hyrox.com but date not announced
- Several Ironman Asia events (Vietnam, Philippines)
- Chiang Mai UTMB
- Spartan Thailand

**Status field values:**
- `upcoming` — confirmed date, registration open or opening soon
- `completed` — event has passed (included for historical record, filter out on frontend)
- `date_tbc` — event confirmed but date not yet announced

**Quarterly update recommended:** Check hyrox.com, au.spartan.com, and ironman.com each quarter to add new events and update TBC dates.

---

## PRIORITY ORDER

Run tasks in this order:
1. Task 3 (remove fake stats) — highest trust risk, fix first
2. Task 4 (real events on homepage) — second priority
3. Task 2 (import CSV to Supabase) — required for Task 4 to work
4. Task 5 (remove login/signup/dashboard from footer)
5. Task 6 (social links)
6. Task 7 (verify events filter)
7. Task 8 (Beehiiv — flag if broken, don't block on this)

---

## AFTER COMPLETING ALL TASKS

Run through the site manually:
- Homepage: no fake stats, real upcoming events showing, email form present
- Events page: filter works, real events load, no past events showing
- Footer: no login/signup/dashboard links, social icons either real or removed
- All pages load without errors in console

Deploy to Vercel when complete.
