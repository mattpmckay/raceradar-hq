-- ============================================================
-- Sprint 24: Event Intelligence Platform — Import Infrastructure
--
-- The four tables that power the Event Intelligence Engine:
--
--   import_sources    — catalog of trusted data sources we monitor
--   import_batches    — groups of related imports (one per scrape/CSV/session)
--   import_queue      — staged records awaiting admin review before going live
--   event_change_log  — immutable audit trail of every field change on every event
--
-- Design principles:
--   • Every piece of data is traceable to a source
--   • No change goes live without a human review step (Phase 1)
--   • Change log is append-only — enables full version history and rollback
--   • Schema scales to 100,000+ events and automated pipeline (Phase 2+)
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── import_sources ───────────────────────────────────────────────────────────
-- Catalog of trusted sources the intelligence engine monitors.
-- Each row is a website, national body, or API endpoint.

CREATE TABLE IF NOT EXISTS public.import_sources (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 text        NOT NULL,
  source_type          text        NOT NULL CHECK (source_type IN (
                                     'official_website',    -- e.g. sydneymarathon.com
                                     'national_body',       -- e.g. Athletics Australia
                                     'state_body',          -- e.g. Athletics NSW
                                     'trusted_aggregator',  -- e.g. Active, Eventbrite
                                     'organiser_direct'     -- direct organiser contact
                                   )),
  url                  text,
  organiser            text,
  discipline           text,
  country              text        NOT NULL DEFAULT 'Australia',
  check_interval_days  integer     NOT NULL DEFAULT 30,
  is_active            boolean     NOT NULL DEFAULT true,
  last_checked_at      timestamptz,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.import_sources IS
  'Catalog of trusted data sources the intelligence engine monitors for event data.';

-- ─── import_batches ───────────────────────────────────────────────────────────
-- A batch groups related import items from a single session.
-- Enables batch-level rollback and provenance ("where did this group come from?").

CREATE TABLE IF NOT EXISTS public.import_batches (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id      uuid        REFERENCES public.import_sources (id) ON DELETE SET NULL,
  import_type    text        NOT NULL CHECK (import_type IN (
                               'manual',   -- admin entered via import queue form
                               'scrape',   -- automated web scrape (Phase 2+)
                               'api',      -- pulled from third-party API (Phase 2+)
                               'csv'       -- bulk CSV upload (Phase 2+)
                             )),
  status         text        NOT NULL DEFAULT 'pending' CHECK (status IN (
                               'pending', 'processing', 'completed', 'failed'
                             )),
  total_records  integer     NOT NULL DEFAULT 0,
  imported       integer     NOT NULL DEFAULT 0,
  skipped        integer     NOT NULL DEFAULT 0,
  errors         integer     NOT NULL DEFAULT 0,
  imported_by    uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  notes          text,
  started_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.import_batches IS
  'Groups related import items from a single session. One batch per scrape, CSV, or manual session.';

-- ─── import_queue ─────────────────────────────────────────────────────────────
-- Staging table: every imported event record waits here for admin review.
-- Admin approves → event created or updated. Admin rejects → nothing changes.
-- This is the core of the Event Intelligence review workflow.

CREATE TABLE IF NOT EXISTS public.import_queue (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id          uuid        REFERENCES public.import_batches (id) ON DELETE SET NULL,
  matched_event_id  uuid        REFERENCES public.events (id) ON DELETE SET NULL,
  action            text        NOT NULL CHECK (action IN (
                                  'create',  -- new event not yet in the database
                                  'update',  -- existing event with proposed changes
                                  'skip'     -- duplicate / no changes detected
                                )),
  status            text        NOT NULL DEFAULT 'pending' CHECK (status IN (
                                  'pending',   -- awaiting admin review
                                  'approved',  -- admin approved; being applied
                                  'rejected',  -- admin rejected
                                  'applied'    -- successfully written to events table
                                )),
  payload           jsonb       NOT NULL,
  diff              jsonb,
  source_url        text,
  confidence        smallint    CHECK (confidence BETWEEN 1 AND 5),
  reviewer_id       uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  reviewer_notes    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.import_queue IS
  'Staging table for imported event data. Every record requires admin approval before going live.';

COMMENT ON COLUMN public.import_queue.payload IS
  'Complete proposed event data as a JSON object matching the events table shape.';

COMMENT ON COLUMN public.import_queue.diff IS
  'For update actions: map of {field_name: {old: value, new: value}} showing what changed.';

-- ─── event_change_log ─────────────────────────────────────────────────────────
-- Immutable, append-only audit trail of every field change on every event.
-- One row per field per change — enables full version history.
-- Never update or delete rows in this table.

CREATE TABLE IF NOT EXISTS public.event_change_log (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id         uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  changed_by       uuid        REFERENCES auth.users (id) ON DELETE SET NULL,
  change_source    text        NOT NULL CHECK (change_source IN (
                                 'admin_manual',   -- admin edited directly in EventForm
                                 'import_queue',   -- change applied from approved queue item
                                 'automated'       -- future: automated pipeline
                               )),
  import_queue_id  uuid        REFERENCES public.import_queue (id) ON DELETE SET NULL,
  field_name       text        NOT NULL,
  old_value        text,
  new_value        text,
  source_url       text,
  confidence       smallint    CHECK (confidence BETWEEN 1 AND 5),
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_change_log IS
  'Immutable audit trail. One row per field per change. Never update or delete rows.';

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.import_sources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_queue     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_change_log ENABLE ROW LEVEL SECURITY;

-- import_sources: public can read active sources; admins manage all
CREATE POLICY "Public read active import sources"
  ON public.import_sources FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage import sources"
  ON public.import_sources FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- import_batches: admin only
CREATE POLICY "Admins manage import batches"
  ON public.import_batches FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- import_queue: admin only
CREATE POLICY "Admins manage import queue"
  ON public.import_queue FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- event_change_log: admins read; system inserts via service-role
CREATE POLICY "Admins read change log"
  ON public.event_change_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role inserts change log"
  ON public.event_change_log FOR INSERT WITH CHECK (true);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Pipeline index: find pending queue items fast
CREATE INDEX IF NOT EXISTS import_queue_pending_idx
  ON public.import_queue (created_at DESC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS import_queue_batch_idx
  ON public.import_queue (batch_id);

CREATE INDEX IF NOT EXISTS import_queue_matched_event_idx
  ON public.import_queue (matched_event_id)
  WHERE matched_event_id IS NOT NULL;

-- Change log: look up history for a specific event efficiently
CREATE INDEX IF NOT EXISTS event_change_log_event_idx
  ON public.event_change_log (event_id, created_at DESC);

CREATE INDEX IF NOT EXISTS event_change_log_field_idx
  ON public.event_change_log (event_id, field_name, created_at DESC);

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('import_sources', 'import_batches', 'import_queue', 'event_change_log');
