// CrossFit APAC event seed — runs against the linked Supabase project
// Usage: set -a && source .env.local && set +a && node scripts/insert-crossfit-events.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey     = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const events = [
  // ── Past events (is_published: false) ────────────────────────────────────
  {
    title:       'Thailand Throwdown 2026',
    slug:        'thailand-throwdown-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Chiang Mai',
    country:     'Thailand',
    start_date:  '2026-01-24',
    end_date:    '2026-01-25',
    website_url: 'https://competitioncorner.net/events/19129/details',
    description: 'Venue: CrossFit Chiang Mai (CFCNX)',
    is_published: false,
    is_featured:  false,
  },
  {
    title:       'Trinity Throwdown Brisbane 2026',
    slug:        'trinity-throwdown-brisbane-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Brisbane',
    country:     'Australia',
    start_date:  '2026-04-18',
    end_date:    '2026-04-18',
    website_url: 'https://www.thetrinitythrowdown.com/events',
    description: 'Venue: Brisbane Showgrounds',
    is_published: false,
    is_featured:  false,
  },
  {
    title:       'Far East Throwdown 2026',
    slug:        'far-east-throwdown-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Busan',
    country:     'South Korea',
    start_date:  '2026-05-01',
    end_date:    '2026-05-03',
    website_url: 'https://fareastthrowdown.com/',
    description: 'Venue: BEXCO, Busan Exhibition & Convention Centre | CrossFit Semifinal',
    is_published: false,
    is_featured:  false,
  },
  {
    title:       'TYR Torian Pro 2026',
    slug:        'tyr-torian-pro-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Brisbane',
    country:     'Australia',
    start_date:  '2026-05-22',
    end_date:    '2026-05-24',
    website_url: 'https://www.torianpro.com/',
    description: 'Venue: Pat Rafter Arena, Queensland Tennis Centre | CrossFit Semifinal',
    is_published: false,
    is_featured:  false,
  },

  // ── Upcoming events (is_published: true) ─────────────────────────────────
  {
    title:       'Jeju Island Makia 2026',
    slug:        'jeju-island-makia-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Jeju City',
    country:     'South Korea',
    start_date:  '2026-07-24',
    end_date:    '2026-07-26',
    website_url: 'https://games.crossfit.com/competitions',
    description: 'CrossFit Licensed Event',
    is_published: true,
    is_featured:  false,
  },
  {
    title:       'Borneo Pangazou 2026',
    slug:        'borneo-pangazou-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Kota Kinabalu',
    country:     'Malaysia',
    start_date:  '2026-08-21',
    end_date:    '2026-08-23',
    website_url: 'https://www.instagram.com/borneopangazou/',
    description: 'Venue: Likas Sports Complex, Kota Kinabalu | CrossFit Licensed Event',
    is_published: true,
    is_featured:  false,
  },
  {
    title:       'CrossFit NZ Championship 2026',
    slug:        'crossfit-nz-championship-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Hamilton',
    country:     'New Zealand',
    start_date:  '2026-08-28',
    end_date:    '2026-08-30',
    website_url: 'https://championshipeventseries.com/new-zealand-championship',
    description: 'Venue: Claudelands Arena, Hamilton',
    is_published: true,
    is_featured:  true,
  },
  {
    title:       'CrossFit Expo Games 2026',
    slug:        'crossfit-expo-games-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Sydney',
    country:     'Australia',
    start_date:  '2026-09-11',
    end_date:    '2026-09-13',
    website_url: 'https://ausfitnessexpo.com.au/crossfit-expo-games',
    description: 'Venue: ICC Sydney, International Convention Centre',
    is_published: true,
    is_featured:  true,
  },
  {
    title:       'Japan Championship 2026',
    slug:        'japan-championship-2026-crossfit',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Yamanashi',
    country:     'Japan',
    start_date:  '2026-09-20',
    end_date:    '2026-09-22',
    website_url: 'https://japanchampionship.com/',
    description: 'Venue: Yamanashi Prefecture | Online qualifier June–July 2026',
    is_published: true,
    is_featured:  false,
  },
  {
    title:       'Masters League Games 2026',
    slug:        'masters-league-games-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Eagleby',
    country:     'Australia',
    start_date:  '2026-10-23',
    end_date:    '2026-10-25',
    website_url: 'https://www.mastersleague.com.au/',
    description: 'Venue: Distillery Road Market, Eagleby QLD',
    is_published: true,
    is_featured:  false,
  },
  {
    title:       'Urban Throwdown 2026',
    slug:        'urban-throwdown-singapore-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Singapore',
    country:     'Singapore',
    start_date:  '2026-10-24',
    end_date:    '2026-10-25',
    website_url: 'https://www.urbanthrowdown.com/',
    description: 'Venue: GUOCO Tower, Singapore | Largest CrossFit competition in Asia',
    is_published: true,
    is_featured:  true,
  },
  {
    title:       'Down Under Championship 2026',
    slug:        'down-under-championship-2026',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Wollongong',
    country:     'Australia',
    start_date:  '2026-11-27',
    end_date:    '2026-11-29',
    website_url: 'https://www.downunderchampionship.com/',
    description: 'Venue: WIN Entertainment Centre, Wollongong',
    is_published: true,
    is_featured:  true,
  },
  {
    title:       'Trinity Throwdown Brisbane 2027',
    slug:        'trinity-throwdown-brisbane-2027',
    discipline:  'CrossFit',
    event_type:  'competition',
    city:        'Brisbane',
    country:     'Australia',
    start_date:  '2027-04-10',
    end_date:    '2027-04-10',
    website_url: 'https://www.thetrinitythrowdown.com/brisbane',
    description: 'Venue: Brisbane Showgrounds Marquees | $10,000 prize pool',
    is_published: true,
    is_featured:  false,
  },
]

async function main() {
  console.log(`Upserting ${events.length} CrossFit events to ${supabaseUrl}...`)

  const { data, error } = await supabase
    .from('events')
    .upsert(events, { onConflict: 'slug' })
    .select('title, start_date, country, is_published')

  if (error) {
    console.error('Insert failed:', error.message, error.details ?? '')
    process.exit(1)
  }

  const published = data?.filter(e => e.is_published) ?? []
  const hidden    = data?.filter(e => !e.is_published) ?? []

  console.log(`\n✓ ${data?.length ?? 0} events upserted\n`)
  console.log('Upcoming (published):')
  published.forEach(e => console.log(`  ${e.start_date}  ${e.title} [${e.country}]`))
  console.log('\nPast (hidden):')
  hidden.forEach(e => console.log(`  ${e.start_date}  ${e.title} [${e.country}]`))
}

main()
