-- Sprint 28: Event Detail Intelligence
-- Adds event-specific content and travel intelligence fields to events table.
-- All columns nullable and backward-compatible — zero existing data affected.
-- Travel pipeline: future checkers submit via import_queue (no new tables needed).

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_specific_overview          text,
  ADD COLUMN IF NOT EXISTS public_transport_url             text,
  ADD COLUMN IF NOT EXISTS parking_url                      text,
  ADD COLUMN IF NOT EXISTS spectator_info_url               text,
  ADD COLUMN IF NOT EXISTS cbd_to_venue_public_transport_time text,
  ADD COLUMN IF NOT EXISTS cbd_to_venue_uber_time           text,
  ADD COLUMN IF NOT EXISTS cbd_to_venue_uber_price_aud      text,
  ADD COLUMN IF NOT EXISTS parking_notes                    text,
  ADD COLUMN IF NOT EXISTS spectator_notes                  text,
  ADD COLUMN IF NOT EXISTS travel_source_url                text,
  ADD COLUMN IF NOT EXISTS travel_last_verified_date        date,
  ADD COLUMN IF NOT EXISTS travel_data_confidence           smallint
    CHECK (travel_data_confidence BETWEEN 1 AND 5);

-- ─── Event-specific overviews ─────────────────────────────────────────────────
-- Only populated where facts are verifiable from public knowledge.
-- Sources: official event websites, geography, well-established public records.

-- IRONMAN Western Australia (Busselton)
UPDATE public.events SET
  event_specific_overview = 'IRONMAN Western Australia is held in the coastal town of Busselton, approximately 240 kilometres south of Perth. The race is defined by one of the most visually distinctive swim courses in long-course triathlon: athletes swim within the protected waters of Geographe Bay alongside the Busselton Jetty — the longest timber-piled jetty in the Southern Hemisphere at 1.84 kilometres. The flat bike course tours the South West Highway corridor through dairy farmland and wine country before athletes return to the Busselton foreshore for the marathon run. Busselton is the gateway to the Margaret River wine region, making the race weekend a popular destination trip for athletes and supporters travelling from the eastern states.'
WHERE slug = 'ironman-western-australia-2026';

-- IRONMAN New Zealand (Lake Taupo)
UPDATE public.events SET
  event_specific_overview = 'IRONMAN New Zealand takes place on the shores of Lake Taupo — New Zealand''s largest lake, formed by one of the most violent volcanic eruptions in recorded history. Athletes swim in the lake''s clear freshwater before heading out onto State Highway 1 along the Taupo lakeshore and into the Central Plateau, with the volcanic peaks of Tongariro National Park — including Mount Ruapehu and Mount Ngauruhoe — dominating the horizon on the bike course. The run follows the eastern shoreline of the lake, finishing in the heart of Taupo township where the streets line with supporters for the final kilometres.'
WHERE slug = 'ironman-new-zealand-2026';

-- Six Foot Track Marathon (Blue Mountains)
UPDATE public.events SET
  event_specific_overview = 'The Six Foot Track Marathon follows the historic Six Foot Track, a bridle trail originally cut in the 1880s to connect the Blue Mountains township of Katoomba to the Jenolan Caves limestone system. The 45-kilometre route begins at Katoomba Oval, descends approximately 400 metres into the Megalong Valley, crosses the Cox''s River, and climbs back through Blue Mountains National Park to finish at the Jenolan Caves House. The event has continuous running history dating to the early 1980s, making it one of the oldest trail races in Australia and a landmark event on the domestic trail calendar.'
WHERE slug = 'six-foot-track-marathon-2026';

-- Pier to Pub (Lorne)
UPDATE public.events SET
  event_specific_overview = 'The Pier to Pub is a 1.2-kilometre ocean swim from the Lorne pier to the main beach, held each January in the Great Ocean Road town of Lorne, Victoria. First staged in 1981, the event attracts thousands of participants ranging from elite open-water swimmers to first-time ocean swimmers. The compact Lorne foreshore means spectators line the beach from start to finish, creating an atmosphere that is unusually intimate for an event of its size. Water temperature in January is typically 18–21°C — bracing but manageable without a wetsuit for most swimmers.'
WHERE slug = 'pier-to-pub-2026';

-- Tarawera Ultramarathon (Rotorua)
UPDATE public.events SET
  event_specific_overview = 'The Tarawera Ultramarathon takes place in the volcanic heartland of the North Island''s Bay of Plenty, traversing the shores of Lake Tarawera and the ancient podocarp forests of the Whirinaki Te Pua-a-Tāne Conservation Park. The landscape carries the story of the 1886 Tarawera eruption — one of New Zealand''s most powerful historical eruptions — which reshaped the lake, the forests and the villages along its shores. Race distances range from 21 km to 102 km, with all distances sharing the volcanic terrain, geothermal features and beech forest sections that make the Tarawera Trail one of the most scenic running routes in New Zealand.'
WHERE slug = 'tarawera-ultra-2026';

-- Cradle Mountain Run (Tasmania)
UPDATE public.events SET
  event_specific_overview = 'The Cradle Mountain Run takes athletes through the heart of the Tasmanian Wilderness World Heritage Area, following the opening leg of the Overland Track — one of Australia''s most celebrated long-distance walks. Runners traverse alpine moorland, dolerite boulder fields, buttongrass plains and the edges of Crater Lake before reaching the distinctive silhouette of Cradle Mountain (1,545 m) at the course turnaround. The event operates in close coordination with the Parks and Wildlife Service to protect the World Heritage landscape — start times are staggered to manage impact on the fragile alpine environment.'
WHERE slug = 'cradle-mountain-run-2026';

-- Bogong to Hotham (Victorian Alps)
UPDATE public.events SET
  event_specific_overview = 'The Bogong to Hotham traverse links two of Victoria''s highest peaks — Mount Bogong (1,986 m, the state''s highest summit) and Mount Hotham (1,861 m) — through the high-country terrain of the Alpine National Park. The 64-kilometre course is run almost entirely at altitude, crossing exposed ridgelines, snowgum forests and the Bogong High Plains. Conditions can change rapidly: snow, hail and strong winds are possible even in summer, and mandatory gear requirements reflect the serious alpine environment athletes are entering.'
WHERE slug = 'bogong-to-hotham-2026';

-- Queenstown International Marathon (New Zealand)
UPDATE public.events SET
  event_specific_overview = 'The Queenstown International Marathon runs through the Wakatipu Basin with the Remarkables mountain range forming a near-constant backdrop. The full marathon begins near the historic gold-rush town of Arrowtown and follows a point-to-point course along the shores of Lake Wakatipu and through the vineyard country of the basin floor, finishing on the Queenstown waterfront. The Southern Lakes region in November offers some of the most spectacular early-summer scenery in New Zealand, and the event is popular with international athletes combining a race entry with a New Zealand visit.'
WHERE slug = 'queenstown-international-marathon-2026';

-- Rotorua Marathon (New Zealand)
UPDATE public.events SET
  event_specific_overview = 'The Rotorua Marathon is run through the geothermal landscape of the central North Island, circling Lake Rotorua and passing through Government Gardens — the ornate Edwardian park that sits at the centre of the city. The course passes the Whakarewarewa geothermal valley and the Te Puia cultural centre, and the sulphur-tinged air unique to Rotorua is a sensory feature of the race that athletes either love or remember forever. Lake Rotorua is one of the largest lakes in New Zealand and was formed by a caldera collapse.'
WHERE slug = 'rotorua-marathon-2026';

-- Run Larapinta (Northern Territory)
UPDATE public.events SET
  event_specific_overview = 'Run Larapinta follows sections of the Larapinta Trail, a 223-kilometre walking track that traverses the ancient quartzite ridges of the West MacDonnell Ranges west of Alice Springs. The ranges are among the oldest surviving mountain chains on Earth, with rock formations dating back more than one billion years. Race distances range from 15 km to 100 km across red desert terrain characterised by sharp quartzite ridgelines, river red gum creek beds, and the silence of the Central Australian desert. The event takes place on Arrernte Country, and the Larapinta Trail itself incorporates numerous sites of deep cultural significance to the Western Arrernte people.'
WHERE slug = 'run-larapinta-2026';

-- Surf Coast Century (Victoria)
UPDATE public.events SET
  event_specific_overview = 'The Surf Coast Century covers 100 kilometres of the Great Ocean Walk trail system along the Victoria surf coast west of Anglesea. The course follows clifftop tracks above the Southern Ocean, through coastal heathland and banksia scrub, and along sections of remote surf beach accessible only on foot. The Otway Ranges that back the coast create a microclimate with high rainfall — mud, wet rock and unpredictable conditions are routine features of the race. Relay teams of two, four, and ten runners make the event accessible to groups alongside individual entrants.'
WHERE slug = 'surf-coast-century-2026';

-- Buffalo Stampede (Mount Buffalo, Victoria)
UPDATE public.events SET
  event_specific_overview = 'The Buffalo Stampede is set on the Mount Buffalo plateau — a distinctive granite massif in the Victorian Alps that rises to 1,723 metres above the Ovens Valley. The plateau''s granite tors, alpine meadows and the famous Gorge walking track give the course its technical character. The Stampede includes distances from 11 km to a 55 km ultra that reaches the summit of Mount Buffalo and covers the full length of the plateau''s escarpment rim. The event is held in the Mount Buffalo National Park, which was Victoria''s first national park, gazetted in 1898.'
WHERE slug = 'buffalo-stampede-2026';
