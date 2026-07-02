-- Sprint 30 (fix): Map 'Spartan Race' → obstacle-race canonical discipline
-- 'Spartan Race' was not in disciplines.event_discipline_values, leaving
-- 8 seeded events with canonical_discipline_slug = NULL.
--
-- Both statements are idempotent (array_append is a no-op if already present;
-- UPDATE WHERE skips rows already set to 'obstacle-race').

-- 1. Add 'Spartan Race' to the obstacle-race event_discipline_values array
UPDATE public.disciplines
SET    event_discipline_values = array_append(event_discipline_values, 'Spartan Race')
WHERE  slug = 'obstacle-race'
  AND  NOT ('Spartan Race' = ANY(event_discipline_values));

-- 2. Backfill the 8 affected events
UPDATE public.events
SET    canonical_discipline_slug = 'obstacle-race'
WHERE  discipline = 'Spartan Race'
  AND  canonical_discipline_slug IS NULL;

-- Verification (run manually in SQL Editor after applying):
--
-- SELECT canonical_discipline_slug, COUNT(*) AS event_count
-- FROM events
-- GROUP BY canonical_discipline_slug
-- ORDER BY event_count DESC;
--
-- Expected: zero rows where canonical_discipline_slug IS NULL.
