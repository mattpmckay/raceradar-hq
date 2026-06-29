-- Sprint 11: Calendar subscriptions — segmented email lead capture
-- Apply via Supabase Dashboard → SQL Editor

create table public.calendar_subscriptions (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  categories text[]      not null default '{}',
  source     text        not null default 'calendar_page',
  created_at timestamptz not null default now()
);

alter table public.calendar_subscriptions enable row level security;

-- Anyone can subscribe (no auth required — this is public lead capture)
create policy "anyone can subscribe"
  on public.calendar_subscriptions
  for insert
  to public
  with check (true);

-- ── Verify ─────────────────────────────────────────────────────────────────
-- SELECT id, email, categories, created_at FROM calendar_subscriptions ORDER BY created_at DESC LIMIT 10;
