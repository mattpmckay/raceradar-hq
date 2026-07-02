-- ═══════════════════════════════════════════════════════════════════════════════
-- Sprint 30: Passport & Challenge System Schema
-- RaceRadarHQ Blueprint v1 — Master Implementation
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Tables created in this migration:
--   1. canonical_discipline_slug column on events (normalization fix)
--   2. open-water-swimming discipline entry (required for backfill)
--   3. challenges
--   4. challenge_titles
--   5. challenge_requirements  (+ trigger: maintain events_required_total)
--   6. completion_claims
--   7. athlete_challenge_progress
--   8. result_feeds (future-ready; no UI until Phase 4)
--   9. passport columns on profiles
--  10. Indexes
--  11. RLS policies
--  12. compute_athlete_challenge_progress() function
--  13. trigger_recompute_progress() function + trigger
--
-- Philosophy note (from product brief):
--   The goal is helping athletes discover new EVENT TYPES, not new sports.
--   challenge_requirements.discipline maps to the canonical discipline slug
--   (e.g. 'marathon', 'hyrox', 'trail-running') which represents an event type,
--   not a sport taxonomy. One athlete may hold completions across many event types.
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── 0. Normalise event disciplines ──────────────────────────────────────────
-- Architectural fix: events.discipline is free-text with inconsistent casing
-- ('Marathon', 'marathon', 'HYROX', 'Ironman', 'Road Running', etc.).
-- Add canonical_discipline_slug to give every event a reliable FK to the
-- disciplines table, which the challenge matching engine uses exclusively.
-- The original events.discipline column is untouched.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS canonical_discipline_slug text
    REFERENCES public.disciplines(slug) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_canonical_discipline_idx
  ON public.events (canonical_discipline_slug)
  WHERE canonical_discipline_slug IS NOT NULL;

-- Add open-water-swimming discipline (used in seeded events; missing from taxonomy)
INSERT INTO public.disciplines
  (slug, name, short_description, event_discipline_values, color, icon_name,
   order_index, related_discipline_slugs, faqs)
VALUES (
  'open-water-swimming',
  'Open Water Swimming',
  'Ocean, lake and river swims — from iconic one-kilometre ocean dashes to long-distance crossings.',
  ARRAY['Open Water Swimming', 'Open Water', 'Ocean Swim', 'Ocean Swimming'],
  '#38BDF8', 'Waves', 75,
  ARRAY['triathlon'],
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Backfill canonical_discipline_slug for all existing events.
-- Matches case-insensitively against disciplines.event_discipline_values[].
UPDATE public.events e
SET    canonical_discipline_slug = d.slug
FROM   public.disciplines d
WHERE  EXISTS (
         SELECT 1
         FROM   unnest(d.event_discipline_values) AS ev
         WHERE  LOWER(ev) = LOWER(e.discipline)
       )
  AND  e.canonical_discipline_slug IS NULL;


-- ─── 1. challenges ────────────────────────────────────────────────────────────
-- Master definition of every Series, Pursuit and Collection.
-- family:  'series'     — depth within a single event type
--          'pursuit'    — breadth across multiple event types
--          'collection' — geographic, iconic or milestone achievements
-- tier:    'starter' → 'achiever' → 'explorer' → 'legend'

CREATE TABLE IF NOT EXISTS public.challenges (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  text        UNIQUE NOT NULL,
  name                  text        NOT NULL,
  tagline               text,                        -- one-line summary for cards
  description           text,                        -- full editorial copy
  family                text        NOT NULL
    CHECK (family IN ('series', 'pursuit', 'collection')),
  tier                  text        NOT NULL
    CHECK (tier IN ('starter', 'achiever', 'explorer', 'legend')),

  -- Series-specific: the primary event type for this series challenge
  primary_discipline_slug text
    REFERENCES public.disciplines(slug) ON DELETE SET NULL,

  -- Collection-specific: geographic scope
  geographic_scope      text
    CHECK (geographic_scope IN ('australia', 'nz', 'global')),

  -- Seasonal / limited-edition variants
  is_seasonal           boolean     NOT NULL DEFAULT false,
  season_year           integer,               -- NULL = permanent; 2026 = annual variant

  -- Retired challenges stay on Passports but stop accepting new completions
  is_retired            boolean     NOT NULL DEFAULT false,
  retired_at            date,

  -- Denormalised total (maintained by trigger on challenge_requirements)
  events_required_total integer     NOT NULL DEFAULT 0,

  -- Assets
  badge_image_url       text,                  -- earned badge graphic (SVG/PNG)
  hero_image_url        text,                  -- challenge detail page hero

  -- Display
  sort_order            integer     NOT NULL DEFAULT 0,
  is_published          boolean     NOT NULL DEFAULT false,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS challenges_family_tier_idx
  ON public.challenges (family, tier)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS challenges_discipline_idx
  ON public.challenges (primary_discipline_slug)
  WHERE primary_discipline_slug IS NOT NULL;

CREATE TRIGGER set_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 2. challenge_titles ──────────────────────────────────────────────────────
-- The earned identity label granted when a challenge is completed.
-- Not all challenges have a named title (Starter tier may grant badge only).

CREATE TABLE IF NOT EXISTS public.challenge_titles (
  id          uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id uuid NOT NULL
    REFERENCES public.challenges(id) ON DELETE CASCADE,
  title       text  NOT NULL,      -- e.g. "Hybrid Athlete", "Endurance Explorer"
  description text,                -- displayed beneath the title on the Passport
  UNIQUE (challenge_id)            -- one title per challenge
);

ALTER TABLE public.challenge_titles ENABLE ROW LEVEL SECURITY;


-- ─── 3. challenge_requirements ────────────────────────────────────────────────
-- Defines what an athlete must do to satisfy a challenge.
-- All requirements within a challenge are AND conditions.
--
-- requirement_type:
--   'specific_event' — a named event (event_id must be set)
--   'discipline'     — any event of this type (discipline must be a canonical slug)
--   'geographic'     — any event in this country/region
--   'any_event'      — any verified event at all
--
-- min_count: how many qualifying events are needed for this requirement.
-- A single challenge can have multiple requirements each with min_count > 1.

CREATE TABLE IF NOT EXISTS public.challenge_requirements (
  id               uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id     uuid  NOT NULL
    REFERENCES public.challenges(id) ON DELETE CASCADE,
  requirement_type text  NOT NULL
    CHECK (requirement_type IN ('specific_event', 'discipline', 'geographic', 'any_event')),

  -- Populated per type (all nullable; validated at application layer)
  event_id         uuid  REFERENCES public.events(id) ON DELETE CASCADE,
  discipline       text  REFERENCES public.disciplines(slug) ON DELETE RESTRICT,
  country          text,
  region           text,

  min_count        integer NOT NULL DEFAULT 1 CHECK (min_count >= 1),
  display_label    text    NOT NULL,  -- "Any marathon", "Sydney Marathon 2026"
  sort_order       integer NOT NULL DEFAULT 0
);

ALTER TABLE public.challenge_requirements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS challenge_requirements_challenge_id_idx
  ON public.challenge_requirements (challenge_id);

CREATE INDEX IF NOT EXISTS challenge_requirements_type_discipline_idx
  ON public.challenge_requirements (requirement_type, discipline)
  WHERE discipline IS NOT NULL;

CREATE INDEX IF NOT EXISTS challenge_requirements_event_id_idx
  ON public.challenge_requirements (event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS challenge_requirements_geographic_idx
  ON public.challenge_requirements (country, region)
  WHERE requirement_type = 'geographic';


-- Trigger: keep challenges.events_required_total in sync with requirements
CREATE OR REPLACE FUNCTION public.sync_events_required_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge_id uuid;
BEGIN
  v_challenge_id := COALESCE(NEW.challenge_id, OLD.challenge_id);

  UPDATE challenges
  SET    events_required_total = (
           SELECT COALESCE(SUM(min_count), 0)
           FROM   challenge_requirements
           WHERE  challenge_id = v_challenge_id
         )
  WHERE  id = v_challenge_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER maintain_events_required_total
  AFTER INSERT OR UPDATE OF min_count OR DELETE
  ON public.challenge_requirements
  FOR EACH ROW
EXECUTE FUNCTION public.sync_events_required_total();


-- ─── 4. completion_claims ─────────────────────────────────────────────────────
-- Single source of truth for all athlete completions — claimed, result-feed-
-- imported, and admin-imported.
-- When status = 'approved', this record IS a verified completion.
-- Progress recomputation is triggered automatically via trigger below.
--
-- source:
--   'athlete_claim'  — submitted by the athlete via the UI
--   'result_feed'    — auto-imported from an organiser result file
--   'admin_import'   — manually entered by an admin
--
-- status lifecycle:
--   athlete_claim:  pending → under_review → approved | rejected → appealing → approved | rejected
--   result_feed:    auto_approved (bypasses review queue)
--   admin_import:   approved (bypasses review queue)

CREATE TABLE IF NOT EXISTS public.completion_claims (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id         uuid        NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,

  -- The specific date completed (events span multiple days; athlete selects)
  event_date       date        NOT NULL,

  source           text        NOT NULL DEFAULT 'athlete_claim'
    CHECK (source IN ('athlete_claim', 'result_feed', 'admin_import')),
  status           text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'appealing', 'auto_approved')),

  -- Evidence (athlete_claim source)
  evidence_type    text
    CHECK (evidence_type IN ('photo', 'results_url', 'bib_photo', 'medal_photo')),
  evidence_url     text,       -- uploaded file URL or results page URL
  evidence_notes   text,       -- athlete-supplied context

  -- Official result data (populated from result feeds or results URLs)
  finish_time      interval,
  bib_number       text,
  official_position integer,   -- overall finish position

  -- Admin review
  reviewed_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at      timestamptz,
  review_notes     text,       -- visible to athlete on rejection or approval
  rejection_reason text
    CHECK (rejection_reason IN (
      'insufficient_evidence', 'evidence_mismatch', 'duplicate',
      'event_not_in_database', 'other'
    )),

  -- Appeal
  appeal_submitted_at timestamptz,
  appeal_notes     text,

  -- Result feed linkage
  result_feed_id   uuid,       -- FK added when result_feeds table is ready (Phase 4)

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- One claim per athlete per event (enforced; duplicates rejected at application layer)
  UNIQUE (athlete_id, event_id)
);

ALTER TABLE public.completion_claims ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS completion_claims_athlete_id_status_idx
  ON public.completion_claims (athlete_id, status);

CREATE INDEX IF NOT EXISTS completion_claims_event_id_status_idx
  ON public.completion_claims (event_id, status);

CREATE INDEX IF NOT EXISTS completion_claims_status_created_idx
  ON public.completion_claims (status, created_at)
  WHERE status IN ('pending', 'under_review', 'appealing');

CREATE TRIGGER set_completion_claims_updated_at
  BEFORE UPDATE ON public.completion_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 5. athlete_challenge_progress ───────────────────────────────────────────
-- Materialised progress cache. Never written directly — managed exclusively by
-- compute_athlete_challenge_progress() called from the trigger below.
-- Recomputed whenever a completion_claim status changes to or from 'approved'.

CREATE TABLE IF NOT EXISTS public.athlete_challenge_progress (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id        uuid        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,

  -- Per-requirement breakdown (jsonb array, one object per requirement)
  -- [{requirement_id, display_label, needed, met, satisfied}]
  requirements_met    jsonb       NOT NULL DEFAULT '[]'::jsonb,

  events_contributed  integer     NOT NULL DEFAULT 0,
  events_required     integer     NOT NULL DEFAULT 0,
  completion_pct      numeric(5,2) NOT NULL DEFAULT 0
    CHECK (completion_pct BETWEEN 0 AND 100),

  is_complete         boolean     NOT NULL DEFAULT false,
  completed_at        timestamptz,         -- set once, never cleared

  -- Set when is_complete = true and the challenge has a title
  earned_title_id     uuid        REFERENCES public.challenge_titles(id) ON DELETE SET NULL,

  last_computed_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (athlete_id, challenge_id)
);

ALTER TABLE public.athlete_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Critical indexes for the Almost There mechanic and Passport dashboard
CREATE INDEX IF NOT EXISTS acp_athlete_complete_idx
  ON public.athlete_challenge_progress (athlete_id, is_complete, completion_pct DESC);

CREATE INDEX IF NOT EXISTS acp_challenge_complete_idx
  ON public.athlete_challenge_progress (challenge_id, is_complete)
  WHERE is_complete = true;

CREATE INDEX IF NOT EXISTS acp_almost_there_idx
  ON public.athlete_challenge_progress (athlete_id, completion_pct DESC)
  WHERE is_complete = false AND completion_pct > 0;


-- ─── 6. result_feeds (future-ready) ──────────────────────────────────────────
-- Defines the schema for organiser result file imports.
-- No UI or API routes until Phase 4. Defined now so future migrations
-- can add FKs from completion_claims.result_feed_id without schema changes.

CREATE TABLE IF NOT EXISTS public.result_feeds (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id             uuid        NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,

  -- Future: references an organiser profile when organiser portal ships
  submitted_by_admin_id uuid       REFERENCES auth.users(id) ON DELETE SET NULL,

  file_url             text,       -- URL of uploaded CSV in Supabase Storage
  status               text        NOT NULL DEFAULT 'pending_import'
    CHECK (status IN ('pending_import', 'processing', 'imported', 'failed')),

  -- Post-import stats
  records_total        integer,
  records_matched      integer,    -- matched to existing RaceRadar athlete profiles
  records_auto_approved integer,
  records_unmatched    integer,    -- athletes not yet on RaceRadar

  error_log            jsonb,
  imported_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.result_feeds ENABLE ROW LEVEL SECURITY;


-- ─── 7. Passport columns on profiles ─────────────────────────────────────────
-- Extends the existing profiles table with Passport-specific settings.
-- profiles.username already exists (from initial schema) — reused as
-- the public Passport URL slug at /athletes/[username].

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS passport_is_public     boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS passport_bio           text,
  ADD COLUMN IF NOT EXISTS passport_location      text,        -- display: "Sydney, NSW"
  ADD COLUMN IF NOT EXISTS show_finish_times      boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_active_challenges boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS primary_title_id       uuid
    REFERENCES public.challenge_titles(id) ON DELETE SET NULL;

-- Index for public Passport discovery and social sharing
CREATE INDEX IF NOT EXISTS profiles_passport_public_idx
  ON public.profiles (username)
  WHERE passport_is_public = true AND username IS NOT NULL;


-- ─── 8. RLS policies ─────────────────────────────────────────────────────────

-- challenges: published challenges are publicly readable; admin full access
CREATE POLICY "Published challenges are publicly readable"
  ON public.challenges FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- challenge_titles: always public (display on Passport)
CREATE POLICY "Challenge titles are publicly readable"
  ON public.challenge_titles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenge titles"
  ON public.challenge_titles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- challenge_requirements: public read (athletes browse what's needed)
CREATE POLICY "Challenge requirements are publicly readable"
  ON public.challenge_requirements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenge requirements"
  ON public.challenge_requirements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- completion_claims: athletes manage their own; admins manage all
CREATE POLICY "Athletes can view their own claims"
  ON public.completion_claims FOR SELECT
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can submit claims"
  ON public.completion_claims FOR INSERT
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can withdraw pending claims"
  ON public.completion_claims FOR DELETE
  USING (auth.uid() = athlete_id AND status = 'pending');

CREATE POLICY "Admins can manage all claims"
  ON public.completion_claims FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- athlete_challenge_progress: athletes read their own; no direct writes (trigger-only)
CREATE POLICY "Athletes can view their own progress"
  ON public.athlete_challenge_progress FOR SELECT
  USING (auth.uid() = athlete_id);

CREATE POLICY "Admins can view all progress"
  ON public.athlete_challenge_progress FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- result_feeds: admin only
CREATE POLICY "Admins can manage result feeds"
  ON public.result_feeds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── 9. Progress computation function ────────────────────────────────────────
-- Recomputes athlete_challenge_progress for one athlete + one challenge.
-- Called from the trigger below. SECURITY DEFINER so it can write progress
-- rows regardless of the calling user's RLS context.
--
-- Performance contract: must run in < 10ms with proper indexes.
-- All queries in the function use indexed columns only.

CREATE OR REPLACE FUNCTION public.compute_athlete_challenge_progress(
  p_athlete_id  uuid,
  p_challenge_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req               RECORD;
  v_req_met_count     integer;
  v_total_needed      integer  := 0;
  v_total_contributed integer  := 0;
  v_all_met           boolean  := true;
  v_req_json          jsonb    := '[]'::jsonb;
  v_title_id          uuid;
  v_existing_completed_at timestamptz;
BEGIN
  -- Process each requirement for this challenge in display order
  FOR v_req IN
    SELECT * FROM challenge_requirements
    WHERE  challenge_id = p_challenge_id
    ORDER  BY sort_order
  LOOP
    v_total_needed := v_total_needed + v_req.min_count;

    SELECT COUNT(*)
    INTO   v_req_met_count
    FROM   completion_claims cc
    JOIN   events e ON e.id = cc.event_id
    WHERE  cc.athlete_id = p_athlete_id
      AND  cc.status IN ('approved', 'auto_approved')
      AND  CASE v_req.requirement_type
             WHEN 'specific_event' THEN
               cc.event_id = v_req.event_id
             WHEN 'discipline' THEN
               -- Canonical slug takes priority; fall back to raw discipline match
               e.canonical_discipline_slug = v_req.discipline
               OR LOWER(e.discipline) = LOWER(v_req.discipline)
             WHEN 'geographic' THEN
               (v_req.country IS NULL OR LOWER(e.country) = LOWER(v_req.country))
               AND (v_req.region IS NULL OR LOWER(e.region) = LOWER(v_req.region))
             WHEN 'any_event' THEN
               true
             ELSE false
           END;

    -- Cap at the requirement ceiling
    v_req_met_count     := LEAST(v_req_met_count, v_req.min_count);
    v_total_contributed := v_total_contributed + v_req_met_count;

    IF v_req_met_count < v_req.min_count THEN
      v_all_met := false;
    END IF;

    v_req_json := v_req_json || jsonb_build_object(
      'requirement_id', v_req.id,
      'display_label',  v_req.display_label,
      'needed',         v_req.min_count,
      'met',            v_req_met_count,
      'satisfied',      (v_req_met_count >= v_req.min_count)
    );
  END LOOP;

  -- Nothing to track if this challenge has no requirements yet
  IF v_total_needed = 0 THEN RETURN; END IF;

  -- Preserve the original completed_at timestamp (never overwrite once set)
  SELECT completed_at INTO v_existing_completed_at
  FROM   athlete_challenge_progress
  WHERE  athlete_id = p_athlete_id AND challenge_id = p_challenge_id;

  -- Look up earned title (if challenge is complete and has one)
  IF v_all_met THEN
    SELECT id INTO v_title_id
    FROM   challenge_titles
    WHERE  challenge_id = p_challenge_id
    LIMIT  1;
  END IF;

  INSERT INTO athlete_challenge_progress (
    athlete_id, challenge_id,
    requirements_met, events_contributed, events_required,
    completion_pct, is_complete, completed_at, earned_title_id,
    last_computed_at
  )
  VALUES (
    p_athlete_id, p_challenge_id,
    v_req_json, v_total_contributed, v_total_needed,
    ROUND((v_total_contributed::numeric / v_total_needed::numeric) * 100, 2),
    v_all_met,
    CASE WHEN v_all_met
         THEN COALESCE(v_existing_completed_at, now())
         ELSE NULL END,
    CASE WHEN v_all_met THEN v_title_id ELSE NULL END,
    now()
  )
  ON CONFLICT (athlete_id, challenge_id) DO UPDATE SET
    requirements_met    = EXCLUDED.requirements_met,
    events_contributed  = EXCLUDED.events_contributed,
    events_required     = EXCLUDED.events_required,
    completion_pct      = EXCLUDED.completion_pct,
    is_complete         = EXCLUDED.is_complete,
    completed_at        = CASE
                            -- Set once on first completion; never cleared
                            WHEN EXCLUDED.is_complete
                             AND athlete_challenge_progress.completed_at IS NULL
                            THEN now()
                            WHEN EXCLUDED.is_complete
                            THEN athlete_challenge_progress.completed_at
                            ELSE NULL
                          END,
    earned_title_id     = EXCLUDED.earned_title_id,
    last_computed_at    = now();
END;
$$;


-- ─── 10. Progress recomputation trigger ──────────────────────────────────────
-- Fires after INSERT or status UPDATE on completion_claims.
-- Finds every published challenge whose requirements include this event,
-- then calls compute_athlete_challenge_progress for each one.
--
-- Exits early unless the claim just became approved or was un-approved.

CREATE OR REPLACE FUNCTION public.trigger_recompute_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event    public.events%ROWTYPE;
  v_chal_id  uuid;
  v_new_approved boolean;
  v_old_approved boolean;
BEGIN
  v_new_approved := NEW.status IN ('approved', 'auto_approved');
  v_old_approved := (TG_OP = 'UPDATE') AND (OLD.status IN ('approved', 'auto_approved'));

  -- Exit if the approval state didn't change
  IF v_new_approved = v_old_approved THEN RETURN NEW; END IF;

  -- Load event for requirement matching
  SELECT * INTO v_event FROM public.events WHERE id = NEW.event_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Find every published challenge where this event satisfies at least one requirement
  FOR v_chal_id IN
    SELECT DISTINCT cr.challenge_id
    FROM   public.challenge_requirements cr
    JOIN   public.challenges c ON c.id = cr.challenge_id
    WHERE  c.is_published = true
      AND  (
             (cr.requirement_type = 'specific_event'
              AND cr.event_id = NEW.event_id)
          OR (cr.requirement_type = 'discipline'
              AND (   cr.discipline = v_event.canonical_discipline_slug
                   OR LOWER(cr.discipline) = LOWER(v_event.discipline)))
          OR (cr.requirement_type = 'geographic'
              AND (cr.country IS NULL OR LOWER(cr.country) = LOWER(v_event.country))
              AND (cr.region  IS NULL OR LOWER(cr.region)  = LOWER(v_event.region)))
          OR  cr.requirement_type = 'any_event'
           )
  LOOP
    PERFORM public.compute_athlete_challenge_progress(NEW.athlete_id, v_chal_id);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_completion_claim_status_change
  AFTER INSERT OR UPDATE OF status
  ON public.completion_claims
  FOR EACH ROW
EXECUTE FUNCTION public.trigger_recompute_progress();


-- ─── End of Sprint 30 migration ──────────────────────────────────────────────
-- Tables pending future sprints (defined here for reference):
--
--   completion_claims.result_feed_id → result_feeds(id)
--     Add FK in Phase 4 when result feed import pipeline ships.
--
--   Scaling note:
--     The trigger recomputes progress synchronously on each approval.
--     At launch scale (< 1,000 approvals/day) this is fine.
--     At > 10,000 approvals/day, move to an async queue:
--     trigger enqueues a job; background worker calls compute_athlete_challenge_progress().
--     The function signature and table schema require no changes to make this switch.
-- ─────────────────────────────────────────────────────────────────────────────
