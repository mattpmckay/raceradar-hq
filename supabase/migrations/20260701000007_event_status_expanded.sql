-- ============================================================
-- Sprint 24: Event Status Expansion
--
-- Two changes:
--
-- 1. event_status column — overall event state (separate from registration_status)
--    Answers: "Is this event definitely happening?"
--    Values: confirmed | postponed | cancelled | completed | tbc
--
-- 2. Fix registration_status CHECK constraint
--    Sprint 21a–23 added values to the TypeScript types but the database
--    CHECK constraint was never updated. This migration aligns them.
--
-- Separation of concerns:
--   registration_status = state of the sign-up window
--   event_status        = state of the event itself
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. event_status — overall event state ───────────────────────────────────

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_status text
    NOT NULL DEFAULT 'confirmed'
    CHECK (event_status IN (
      'confirmed',   -- event is on; dates are set
      'postponed',   -- event delayed; new date TBC
      'cancelled',   -- event will not happen
      'completed',   -- event has occurred
      'tbc'          -- placeholder; details not yet confirmed
    ));

COMMENT ON COLUMN public.events.event_status IS
  'Overall event state. Separate from registration_status (which tracks the sign-up window).';

-- ─── 2. Fix registration_status CHECK constraint ─────────────────────────────
-- The database constraint only included 4 values from the original migration.
-- Sprint 21a–23 added more values to the TypeScript types but forgot to update
-- the CHECK constraint, causing INSERT/UPDATE failures for the new values.

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_registration_status_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_registration_status_check
    CHECK (registration_status IN (
      'open',           -- registrations are open
      'closing_soon',   -- closing within ~7 days
      'sold_out',       -- event is full
      'waitlist_only',  -- only waitlist spots remain
      'coming_soon',    -- not yet open
      'ballot_open',    -- ballot entry window is open
      'ballot_closed'   -- ballot closed, awaiting results
    ));

-- ─── 3. Index for event status queries ───────────────────────────────────────
-- Only index non-default values — the common case ('confirmed') is excluded.

CREATE INDEX IF NOT EXISTS events_event_status_idx
  ON public.events (event_status)
  WHERE event_status != 'confirmed';

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT column_name, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
--   AND column_name = 'event_status';
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.events'::regclass
--   AND conname = 'events_registration_status_check';
