-- ============================================================
-- Sprint 21a (extended): Comprehensive registration intelligence
-- Adds early bird completion, late entry pricing, platform,
-- waitlist URL, capacity, policies, qualification, ballot, age.
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.events

  -- ── Early bird (completing the window) ────────────────────
  -- early_bird_closes_date and early_bird_price_from added in 20260701000001
  ADD COLUMN IF NOT EXISTS early_bird_opens_date    date,
  ADD COLUMN IF NOT EXISTS early_bird_price_to      numeric(10,2),

  -- ── Late entry pricing ────────────────────────────────────
  ADD COLUMN IF NOT EXISTS late_entry_opens_date    date,
  ADD COLUMN IF NOT EXISTS late_entry_price_from    numeric(10,2),
  ADD COLUMN IF NOT EXISTS late_entry_price_to      numeric(10,2),

  -- ── Registration mechanics ────────────────────────────────
  -- Free text: Humanitix, Race Roster, Active.com, hyrox.com, etc.
  ADD COLUMN IF NOT EXISTS registration_platform    text,

  -- ── Waitlist ──────────────────────────────────────────────
  -- waitlist_open (boolean) added in 20260701000001
  -- Separate URL for joining the waitlist (often distinct from registration_url)
  ADD COLUMN IF NOT EXISTS waitlist_url             text,

  -- ── Capacity ──────────────────────────────────────────────
  -- Per-category capacity already exists on event_categories.max_participants.
  -- This is the event-level total; powers "nearly full" signals.
  ADD COLUMN IF NOT EXISTS total_capacity           integer,

  -- ── Cancellation / transfer / deferral policies ───────────
  ADD COLUMN IF NOT EXISTS refund_available         boolean,
  ADD COLUMN IF NOT EXISTS refund_deadline          date,
  ADD COLUMN IF NOT EXISTS transfer_available       boolean,
  ADD COLUMN IF NOT EXISTS transfer_deadline        date,
  ADD COLUMN IF NOT EXISTS deferral_available       boolean,
  ADD COLUMN IF NOT EXISTS deferral_deadline        date,
  -- Link to the organiser's full policies page (saves athletes hunting for it)
  ADD COLUMN IF NOT EXISTS policies_url             text,

  -- ── Qualification (entry requirements) ───────────────────
  -- qualification_required: must the athlete meet a prior standard to enter?
  -- e.g. Boston Marathon BQ time, HYROX Pro category sub-60 min requirement
  ADD COLUMN IF NOT EXISTS qualification_required   boolean,
  ADD COLUMN IF NOT EXISTS qualification_notes      text,

  -- ── Qualifier status (does this event earn a championship spot?) ──
  -- e.g. Ironman → Kona, HYROX regional → HYROX World Championships
  ADD COLUMN IF NOT EXISTS is_qualifier             boolean,
  ADD COLUMN IF NOT EXISTS qualifier_for            text,

  -- ── Ballot / lottery ─────────────────────────────────────
  -- Some events (London Marathon, Tokyo Marathon) use a ballot model:
  -- athletes apply during a window; places are allocated by lottery.
  -- ballot_required changes the CTA from "Register" to "Apply for ballot".
  ADD COLUMN IF NOT EXISTS ballot_required          boolean,
  ADD COLUMN IF NOT EXISTS ballot_opens_date        date,
  ADD COLUMN IF NOT EXISTS ballot_closes_date       date,
  ADD COLUMN IF NOT EXISTS ballot_results_date      date,
  ADD COLUMN IF NOT EXISTS ballot_apply_url         text,

  -- ── Age requirements ─────────────────────────────────────
  ADD COLUMN IF NOT EXISTS min_age                  smallint,
  ADD COLUMN IF NOT EXISTS max_age                  smallint;

-- ── Extend registration_status check constraint ───────────────────────────────
-- Add: waitlist_only, ballot_open, ballot_closed
-- These are meaningfully different states that require different UI / CTAs.

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_registration_status_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_registration_status_check
    CHECK (registration_status IN (
      'open',           -- registration is open, spots available
      'closing_soon',   -- open but deadline is within ~7 days
      'sold_out',       -- no spots available, no waitlist
      'waitlist_only',  -- sold out but waitlist is accepting applicants
      'coming_soon',    -- registration not yet open
      'ballot_open',    -- ballot application window is open
      'ballot_closed'   -- ballot closed, awaiting results
    ));

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run after applying to confirm:
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'events'
--   AND column_name IN (
--     'early_bird_opens_date','early_bird_price_to',
--     'late_entry_opens_date','late_entry_price_from','late_entry_price_to',
--     'registration_platform','waitlist_url','total_capacity',
--     'refund_available','refund_deadline',
--     'transfer_available','transfer_deadline',
--     'deferral_available','deferral_deadline','policies_url',
--     'qualification_required','qualification_notes',
--     'is_qualifier','qualifier_for',
--     'ballot_required','ballot_opens_date','ballot_closes_date',
--     'ballot_results_date','ballot_apply_url',
--     'min_age','max_age'
--   )
-- ORDER BY column_name;
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.events'::regclass
--   AND conname = 'events_registration_status_check';
