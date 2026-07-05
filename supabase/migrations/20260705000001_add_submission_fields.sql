-- Sprint 35: Add organiser submission tracking fields to events table.
-- submission_source distinguishes admin-created records from public organiser submissions.
-- submitter_name and submitter_email are internal-only contact fields for admin follow-up.

alter table public.events
  add column if not exists submission_source text not null default 'admin',
  add column if not exists submitter_name    text,
  add column if not exists submitter_email   text;
