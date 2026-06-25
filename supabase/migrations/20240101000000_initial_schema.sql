-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tracks
create table public.tracks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  country text not null,
  region text,
  city text,
  length_km numeric(6,3),
  surface text,
  description text,
  image_url text,
  website_url text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tracks enable row level security;

create policy "Published tracks are publicly readable" on public.tracks
  for select using (is_published = true);

create policy "Admins can manage tracks" on public.tracks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Championships
create table public.championships (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  discipline text not null,
  country text,
  season_year int,
  description text,
  image_url text,
  website_url text,
  organiser text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.championships enable row level security;

create policy "Published championships are publicly readable" on public.championships
  for select using (is_published = true);

create policy "Admins can manage championships" on public.championships
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Events
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  event_type text not null,
  discipline text not null,
  track_id uuid references public.tracks(id) on delete set null,
  championship_id uuid references public.championships(id) on delete set null,
  start_date date not null,
  end_date date,
  registration_deadline date,
  description text,
  image_url text,
  website_url text,
  organiser text,
  country text not null,
  region text,
  city text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Published events are publicly readable" on public.events
  for select using (is_published = true);

create policy "Admins can manage events" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Indexes for common queries
create index events_start_date_idx on public.events(start_date);
create index events_discipline_idx on public.events(discipline);
create index events_is_published_idx on public.events(is_published);
create index events_track_id_idx on public.events(track_id);
create index events_championship_id_idx on public.events(championship_id);

-- Favourites
create table public.favourites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('event', 'track', 'championship')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

alter table public.favourites enable row level security;

create policy "Users can view own favourites" on public.favourites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favourites" on public.favourites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favourites" on public.favourites
  for delete using (auth.uid() = user_id);

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_tracks_updated_at before update on public.tracks
  for each row execute procedure public.set_updated_at();

create trigger set_championships_updated_at before update on public.championships
  for each row execute procedure public.set_updated_at();

create trigger set_events_updated_at before update on public.events
  for each row execute procedure public.set_updated_at();
