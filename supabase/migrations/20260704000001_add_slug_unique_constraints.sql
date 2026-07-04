-- Add UNIQUE constraints on slug columns that should have been present
-- from the initial schema but are missing from the live database.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tracks_slug_key'
      and conrelid = 'public.tracks'::regclass
  ) then
    alter table public.tracks add constraint tracks_slug_key unique (slug);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'championships_slug_key'
      and conrelid = 'public.championships'::regclass
  ) then
    alter table public.championships add constraint championships_slug_key unique (slug);
  end if;
end $$;
