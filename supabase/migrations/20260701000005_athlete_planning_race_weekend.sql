-- ============================================================
-- Sprint 23: Event Intelligence Platform — Athlete Planning & Race Weekend
--
-- Adds the practical athlete-facing fields missing from events:
--
--   Athlete Planning:  elevation, surface, team/relay/adaptive flags
--   Race Weekend:      athlete guide, course map, GPX, results
--   Registration gaps: waitlist close date, next price increase
--
-- Every field answers the question: "Will this make RaceRadarHQ
-- more valuable for an athlete planning their season?"
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.events

  -- ── Athlete planning ─────────────────────────────────────────────────────────

  -- Total ascent in metres — critical for trail runners, triathletes, and hikers
  -- deciding on shoe choice and pacing strategy.
  ADD COLUMN IF NOT EXISTS elevation_gain_m        integer,

  -- Primary surface type — helps athletes choose footwear and predict mud/weather impact.
  ADD COLUMN IF NOT EXISTS surface_type            text CHECK (surface_type IN (
                                                     'road', 'trail', 'track', 'mixed', 'indoor', 'water', 'other'
                                                   )),

  -- Team / relay / adaptive participation flags.
  -- NULL = unknown, TRUE = available, FALSE = explicitly not offered.
  ADD COLUMN IF NOT EXISTS relay_available         boolean,
  ADD COLUMN IF NOT EXISTS team_available          boolean,
  ADD COLUMN IF NOT EXISTS wheelchair_available    boolean,
  ADD COLUMN IF NOT EXISTS adaptive_available      boolean,

  -- ── Race weekend essentials ───────────────────────────────────────────────────

  -- The three most-searched documents on any event website.
  -- Providing these saves athletes 10–15 minutes of hunting.
  ADD COLUMN IF NOT EXISTS athlete_guide_url       text,  -- official athlete information guide PDF/page
  ADD COLUMN IF NOT EXISTS course_map_url          text,  -- course map image or PDF
  ADD COLUMN IF NOT EXISTS gpx_file_url            text,  -- GPX/KML file for GPS devices

  -- Results link — allows athletes to look up past finishers and predict finish times.
  ADD COLUMN IF NOT EXISTS results_url             text,

  -- Event history — adds credibility and context ("First held in 2003")
  ADD COLUMN IF NOT EXISTS first_year_held         smallint,

  -- ── Registration intelligence gap-fills ──────────────────────────────────────

  -- Waitlist close date — allows Upcoming Actions to fire "waitlist closes in X days"
  ADD COLUMN IF NOT EXISTS waitlist_closes_date    date,

  -- Upcoming price change — powers "Price goes up in X days. Save $40 now." alert.
  -- This is one of the highest-engagement triggers in endurance event marketing.
  ADD COLUMN IF NOT EXISTS next_price_increase_date date;

-- Index for surface-filtered queries (future: "trail events near me")
CREATE INDEX IF NOT EXISTS events_surface_type_idx
  ON public.events (surface_type)
  WHERE surface_type IS NOT NULL;

-- ─── Verify ──────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
--   AND column_name IN (
--     'elevation_gain_m', 'surface_type',
--     'relay_available', 'team_available',
--     'wheelchair_available', 'adaptive_available',
--     'athlete_guide_url', 'course_map_url', 'gpx_file_url',
--     'results_url', 'first_year_held',
--     'waitlist_closes_date', 'next_price_increase_date'
--   )
-- ORDER BY column_name;
