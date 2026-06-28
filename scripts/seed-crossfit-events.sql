-- RaceRadar HQ — CrossFit APAC Events seed
-- Sources: games.crossfit.com, torianpro.com, fareastthrowdown.com,
--          urbanthrowdown.com, downunderchampionship.com, ausfitnessexpo.com.au,
--          championshipeventseries.com, japanchampionship.com,
--          mastersleague.com.au, thetrinitythrowdown.com,
--          competitioncorner.net, borneopangazou Instagram
--
-- Past events are included with is_published=false for historical completeness.
-- Upcoming events use is_published=true.
--
-- Run this in: Supabase Dashboard → SQL Editor
-- OR use: set -a && source .env.local && set +a && node scripts/insert-crossfit-events.js

INSERT INTO events (title, slug, discipline, event_type, city, country, start_date, end_date, website_url, description, is_published, is_featured)
VALUES

-- ── Past events (is_published=false) ─────────────────────────────────────────

('Thailand Throwdown 2026',
 'thailand-throwdown-2026',
 'CrossFit', 'competition', 'Chiang Mai', 'Thailand',
 '2026-01-24', '2026-01-25',
 'https://competitioncorner.net/events/19129/details',
 'Venue: CrossFit Chiang Mai (CFCNX)',
 false, false),

('Trinity Throwdown Brisbane 2026',
 'trinity-throwdown-brisbane-2026',
 'CrossFit', 'competition', 'Brisbane', 'Australia',
 '2026-04-18', '2026-04-18',
 'https://www.thetrinitythrowdown.com/events',
 'Venue: Brisbane Showgrounds',
 false, false),

('Far East Throwdown 2026',
 'far-east-throwdown-2026',
 'CrossFit', 'competition', 'Busan', 'South Korea',
 '2026-05-01', '2026-05-03',
 'https://fareastthrowdown.com/',
 'Venue: BEXCO, Busan Exhibition & Convention Centre | CrossFit Semifinal',
 false, false),

('TYR Torian Pro 2026',
 'tyr-torian-pro-2026',
 'CrossFit', 'competition', 'Brisbane', 'Australia',
 '2026-05-22', '2026-05-24',
 'https://www.torianpro.com/',
 'Venue: Pat Rafter Arena, Queensland Tennis Centre | CrossFit Semifinal',
 false, false),

-- ── Upcoming events (is_published=true) ───────────────────────────────────────

('Jeju Island Makia 2026',
 'jeju-island-makia-2026',
 'CrossFit', 'competition', 'Jeju City', 'South Korea',
 '2026-07-24', '2026-07-26',
 'https://games.crossfit.com/competitions',
 'CrossFit Licensed Event',
 true, false),

('Borneo Pangazou 2026',
 'borneo-pangazou-2026',
 'CrossFit', 'competition', 'Kota Kinabalu', 'Malaysia',
 '2026-08-21', '2026-08-23',
 'https://www.instagram.com/borneopangazou/',
 'Venue: Likas Sports Complex, Kota Kinabalu | CrossFit Licensed Event',
 true, false),

('CrossFit NZ Championship 2026',
 'crossfit-nz-championship-2026',
 'CrossFit', 'competition', 'Hamilton', 'New Zealand',
 '2026-08-28', '2026-08-30',
 'https://championshipeventseries.com/new-zealand-championship',
 'Venue: Claudelands Arena, Hamilton',
 true, true),

('CrossFit Expo Games 2026',
 'crossfit-expo-games-2026',
 'CrossFit', 'competition', 'Sydney', 'Australia',
 '2026-09-11', '2026-09-13',
 'https://ausfitnessexpo.com.au/crossfit-expo-games',
 'Venue: ICC Sydney, International Convention Centre',
 true, true),

('Japan Championship 2026',
 'japan-championship-2026-crossfit',
 'CrossFit', 'competition', 'Yamanashi', 'Japan',
 '2026-09-20', '2026-09-22',
 'https://japanchampionship.com/',
 'Venue: Yamanashi Prefecture | Online qualifier June–July 2026',
 true, false),

('Masters League Games 2026',
 'masters-league-games-2026',
 'CrossFit', 'competition', 'Eagleby', 'Australia',
 '2026-10-23', '2026-10-25',
 'https://www.mastersleague.com.au/',
 'Venue: Distillery Road Market, Eagleby QLD',
 true, false),

('Urban Throwdown 2026',
 'urban-throwdown-singapore-2026',
 'CrossFit', 'competition', 'Singapore', 'Singapore',
 '2026-10-24', '2026-10-25',
 'https://www.urbanthrowdown.com/',
 'Venue: GUOCO Tower, Singapore | Largest CrossFit competition in Asia',
 true, true),

('Down Under Championship 2026',
 'down-under-championship-2026',
 'CrossFit', 'competition', 'Wollongong', 'Australia',
 '2026-11-27', '2026-11-29',
 'https://www.downunderchampionship.com/',
 'Venue: WIN Entertainment Centre, Wollongong',
 true, true),

('Trinity Throwdown Brisbane 2027',
 'trinity-throwdown-brisbane-2027',
 'CrossFit', 'competition', 'Brisbane', 'Australia',
 '2027-04-10', '2027-04-10',
 'https://www.thetrinitythrowdown.com/brisbane',
 'Venue: Brisbane Showgrounds Marquees | $10,000 prize pool',
 true, false)

ON CONFLICT (slug) DO UPDATE SET
  title        = EXCLUDED.title,
  discipline   = EXCLUDED.discipline,
  event_type   = EXCLUDED.event_type,
  city         = EXCLUDED.city,
  country      = EXCLUDED.country,
  start_date   = EXCLUDED.start_date,
  end_date     = EXCLUDED.end_date,
  website_url  = EXCLUDED.website_url,
  description  = EXCLUDED.description,
  is_published = EXCLUDED.is_published,
  is_featured  = EXCLUDED.is_featured,
  updated_at   = now();

-- Verify
SELECT COUNT(*) AS total_crossfit FROM events WHERE discipline = 'CrossFit';
SELECT COUNT(*) AS published_crossfit FROM events WHERE discipline = 'CrossFit' AND is_published = true;
SELECT title, start_date, country
  FROM events
  WHERE discipline = 'CrossFit'
    AND is_published = true
    AND start_date < '2099-01-01'
  ORDER BY start_date;
