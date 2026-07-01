-- ============================================================
-- Sprint 21a: Registration intelligence
-- Adds early bird dates, registration URL, and waitlist support.
-- Extends event_reminders to include early_bird_closing type.
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. Extend events table ───────────────────────────────────────────────────

ALTER TABLE public.events
  -- Early bird deadline — drives "Early bird closes in X days" Upcoming Actions
  ADD COLUMN IF NOT EXISTS early_bird_closes_date  date,

  -- Early bird pricing — enables "Save $X — early bird open now" messaging
  ADD COLUMN IF NOT EXISTS early_bird_price_from   numeric(10,2),

  -- Direct registration link — distinct from website_url (event homepage)
  -- e.g. EventBrite, Active.com, SportEntry links
  ADD COLUMN IF NOT EXISTS registration_url        text,

  -- Waitlist flag — surfaces "Waitlist available" when registration is full
  ADD COLUMN IF NOT EXISTS waitlist_open           boolean NOT NULL DEFAULT false;

-- ─── 2. Extend event_reminders reminder_type ─────────────────────────────────
-- PostgreSQL names the inline CHECK constraint {table}_{column}_check.
-- We drop and recreate it to add early_bird_closing.

ALTER TABLE public.event_reminders
  DROP CONSTRAINT IF EXISTS event_reminders_reminder_type_check;

ALTER TABLE public.event_reminders
  ADD CONSTRAINT event_reminders_reminder_type_check
    CHECK (reminder_type IN (
      'registration_opens',   -- fires when registration opens
      'registration_closing', -- fires N days before registration_deadline
      'early_bird_closing',   -- fires when early_bird_closes_date is approaching
      'race_week'             -- fires 7 days before start_date
    ));

-- ─── 3. Index for early bird reminders ───────────────────────────────────────
-- Allows the daily send job to efficiently find unsent early-bird reminders.

CREATE INDEX IF NOT EXISTS event_reminders_early_bird_idx
  ON public.event_reminders (reminder_type, is_sent)
  WHERE reminder_type = 'early_bird_closing' AND is_sent = false;

-- ─── 4. Verify ────────────────────────────────────────────────────────────────
-- Run these after applying to confirm the schema is correct:
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
--   AND column_name IN (
--     'early_bird_closes_date', 'early_bird_price_from',
--     'registration_url', 'waitlist_open'
--   );
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.event_reminders'::regclass
--   AND conname = 'event_reminders_reminder_type_check';
