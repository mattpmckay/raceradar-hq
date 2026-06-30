-- ============================================================
-- Sprint 17a: Event page schema
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. Extend the events table ───────────────────────────────────────────────

ALTER TABLE public.events

  -- Registration window (close date already exists as registration_deadline)
  ADD COLUMN IF NOT EXISTS registration_opens_date  date,

  -- Pricing
  ADD COLUMN IF NOT EXISTS entry_fee_from           numeric(10,2),
  ADD COLUMN IF NOT EXISTS entry_fee_to             numeric(10,2),
  ADD COLUMN IF NOT EXISTS entry_fee_currency       text NOT NULL DEFAULT 'AUD',

  -- Venue (city/country already exist; these add the specific location)
  ADD COLUMN IF NOT EXISTS venue_name               text,
  ADD COLUMN IF NOT EXISTS venue_address            text,
  ADD COLUMN IF NOT EXISTS latitude                 numeric(10,6),
  ADD COLUMN IF NOT EXISTS longitude                numeric(10,6),

  -- Media (image_url is the card thumbnail; hero_image_url is the full-width page banner)
  ADD COLUMN IF NOT EXISTS hero_image_url           text,

  -- Editorial
  ADD COLUMN IF NOT EXISTS difficulty               smallint CHECK (difficulty BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS format_notes             text,
  ADD COLUMN IF NOT EXISTS whats_included           text[],

  -- Logistics (manually curated; replaces the need to hunt across organiser sites)
  ADD COLUMN IF NOT EXISTS transport_notes          text,
  ADD COLUMN IF NOT EXISTS accommodation_notes      text,

  -- Series linking (groups recurring annual editions of the same event)
  ADD COLUMN IF NOT EXISTS series_slug              text;

-- Index for series edition lookups (e.g. "previous editions of HYROX Melbourne")
CREATE INDEX IF NOT EXISTS events_series_slug_idx ON public.events (series_slug)
  WHERE series_slug IS NOT NULL;

-- ─── 2. event_categories ──────────────────────────────────────────────────────
-- Multiple distance/format options per event with individual pricing and cutoffs.
-- Example: HYROX Standard / HYROX Doubles / HYROX Relay at the same event.

CREATE TABLE IF NOT EXISTS public.event_categories (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id         uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name             text        NOT NULL,           -- "HYROX Doubles"
  distance_label   text,                           -- "8×1km + 8 stations (team of 2)"
  entry_fee        numeric(10,2),                  -- per-person price for this category
  cutoff_minutes   integer,                        -- total race cutoff in minutes (null = no cutoff)
  max_participants integer,                        -- capacity (null = unlimited)
  is_sold_out      boolean     NOT NULL DEFAULT false,
  sort_order       integer     NOT NULL DEFAULT 0, -- display order within the event
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories for published events only
CREATE POLICY "Event categories for published events are publicly readable"
  ON public.event_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND is_published = true
    )
  );

-- Admins can manage all categories
CREATE POLICY "Admins can manage event categories"
  ON public.event_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS event_categories_event_id_idx
  ON public.event_categories (event_id);

-- ─── 3. event_reminders ───────────────────────────────────────────────────────
-- Powers "Notify me when registration opens" and pre-close reminders.
-- Supports both authenticated users (user_id) and anonymous visitors (email only).
-- A future cron/edge function checks this table daily and sends emails.

CREATE TABLE IF NOT EXISTS public.event_reminders (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id       uuid        REFERENCES auth.users (id) ON DELETE CASCADE,
  email         text,
  reminder_type text        NOT NULL CHECK (
                              reminder_type IN (
                                'registration_opens',   -- fire when registration opens
                                'registration_closing', -- fire N days before close
                                'race_week'             -- fire 7 days before start_date
                              )
                            ),
  is_sent       boolean     NOT NULL DEFAULT false,
  sent_at       timestamptz,                          -- populated when the reminder fires
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- At least one contact method must be present
  CONSTRAINT event_reminders_contact_check
    CHECK (user_id IS NOT NULL OR (email IS NOT NULL AND email <> ''))
);

ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Prevent duplicate anonymous subscriptions (partial index — nulls are allowed in unique)
CREATE UNIQUE INDEX IF NOT EXISTS event_reminders_email_unique
  ON public.event_reminders (event_id, lower(email), reminder_type)
  WHERE email IS NOT NULL;

-- Prevent duplicate authenticated subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS event_reminders_user_unique
  ON public.event_reminders (event_id, user_id, reminder_type)
  WHERE user_id IS NOT NULL;

-- Index for the daily send job (fetch all unsent reminders)
CREATE INDEX IF NOT EXISTS event_reminders_unsent_idx
  ON public.event_reminders (reminder_type, is_sent)
  WHERE is_sent = false;

-- Index for user's own reminder list
CREATE INDEX IF NOT EXISTS event_reminders_user_id_idx
  ON public.event_reminders (user_id)
  WHERE user_id IS NOT NULL;

-- Authenticated users can read their own reminders
CREATE POLICY "Users can view own reminders"
  ON public.event_reminders
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can create a reminder (auth or anonymous — application enforces contact field)
CREATE POLICY "Anyone can create reminders"
  ON public.event_reminders
  FOR INSERT WITH CHECK (true);

-- Admins can read and manage all reminders
CREATE POLICY "Admins can manage reminders"
  ON public.event_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── 4. Verify ────────────────────────────────────────────────────────────────
-- Run these after applying to confirm the schema is correct:
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
-- ORDER BY ordinal_position;
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('event_categories', 'event_reminders');
--
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('events', 'event_categories', 'event_reminders')
-- ORDER BY tablename, indexname;
