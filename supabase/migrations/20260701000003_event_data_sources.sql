-- ============================================================
-- Sprint 23: Event Intelligence Platform — Data Provenance
--
-- Creates event_data_sources table to track where every piece
-- of event data came from, when it was verified, and how
-- confident we are in it.
--
-- Also adds data_verified_at and data_confidence directly on
-- events for quick-access without a JOIN (denormalised summary).
--
-- This table is the foundation of the Event Intelligence Pipeline:
-- the daily cron queries active sources where
-- last_checked_at < now() - (check_interval_days * interval '1 day')
-- and re-verifies them automatically.
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. event_data_sources ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.event_data_sources (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id             uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,

  -- Type of source — drives pipeline behaviour
  source_type          text        NOT NULL CHECK (source_type IN (
                                     'official_website', -- scraped from the organiser's own domain
                                     'organiser_email',  -- data confirmed by organiser directly
                                     'press_release',    -- official press release or media kit
                                     'manual',           -- manually entered by RaceRadar team
                                     'automated'         -- populated by the intelligence pipeline
                                   )),

  source_url           text,                           -- specific page URL where this data was found
  last_checked_at      timestamptz,                    -- when the pipeline last read this source
  last_changed_at      timestamptz,                    -- when the data at this source last changed
  check_interval_days  integer     NOT NULL DEFAULT 7, -- how often to re-verify (pipeline hint)

  -- 1 = uncertain (e.g. inferred from social media)
  -- 3 = likely accurate (consistent with other sources)
  -- 5 = verified directly from organiser
  confidence           smallint    CHECK (confidence BETWEEN 1 AND 5),

  is_active            boolean     NOT NULL DEFAULT true, -- false = source is dead or obsolete
  notes                text,                           -- internal notes for the data team
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage event data sources"
  ON public.event_data_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pipeline efficiency: fetch all active sources due for re-check
CREATE INDEX IF NOT EXISTS event_data_sources_event_id_idx
  ON public.event_data_sources (event_id);

CREATE INDEX IF NOT EXISTS event_data_sources_pipeline_idx
  ON public.event_data_sources (last_checked_at, check_interval_days, is_active)
  WHERE is_active = true;

CREATE TRIGGER set_event_data_sources_updated_at
  BEFORE UPDATE ON public.event_data_sources
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ─── 2. Provenance summary columns on events ─────────────────────────────────
-- Quick-access fields so event list queries don't need a JOIN.
-- Updated by the pipeline after each successful verification pass.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS data_verified_at  timestamptz,
  ADD COLUMN IF NOT EXISTS data_confidence   smallint CHECK (data_confidence BETWEEN 1 AND 5);

-- ─── Verify ──────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'event_data_sources';
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
--   AND column_name IN ('data_verified_at', 'data_confidence');
