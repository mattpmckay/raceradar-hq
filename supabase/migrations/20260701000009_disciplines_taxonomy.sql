-- ============================================================
-- Sprint 25: Discipline Taxonomy & Series Tables
--
-- Creates two tables:
--   disciplines — SEO landing pages per discipline with content slots
--   series      — named race series (mirrors events.series_slug)
--
-- Design: disciplines.event_discipline_values[] joins to
-- events.discipline text — no FK, allows many-to-one groupings
-- (e.g. 'Ironman' + 'Ironman 70.3' both → slug 'ironman').
--
-- series.slug mirrors events.series_slug exactly.
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── disciplines ─────────────────────────────────────────────────────────────

CREATE TABLE public.disciplines (
  id                        uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                      text        UNIQUE NOT NULL,
  name                      text        NOT NULL,
  short_description         text,
  overview_content          text,
  first_timer_guide         text,
  faqs                      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  icon_name                 text,
  color                     text        NOT NULL DEFAULT '#00D9A6',
  related_discipline_slugs  text[]      NOT NULL DEFAULT '{}',
  event_discipline_values   text[]      NOT NULL DEFAULT '{}',
  order_index               integer     NOT NULL DEFAULT 0,
  is_active                 boolean     NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disciplines_public_read"
  ON public.disciplines FOR SELECT USING (is_active = true);

-- ─── series ──────────────────────────────────────────────────────────────────

CREATE TABLE public.series (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              text        UNIQUE NOT NULL,
  name              text        NOT NULL,
  discipline_slug   text        REFERENCES public.disciplines(slug) ON DELETE SET NULL,
  organiser         text,
  short_description text,
  website_url       text,
  country           text        NOT NULL DEFAULT 'Australia',
  is_active         boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "series_public_read"
  ON public.series FOR SELECT USING (is_active = true);

-- ─── indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX disciplines_slug_idx          ON public.disciplines (slug);
CREATE INDEX disciplines_order_idx         ON public.disciplines (order_index) WHERE is_active = true;
CREATE INDEX series_slug_idx               ON public.series (slug);
CREATE INDEX series_discipline_slug_idx    ON public.series (discipline_slug);

-- ─── seed: disciplines ────────────────────────────────────────────────────────

INSERT INTO public.disciplines
  (slug, name, short_description, overview_content, first_timer_guide, event_discipline_values,
   color, icon_name, order_index, related_discipline_slugs, faqs)
VALUES

(
  'hyrox', 'HYROX',
  'The world''s fastest-growing indoor fitness race — 8 × 1 km runs and 8 functional fitness stations under a single roof.',
  'HYROX is a standardised fitness race format designed so that every result is globally comparable. The course never changes: 8 kilometres of running broken into 8 × 1 km legs, each followed by a functional fitness station (SkiErg, Sled Push, Sled Pull, Burpee Broad Jump, Rowing, Farmer''s Carry, Sandbag Lunges, Wall Balls). Because every HYROX event worldwide uses identical stations, distances and weights, your Sydney finish time is directly comparable to results from Melbourne, London or New York.

HYROX is open to all fitness levels. The Open Individual division has no weight vest and no prerequisites beyond a willingness to work hard. Doubles (2 athletes alternating) and Relay (4 athletes) divisions make it accessible to training partners and groups. The Pro division adds a weight vest and shortened station distances for competitive athletes targeting the HYROX World Championships.',
  'If you can run 5 km without stopping and have 3+ months of gym experience, you are ready to start a HYROX training block. Most first-timers target a 12–16 week preparation period.

The key mistake first-timers make is over-preparing on the functional stations and neglecting running. Your 1 km run splits between stations are where most time is lost. A typical first-timer finishes the stations fine but bleeds minutes on slow running laps.

Start your training by running at race pace (approximately your 10 km race pace) immediately after each station. The fatigue transition — going from rowing straight into a 1 km run — is the unique challenge HYROX presents.

On race day: seed yourself honestly in a wave, pace the first three runs conservatively, and leave everything on the Wall Balls.',
  ARRAY['HYROX'],
  '#00D9A6', 'Dumbbell', 10,
  ARRAY['deka-fit', 'crossfit'],
  '[
    {"question": "Do I need prior experience to enter HYROX?", "answer": "No experience is required. HYROX Open is designed for all fitness levels. If you can run 5 km and have basic gym experience, you have the foundation to complete HYROX with a 12–16 week preparation block."},
    {"question": "What divisions are available at HYROX?", "answer": "HYROX offers Open Individual, Pro Individual (with weight vest), Doubles (2 athletes alternating stations and sharing runs), and Relay (4 athletes splitting all exercises). Most first-timers enter Open Individual."},
    {"question": "How long does HYROX take to complete?", "answer": "Finish times range from under 60 minutes for elite athletes to 90–120 minutes for recreational participants. Most first-timers aim for 90–110 minutes in the Open division."},
    {"question": "Are HYROX results comparable between events?", "answer": "Yes — this is one of HYROX''s defining features. Every event worldwide uses the exact same stations, distances and weights, so your Sydney finish time is directly comparable to results from Melbourne, London or New York."},
    {"question": "What should I train for HYROX?", "answer": "The key is running endurance combined with functional fitness. Focus on: rowing, SkiErg, sled pushes and pulls, wall balls and farmer''s carries — plus consistent running. Your running pace between stations is where most athletes lose the most time."},
    {"question": "How much does HYROX cost in Australia?", "answer": "Australian HYROX events typically cost $155–$200 AUD for Individual entry. Doubles and Relay entries are priced per team. Check the official HYROX website for current pricing as fees vary by event."}
  ]'::jsonb
),

(
  'marathon', 'Marathon',
  'The ultimate running distance — 42.195 km of road, the benchmark goal for long-distance runners at every level.',
  'The marathon — 42.195 km — is the gold standard distance in road running, one of the oldest and most celebrated athletic challenges in the world. Whether you are running your first marathon or chasing a personal best, the distance tests physical preparation, mental resilience and pacing discipline in equal measure.

Australia hosts some of the world''s most iconic marathon courses. The Sydney Marathon passes the Opera House and crosses the Harbour Bridge. The Melbourne Marathon starts and finishes at the MCG. The Gold Coast Marathon is one of the fastest courses in the Asia Pacific region, drawing elite and recreational runners from over 50 countries.',
  'For most runners, a marathon requires 16–20 weeks of structured training from a solid base. Before starting a marathon training plan, you should comfortably run 30–35 km per week across 4–5 sessions.

The biggest first-timer mistake is going out too fast. Your first 21 km should feel easy — almost embarrassingly easy. Positive splits (running the first half faster than the second) are the fastest way to a miserable last 10 km.

Nutrition matters more in a marathon than any shorter race. Practice your race-day nutrition strategy in every long run over 25 km. Gel timing, hydration and electrolytes should be automated habits before race day.

Register early. Major Australian marathons sell out quickly and several now use ballot systems.',
  ARRAY['Marathon'],
  '#60A5FA', 'Timer', 20,
  ARRAY['road-running', 'trail-running'],
  '[
    {"question": "How long does it take to train for a marathon?", "answer": "Most runners need 16–20 weeks of structured training from a solid running base (able to run 30–35 km per week comfortably). Beginners may need 6–12 months to build to this base before starting a marathon plan."},
    {"question": "What is a good marathon finishing time?", "answer": "Average recreational finish times are 4:00–5:00. Sub-4:00 is a strong recreational time. Sub-3:30 enters competitive territory. Sub-3:00 is elite amateur. Boston Qualifier times vary by age group — check the BAA website for current standards."},
    {"question": "What should I eat before a marathon?", "answer": "Carbohydrate-load in the 2–3 days before the race, and eat a familiar high-carb meal 3 hours before your start time. Nothing new on race day — stick to foods your gut already knows from training."},
    {"question": "Do I need to enter a ballot for Australian marathons?", "answer": "The Sydney Marathon now uses a ballot system due to demand. Gold Coast Marathon and Melbourne Marathon currently use standard entry. Check each event''s registration page for the most current process."},
    {"question": "What is the minimum age for a marathon?", "answer": "Most Australian marathons require participants to be at least 18 years old. Some events permit 16–17 year olds with parental consent. Check individual event rules for age requirements."}
  ]'::jsonb
),

(
  'road-running', 'Road Running',
  'From 5 km fun runs to half marathons — road running events for every pace, distance and ability.',
  'Road running events in Australia range from local parkruns and community fun runs to the world''s largest mass-participation events. The City2Surf — 14 km from Sydney''s Hyde Park to Bondi Beach — attracts over 80,000 participants and is the largest fun run on Earth by entry.

Half marathons (21.1 km) are the fastest-growing race distance in Australia, offering a significant challenge without the extreme training commitment of a full marathon. Most road running events offer timing, age-group awards and multiple distance options to accommodate all abilities.',
  'Beginners should start with a distance they can complete and enjoy. For a 5 km, 4–6 weeks of running three times per week is enough. For a 10 km, allow 8–12 weeks. For a half marathon (21.1 km), plan 12–16 weeks of structured training.

Invest in proper running shoes fitted at a specialty running store — it is the single most important equipment decision for a road runner. Replace them every 600–800 km.

On race day, start slower than feels comfortable. The energy of a race start will have you running faster than your training pace — resist it for the first kilometre.',
  ARRAY['Road Running'],
  '#94A3B8', 'Wind', 30,
  ARRAY['marathon', 'trail-running'],
  '[
    {"question": "What is City2Surf?", "answer": "City2Surf is a 14 km road run from Hyde Park in Sydney''s CBD to Bondi Beach, held each August. It is the world''s largest fun run by participation, attracting 80,000+ runners each year. Heartbreak Hill at Rose Bay is the key challenge."},
    {"question": "What is the difference between a road race and a fun run?", "answer": "The terms are often used interchangeably. Fun runs typically emphasise participation over competition and are shorter (5–14 km). Road races suggest a more competitive context, often with chip timing and age-group awards. Both are welcome at all fitness levels."},
    {"question": "How should I prepare for my first road race?", "answer": "Pick a distance appropriate to your current fitness. For a 5 km, 4–6 weeks of running 3x per week is enough. For a 10 km, allow 8–12 weeks. For a half marathon (21.1 km), plan 12–16 weeks of structured training including at least one long run of 18–20 km."}
  ]'::jsonb
),

(
  'obstacle-race', 'Obstacle Course Racing',
  'Mud, rope climbs, barbed wire and burpees — obstacle course racing across rugged natural terrain.',
  'Obstacle course racing (OCR) combines trail running with purpose-built obstacles on natural terrain — farms, mountains and open land. Athletes navigate mud crawls, rope climbs, barbed wire, bucket carries, spear throws and heavy carries in a race against the clock.

Spartan Race is the world''s largest OCR series, with events in the Hunter Valley, Queensland and across 40+ countries. The race distances range from the beginner-friendly Sprint (~5 km, 20+ obstacles) to the ultra-endurance Beast (~21 km, 30+ obstacles) and Ultra (50+ km). Most Australian Spartan events offer multiple formats over a single weekend.',
  'The Spartan Sprint (~5 km, 20+ obstacles) is the natural starting point for OCR newcomers. You need basic running fitness and a willingness to get dirty — no prior obstacle experience is required.

Train by running on trails (not just roads), doing grip strength work (dead hangs, pull-ups), and practising heavy carries. The rope climb, bucket brigade and spear throw are the obstacles that eliminate most first-timers — drill these specifically.

In Spartan Race, failing an obstacle means 30 burpees before you can continue. Train for this: add burpee sets to the end of your runs to simulate the penalty fatigue.',
  ARRAY['Obstacle Race', 'Obstacle Course Racing'],
  '#FF6B35', 'Mountain', 40,
  ARRAY['trail-running'],
  '[
    {"question": "Is obstacle course racing suitable for beginners?", "answer": "Yes — most obstacle races offer a beginner-friendly format. Spartan Sprint (~5 km, 20+ obstacles) is the standard entry point. You need basic running fitness and a willingness to get dirty; no prior obstacle experience is required."},
    {"question": "What happens if I can''t complete an obstacle?", "answer": "In Spartan Race, athletes who fail an obstacle must complete a 30-burpee penalty before continuing. Tough Mudder does not penalise missed obstacles — it emphasises completion and camaraderie over competition."},
    {"question": "What should I wear for an obstacle race?", "answer": "Moisture-wicking technical clothing that dries fast, trail running shoes with grip (not road shoes), and gloves if you want them for rope climbs. Avoid 100% cotton. Expect to be muddy and wet for the entire race."},
    {"question": "Can I enter as a team?", "answer": "Yes — most obstacle races offer team categories. Spartan Race has a Team Wave where groups compete together. Many athletes choose team entry for their first obstacle race experience."}
  ]'::jsonb
),

(
  'triathlon', 'Triathlon',
  'Swim, bike, run — triathlon is the ultimate multi-sport test, from sprint distance to Olympic and beyond.',
  'Triathlon combines swimming, cycling and running in a single continuous race. Distances range from the beginner-friendly Sprint (750 m / 20 km / 5 km) to the Olympic distance (1.5 km / 40 km / 10 km) and the long-course formats — 70.3 (half Ironman) and full Ironman (226 km).

The Noosa Triathlon Multi Sport Festival is one of the most celebrated triathlon events in Asia Pacific — Olympic distance on Noosa Main Beach, held the first weekend of November each year. It attracts elite athletes and recreational triathletes from across the region.',
  'Start with a Sprint or Olympic distance event. Most triathlon clubs offer learn-to-swim programs and group training rides — these are the fastest route to your first race.

The transition zone (T1: swim to bike; T2: bike to run) is the most overlooked part of triathlon preparation. Practice your transitions in training — fumbling with a wetsuit or forgetting your helmet at T1 can cost several minutes.

The run is completed in a fatigued state unlike any standalone running race. Run with bike-to-run legs in training by doing brick sessions: finish a bike ride and immediately run 2–5 km at race pace.',
  ARRAY['Triathlon'],
  '#818CF8', 'Activity', 50,
  ARRAY['ironman'],
  '[
    {"question": "What distances does triathlon come in?", "answer": "Sprint (750 m swim / 20 km bike / 5 km run), Olympic (1.5 km / 40 km / 10 km), Half / 70.3 (1.93 km / 90 km / 21.1 km), Full Ironman (3.86 km / 180.25 km / 42.2 km). Most beginners start at Sprint or Olympic distance."},
    {"question": "Do I need a road bike to do triathlon?", "answer": "No — many first-timers race on a hybrid or road bike. A TT (time-trial) bike provides aerodynamic advantage but is not required. Comfort and bike fitness matter more than equipment at the recreational level."},
    {"question": "Do I need to be able to swim in open water?", "answer": "Yes — triathlon swims are in open water (ocean, lake or river), not a pool. Open water swimming requires different skills to pool swimming: sighting (navigation), wetsuit use and managing current or chop. Practice these before race day."}
  ]'::jsonb
),

(
  'ironman', 'Ironman & 70.3',
  'Long-course triathlon — from the 113 km Ironman 70.3 to the full 226 km Ironman distance.',
  'IRONMAN is the pinnacle of long-course triathlon: a continuous 3.86 km swim, 180.25 km bike ride and 42.2 km marathon run, completed in a single day within a 17-hour cut-off. IRONMAN 70.3 is the half-distance version — 1.93 km swim, 90.12 km bike, 21.1 km run — with an 8:30 cut-off.

Both formats offer age-group qualification slots for their respective World Championships. The IRONMAN World Championship (Kona and Nice) and the IRONMAN 70.3 World Championship are the pinnacle events in long-course triathlon.

Australia hosts IRONMAN Cairns (full distance, June) and multiple IRONMAN 70.3 events including Sunshine Coast (September). Both qualify athletes for their respective World Championships.',
  'IRONMAN is a serious multi-year commitment, not a single season project. Athletes new to triathlon should start with Sprint and Olympic events before targeting 70.3, and complete at least one 70.3 before attempting full Ironman.

For a 70.3, allow a minimum of 6–12 months of structured triathlon training. For full Ironman, plan 12–18 months with a structured training plan peaking at 15–20 hours of training per week.

Race nutrition is often the deciding factor in long-course triathlon. Athletes need to consume 60–90 grams of carbohydrate per hour during the bike and run. Practice your nutrition strategy in every long training session.',
  ARRAY['Ironman', 'Ironman 70.3'],
  '#F87171', 'Zap', 60,
  ARRAY['triathlon'],
  '[
    {"question": "What is the difference between Ironman and Ironman 70.3?", "answer": "A full Ironman is 226.3 km total: 3.86 km swim + 180.25 km bike + 42.2 km run, with a 17-hour cut-off. An Ironman 70.3 is 113 km: 1.93 km swim + 90.12 km bike + 21.1 km run, with an 8:30 cut-off. Both qualify athletes for their respective World Championships."},
    {"question": "How long does it take to complete an Ironman?", "answer": "Typical recreational finish times are 10–14 hours for full Ironman. Top age-groupers finish in 8–10 hours. Professional athletes finish in 7–8 hours. The cut-off is 17 hours. IRONMAN 70.3 recreational times average 5–8 hours."},
    {"question": "How much does an Ironman cost in Australia?", "answer": "IRONMAN Cairns (full distance) typically costs $450–$650 AUD. IRONMAN 70.3 events in Australia range from $280–$420 AUD. Prices increase as the event date approaches."},
    {"question": "Do I need experience to enter Ironman?", "answer": "There are no official prerequisites, but IRONMAN strongly recommends completing Sprint and Olympic distance triathlons before attempting 70.3, and at least one 70.3 before a full Ironman. Most events require athletes to be 18 or older."}
  ]'::jsonb
),

(
  'trail-running', 'Trail Running',
  'Off-road running on mountain paths, forest tracks and natural terrain — from 10 km to 100+ km ultra distances.',
  'Trail running takes the marathon concept off-road — onto mountain paths, forest tracks and natural terrain where elevation gain, technical surface and distance combine to challenge athletes in entirely different ways to road racing.

Events range from 10 km social trail runs to 100+ km ultra-distance races requiring mandatory gear, navigation skills and days of preparation. Australia''s trail running scene spans spectacular terrain across the Blue Mountains, Tasmanian wilderness, Victorian High Country and Queensland highlands.',
  'Start with a trail event of 10–15 km that suits your current road running fitness. Trail running is slower than road running — plan for 20–30% longer finish times than your equivalent road race distance.

Gear matters: trail running shoes with grip are essential. Road shoes lack the traction needed on technical or wet terrain. Many Australian events require a mandatory gear list (hydration pack, emergency food, whistle, thermal layer) — read it thoroughly before race day.

Train on the terrain you will race on. If your event has significant elevation gain, train with elevation. GPS watch data for distance is less useful on trails — focus on time on feet rather than pace per kilometre.',
  ARRAY['Trail Running'],
  '#34D399', 'TreePine', 70,
  ARRAY['marathon', 'obstacle-race'],
  '[
    {"question": "What is the difference between trail running and road running?", "answer": "Trail running takes place on natural surfaces — dirt tracks, mountain paths, forest trails — rather than asphalt. Technical terrain, elevation gain and navigation are factors that don''t exist in road running. Finish times are typically 20–40% slower per km than road races of the same distance."},
    {"question": "Do I need special shoes for trail running?", "answer": "Yes — trail running shoes have a grip outsole designed for off-road surfaces. Road running shoes are not suitable for technical or wet trail terrain. Look for shoes with 4–6 mm lugs for most Australian trail events."},
    {"question": "What mandatory gear is required for trail races?", "answer": "Most Australian trail events over 20 km require mandatory gear: hydration pack (minimum 1.5–2 L), emergency food, first aid kit, emergency whistle, and thermal layer. The specific list varies by event — always check before race day."}
  ]'::jsonb
),

(
  'crossfit', 'CrossFit',
  'Constantly varied functional movements — weightlifting, gymnastics and metabolic conditioning at competitive intensity.',
  NULL, NULL,
  ARRAY['CrossFit'],
  '#EF4444', 'Flame', 80,
  ARRAY['hyrox', 'deka-fit'],
  '[]'::jsonb
),

(
  'deka-fit', 'Deka Fit',
  'An indoor fitness race — 10 × 500 m runs alternating with 10 functional workout stations. All results globally comparable.',
  NULL, NULL,
  ARRAY['Deka Fit'],
  '#A78BFA', 'BarChart2', 90,
  ARRAY['hyrox', 'crossfit'],
  '[]'::jsonb
);

-- ─── seed: series ─────────────────────────────────────────────────────────────

INSERT INTO public.series
  (slug, name, discipline_slug, organiser, short_description, website_url, country)
VALUES
(
  'hyrox-australia',
  'HYROX Australia',
  'hyrox', 'HYROX',
  'The HYROX race series across Australian cities — Sydney, Melbourne, Brisbane and Perth. Every event uses the identical standardised format so all results are directly comparable.',
  'https://hyrox.com/events/australia/',
  'Australia'
),
(
  'spartan-australia',
  'Spartan Race Australia',
  'obstacle-race', 'Spartan Race',
  'Spartan Race''s Australian obstacle course racing calendar — Sprint, Super, Beast and Ultra formats across natural terrain in NSW and QLD.',
  'https://www.spartanrace.com/en-au/',
  'Australia'
),
(
  'gold-coast-marathon',
  'Gold Coast Marathon',
  'marathon', 'Gold Coast Marathon',
  'Australia''s largest road running event and one of the biggest marathons in the Southern Hemisphere by entry. Held on the Gold Coast each July since 1979.',
  'https://www.goldcoastmarathon.com.au',
  'Australia'
),
(
  'sydney-marathon',
  'Sydney Marathon',
  'marathon', 'Sydney Running Festival',
  'Part of the Sydney Running Festival — a point-to-point route past the Opera House forecourt and across the Sydney Harbour Bridge. Abbott World Marathon Majors Wanda Age Group affiliated.',
  'https://www.sydneymarathon.com',
  'Australia'
),
(
  'melbourne-marathon',
  'Melbourne Marathon',
  'marathon', 'Melbourne Marathon',
  'Australia''s oldest marathon, first held in 1978. The MCG start and finish line is one of the most iconic moments in Australian road running.',
  'https://www.melbournemarathon.com.au',
  'Australia'
),
(
  'city2surf',
  'City2Surf',
  'road-running', 'Upworthy Events',
  'The world''s largest fun run by participation — 14 km from Sydney''s Hyde Park to Bondi Beach, past the famous Heartbreak Hill at Rose Bay. 80,000+ participants each August.',
  'https://city2surf.com.au',
  'Australia'
),
(
  'run-melbourne',
  'Run Melbourne',
  'marathon', 'Run Melbourne',
  'Melbourne''s mid-winter running festival with a flat CBD loop course. Distances from a 3 km family fun run to the full marathon, all designed for personal bests.',
  'https://www.runmelbourne.com.au',
  'Australia'
),
(
  'noosa-triathlon',
  'Noosa Triathlon',
  'triathlon', 'Noosa Triathlon',
  'One of Asia Pacific''s most celebrated triathlons — Olympic distance on Noosa Main Beach, held the first weekend of November each year.',
  'https://www.noosatri.com.au',
  'Australia'
),
(
  'ironman-cairns',
  'IRONMAN Cairns',
  'ironman', 'Ironman Oceania',
  'Full-distance IRONMAN in tropical Cairns — swim in Trinity Inlet, bike through the Atherton Tablelands, run the Esplanade. Kona and World Championship qualifier.',
  'https://www.ironman.com/im-cairns',
  'Australia'
),
(
  'ironman-703-sunshine-coast',
  'IRONMAN 70.3 Sunshine Coast',
  'ironman', 'Ironman Oceania',
  'Half-distance IRONMAN at Mooloolaba Beach on the Sunshine Coast — ocean swim, hinterland bike leg, two-lap Esplanade run. IRONMAN 70.3 World Championship qualifier.',
  'https://www.ironman.com/im703-sunshine-coast',
  'Australia'
);

-- ─── verify ──────────────────────────────────────────────────────────────────
-- SELECT slug, name, array_length(event_discipline_values, 1) as ev_count
-- FROM public.disciplines ORDER BY order_index;
--
-- SELECT slug, name, discipline_slug FROM public.series ORDER BY name;
