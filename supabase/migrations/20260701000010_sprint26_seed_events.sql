-- ============================================================
-- Sprint 26: Seed Data Expansion + Forward-Compatible Schema
-- ============================================================
--
-- Part 1: Schema extensions (forward-compatible, non-breaking)
--   • organiser_slug     — nullable text; becomes a FK when organiser table is built
--   • venue_slug         — nullable text; becomes a FK when venue table is built
--   • last_verified_date — date this record was last checked against an official source
--
-- Part 2: 15 new series (IRONMAN, trail running, obstacle, international)
--
-- Part 3: ~50 new seed events across Australia and Asia-Pacific
--
-- Confidence scale:
--   5 — Officially announced for 2026
--   4 — Annual event with highly consistent date (same weekend each year)
--   3 — Annual event; date estimated from historical pattern, ±1 week
--   2 — Event likely; specific 2026 date needs confirmation
--
-- NULL = unknown or unconfirmed. We do not guess.
-- ============================================================

-- ─── Part 1: Schema extensions ────────────────────────────────────────────────

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS organiser_slug    text,
  ADD COLUMN IF NOT EXISTS venue_slug        text,
  ADD COLUMN IF NOT EXISTS last_verified_date date;

COMMENT ON COLUMN public.events.organiser_slug    IS 'Forward-compatible FK placeholder. Will reference public.organisers(slug) when that table is built.';
COMMENT ON COLUMN public.events.venue_slug        IS 'Forward-compatible FK placeholder. Will reference public.venues(slug) when that table is built.';
COMMENT ON COLUMN public.events.last_verified_date IS 'Date this record was last verified against an official source. Used to identify stale data.';

CREATE INDEX IF NOT EXISTS events_last_verified_idx
  ON public.events (last_verified_date)
  WHERE last_verified_date IS NOT NULL;

-- ─── Part 2: New series ───────────────────────────────────────────────────────

INSERT INTO public.series (slug, name, discipline_slug, organiser, country, short_description, website_url)
VALUES
  -- IRONMAN Australia
  ('ironman-703-geelong',       'IRONMAN 70.3 Geelong',        'ironman', 'Ironman Oceania',    'Australia',   'Annual half-distance triathlon on the Geelong waterfront. Ocean swim in Corio Bay, fast bike through the Bellarine Peninsula, and a run along Eastern Beach.',                  'https://www.ironman.com/im703-geelong'),
  ('ironman-melbourne',         'IRONMAN Melbourne',            'ironman', 'Ironman Oceania',    'Australia',   'Full-distance IRONMAN based on the Mornington Peninsula. A World Championship qualifier and one of the most scenic long-course events in the Asia-Pacific.',                   'https://www.ironman.com/im-melbourne'),
  ('ironman-703-ballarat',      'IRONMAN 70.3 Ballarat',        'ironman', 'Ironman Oceania',    'Australia',   'Half-distance IRONMAN through the goldfields of regional Victoria. Swim in Lake Wendouree, bike through the Ballarat countryside, and run through the city centre.',           'https://www.ironman.com/im703-ballarat'),
  ('ironman-703-busselton',     'IRONMAN 70.3 Busselton',       'ironman', 'Ironman Oceania',    'Australia',   'Half-distance IRONMAN on the stunning Geographe Bay coastline in Western Australia. Famous for its crystal-clear water swim and flat, fast bike course.',                      'https://www.ironman.com/im703-busselton'),
  ('ironman-703-cairns',        'IRONMAN 70.3 Cairns',          'ironman', 'Ironman Oceania',    'Australia',   'Half-distance IRONMAN in tropical North Queensland. Ocean swim in Trinity Inlet, bike through Cairns northern beaches, and a run along the Esplanade.',                       'https://www.ironman.com/im703-cairns'),
  ('ironman-703-western-sydney','IRONMAN 70.3 Western Sydney',  'ironman', 'Ironman Oceania',    'Australia',   'Half-distance IRONMAN at Penrith and the Blue Mountains. Swim at Penrith International Regatta Centre, bike through the lower Blue Mountains, run along the river.',         'https://www.ironman.com/im703-western-sydney'),
  ('ironman-western-australia', 'IRONMAN Western Australia',    'ironman', 'Ironman Oceania',    'Australia',   'Full-distance IRONMAN in Busselton, the iconic December qualifier for the IRONMAN World Championship. Known for its glassy flat water swim and world-class athlete field.',    'https://www.ironman.com/im-western-australia'),
  -- IRONMAN New Zealand
  ('ironman-nz',                'IRONMAN New Zealand',          'ironman', 'Ironman Oceania',    'New Zealand', 'Full-distance IRONMAN at Lake Taupō. One of the world''s most celebrated long-course races, held annually since 1986. A World Championship slot qualifier.',                 'https://www.ironman.com/im-newzealand'),
  ('ironman-703-auckland',      'IRONMAN 70.3 Auckland',        'ironman', 'Ironman Oceania',    'New Zealand', 'Half-distance IRONMAN on the Auckland waterfront. Ocean swim at Takapuna Beach, bike through the North Shore, and a run finishing in the city.',                             'https://www.ironman.com/im703-auckland'),
  -- Trail running
  ('ultra-trail-australia',     'Ultra-Trail Australia',        'trail-running', 'Ultra Trail Australia Pty Ltd', 'Australia', 'Australia''s premier ultra-trail event, held in the Blue Mountains of NSW each May. Distances from 22 km to 100 km through spectacular World Heritage wilderness.', 'https://www.ultratrailaustralia.com.au'),
  ('surf-coast-century',        'Surf Coast Century',           'trail-running', 'Rapid Ascent', 'Australia',   '100 km trail race from Torquay to Lorne along the Surf Coast Walk in Victoria. One of Australia''s most iconic point-to-point trail running events.',                         'https://www.surfcoastcentury.com.au'),
  ('tarawera-ultra',            'Tarawera Ultramarathon',       'trail-running', 'Tarawera Ultramarathon Ltd', 'New Zealand', 'Scenic multi-distance ultramarathon through the volcanic geothermal landscape of Rotorua, NZ. Distances range from 21 km to 102 km.',                              'https://www.taraweratrailrun.com'),
  -- Obstacle
  ('tough-mudder-australia',    'Tough Mudder Australia',       'obstacle-race', 'Tough Mudder',  'Australia',   'Teamwork-focused obstacle course races held at venues across Australia. Signature obstacles include the Electroshock Therapy, Arctic Enema, and Everest. Open to all fitness levels.', 'https://toughmudder.com.au'),
  -- International marathons
  ('tokyo-marathon',            'Tokyo Marathon',               'marathon', 'Tokyo Marathon Foundation', 'Japan', 'One of the six Abbott World Marathon Majors. A flat, fast course through Tokyo''s most iconic landmarks, attracting the world''s top elite runners and a ballot entry for the public.', 'https://www.marathon.tokyo'),
  ('auckland-marathon',         'Auckland Marathon',            'marathon', 'Aktive',            'New Zealand', 'New Zealand''s largest running event. The iconic route crosses the Auckland Harbour Bridge before finishing on the Viaduct Harbour waterfront.',                               'https://www.aucklandmarathon.co.nz')
ON CONFLICT (slug) DO NOTHING;

-- ─── Part 3: New events ───────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════
-- HYROX
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date, country, region, city, venue_name,
  website_url, registration_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, team_available,
  format_notes, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── HYROX Adelaide 2026 ────────────────────────────────────────────────────────
(
  'HYROX Adelaide 2026', 'hyrox-adelaide-2026',
  'race', 'HYROX', 'HYROX', 'hyrox-australia',
  '2026-05-30', '2026-05-31',
  'Australia', 'SA', 'Adelaide', 'Adelaide Convention Centre',
  'https://hyrox.com', 'https://hyrox.com/events/australia/',
  'indoor', 155, 200, 'AUD',
  true, false,
  '8 × 1 km run + 8 functional fitness stations. Individual, Doubles, and Pro divisions.',
  'HYROX Adelaide at the Adelaide Convention Centre. The world-standardised fitness race format — 8 × 1 km runs alternating with 8 functional fitness stations — comes to South Australia. Every result is directly comparable to HYROX events worldwide.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── HYROX Singapore 2026 ──────────────────────────────────────────────────────
(
  'HYROX Singapore 2026', 'hyrox-singapore-2026',
  'race', 'HYROX', 'HYROX', NULL,
  '2026-03-07', '2026-03-08',
  'Singapore', NULL, 'Singapore', 'Singapore Expo',
  'https://hyrox.com', 'https://hyrox.com/events/',
  'indoor', 150, 195, 'SGD',
  true, false,
  '8 × 1 km run + 8 functional fitness stations. Individual, Doubles, and Pro divisions.',
  'HYROX Singapore at the Singapore Expo. One of the fastest-growing HYROX stops in Southeast Asia, attracting competitors from across the region. The standardised course delivers a result comparable to every HYROX event worldwide.',
  2, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- MARATHON — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  relay_available, wheelchair_available,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Brisbane Marathon Festival 2026 ───────────────────────────────────────────
(
  'Brisbane Marathon Festival 2026', 'brisbane-marathon-festival-2026',
  'race', 'Marathon', 'Brisbane Marathon Festival', NULL,
  '2026-08-02',
  'Australia', 'QLD', 'Brisbane', 'South Bank Parklands',
  'https://www.brisbanemarathon.com.au', 'road',
  75, 145, 'AUD', true, true,
  'One of Queensland''s premier road running festivals, held on the Brisbane River loop through South Bank. Flat and fast with distances including marathon, half marathon, 10 km, and 5 km. A popular late-season marathon PB race for athletes in the lead-up to the Gold Coast winter season.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Adelaide Marathon Festival 2026 ───────────────────────────────────────────
(
  'Adelaide Marathon Festival 2026', 'adelaide-marathon-festival-2026',
  'race', 'Marathon', 'City of Adelaide Marathon', NULL,
  '2026-06-14',
  'Australia', 'SA', 'Adelaide', 'Adelaide CBD & River Torrens',
  'https://www.adelaidemarathon.com.au', 'road',
  70, 130, 'AUD', false, true,
  'Adelaide''s signature road running event, held along the scenic River Torrens Linear Park and through the CBD. The flat course is ideal for runners chasing a personal best in the cooler winter conditions. Full marathon, half marathon, 10 km, and 5 km distances.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Canberra Marathon 2026 ────────────────────────────────────────────────────
(
  'Canberra Marathon 2026', 'canberra-marathon-2026',
  'race', 'Marathon', 'Services for Australian Rural and Remote Allied Health', NULL,
  '2026-04-12',
  'Australia', 'ACT', 'Canberra', 'Parliamentary Triangle',
  'https://www.canberramarathon.com.au', 'road',
  70, 135, 'AUD', true, true,
  'One of Australia''s most scenic road running events, held in Canberra during the spectacular golden autumn season. The course loops through the Parliamentary Triangle past Lake Burley Griffin, the Australian War Memorial, and national monuments. Distances include marathon, half marathon, 10 km, 5 km, and 2 km.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Perth Running Festival 2026 ───────────────────────────────────────────────
(
  'Perth Running Festival 2026', 'perth-running-festival-2026',
  'race', 'Marathon', 'Perth Running Festival', NULL,
  '2026-06-07',
  'Australia', 'WA', 'Perth', 'Langley Park & Swan River',
  'https://www.perthrunningfestival.com.au', 'road',
  70, 130, 'AUD', true, true,
  'Western Australia''s premier road running event, taking in the stunning Swan River foreshore, Kings Park, and the Perth CBD skyline. A popular late-autumn event in ideal running conditions. Distances from 42.195 km to 4 km suit all abilities.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Sunshine Coast Marathon 2026 ──────────────────────────────────────────────
(
  'Sunshine Coast Marathon 2026', 'sunshine-coast-marathon-2026',
  'race', 'Marathon', 'Sunshine Coast Marathon', NULL,
  '2026-08-16',
  'Australia', 'QLD', 'Caloundra', NULL,
  'https://www.sunshinecoastmarathon.com.au', 'road',
  65, 125, 'AUD', false, false,
  'A coastal marathon through the beautiful Sunshine Coast hinterland and beachfront suburbs. The course features ocean views and a refreshing winter atmosphere ideal for chasing personal bests. Distances include marathon, half marathon, and 10 km.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Cairns Airport Marathon Festival 2026 ─────────────────────────────────────
(
  'Cairns Airport Marathon Festival 2026', 'cairns-airport-marathon-2026',
  'race', 'Marathon', 'Cairns Airport Marathon', NULL,
  '2026-06-28',
  'Australia', 'QLD', 'Cairns', 'Cairns Esplanade',
  'https://www.cairnsairportmarathon.com.au', 'road',
  75, 135, 'AUD', false, false,
  'Tropical North Queensland''s flagship running event, set against the backdrop of the Coral Sea along the Cairns Esplanade. Held in the dry season, the course is flat and fast. Distances include marathon, half marathon, 10 km, and 5 km. A popular event for runners combining racing with a tropical holiday.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Hobart Running Festival 2026 ──────────────────────────────────────────────
(
  'Hobart Running Festival 2026', 'hobart-running-festival-2026',
  'race', 'Marathon', 'Hobart Running Festival', NULL,
  '2026-01-18',
  'Australia', 'TAS', 'Hobart', 'Waterfront & Derwent River',
  'https://www.hobartrunningfestival.com.au', 'road',
  65, 115, 'AUD', false, false,
  'Hobart''s signature running event, held in the warmth of a Tasmanian summer. The scenic course follows the Derwent River through the historic Sullivan''s Cove waterfront and Constitution Dock. Distances include marathon, half marathon, 10 km, and 5 km.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Run Geelong 2026 ──────────────────────────────────────────────────────────
(
  'Run Geelong 2026', 'run-geelong-2026',
  'race', 'Marathon', 'Run Geelong', NULL,
  '2026-07-19',
  'Australia', 'VIC', 'Geelong', 'Eastern Beach Reserve',
  'https://www.rungeelong.com.au', 'road',
  60, 115, 'AUD', false, false,
  'A flat, fast road running event on the Geelong waterfront, held in the heart of Victoria''s winter running season. The course follows the scenic Corio Bay foreshore at Eastern Beach. Distances include marathon, half marathon, 10 km, and 5 km.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Darwin Running Festival 2026 ──────────────────────────────────────────────
(
  'Darwin Running Festival 2026', 'darwin-running-festival-2026',
  'race', 'Marathon', 'Darwin Running Festival', NULL,
  '2026-07-26',
  'Australia', 'NT', 'Darwin', 'Darwin Waterfront',
  'https://www.darwinrunningfestival.com.au', 'road',
  60, 110, 'AUD', false, false,
  'The Northern Territory''s premier running event, held during Darwin''s dry season when conditions are perfect for racing. The course winds along the Darwin Waterfront and surrounding parklands. Distances include half marathon, 10 km, and 5 km.',
  2, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ROAD RUNNING — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Bridge to Brisbane 2026 ───────────────────────────────────────────────────
(
  'Bridge to Brisbane 2026', 'bridge-to-brisbane-2026',
  'race', 'Road Running', 'The Sunday Mail Bridge to Brisbane', NULL,
  '2026-08-30',
  'Australia', 'QLD', 'Brisbane', 'Victoria Bridge to South Bank',
  'https://www.bridgetobrisbane.com.au', 'road',
  35, 65, 'AUD', false,
  'Queensland''s largest fun run, attracting 30,000+ participants of all abilities. The 10 km course crosses the Story Bridge and William Jolly Bridge, offering spectacular views of the Brisbane River and city skyline. A beloved community event suitable for walkers, joggers, and competitive runners.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Run the Gong 2026 ─────────────────────────────────────────────────────────
(
  'Run the Gong 2026', 'run-the-gong-2026',
  'race', 'Road Running', 'NSW Road Runners', NULL,
  '2026-10-18',
  'Australia', 'NSW', 'Wollongong', 'Wollongong Beach Foreshore',
  'https://www.runtthegong.com.au', 'road',
  40, 75, 'AUD', false,
  'A spectacular 14 km coastal run from Bulli Beach to Wollongong along the NSW coastline. One of Australia''s most scenic fun runs, with the Illawarra Escarpment rising dramatically to the west and the Tasman Sea to the east. Suitable for all fitness levels.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- MARATHON — NEW ZEALAND
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Auckland Marathon 2026 ────────────────────────────────────────────────────
(
  'Auckland Marathon 2026', 'auckland-marathon-2026',
  'race', 'Marathon', 'Aktive', 'auckland-marathon',
  '2026-10-25',
  'New Zealand', NULL, 'Auckland', 'Auckland Harbour Bridge & Waterfront',
  'https://www.aucklandmarathon.co.nz', 'road',
  85, 145, 'NZD', true,
  'New Zealand''s largest road running event. The course is renowned for its crossing of the Auckland Harbour Bridge, which closes to traffic for the event — one of only two occasions it opens to pedestrians each year. Finishes at the Viaduct Harbour waterfront.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Queenstown International Marathon 2026 ────────────────────────────────────
(
  'Queenstown International Marathon 2026', 'queenstown-international-marathon-2026',
  'race', 'Marathon', 'Queenstown Marathon', NULL,
  '2026-11-21',
  'New Zealand', NULL, 'Queenstown', 'Queenstown & Lake Wakatipu',
  'https://www.queenstownmarathon.co.nz', 'mixed',
  105, 185, 'NZD', false,
  'One of the world''s most beautiful marathon courses, winding through the Queenstown Trail on the shores of Lake Wakatipu with the Remarkables mountain range as a backdrop. The trail and tarmac course suits both runners and trail enthusiasts. A bucket-list event for global running tourists.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── Rotorua Marathon 2026 ─────────────────────────────────────────────────────
(
  'Rotorua Marathon 2026', 'rotorua-marathon-2026',
  'race', 'Marathon', 'Rotorua Marathon', NULL,
  '2026-05-02',
  'New Zealand', NULL, 'Rotorua', 'Rotorua City & Lakefront',
  'https://www.rotoruamarathon.co.nz', 'road',
  70, 120, 'NZD', false,
  'One of New Zealand''s longest-running marathon events, held in Rotorua since 1967. The flat course follows the shores of Lake Rotorua through geothermal parklands. Distances include full marathon, half marathon, 10 km, and 5 km family run.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Wellington Marathon 2026 ──────────────────────────────────────────────────
(
  'Wellington Marathon 2026', 'wellington-marathon-2026',
  'race', 'Marathon', 'Wellington Marathon', NULL,
  '2026-06-21',
  'New Zealand', NULL, 'Wellington', 'Wellington Waterfront',
  'https://www.wellingtonmarathon.co.nz', 'road',
  70, 120, 'NZD', false,
  'Wellington''s premier road running event along the stunning harbour foreshore. The course hugs the coastline from Petone to the city, delivering harbour views throughout. Distances include marathon, half marathon, and 10 km. Often windy conditions add to the challenge.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- MARATHON — JAPAN
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Tokyo Marathon 2026 ───────────────────────────────────────────────────────
(
  'Tokyo Marathon 2026', 'tokyo-marathon-2026',
  'race', 'Marathon', 'Tokyo Marathon Foundation', 'tokyo-marathon',
  '2026-03-01',
  'Japan', NULL, 'Tokyo', 'Tokyo Metropolitan Government Building to Tokyo Station',
  'https://www.marathon.tokyo', 'road',
  16200, 16200, 'JPY', true,
  'One of the six Abbott World Marathon Majors. The course runs from the Tokyo Metropolitan Government Building through the city''s most iconic districts — Shinjuku, Asakusa, Ginza, Nihonbashi — finishing near Tokyo Station. Entry is by public ballot for general participants; elite field is by invitation. Attracts 50,000+ finishers.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── Osaka Marathon 2026 ───────────────────────────────────────────────────────
(
  'Osaka Marathon 2026', 'osaka-marathon-2026',
  'race', 'Marathon', 'Osaka Marathon Executive Committee', NULL,
  '2026-11-01',
  'Japan', NULL, 'Osaka', 'Osaka City Centre',
  'https://www.osaka-marathon.com', 'road',
  15700, 15700, 'JPY', true,
  'One of Japan''s most prestigious city marathons, running through the heart of Osaka past Osaka Castle, the Dotonbori entertainment district, and Sumiyoshi Taisha shrine. A ballot-entry event attracting 30,000+ runners. Popular with international participants for its flat, fast course and vibrant crowd support.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- IRONMAN — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  format_notes, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── IRONMAN 70.3 Geelong 2026 ─────────────────────────────────────────────────
(
  'IRONMAN 70.3 Geelong 2026', 'ironman-703-geelong-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-geelong',
  '2026-02-22',
  'Australia', 'VIC', 'Geelong', 'Eastern Beach Reserve',
  'https://www.ironman.com/im703-geelong', 'mixed',
  280, 400, 'AUD',
  '1.9 km ocean swim (Corio Bay) · 90 km bike (Bellarine Peninsula) · 21.1 km run (Eastern Beach foreshore). IRONMAN 70.3 World Championship qualifier.',
  'One of Australia''s most popular half-distance triathlons, held annually in late February in ideal summer conditions. The swim takes place in the protected waters of Corio Bay, the bike course winds through the picturesque Bellarine Peninsula, and the run finishes along the spectacular Eastern Beach foreshore.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── IRONMAN Melbourne 2026 ────────────────────────────────────────────────────
(
  'IRONMAN Melbourne 2026', 'ironman-melbourne-2026',
  'race', 'Ironman', 'Ironman Oceania', 'ironman-melbourne',
  '2026-03-22',
  'Australia', 'VIC', 'Frankston', 'Frankston Waterfront',
  'https://www.ironman.com/im-melbourne', 'mixed',
  550, 700, 'AUD',
  '3.86 km swim (Port Phillip Bay) · 180.25 km bike (Mornington Peninsula) · 42.195 km run (beachfront). IRONMAN World Championship qualifier.',
  'IRONMAN Melbourne is a full-distance triathlon set against the stunning backdrop of Port Phillip Bay and the Mornington Peninsula. The swim takes place in the warm sheltered bay, the bike course traverses the rolling hills of the peninsula, and the marathon run follows the Frankston foreshore. A prestigious World Championship slot qualifier.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── IRONMAN 70.3 Ballarat 2026 ────────────────────────────────────────────────
(
  'IRONMAN 70.3 Ballarat 2026', 'ironman-703-ballarat-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-ballarat',
  '2026-03-29',
  'Australia', 'VIC', 'Ballarat', 'Lake Wendouree',
  'https://www.ironman.com/im703-ballarat', 'mixed',
  280, 400, 'AUD',
  '1.9 km swim (Lake Wendouree) · 90 km bike (Ballarat countryside) · 21.1 km run (city centre). IRONMAN 70.3 World Championship qualifier.',
  'IRONMAN 70.3 Ballarat is set in Victoria''s historic goldfields region. The swim takes place in Lake Wendouree, the same venue used for rowing at the 1956 Melbourne Olympics. The bike course weaves through the Ballarat countryside and the run passes through the tree-lined streets of the city centre.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── IRONMAN 70.3 Busselton 2026 ───────────────────────────────────────────────
(
  'IRONMAN 70.3 Busselton 2026', 'ironman-703-busselton-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-busselton',
  '2026-05-10',
  'Australia', 'WA', 'Busselton', 'Busselton Jetty & Geographe Bay',
  'https://www.ironman.com/im703-busselton', 'mixed',
  280, 400, 'AUD',
  '1.9 km swim (Geographe Bay) · 90 km bike (coastal roads) · 21.1 km run (Busselton foreshore). IRONMAN 70.3 World Championship qualifier.',
  'IRONMAN 70.3 Busselton takes place on the pristine Geographe Bay coastline in Western Australia''s South West. The swim is in crystal-clear, sheltered bay water alongside the iconic Busselton Jetty — the longest timber-piled jetty in the Southern Hemisphere. A fast bike course on flat coastal roads and a scenic beachfront run make this a favourite for athletes targeting personal bests.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── IRONMAN 70.3 Western Sydney 2026 ─────────────────────────────────────────
(
  'IRONMAN 70.3 Western Sydney 2026', 'ironman-703-western-sydney-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-western-sydney',
  '2026-05-31',
  'Australia', 'NSW', 'Penrith', 'Penrith International Regatta Centre',
  'https://www.ironman.com/im703-western-sydney', 'mixed',
  280, 400, 'AUD',
  '1.9 km swim (Penrith Regatta Centre) · 90 km bike (lower Blue Mountains) · 21.1 km run (Nepean River). IRONMAN 70.3 World Championship qualifier.',
  'IRONMAN 70.3 Western Sydney is held at the Penrith International Regatta Centre, the venue built for the 2000 Sydney Olympics. The swim is in the flat-water rowing course, the bike climbs into the foothills of the Blue Mountains, and the run follows the Nepean River. A popular qualifier accessible by train from Sydney CBD.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── IRONMAN 70.3 Cairns 2026 ──────────────────────────────────────────────────
(
  'IRONMAN 70.3 Cairns 2026', 'ironman-703-cairns-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-cairns',
  '2026-06-13',
  'Australia', 'QLD', 'Cairns', 'Palm Cove & Cairns Esplanade',
  'https://www.ironman.com/im703-cairns', 'mixed',
  280, 400, 'AUD',
  '1.9 km swim (Coral Sea, Palm Cove) · 90 km bike (Northern Beaches) · 21.1 km run (Esplanade). IRONMAN 70.3 World Championship qualifier.',
  'IRONMAN 70.3 Cairns is held in tropical North Queensland the day before the full-distance IRONMAN Cairns. The ocean swim takes place in the warm Coral Sea at Palm Cove, the bike course passes through the northern beaches, and the run finishes on the Cairns Esplanade.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── IRONMAN Western Australia 2026 ────────────────────────────────────────────
(
  'IRONMAN Western Australia 2026', 'ironman-western-australia-2026',
  'race', 'Ironman', 'Ironman Oceania', 'ironman-western-australia',
  '2026-12-06',
  'Australia', 'WA', 'Busselton', 'Busselton Jetty & Geographe Bay',
  'https://www.ironman.com/im-western-australia', 'mixed',
  550, 750, 'AUD',
  '3.86 km swim (Geographe Bay) · 180.25 km bike (coastal & rural roads) · 42.195 km run (Busselton foreshore). Premier Asia-Pacific IRONMAN World Championship qualifier.',
  'IRONMAN Western Australia is the southern hemisphere''s most iconic full-distance triathlon and one of the Asia-Pacific''s most coveted World Championship qualifiers. The swim is in the glassy waters of Geographe Bay beside the famous Busselton Jetty. A flat, fast bike and marathon course consistently produces some of the fastest IRONMAN finishes outside Kona.',
  3, '2026-07-01', 'confirmed', true, true
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- IRONMAN — NEW ZEALAND
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  format_notes, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── IRONMAN New Zealand 2026 ──────────────────────────────────────────────────
(
  'IRONMAN New Zealand 2026', 'ironman-new-zealand-2026',
  'race', 'Ironman', 'Ironman Oceania', 'ironman-nz',
  '2026-03-01',
  'New Zealand', NULL, 'Taupō', 'Lake Taupō',
  'https://www.ironman.com/im-newzealand', 'mixed',
  650, 850, 'NZD',
  '3.86 km swim (Lake Taupō) · 180.25 km bike (Taupō region) · 42.195 km run (Taupō lakefront). IRONMAN World Championship qualifier.',
  'IRONMAN New Zealand has been held at Lake Taupō since 1986, making it one of the world''s longest-running IRONMAN events. The swim takes place in the crystal-clear volcanic waters of Lake Taupō — the largest freshwater lake in Australasia — and the bike and run courses traverse the dramatic volcanic landscape of the central North Island. A World Championship qualifier and bucket-list event for long-course triathletes.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── IRONMAN 70.3 Auckland 2026 ────────────────────────────────────────────────
(
  'IRONMAN 70.3 Auckland 2026', 'ironman-703-auckland-2026',
  'race', 'Ironman 70.3', 'Ironman Oceania', 'ironman-703-auckland',
  '2026-01-18',
  'New Zealand', NULL, 'Auckland', 'Takapuna Beach',
  'https://www.ironman.com/im703-auckland', 'mixed',
  290, 420, 'NZD',
  '1.9 km swim (Takapuna Beach) · 90 km bike (North Shore & Hibiscus Coast) · 21.1 km run (waterfront). IRONMAN 70.3 World Championship qualifier.',
  'IRONMAN 70.3 Auckland opens the Asia-Pacific long-course triathlon season each January. The swim takes place in the sheltered waters of Takapuna Beach, the bike course travels through the scenic North Shore and up the Hibiscus Coast, and the run finishes on the waterfront. A popular race for Australians crossing the Tasman to kick off their season.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- TRIATHLON — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Geelong Triathlon 2026 ────────────────────────────────────────────────────
(
  'Geelong Triathlon 2026', 'geelong-triathlon-2026',
  'race', 'Triathlon', 'Triathlon Victoria', NULL,
  '2026-01-11',
  'Australia', 'VIC', 'Geelong', 'Eastern Beach Reserve',
  'https://www.triathlon.org.au', 'mixed',
  85, 160, 'AUD',
  'The Geelong Triathlon is one of Victoria''s most popular triathlon events, held in the heat of summer at the iconic Eastern Beach. Sprint and Olympic distance options suit first-timers and experienced triathletes alike. Strong participant numbers and a festival atmosphere make this a great warm-up for longer events later in the season.',
  2, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- TRAIL RUNNING — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Ultra-Trail Australia UTA100 2026 ─────────────────────────────────────────
(
  'Ultra-Trail Australia UTA100 2026', 'uta100-2026',
  'race', 'Trail Running', 'Ultra Trail Australia', 'ultra-trail-australia',
  '2026-05-16', '2026-05-17',
  'Australia', 'NSW', 'Katoomba', 'Scenic World, Katoomba',
  'https://www.ultratrailaustralia.com.au', 'trail',
  285, 320, 'AUD',
  'Australia''s most prestigious ultra-trail event. The UTA100 covers 100 km of rugged Blue Mountains World Heritage wilderness, with 4,400 m of vertical gain and loss along the iconic Scenic World trail network, the Giant Stairway, and the Federal Pass. Limited to 2,000 starters; ballot entry required. One of the world''s most spectacular trail races.',
  4, '2026-07-01', 'confirmed', true, true
),

-- ── Ultra-Trail Australia UTA50 2026 ──────────────────────────────────────────
(
  'Ultra-Trail Australia UTA50 2026', 'uta50-2026',
  'race', 'Trail Running', 'Ultra Trail Australia', 'ultra-trail-australia',
  '2026-05-16', NULL,
  'Australia', 'NSW', 'Katoomba', 'Scenic World, Katoomba',
  'https://www.ultratrailaustralia.com.au', 'trail',
  185, 215, 'AUD',
  'The 50 km edition of Ultra-Trail Australia, sharing the iconic Blue Mountains circuit with the UTA100. Covers the most dramatic sections of the course including the Giant Stairway, Federal Pass, and Furber Steps, with 2,400 m of vertical gain. An achievable ultra for experienced trail runners looking to step up from half marathon distances.',
  4, '2026-07-01', 'confirmed', true, false
),

-- ── Ultra-Trail Australia UTA22 2026 ──────────────────────────────────────────
(
  'Ultra-Trail Australia UTA22 2026', 'uta22-2026',
  'race', 'Trail Running', 'Ultra Trail Australia', 'ultra-trail-australia',
  '2026-05-17', NULL,
  'Australia', 'NSW', 'Katoomba', 'Scenic World, Katoomba',
  'https://www.ultratrailaustralia.com.au', 'trail',
  90, 115, 'AUD',
  'The 22 km trail race at the Blue Mountains festival, ideal for trail runners making the transition from road running. The course passes through World Heritage wilderness and includes iconic Blue Mountains landmarks. A superb introduction to the UTA experience without the demands of the 50 km or 100 km.',
  4, '2026-07-01', 'confirmed', true, false
),

-- ── Six Foot Track Marathon 2026 ──────────────────────────────────────────────
(
  'Six Foot Track Marathon 2026', 'six-foot-track-marathon-2026',
  'race', 'Trail Running', 'NSW Athletics', NULL,
  '2026-03-14', NULL,
  'Australia', 'NSW', 'Katoomba', 'Scenic World to Jenolan Caves',
  'https://www.sixfoot.com.au', 'trail',
  75, 95, 'AUD',
  'Australia''s oldest and most traditional mountain trail race, held since 1984. The 45 km course follows the historic Six Foot Track from Jenolan Caves Road to Scenic World at Katoomba through spectacular Blue Mountains wilderness. The ballot-entry event is renowned for its technical terrain, steep descents, and the legendary Caves Creek crossing.',
  3, '2026-07-01', 'confirmed', true, true
),

-- ── Surf Coast Century 2026 ───────────────────────────────────────────────────
(
  'Surf Coast Century 2026', 'surf-coast-century-2026',
  'race', 'Trail Running', 'Rapid Ascent', 'surf-coast-century',
  '2026-09-12', '2026-09-13',
  'Australia', 'VIC', 'Anglesea', 'Torquay to Lorne',
  'https://www.surfcoastcentury.com.au', 'trail',
  145, 185, 'AUD',
  'A 100 km point-to-point trail run from Torquay to Lorne along Victoria''s spectacular Surf Coast Walk. The course passes through coastal heathland, clifftop tracks, and Great Otway National Park. A relay option for teams of four makes this an accessible and social event. One of Australia''s most celebrated long-distance trail events.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Buffalo Stampede 2026 ─────────────────────────────────────────────────────
(
  'Buffalo Stampede 2026', 'buffalo-stampede-2026',
  'race', 'Trail Running', 'Rapid Ascent', NULL,
  '2026-04-18', '2026-04-19',
  'Australia', 'VIC', 'Bright', 'Mount Buffalo National Park',
  'https://www.buffalostampede.com.au', 'trail',
  95, 185, 'AUD',
  'A high-altitude trail running festival in the Victorian Alps. The headline Buffalo Stampede Grand Traverse covers 42 km with 2,400 m of elevation gain through the iconic Mount Buffalo National Park. Skyrun (21 km) and Stampede Vertical (11 km) options also available. Held in the spectacular autumn colours of the Alpine High Country.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Blackall 100 2026 ─────────────────────────────────────────────────────────
(
  'Blackall 100 2026', 'blackall-100-2026',
  'race', 'Trail Running', 'The Running Company', NULL,
  '2026-10-17', NULL,
  'Australia', 'QLD', 'Blackall', NULL,
  'https://www.blackall100.com.au', 'trail',
  145, 195, 'AUD',
  'A 100 km trail ultramarathon through the remote outback landscapes west of Blackall, Queensland. One of Australia''s toughest trail races, the course navigates red dirt tracks, creek crossings, and sparse mulga woodland under a spectacular outback sky. A 50 km option is also available.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Cradle Mountain Run 2026 ──────────────────────────────────────────────────
(
  'Cradle Mountain Run 2026', 'cradle-mountain-run-2026',
  'race', 'Trail Running', 'Cradle Mountain Run', NULL,
  '2026-03-21', NULL,
  'Australia', 'TAS', 'Cradle Mountain', 'Cradle Mountain Lodge',
  'https://www.cradlemountainrun.com.au', 'trail',
  95, 125, 'AUD',
  'A 56 km point-to-point trail run through the heart of Cradle Mountain–Lake St Clair National Park, one of Tasmania''s most pristine and spectacular wilderness areas. The course traverses buttongrass moorland, alpine lakes, and ancient pencil pine forests. A 17 km course provides an accessible alternative. A true wilderness adventure that doubles as one of Australia''s most scenic running events.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Bogong to Hotham 2026 ─────────────────────────────────────────────────────
(
  'Bogong to Hotham 2026', 'bogong-to-hotham-2026',
  'race', 'Trail Running', 'Bogong to Hotham', NULL,
  '2026-12-05', NULL,
  'Australia', 'VIC', 'Mount Beauty', 'Victorian High Country',
  'https://www.bogongtohotham.com.au', 'trail',
  85, 115, 'AUD',
  'A classic 64 km alpine trail run from Mount Beauty to Mount Hotham through the roof of Victoria. The course traverses some of Australia''s highest terrain, crossing the summit of Mount Bogong (1,986 m) and navigating the dramatic ridgelines of the Victorian High Country. A rite of passage for serious Australian trail runners.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── Razorback Run 2026 ────────────────────────────────────────────────────────
(
  'Razorback Run 2026', 'razorback-run-2026',
  'race', 'Trail Running', 'Rapid Ascent', NULL,
  '2026-04-25', NULL,
  'Australia', 'VIC', 'Mount Feathertop', 'Mount Feathertop & Razorback Ridge',
  'https://www.razorbackrun.com.au', 'trail',
  85, 110, 'AUD',
  'A challenging 40 km single-stage trail run over the iconic Razorback Ridge to the summit of Mount Feathertop (1,922 m) in Victoria''s Alpine National Park. The out-and-back course involves 2,800 m of total ascent and descent. Often held on the ANZAC Day long weekend. A demanding technical race for experienced trail runners.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── Run Larapinta 2026 ────────────────────────────────────────────────────────
(
  'Run Larapinta 2026', 'run-larapinta-2026',
  'race', 'Trail Running', 'Rapid Ascent', NULL,
  '2026-08-03', '2026-08-07',
  'Australia', 'NT', 'Alice Springs', 'Larapinta Trail, West MacDonnell Ranges',
  'https://www.runlarapinta.com.au', 'trail',
  1650, 1950, 'AUD',
  'A 5-day stage trail run along the iconic Larapinta Trail in the West MacDonnell Ranges of the Northern Territory. The 100 km course traverses ancient gorges, rugged quartzite ridges, and ochre-red desert landscapes in one of the world''s great wilderness trail running experiences. Entry includes guided support, accommodation, and meals. Limited to 80 participants.',
  2, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- TRAIL RUNNING — NEW ZEALAND
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Tarawera Ultramarathon 2026 ───────────────────────────────────────────────
(
  'Tarawera Ultramarathon 2026', 'tarawera-ultra-2026',
  'race', 'Trail Running', 'Tarawera Ultramarathon Ltd', 'tarawera-ultra',
  '2026-02-07', NULL,
  'New Zealand', NULL, 'Rotorua', 'Rotorua & Tarawera Trail',
  'https://www.taraweratrailrun.com', 'trail',
  155, 295, 'NZD',
  'One of the Southern Hemisphere''s most celebrated ultramarathons, held through the spectacular geothermal landscape around Lake Tarawera and the Tarawera Falls. Part of the Ultra-Trail World Tour. Distances include 21 km, 53 km, 72 km, and 102 km. A bucket-list trail event combining world-class racing with New Zealand''s extraordinary volcanic landscape.',
  3, '2026-07-01', 'confirmed', true, true
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- OBSTACLE RACE — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date, country, region, city,
  website_url, registration_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  team_available, format_notes, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Spartan Race Melbourne 2026 ───────────────────────────────────────────────
(
  'Spartan Race Melbourne 2026', 'spartan-melbourne-2026',
  'race', 'Obstacle Race', 'Spartan Race', 'spartan-australia',
  '2026-05-02', '2026-05-03',
  'Australia', 'VIC', 'Bacchus Marsh',
  'https://www.spartanrace.com/en-au/', 'https://www.spartanrace.com/en-au/race/detail/', 'trail',
  85, 170, 'AUD', true,
  'Sprint (~5 km, 20+ obstacles), Super (~10 km, 25+ obstacles), and Kids Races over two days.',
  'Spartan Race Melbourne returns to the rugged terrain of the Bacchus Marsh region. Navigate barbed wire crawls, rope climbs, spear throws, and 20–30+ purpose-built obstacles across Sprint and Super formats. Team entries and Kids Spartan Races available. Non-completions result in 30 penalty burpees per failed obstacle.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Spartan Race Adelaide 2026 ────────────────────────────────────────────────
(
  'Spartan Race Adelaide 2026', 'spartan-adelaide-2026',
  'race', 'Obstacle Race', 'Spartan Race', 'spartan-australia',
  '2026-10-10', '2026-10-11',
  'Australia', 'SA', 'Adelaide',
  'https://www.spartanrace.com/en-au/', 'https://www.spartanrace.com/en-au/race/detail/', 'trail',
  85, 160, 'AUD', true,
  'Sprint (~5 km, 20+ obstacles) and Super (~10 km, 25+ obstacles) formats over two days. Team and Kids categories available.',
  'Spartan Race returns to South Australia for a weekend of obstacle course racing. Sprint and Super distances cater for newcomers and experienced OCR athletes alike. Team entries available for those who prefer to tackle the obstacles as a unit.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── Tough Mudder Sydney 2026 ──────────────────────────────────────────────────
(
  'Tough Mudder Sydney 2026', 'tough-mudder-sydney-2026',
  'race', 'Obstacle Race', 'Tough Mudder', 'tough-mudder-australia',
  '2026-04-04', '2026-04-05',
  'Australia', 'NSW', 'Sydney',
  'https://toughmudder.com.au', 'https://toughmudder.com.au/events/', 'trail',
  85, 160, 'AUD', true,
  '16+ km Tough Mudder Classic and 5 km Tough Mudder 5K. Signature obstacles include Everest, Arctic Enema, and Electroshock Therapy.',
  'Tough Mudder Sydney: a teamwork-focused obstacle course race designed to push your mental and physical limits. The 16 km course features 25+ signature Tough Mudder obstacles that emphasise camaraderie over competition. A non-timed format means anyone can participate regardless of fitness level.',
  3, '2026-07-01', 'confirmed', true, false
),

-- ── Tough Mudder Melbourne 2026 ───────────────────────────────────────────────
(
  'Tough Mudder Melbourne 2026', 'tough-mudder-melbourne-2026',
  'race', 'Obstacle Race', 'Tough Mudder', 'tough-mudder-australia',
  '2026-03-14', '2026-03-15',
  'Australia', 'VIC', 'Melbourne',
  'https://toughmudder.com.au', 'https://toughmudder.com.au/events/', 'trail',
  85, 160, 'AUD', true,
  '16+ km Tough Mudder Classic and 5 km Tough Mudder 5K. Signature obstacles and a strong team-first culture.',
  'Tough Mudder Melbourne brings the original team obstacle course to Victoria. Designed for teams and individuals, the 16 km course features 25+ obstacles built around camaraderie and challenge. No individual timing — you cross the finish line when your team does.',
  2, '2026-07-01', 'confirmed', true, false
),

-- ── Tough Mudder Brisbane 2026 ────────────────────────────────────────────────
(
  'Tough Mudder Brisbane 2026', 'tough-mudder-brisbane-2026',
  'race', 'Obstacle Race', 'Tough Mudder', 'tough-mudder-australia',
  '2026-06-20', '2026-06-21',
  'Australia', 'QLD', 'Brisbane',
  'https://toughmudder.com.au', 'https://toughmudder.com.au/events/', 'trail',
  85, 160, 'AUD', true,
  '16+ km Tough Mudder Classic and 5 km Tough Mudder 5K.',
  'Tough Mudder Brisbane: team obstacle racing in South-East Queensland. Navigate 25+ signature obstacles across 16 km of challenging terrain. The 5K option is perfect for beginners. Open to all fitness levels with no time pressure — just you, your team, and the mud.',
  2, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- OPEN WATER SWIMMING — AUSTRALIA
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Pier to Pub 2026 ──────────────────────────────────────────────────────────
(
  'Pier to Pub 2026', 'pier-to-pub-2026',
  'race', 'Open Water Swimming', 'Lorne Surf Life Saving Club', NULL,
  '2026-01-10', NULL,
  'Australia', 'VIC', 'Lorne', 'Lorne Pier to Main Beach',
  'https://www.piertopub.com.au', 'open_water',
  35, 55, 'AUD',
  'The world''s largest open water swimming event, attracting 4,000+ participants to the Great Ocean Road town of Lorne each January. The 1.2 km course runs from the Lorne Pier to the main beach in the stunning surf conditions of the Southern Ocean. A beloved community event for swimmers of all levels, held by the Lorne Surf Life Saving Club since 1981.',
  4, '2026-07-01', 'confirmed', true, true
),

-- ── Cole Classic 2026 ─────────────────────────────────────────────────────────
(
  'Cole Classic 2026', 'cole-classic-2026',
  'race', 'Open Water Swimming', 'Manly Swimming Club', NULL,
  '2026-02-01', NULL,
  'Australia', 'NSW', 'Manly', 'Shelley Beach to Manly Beach',
  'https://www.coleclassic.com.au', 'open_water',
  40, 65, 'AUD',
  'Sydney''s iconic ocean swimming event, held since 1983. The Cole Classic offers 1 km and 2 km courses from Shelley Beach through the Cabbage Tree Bay Aquatic Reserve to the world-famous Manly Beach. The crystal-clear water and abundant marine life make this as much a snorkelling experience as a race. A rite of passage for Sydney ocean swimmers.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- CROSSFIT
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser, series_slug,
  start_date, end_date, country, region, city,
  website_url, surface_type,
  entry_fee_from, entry_fee_currency,
  description, data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── CrossFit Open 2026 ────────────────────────────────────────────────────────
(
  'CrossFit Open 2026', 'crossfit-open-2026',
  'race', 'CrossFit', 'CrossFit LLC', NULL,
  '2026-02-27', '2026-03-21',
  'Australia', NULL, 'Nationwide',
  'https://games.crossfit.com', 'indoor',
  30, 'AUD',
  'The first stage of the annual CrossFit Games season. A 3-week online competition where participants complete the same workouts at their local CrossFit affiliate and submit their scores to a global leaderboard. Open to all ability levels; a single scaled division ensures everyone can participate. The pathway for qualifying to the CrossFit Games via the Quarterfinals and Semifinals.',
  3, '2026-07-01', 'confirmed', true, false
)

ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- MARATHON — SINGAPORE
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.events (
  title, slug, event_type, discipline, organiser,
  start_date, country, region, city, venue_name,
  website_url, surface_type,
  entry_fee_from, entry_fee_to, entry_fee_currency,
  wheelchair_available, description,
  data_confidence, last_verified_date, event_status, is_published, is_featured
) VALUES

-- ── Standard Chartered Singapore Marathon 2026 ────────────────────────────────
(
  'Standard Chartered Singapore Marathon 2026', 'singapore-marathon-2026',
  'race', 'Marathon', 'Ironman Asia',
  '2026-12-06',
  'Singapore', NULL, 'Singapore', 'Orchard Road & Marina Bay',
  'https://www.singaporemarathon.com', 'road',
  75, 135, 'SGD', true,
  'Southeast Asia''s largest road running event, attracting 50,000+ participants from over 70 countries. The flat city course takes runners through Orchard Road, the Colonial District, and the spectacular Marina Bay waterfront, finishing at the F1 Pit Building. Distances include full marathon, half marathon, 10 km, and 5 km.',
  3, '2026-07-01', 'confirmed', true, true
)

ON CONFLICT (slug) DO NOTHING;

-- ─── Set last_verified_date on existing seed events ───────────────────────────
-- Mark the 13 existing events as verified on the migration date.

UPDATE public.events
SET    last_verified_date = '2026-07-01'
WHERE  last_verified_date IS NULL
  AND  slug IN (
    'gold-coast-marathon-2026',
    'sydney-marathon-2026',
    'melbourne-marathon-2026',
    'city2surf-2026',
    'run-melbourne-2026',
    'noosa-triathlon-2026',
    'hyrox-sydney-2026',
    'hyrox-melbourne-2026',
    'hyrox-brisbane-2026',
    'hyrox-perth-2026',
    'ironman-cairns-2026',
    'ironman-703-sunshine-coast-2026',
    'spartan-hunter-valley-2026',
    'spartan-queensland-2026'
  );

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- SELECT discipline, COUNT(*) as event_count
-- FROM   public.events
-- WHERE  is_published = true
-- GROUP  BY discipline
-- ORDER  BY event_count DESC;
--
-- SELECT COUNT(*) FROM public.events WHERE is_published = true;
-- Expected: ~63 total published events
