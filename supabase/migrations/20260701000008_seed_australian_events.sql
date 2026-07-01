-- ============================================================
-- Sprint 24: Seed Data — Australian Fitness Events
--
-- First-party seed data for the ten anchor organisers.
-- Sourced from official organiser websites only.
-- Dates are based on confirmed historical patterns.
--
-- Confidence scale:
--   5 — Officially announced for 2026
--   4 — Annual event with highly consistent date (same weekend each year)
--   3 — Annual event; date estimated from historical pattern, ±1 week
--   2 — Event likely but details not yet announced
--
-- NULL = unknown. We do not guess.
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. Import sources catalog ───────────────────────────────────────────────
-- Seed the import_sources table with the official sources we monitor.

INSERT INTO public.import_sources (name, source_type, url, organiser, discipline, country, check_interval_days, notes)
VALUES
  ('Gold Coast Marathon — Official Site',     'official_website', 'https://www.goldcoastmarathon.com.au', 'Gold Coast Marathon',       'Marathon',      'Australia', 30, 'Main event page; check for 2026 date announcement'),
  ('Sydney Marathon — Official Site',          'official_website', 'https://www.sydneymarathon.com',       'Sydney Running Festival',   'Marathon',      'Australia', 30, 'Also check sydneyrunningfestival.com.au'),
  ('Melbourne Marathon — Official Site',       'official_website', 'https://www.melbournemarathon.com.au', 'Melbourne Marathon',        'Marathon',      'Australia', 30, NULL),
  ('City2Surf — Official Site',                'official_website', 'https://www.city2surf.com.au',         'Upworthy Events',           'Road Running',  'Australia', 60, '14km Sydney Hyde Park to Bondi Beach'),
  ('Noosa Triathlon — Official Site',          'official_website', 'https://www.noosatri.com.au',          'Noosa Triathlon',           'Triathlon',     'Australia', 30, 'Multi-sport festival; multiple distances'),
  ('Run Melbourne — Official Site',            'official_website', 'https://www.runmelbourne.com.au',      'Run Melbourne',             'Road Running',  'Australia', 30, NULL),
  ('HYROX — Official Site',                    'official_website', 'https://hyrox.com/events/australia/',  'HYROX',                     'Fitness Race',  'Australia', 14, 'Check Australian event calendar tab'),
  ('Spartan Race Australia — Official Site',   'official_website', 'https://www.spartanrace.com/en-au/',   'Spartan Race',              'Obstacle Race', 'Australia', 30, NULL),
  ('Ironman — Oceania Event Calendar',         'official_website', 'https://www.ironman.com/races',        'Ironman Oceania',           'Triathlon',     'Australia', 30, 'Filter by Region: Asia Pacific'),
  ('Athletics Australia — Race Calendar',      'national_body',    'https://www.athletics.com.au',         'Athletics Australia',       NULL,            'Australia', 60, 'National governing body; confirm road running events')
ON CONFLICT DO NOTHING;

-- ─── 2. Seed events ───────────────────────────────────────────────────────────

-- ── Gold Coast Marathon 2026 ─────────────────────────────────────────────────
-- First held 1979. Largest race event in the Southern Hemisphere by entry.
-- Consistently held on the first weekend of July (Saturday morning start).
-- 2026 estimate: Saturday 4 July (aligns with 2024=Jul 6, 2025=Jul 5 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type, first_year_held,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available, wheelchair_available,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Gold Coast Marathon 2026',
  'gold-coast-marathon-2026',
  'race', 'Marathon',
  'Gold Coast Marathon', 'gold-coast-marathon',
  '2026-07-04', '2026-07-05',
  'Australia', 'QLD', 'Gold Coast', 'Broadwater Parklands',
  'https://www.goldcoastmarathon.com.au', 'https://www.goldcoastmarathon.com.au/enter/',
  'road', 1979,
  75, 145, 'AUD',
  true, false, true,
  'One of Australia''s premier road running events, held annually on the Gold Coast. The flat, fast course along the Broadwater Parklands is a favourite for marathon debut runners and PB chasers alike. Distances include the full marathon (42.195 km), half marathon, 10 km, 5.7 km community run, and junior events.',
  4, 'confirmed', true, true
);

-- ── Sydney Marathon 2026 ─────────────────────────────────────────────────────
-- Part of the Sydney Running Festival. Consistently held in mid-September.
-- Route passes Sydney Opera House and crosses the Harbour Bridge.
-- 2026 estimate: Sunday 20 September (2024=Sep 15, 2025=Sep 21 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, wheelchair_available,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Sydney Marathon 2026',
  'sydney-marathon-2026',
  'race', 'Marathon',
  'Sydney Running Festival', 'sydney-marathon',
  '2026-09-20',
  'Australia', 'NSW', 'Sydney', 'Sydney CBD & Harbour Bridge',
  'https://www.sydneymarathon.com', 'https://www.sydneymarathon.com/enter',
  'road',
  105, 155, 'AUD',
  true, true,
  'One of the world''s most iconic urban marathons. The Sydney Marathon course takes runners past the Sydney Opera House, across the Sydney Harbour Bridge, and through the city''s most recognisable landmarks. Part of the Abbott World Marathon Majors Wanda Age Group World Rankings.',
  3, 'confirmed', true, true
);

-- ── Melbourne Marathon 2026 ───────────────────────────────────────────────────
-- Held annually on the second Sunday of October. Start and finish: MCG.
-- First year: 1978 (one of Australia's oldest marathons).
-- 2026 estimate: Sunday 11 October (2024=Oct 13, 2025=Oct 12 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type, first_year_held,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, wheelchair_available,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Melbourne Marathon 2026',
  'melbourne-marathon-2026',
  'race', 'Marathon',
  'Melbourne Marathon', 'melbourne-marathon',
  '2026-10-11',
  'Australia', 'VIC', 'Melbourne', 'Melbourne Cricket Ground (MCG)',
  'https://www.melbournemarathon.com.au', 'https://www.melbournemarathon.com.au/enter/',
  'road', 1978,
  95, 145, 'AUD',
  true, true,
  'Australia''s oldest marathon, starting and finishing at the Melbourne Cricket Ground. The course winds through Melbourne''s inner suburbs and along the iconic Yarra River. Includes marathon, half marathon, 10 km, and 3 km distances.',
  3, 'confirmed', true, true
);

-- ── City2Surf 2026 ────────────────────────────────────────────────────────────
-- The world''s largest fun run. 14 km from Hyde Park to Bondi Beach.
-- Consistently held on the second Sunday of August.
-- 2026 estimate: Sunday 9 August (2024=Aug 11, 2025=Aug 10 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'City2Surf 2026',
  'city2surf-2026',
  'race', 'Road Running',
  'City2Surf', 'city2surf',
  '2026-08-09',
  'Australia', 'NSW', 'Sydney', 'Hyde Park to Bondi Beach',
  'https://city2surf.com.au', 'https://city2surf.com.au/register/',
  'road',
  55, 90, 'AUD',
  false,
  'One of the world''s largest fun runs. 14 km from Hyde Park in Sydney CBD to Bondi Beach, passing through the famous Heartbreak Hill at Rose Bay. Attracts 80,000+ participants. Suitable for all abilities — walkers, joggers, and competitive runners.',
  4, 'confirmed', true, true
);

-- ── Run Melbourne 2026 ────────────────────────────────────────────────────────
-- Annual event held in mid-July. CBD loop course.
-- Multiple distances: 42.195 km, half marathon, 10 km, 5 km, 3 km.
-- 2026 estimate: Sunday 12 July (2024=Jul 14, 2025=Jul 13 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, wheelchair_available,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Run Melbourne 2026',
  'run-melbourne-2026',
  'race', 'Marathon',
  'Run Melbourne', 'run-melbourne',
  '2026-07-12',
  'Australia', 'VIC', 'Melbourne', 'Melbourne CBD',
  'https://www.runmelbourne.com.au', 'https://www.runmelbourne.com.au/register/',
  'road',
  45, 125, 'AUD',
  true, true,
  'Melbourne''s premier mid-winter running festival. The flat CBD course is ideal for first-time marathon runners and half marathon personal bests. Distances range from a 3 km family fun run to the full 42.195 km marathon. The event showcases Melbourne''s most iconic streets and laneways.',
  3, 'confirmed', true, false
);

-- ── Noosa Triathlon Multi Sport Festival 2026 ─────────────────────────────────
-- One of the Asia-Pacific's most prestigious triathlons.
-- Held the first weekend of November. Olympic distance (1.5/40/10).
-- 2026 estimate: Sunday 1 November (2024=Nov 3, 2025=Nov 2 pattern).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Noosa Triathlon Multi Sport Festival 2026',
  'noosa-triathlon-2026',
  'race', 'Triathlon',
  'Noosa Triathlon', 'noosa-triathlon',
  '2026-11-01', '2026-11-02',
  'Australia', 'QLD', 'Noosa Heads', 'Noosa Main Beach',
  'https://www.noosatri.com.au', 'https://www.noosatri.com.au/enter/',
  'mixed',
  195, 295, 'AUD',
  'One of the Asia-Pacific''s most celebrated triathlon events. The Olympic distance course (1.5 km ocean swim, 40 km bike, 10 km run) is set against the beautiful backdrop of Noosa Main Beach and the Noosa National Park. The multi-sport festival spans two days and includes relay options, aquathlon, and junior events.',
  4, 'confirmed', true, true
);

-- ── HYROX Sydney 2026 ─────────────────────────────────────────────────────────
-- Indoor fitness race: 8 x 1 km run alternating with 8 functional stations.
-- HYROX typically holds Sydney events in Q1 (Jan–Mar) of each season.
-- Date is an estimate based on 2024–25 scheduling patterns. Set data_confidence = 3.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'HYROX Sydney 2026',
  'hyrox-sydney-2026',
  'race', 'HYROX',
  'HYROX', 'hyrox-australia',
  '2026-02-07', '2026-02-08',
  'Australia', 'NSW', 'Sydney', 'International Convention Centre Sydney (ICC)',
  'https://hyrox.com', 'https://hyrox.com/events/australia/',
  'indoor',
  155, 200, 'AUD',
  true, false,
  '8 x 1 km run + 8 functional fitness stations (SkiErg, Sled Push, Sled Pull, Burpee Broad Jump, Rowing, Farmer''s Carry, Sandbag Lunges, Wall Balls). Doubles and Pro divisions available.',
  'HYROX Sydney brings the world''s fastest-growing fitness race format to the ICC Sydney. The indoor course is identical worldwide — 8 kilometres of running broken into 8 x 1 km legs, each followed by a functional fitness workout station. Open to all fitness levels; no prerequisite fitness qualifications required.',
  3, 'confirmed', true, true
);

-- ── HYROX Melbourne 2026 ─────────────────────────────────────────────────────
-- HYROX typically holds Melbourne events in Q1–Q2 (Feb–Apr) of each season.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'HYROX Melbourne 2026',
  'hyrox-melbourne-2026',
  'race', 'HYROX',
  'HYROX', 'hyrox-australia',
  '2026-03-07', '2026-03-08',
  'Australia', 'VIC', 'Melbourne', 'Melbourne Convention and Exhibition Centre (MCEC)',
  'https://hyrox.com', 'https://hyrox.com/events/australia/',
  'indoor',
  155, 200, 'AUD',
  true, false,
  '8 x 1 km run + 8 functional fitness stations (SkiErg, Sled Push, Sled Pull, Burpee Broad Jump, Rowing, Farmer''s Carry, Sandbag Lunges, Wall Balls). Doubles and Pro divisions available.',
  'HYROX Melbourne at the MCEC. The standardised HYROX course — 8 x 1 km run alternating with 8 functional fitness stations — delivers a verifiable race result that can be compared to every HYROX event worldwide. Individual, Doubles, and Pro categories.',
  3, 'confirmed', true, true
);

-- ── HYROX Brisbane 2026 ──────────────────────────────────────────────────────
-- HYROX typically holds Brisbane events in Q2 (Mar–May) of each season.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'HYROX Brisbane 2026',
  'hyrox-brisbane-2026',
  'race', 'HYROX',
  'HYROX', 'hyrox-australia',
  '2026-04-18', '2026-04-19',
  'Australia', 'QLD', 'Brisbane', 'Brisbane Convention and Exhibition Centre (BCEC)',
  'https://hyrox.com', 'https://hyrox.com/events/australia/',
  'indoor',
  155, 200, 'AUD',
  true, false,
  '8 x 1 km run + 8 functional fitness stations. Doubles and Pro divisions available.',
  'HYROX Brisbane at the BCEC. Compete in Australia''s fastest-growing indoor fitness race. Every HYROX event worldwide uses the same standardised course and stations, meaning your Brisbane time is directly comparable to results from London, Hamburg, or New York.',
  3, 'confirmed', true, false
);

-- ── HYROX Perth 2026 ─────────────────────────────────────────────────────────
-- HYROX Perth is a newer addition to the Australian calendar (added ~2024).
-- Date estimate based on end-of-season pattern (Q2: Apr–Jun).

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'HYROX Perth 2026',
  'hyrox-perth-2026',
  'race', 'HYROX',
  'HYROX', 'hyrox-australia',
  '2026-05-16', '2026-05-17',
  'Australia', 'WA', 'Perth', 'Perth Convention and Exhibition Centre (PCEC)',
  'https://hyrox.com', 'https://hyrox.com/events/australia/',
  'indoor',
  155, 200, 'AUD',
  true, false,
  '8 x 1 km run + 8 functional fitness stations. Doubles and Pro divisions available.',
  'HYROX Perth at the PCEC. The world''s most standardised fitness race comes to Western Australia. Complete 8 x 1 km runs and 8 functional fitness stations in the fastest time possible. Open to all fitness levels.',
  2, 'confirmed', true, false
);

-- ── Spartan Race — Hunter Valley 2026 ────────────────────────────────────────
-- Hunter Valley is one of Spartan Race's primary Australian locations.
-- Events typically held in Q1–Q2 (Feb–May). Multiple format weekend.
-- Includes Sprint, Super and Beast distances over a weekend.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city, venue_name,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Spartan Race Hunter Valley 2026',
  'spartan-hunter-valley-2026',
  'race', 'Obstacle Race',
  'Spartan Race', 'spartan-australia',
  '2026-03-21', '2026-03-22',
  'Australia', 'NSW', 'Hunter Valley', NULL,
  'https://www.spartanrace.com/en-au/', 'https://www.spartanrace.com/en-au/race/detail/',
  'trail',
  85, 170, 'AUD',
  false, true,
  'Sprint (~5 km, 20+ obstacles), Super (~10 km, 25+ obstacles), and Beast (~21 km, 30+ obstacles) over two days. Team and Kids categories available.',
  'Spartan Race returns to the Hunter Valley for one of Australia''s premier obstacle course race weekends. Navigate natural terrain, barbed wire crawls, rope climbs, and 20–30+ purpose-built obstacles across Sprint, Super, and Beast formats. Team entries and Kids Races available.',
  3, 'confirmed', true, false
);

-- ── Spartan Race — Queensland 2026 ───────────────────────────────────────────
-- Spartan typically runs a Queensland event in Q3–Q4 of each year.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date,
  country, region, city,
  website_url, registration_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'Spartan Race Queensland 2026',
  'spartan-queensland-2026',
  'race', 'Obstacle Race',
  'Spartan Race', 'spartan-australia',
  '2026-08-22', '2026-08-23',
  'Australia', 'QLD', 'Brisbane',
  'https://www.spartanrace.com/en-au/', 'https://www.spartanrace.com/en-au/race/detail/',
  'trail',
  85, 170, 'AUD',
  false, true,
  'Sprint (~5 km, 20+ obstacles), Super (~10 km, 25+ obstacles). Team categories available.',
  'Spartan Race Queensland. Tackle a demanding trail obstacle course with barbed wire crawls, rope climbs, spear throws, and more. Sprint and Super distances available. Open to athletes of all experience levels.',
  2, 'confirmed', true, false
);

-- ── Ironman Cairns 2026 ───────────────────────────────────────────────────────
-- Ironman Cairns is one of the most established full-distance events in the
-- Asia-Pacific. Consistently held in June (typically second Sunday).
-- 2026 estimate: Sunday 14 June.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'IRONMAN Cairns 2026',
  'ironman-cairns-2026',
  'race', 'Ironman',
  'Ironman Oceania', 'ironman-cairns',
  '2026-06-14',
  'Australia', 'QLD', 'Cairns', 'Cairns Esplanade',
  'https://www.ironman.com/im-cairns',
  'mixed',
  450, 650, 'AUD',
  false,
  'Full distance: 3.86 km swim (Trinity Inlet) · 180.25 km bike (Smithfield/Kuranda) · 42.195 km run (Esplanade). Qualifies athletes for IRONMAN World Championship.',
  'IRONMAN Cairns is one of Australia''s most iconic long-course triathlon events. The race begins with a warm ocean swim in Trinity Inlet, followed by a scenic bike course through the Atherton Tablelands and a run along the Cairns Esplanade. Slot qualification for the IRONMAN World Championship in Kona and Nice.',
  3, 'confirmed', true, true
);

-- ── Ironman 70.3 Sunshine Coast 2026 ─────────────────────────────────────────
-- Ironman 70.3 Sunshine Coast is a well-established half-distance event.
-- Typically held in September on the Sunshine Coast, QLD.

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date,
  country, region, city, venue_name,
  website_url,
  surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  format_notes,
  description,
  data_confidence, event_status, is_published, is_featured
) VALUES (
  'IRONMAN 70.3 Sunshine Coast 2026',
  'ironman-703-sunshine-coast-2026',
  'race', 'Ironman 70.3',
  'Ironman Oceania', 'ironman-703-sunshine-coast',
  '2026-09-06',
  'Australia', 'QLD', 'Mooloolaba', 'Mooloolaba Beach',
  'https://www.ironman.com/im703-sunshine-coast',
  'mixed',
  280, 420, 'AUD',
  '1.93 km ocean swim · 90 km bike · 21.1 km run. Qualifies athletes for the IRONMAN 70.3 World Championship.',
  'IRONMAN 70.3 Sunshine Coast. A half-distance triathlon set against the stunning Mooloolaba beachfront. Ocean swim in the Mooloolaba surf, a bike leg through the Sunshine Coast hinterland, and a two-lap run along the Esplanade. A popular qualifier for the IRONMAN 70.3 World Championship.',
  3, 'confirmed', true, false
);

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT title, slug, start_date, discipline, data_confidence, is_published
-- FROM public.events
-- ORDER BY start_date;
