import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Globe, ArrowLeft, Flag, CheckCircle, Clock, Train, Car, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

// ─── Schema helpers ───────────────────────────────────────────────────────────

const COUNTRY_CODES: Record<string, string> = {
  'Australia':   'AU',
  'New Zealand': 'NZ',
  'Singapore':   'SG',
  'Japan':       'JP',
  'South Korea': 'KR',
  'Thailand':    'TH',
  'Indonesia':   'ID',
  'Hong Kong':   'HK',
  'China':       'CN',
}

function buildEventSchema(event: {
  title: string
  slug: string
  discipline: string
  city: string | null
  country: string | null
  start_date: string
  end_date: string | null
  website_url: string | null
  organiser: string | null
  description: string | null
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const venueName = event.description?.match(/^Venue:\s*(.+)/i)?.[1]?.trim()

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    url: `${siteUrl}/events/${event.slug}`,
    startDate: event.start_date,
    ...(event.end_date ? { endDate: event.end_date } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: event.discipline,
    location: {
      '@type': 'Place',
      ...(venueName ? { name: venueName } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(event.city    ? { addressLocality: event.city }                                  : {}),
        ...(event.country ? { addressCountry: COUNTRY_CODES[event.country] ?? event.country } : {}),
      },
    },
    ...(event.organiser || event.discipline
      ? {
          organizer: {
            '@type': 'Organization',
            name: event.organiser ?? event.discipline,
          },
        }
      : {}),
    ...(event.website_url ? { sameAs: event.website_url } : {}),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

type EventRow = {
  id: string
  title: string
  slug: string
  discipline: string
  event_type: string
  city: string | null
  region: string | null
  country: string | null
  start_date: string
  end_date: string | null
  registration_deadline: string | null
  website_url: string | null
  description: string | null
  organiser: string | null
  is_featured: boolean
}

// ─── Discipline constants ─────────────────────────────────────────────────────

const HYROX_STATIONS = [
  { order: 1, name: 'SkiErg',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 2, name: 'Sled Push',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 3, name: 'Sled Pull',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 4, name: 'Burpee Broad Jump', distance: '80 m',     note: '50 m Women' },
  { order: 5, name: 'Rowing',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 6, name: "Farmer's Carry",    distance: '200 m',    note: '2 × 24 kg Men / 2 × 16 kg Women' },
  { order: 7, name: 'Sandbag Lunges',    distance: '100 m',    note: '20 kg Men / 10 kg Women' },
  { order: 8, name: 'Wall Balls',        distance: '100 reps', note: '6 kg Men / 4 kg Women' },
]

const DEKA_STATIONS = [
  { order: 1,  name: 'Ski Erg',       distance: '500 m' },
  { order: 2,  name: 'Sled Push',     distance: '25 m' },
  { order: 3,  name: 'Sled Pull',     distance: '25 m' },
  { order: 4,  name: 'Burpee Jump',   distance: '50 m' },
  { order: 5,  name: 'Row Erg',       distance: '500 m' },
  { order: 6,  name: 'Farmers Carry', distance: '50 m' },
  { order: 7,  name: 'Sandbag Lunge', distance: '25 m' },
  { order: 8,  name: 'Wall Balls',    distance: '50 reps' },
  { order: 9,  name: 'Box Jump',      distance: '50 reps' },
  { order: 10, name: 'Battle Ropes',  distance: '30 sec' },
]

const IRONMAN_DISTANCES: Record<string, { swim: string; bike: string; run: string; total: string }> = {
  'Ironman': {
    swim: '3.86 km (2.4 mi)',
    bike: '180.25 km (112 mi)',
    run: '42.2 km (26.2 mi)',
    total: '226.3 km',
  },
  'Ironman 70.3': {
    swim: '1.93 km (1.2 mi)',
    bike: '90.12 km (56 mi)',
    run: '21.1 km (13.1 mi)',
    total: '113.0 km',
  },
}

const SPARTAN_FORMATS = [
  { name: 'Spartan Sprint',  distance: '~5 km',   obstacles: '20+', level: 'Beginner-friendly' },
  { name: 'Spartan Super',   distance: '~10 km',  obstacles: '25+', level: 'Intermediate' },
  { name: 'Spartan Beast',   distance: '~20 km',  obstacles: '30+', level: 'Experienced' },
  { name: 'Spartan Ultra',   distance: '~50 km',  obstacles: '60+', level: 'Elite / Ultra-endurance' },
  { name: 'Stadion',         distance: '~5 km',   obstacles: '20+', level: 'Stadium / flat course' },
]

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, discipline, city, country')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!event) return { title: 'Event not found' }

  const location = [event.city, event.country].filter(Boolean).join(', ')
  const metaDesc =
    event.description && !event.description.startsWith('Venue:')
      ? event.description
      : `${event.title} — ${event.discipline} event in ${location}. Dates, categories, entry fees, venue information and race guide.`

  return {
    title: `${event.title} — ${event.discipline} Race Guide`,
    description: metaDesc,
    openGraph: {
      title: `${event.title} — Race Guide`,
      description: metaDesc,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: event }, { data: relatedRaw }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, slug, discipline, event_type, city, region, country, start_date, end_date, registration_deadline, website_url, description, organiser, is_featured')
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),
    supabase
      .from('events')
      .select('title, slug, city, country, start_date, discipline')
      .eq('is_published', true)
      .neq('slug', slug)
      .order('start_date', { ascending: true })
      .limit(20),
  ])

  if (!event) notFound()

  const today = new Date().toISOString().split('T')[0]
  const related = (relatedRaw ?? [])
    .filter((e) => e.discipline === event.discipline && e.start_date >= today)
    .slice(0, 4)

  const venue = extractVenue(event.description)
  const location = [event.city, event.region, event.country].filter(Boolean).join(', ')
  const eventSchema = buildEventSchema(event)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    <div className="container-page py-10">
      <Link href="/events" className="btn-ghost mb-6 inline-flex px-0 text-ink-muted">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">

        {/* ── Main content ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="brand">{event.discipline}</Badge>
              <Badge variant="outline">{event.event_type}</Badge>
              {event.is_featured && <Badge variant="warning">Featured</Badge>}
            </div>
            <h1 className="page-title">{event.title}</h1>
            {location && (
              <p className="mt-3 text-ink-muted text-lg">
                {venue ?? location}
                {event.city && venue ? ` · ${event.city}, ${event.country}` : ''}
                {' · '}
                {formatDate(event.start_date)}
                {event.end_date && event.end_date !== event.start_date
                  ? ` – ${formatDate(event.end_date)}`
                  : ''}
              </p>
            )}
          </div>

          {/* About — discipline editorial */}
          <AboutSection discipline={event.discipline} event={event} />

          {/* Discipline-specific content */}
          {event.discipline === 'HYROX' && <HYROXSections />}
          {event.discipline === 'Spartan Race' && <SpartanSections />}
          {(event.discipline === 'Ironman' || event.discipline === 'Ironman 70.3') && (
            <IronmanSections discipline={event.discipline} />
          )}
          {(event.discipline === 'Marathon' || event.discipline === 'Trail Running') && (
            <RunningSection discipline={event.discipline} />
          )}
          {event.discipline === 'Deka Fit' && <DekaSections />}

          {/* Venue */}
          <section>
            <SectionHeading>Venue &amp; Location</SectionHeading>
            <div className="card space-y-3">
              {venue && <h3 className="font-semibold text-white">{venue}</h3>}
              <p className="text-ink text-sm">{location}</p>
              {!venue && (
                <p className="text-ink-muted text-sm">
                  Venue details will be confirmed closer to the event. Check the official website
                  for the most up-to-date information.
                </p>
              )}
            </div>
          </section>

          {/* Entry Fees */}
          <EntryFeesSection discipline={event.discipline} />

          {/* Tips */}
          <WeekendTipsSection />

          {/* Plan Your Trip */}
          <section>
            <SectionHeading>Plan Your Trip</SectionHeading>
            <div className="card space-y-5">
              <p className="text-sm text-ink-muted">
                Most athletes need to coordinate travel and logistics for race weekend. Here are the key steps to get organised well in advance.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: CheckCircle,
                    heading: 'Check your registration is confirmed',
                    tip: 'Log in to the event portal and download your confirmation email before race week. Some events require you to complete a waiver or provide a medical certificate at check-in.',
                  },
                  {
                    icon: MapPin,
                    heading: 'Confirm the venue address',
                    tip: 'Check the official event website for the exact venue address and any race village or parking entrances specific to athletes. GPS can sometimes route you to the wrong gate.',
                  },
                  {
                    icon: Calendar,
                    heading: 'Book accommodation early',
                    tip: 'Hotels near major race venues fill up months in advance, especially for multi-day events. Book as soon as your registration is confirmed — cancellation rates apply if your plans change.',
                  },
                  {
                    icon: Train,
                    heading: 'Plan your transport',
                    tip: 'Many race venues restrict parking on event day or use remote parking with shuttles. Check the event logistics page for shuttle times, public transit options and recommended arrival windows.',
                  },
                  {
                    icon: Clock,
                    heading: 'Arrive early on race day',
                    tip: 'Plan to arrive at least 60–90 minutes before your wave start. Allow time for parking, gear check, warm-up and finding your starting corral without rushing.',
                  },
                ].map(({ icon: Icon, heading, tip }) => (
                  <li key={heading} className="flex items-start gap-4">
                    <div className="rounded-lg bg-mint/10 p-2 shrink-0">
                      <Icon className="h-4 w-4 text-mint" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{heading}</div>
                      <div className="text-sm text-ink-muted leading-relaxed">{tip}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQs */}
          <FaqSection discipline={event.discipline} />

        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

          {/* Event details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Event Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">{formatDate(event.start_date)}</div>
                  {event.end_date && event.end_date !== event.start_date && (
                    <div className="text-ink-muted">to {formatDate(event.end_date)}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                <div>
                  {venue && <div className="font-medium text-white">{venue}</div>}
                  <div className="text-ink-muted">{location}</div>
                </div>
              </div>
              {event.organiser && (
                <div className="flex items-start gap-3">
                  <Flag className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                  <div>
                    <div className="text-ink-muted text-xs">Organiser</div>
                    <div className="font-medium text-white">{event.organiser}</div>
                  </div>
                </div>
              )}
            </div>

            {event.registration_deadline && (
              <div className="rounded-lg bg-mint/10 border border-mint/20 px-3 py-2.5 text-sm">
                <span className="text-mint font-medium">Registration closes</span>
                <div className="text-white">{formatDate(event.registration_deadline)}</div>
              </div>
            )}

            {event.website_url && (
              <a
                href={event.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
              >
                <Globe className="h-4 w-4" /> Register Now
              </a>
            )}
          </div>

          {/* Quick facts */}
          <QuickFactsSidebar discipline={event.discipline} />

          {/* Related events */}
          {related.length > 0 && (
            <div className="card space-y-3 text-sm">
              <h2 className="font-semibold text-white">More {event.discipline} Events</h2>
              <ul className="space-y-2 text-ink-muted">
                {related.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/events/${e.slug}`} className="hover:text-white transition-colors">
                      {e.title} →
                    </Link>
                    <div className="text-ink-muted text-xs mt-0.5">
                      {e.city}, {e.country} · {formatDate(e.start_date)}
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={`/events?discipline=${encodeURIComponent(event.discipline)}`}
                className="text-mint hover:text-mint-300 transition-colors text-xs"
              >
                View all {event.discipline} events →
              </Link>
            </div>
          )}

        </aside>
      </div>
    </div>
    </>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white mb-5 pb-3 border-b border-wire">
      {children}
    </h2>
  )
}

function extractVenue(description: string | null): string | null {
  if (!description) return null
  const match = description.match(/^Venue:\s*(.+)/i)
  return match ? match[1].trim() : null
}

// ─── About section (discipline-aware editorial) ───────────────────────────────

function AboutSection({ discipline, event }: { discipline: string; event: EventRow }) {
  const location = [event.city, event.country].filter(Boolean).join(', ')

  const copy: Record<string, React.ReactNode> = {
    'CrossFit': (
      <>
        <p>
          CrossFit competitions test athletes across weightlifting, gymnastics and metabolic
          conditioning in constantly varied workouts (WODs) scored for time, load or reps.
          Events range from local box throwdowns and regional invitationals to Licensed Sanctional
          competitions that qualify athletes for the CrossFit Games — the world&apos;s premier test
          of fitness.
        </p>
        <p>
          The CrossFit Open, held annually in February and March, is the world&apos;s largest online
          fitness competition with hundreds of thousands of athletes from every country. The top
          finishers progress to the Quarterfinals, Semifinals and ultimately the CrossFit Games.
          Local throwdowns and team competitions run throughout the year at affiliate boxes,
          providing competitive opportunities at every fitness level.
        </p>
        <p>
          CrossFit competitions typically span one or two days and include multiple WODs announced
          at or shortly before the event. Unlike standardised race formats, every CrossFit event
          is different — the element of the unknown is central to the competitive experience.
          Most events offer RX (prescribed), Scaled and Masters divisions, making competition
          accessible for athletes at every stage of their CrossFit journey.
        </p>
      </>
    ),
    'HYROX': (
      <>
        <p>
          HYROX is the world&apos;s fastest-growing fitness race — a standardised format that
          combines 8 × 1 km runs with 8 functional workout stations under a single roof. Created
          in Hamburg in 2017, every HYROX event worldwide uses the exact same stations, distances
          and weights, meaning your finish time in {location} is directly comparable to athletes
          who raced in London, Tokyo or New York.
        </p>
        <p>
          The event attracts athletes of all levels: recreational gym-goers chasing their first
          completion race side-by-side with competitive athletes targeting a HYROX World
          Championships qualification. With Open, Pro, Doubles and Relay divisions, there is a
          format for everyone from first-timers to elite competitors.
        </p>
        <p>
          HYROX events are held indoors, which means spectators get an unobstructed view of the
          full race floor — every workout station and every running lap — from the same vantage
          point. This makes HYROX one of the most spectator-friendly fitness races on the planet.
        </p>
      </>
    ),
    'Spartan Race': (
      <>
        <p>
          Spartan Race is the world&apos;s largest obstacle course race series, with over 200 events
          annually across 40+ countries. Races are held on rugged, natural terrain — mountains,
          farms and open land — and include a mix of running and purpose-built obstacles including
          rope climbs, barbed wire crawls, bucket carries, spear throws and heavy carries.
        </p>
        <p>
          Unlike road races, Spartan events are held on private property and often involve
          significant elevation gain. The course changes from year to year at most venues,
          and race distances are approximate — actual course length can vary based on terrain.
          Athletes who fail an obstacle must complete a 30-burpee penalty before continuing.
        </p>
        <p>
          Multiple race formats mean that whether you&apos;re a first-time obstacle racer or a
          seasoned ultra-endurance competitor, there is a Spartan distance suited to your fitness
          level. The Trifecta challenge — completing a Sprint, Super and Beast in one season — is
          one of the most popular multi-race goals in the sport.
        </p>
      </>
    ),
    'Ironman': (
      <>
        <p>
          IRONMAN is the pinnacle of long-course triathlon: a continuous 3.86 km swim, 180.25 km
          bike ride and 42.2 km marathon run, completed in a single day. Athletes must finish
          within a 17-hour cut-off. It is widely regarded as one of the most demanding one-day
          endurance challenges in sport.
        </p>
        <p>
          The Asia Pacific circuit includes events in New Zealand, Australia, Malaysia and Japan —
          each with its own character in terms of course terrain, water conditions and crowd
          atmosphere. All IRONMAN events offer Kona and World Championship qualification slots
          distributed across age groups, making them competitive for serious triathletes.
        </p>
      </>
    ),
    'Ironman 70.3': (
      <>
        <p>
          IRONMAN 70.3 — named after the total race distance in miles — combines a 1.93 km swim,
          90.12 km bike and 21.1 km run (half marathon). The 8-hour 30-minute cut-off makes it
          the natural progression from sprint and Olympic-distance triathlon, and the most popular
          long-course format for athletes preparing for a full IRONMAN.
        </p>
        <p>
          IRONMAN 70.3 events qualify athletes for the annual 70.3 World Championship. The Asia
          Pacific circuit offers multiple 70.3 options across Australia, New Zealand and Southeast
          Asia — each with distinct course profiles suited to different athlete strengths.
        </p>
      </>
    ),
    'Marathon': (
      <>
        <p>
          The marathon — 42.195 km — is one of the oldest and most celebrated distance running
          events in the world. Whether you&apos;re running your first marathon or targeting a
          qualifying time, road marathons remain the benchmark distance goal for long-distance
          runners at every level.
        </p>
        <p>
          Marathons in the Asia Pacific region range from flat, fast city courses ideal for
          personal bests to scenic coastal and mountain routes designed for the experience over
          the clock. Most events also offer half marathon and shorter distances for runners at
          different stages of their training.
        </p>
      </>
    ),
    'Trail Running': (
      <>
        <p>
          Trail running takes the marathon concept off-road — onto mountain paths, forest tracks
          and natural terrain where elevation, surface and distance combine to challenge athletes
          in entirely different ways to road racing. Events range from 10 km social trail runs to
          100+ km ultra-distance races that take place over multiple days.
        </p>
        <p>
          Asia Pacific&apos;s trail running scene spans some of the world&apos;s most spectacular terrain —
          from Japan&apos;s volcanic mountain trails to New Zealand&apos;s alpine wilderness and Australia&apos;s
          rugged national parks. Distances are often approximate due to terrain variability, and
          mandatory gear requirements are common for longer distances.
        </p>
      </>
    ),
    'Deka Fit': (
      <>
        <p>
          Deka Fit is an indoor fitness race that blends the HYROX concept with its own unique
          station format: 10 × 500 m runs alternating with 10 workout stations — including Ski
          Erg, Sled Push, Sled Pull, Burpee Jumps, Row Erg, Farmer&apos;s Carry, Sandbag Lunges,
          Wall Balls, Box Jumps and Battle Ropes.
        </p>
        <p>
          Like HYROX, Deka Fit uses a standardised global format so all results are directly
          comparable. The race is held indoors, spectator-friendly, and offers divisions for
          athletes of all fitness backgrounds. It is an excellent complementary event for
          athletes who compete in both HYROX and functional fitness formats.
        </p>
      </>
    ),
  }

  const fallback = event.description && !event.description.startsWith('Venue:')
    ? <p>{event.description}</p>
    : (
      <p>
        {event.title} is a {discipline} event in {location}. Visit the official website for
        full event details, course information and registration.
      </p>
    )

  return (
    <section>
      <SectionHeading>About the Event</SectionHeading>
      <div className="space-y-4 text-ink leading-relaxed text-[0.9375rem]">
        {copy[discipline] ?? fallback}
      </div>
    </section>
  )
}

// ─── HYROX sections ───────────────────────────────────────────────────────────

function HYROXSections() {
  return (
    <>
      <section>
        <SectionHeading>Race Format</SectionHeading>
        <p className="text-ink-muted mb-6">
          8 rounds. Each round: 1 km run → workout station. Total running: 8 km.
          Workout volume is fixed across all divisions — only weights and vest requirements differ.
        </p>
        <div className="overflow-x-auto rounded-xl border border-wire">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire bg-panel">
                <th className="text-left px-4 py-3 text-ink-muted font-medium w-8">#</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium">Station</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium">Distance / Reps</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {HYROX_STATIONS.map((s, i) => (
                <tr key={s.order} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                  <td className="px-4 py-3 text-mint font-bold">{s.order}</td>
                  <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-ink">{s.distance}</td>
                  <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Pro division distances and weights may vary — confirm with the official HYROX race guide.
        </p>
      </section>

      <section>
        <SectionHeading>Event Categories</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'Open Individual',  desc: 'No weight vest. Standard distances. The entry-level division — great for first-timers and recreational athletes.', tag: 'Most Popular', variant: 'brand' as const },
            { name: 'Pro Individual',   desc: 'Weight vest required (10 kg men / 6 kg women). Shorter station distances. For competitive athletes.', tag: 'Competitive', variant: 'warning' as const },
            { name: 'Doubles',          desc: 'Two athletes alternate stations and share running laps. Ideal for training partners.', tag: 'Team of 2', variant: 'success' as const },
            { name: 'Relay',            desc: 'Teams of up to four split all exercises. The most social format — perfect for groups and corporate teams.', tag: 'Team of 4', variant: 'success' as const },
          ].map((cat) => (
            <div key={cat.name} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{cat.name}</h3>
                <Badge variant={cat.variant}>{cat.tag}</Badge>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading>Who Should Enter?</SectionHeading>
        <div className="space-y-4">
          {[
            { title: 'Beginner',      cta: 'Target finish: 90–120 min', desc: 'Can run 5 km and has 3–6 months of gym training. HYROX Open is well within reach with a 12–16 week prep block.' },
            { title: 'Intermediate',  cta: 'Target finish: 75–90 min',  desc: 'Regular gym-goer with solid cardio. Focus on your running pace between stations — that\'s where most athletes lose time.' },
            { title: 'Competitive',   cta: 'Target finish: Sub-75 min (Open) / Sub-60 min (Pro)', desc: 'CrossFit, triathlon or elite running background. Consider the Pro division if you\'re targeting a top-10 age-group result.' },
          ].map((level) => (
            <div key={level.title} className="card flex gap-4">
              <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">{level.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
                <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// ─── Spartan sections ─────────────────────────────────────────────────────────

function SpartanSections() {
  return (
    <>
      <section>
        <SectionHeading>Race Types</SectionHeading>
        <p className="text-ink-muted mb-6">
          Most Spartan events offer multiple race formats on the same weekend. Distances are
          approximate — actual course length depends on terrain.
        </p>
        <div className="overflow-x-auto rounded-xl border border-wire">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire bg-panel">
                <th className="text-left px-4 py-3 text-ink-muted font-medium">Format</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium">Distance</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium">Obstacles</th>
                <th className="text-left px-4 py-3 text-ink-muted font-medium hidden sm:table-cell">Level</th>
              </tr>
            </thead>
            <tbody>
              {SPARTAN_FORMATS.map((f, i) => (
                <tr key={f.name} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                  <td className="px-4 py-3 text-white font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-ink">{f.distance}</td>
                  <td className="px-4 py-3 text-ink">{f.obstacles}</td>
                  <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">{f.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Check the event registration page to confirm which formats are available at this specific event.
          Not all events offer every distance.
        </p>
      </section>

      <section>
        <SectionHeading>Who Should Enter?</SectionHeading>
        <div className="space-y-4">
          {[
            { title: 'First-timers',   desc: 'The Spartan Sprint (~5 km) is designed as an accessible entry point. You need basic running fitness and a willingness to get muddy — no prior obstacle experience required.', cta: 'Start with: Spartan Sprint' },
            { title: 'Intermediate',   desc: 'If you\'ve completed a Sprint and want more challenge, the Super (~10 km) is the natural next step. Comfortable with 10 km trail runs and basic strength training.', cta: 'Aim for: Spartan Super or Trifecta' },
            { title: 'Experienced',    desc: 'The Beast and Ultra formats demand serious endurance base and obstacle proficiency. Expect significant elevation gain and time on feet of 4–12+ hours.', cta: 'Push for: Spartan Beast or Ultra' },
          ].map((level) => (
            <div key={level.title} className="card flex gap-4">
              <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">{level.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
                <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// ─── Ironman sections ─────────────────────────────────────────────────────────

function IronmanSections({ discipline }: { discipline: string }) {
  const d = IRONMAN_DISTANCES[discipline]
  if (!d) return null

  return (
    <section>
      <SectionHeading>Race Distances</SectionHeading>
      <div className="overflow-x-auto rounded-xl border border-wire mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="text-left px-4 py-3 text-ink-muted font-medium">Leg</th>
              <th className="text-left px-4 py-3 text-ink-muted font-medium">Distance</th>
            </tr>
          </thead>
          <tbody>
            {[
              { leg: 'Swim',  dist: d.swim },
              { leg: 'Bike',  dist: d.bike },
              { leg: 'Run',   dist: d.run  },
              { leg: 'Total', dist: d.total },
            ].map((row, i) => (
              <tr key={row.leg} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className={`px-4 py-3 font-medium ${row.leg === 'Total' ? 'text-mint' : 'text-white'}`}>{row.leg}</td>
                <td className="px-4 py-3 text-ink">{row.dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        {[
          { title: 'Beginners',   desc: `${discipline} is a serious long-course commitment. Athletes new to triathlon should start with a sprint or Olympic-distance event before targeting a ${discipline}. A minimum of 12–18 months of structured triathlon training is recommended.`, cta: discipline === 'Ironman' ? 'Minimum base: 12–18 months triathlon training' : 'Minimum base: 6–12 months triathlon training' },
          { title: 'Intermediate', desc: 'Solid swim, bike and run base across all three disciplines. You\'ve completed Olympic-distance triathlon and can comfortably train 10–15 hours per week.', cta: 'Build a 20–24 week specific training block' },
          { title: 'Experienced',  desc: `You've completed a ${discipline === 'Ironman 70.3' ? 'full IRONMAN or multiple 70.3s' : 'prior full IRONMAN'} and are targeting a competitive finish or Kona/World Champs qualification.`, cta: 'Focus: race-specific pacing and nutrition strategy' },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Running section (Marathon + Trail) ───────────────────────────────────────

function RunningSection({ discipline }: { discipline: string }) {
  const isTrail = discipline === 'Trail Running'
  return (
    <section>
      <SectionHeading>Who Should Enter?</SectionHeading>
      <div className="space-y-4">
        {[
          {
            title: 'Beginner',
            desc: isTrail
              ? 'Trail running events typically offer shorter distances (10–15 km) that are suitable for runners with a solid road running base who want their first off-road experience.'
              : 'If you can run 30 km in training, you have the base to finish a marathon. Allow 16–20 weeks of structured marathon-specific training before race day.',
            cta: isTrail ? 'Start with a 10–15 km trail event' : 'Target finish: 4:30–6:00',
          },
          {
            title: 'Intermediate',
            desc: isTrail
              ? 'Comfortable on technical terrain and can run 20+ km on trails. Look for 25–50 km events with moderate elevation gain to progress from shorter distances.'
              : 'You\'ve completed a half marathon and have 3–4 days of running per week. Focus on your long run progression and race-day pacing strategy.',
            cta: isTrail ? 'Target distance: 25–50 km' : 'Target finish: 3:30–4:30',
          },
          {
            title: 'Experienced',
            desc: isTrail
              ? 'Ultra trail events (50 km+) require serious endurance base, mandatory gear, nutrition strategy and experience navigating night sections. Not for first-timers.'
              : 'Targeting a personal best or Boston Qualifier. Focus on tempo runs, threshold work and negative-split race execution.',
            cta: isTrail ? 'Tackle an ultra: 50–100 km+' : 'Target finish: Sub-3:30',
          },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Deka Fit sections ────────────────────────────────────────────────────────

function DekaSections() {
  return (
    <section>
      <SectionHeading>Race Format</SectionHeading>
      <p className="text-ink-muted mb-6">
        10 rounds. Each round: 500 m run → workout station. Total running: 5 km.
        All results are globally comparable — every Deka Fit event uses the same format.
      </p>
      <div className="overflow-x-auto rounded-xl border border-wire">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="text-left px-4 py-3 text-ink-muted font-medium w-8">#</th>
              <th className="text-left px-4 py-3 text-ink-muted font-medium">Station</th>
              <th className="text-left px-4 py-3 text-ink-muted font-medium">Distance / Reps</th>
            </tr>
          </thead>
          <tbody>
            {DEKA_STATIONS.map((s, i) => (
              <tr key={s.order} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className="px-4 py-3 text-mint font-bold">{s.order}</td>
                <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                <td className="px-4 py-3 text-ink">{s.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Entry fees (discipline-aware) ────────────────────────────────────────────

function EntryFeesSection({ discipline }: { discipline: string }) {
  type Fee = { category: string; price: string }
  const fees: Record<string, Fee[]> = {
    'CrossFit': [
      { category: 'Individual (RX)',       price: '~AUD $80–180' },
      { category: 'Individual (Scaled)',   price: '~AUD $60–150' },
      { category: 'Masters divisions',     price: '~AUD $60–150' },
      { category: 'Team (3–5 athletes)',   price: '~AUD $200–400 per team' },
    ],
    'HYROX': [
      { category: 'Open Individual', price: '~AUD $175–195' },
      { category: 'Pro Individual',  price: '~AUD $175–195' },
      { category: 'Open Doubles',    price: '~AUD $300–340 per team' },
      { category: 'Open Relay',      price: '~AUD $440–480 per team' },
    ],
    'Spartan Race': [
      { category: 'Spartan Sprint',  price: '~AUD $80–130' },
      { category: 'Spartan Super',   price: '~AUD $100–150' },
      { category: 'Spartan Beast',   price: '~AUD $130–180' },
      { category: 'Trifecta Bundle', price: '~AUD $250–350' },
    ],
    'Ironman': [
      { category: 'Full IRONMAN',        price: '~AUD $800–1,100' },
      { category: 'Relay team (3)',       price: '~AUD $400–600 per team' },
    ],
    'Ironman 70.3': [
      { category: 'IRONMAN 70.3 Individual', price: '~AUD $350–550' },
      { category: 'Relay team (3)',           price: '~AUD $250–400 per team' },
    ],
    'Marathon': [
      { category: 'Full Marathon',  price: '~AUD $80–150' },
      { category: 'Half Marathon',  price: '~AUD $60–100' },
    ],
    'Trail Running': [
      { category: 'Short distance (10–21 km)', price: '~AUD $60–120' },
      { category: 'Long distance (42–100 km)', price: '~AUD $150–350' },
    ],
    'Deka Fit': [
      { category: 'Deka Fit Individual', price: '~AUD $100–140' },
    ],
  }

  const rows = fees[discipline]
  if (!rows) return null

  return (
    <section>
      <SectionHeading>Entry Fees</SectionHeading>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="text-left px-5 py-3 text-ink-muted font-medium">Category</th>
              <th className="text-left px-5 py-3 text-ink-muted font-medium">Approx. Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fee, i) => (
              <tr key={fee.category} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className="px-5 py-3.5 text-white font-medium">{fee.category}</td>
                <td className="px-5 py-3.5 text-ink">{fee.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Prices are approximate and based on early-bird rates. Fees increase as the event approaches.
        Check the official website for current pricing before registering.
      </p>
    </section>
  )
}

// ─── Weekend tips (generic) ───────────────────────────────────────────────────

function WeekendTipsSection() {
  return (
    <section>
      <SectionHeading>Race Weekend Tips</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: <Clock className="h-4 w-4" />, title: 'Arrival', body: 'Arrive at least 90 minutes before your start time. Allow time for bag drop, warm-up and reaching your start corral. Late arrivals risk losing their slot.' },
          { icon: <Train className="h-4 w-4" />, title: 'Public Transport', body: 'Where available, public transport is strongly recommended over driving on event days. Check the venue\'s transport page for specific routes and services.' },
          { icon: <Car className="h-4 w-4" />, title: 'Parking', body: 'Parking fills quickly at large events. Book in advance if available, or use ride-share services to avoid the stress of finding a space close to the venue.' },
          { icon: <Users className="h-4 w-4" />, title: 'Spectators', body: 'Check whether spectators need tickets. Indoor events like HYROX and Deka Fit typically offer free spectator entry; outdoor events may have different policies.' },
        ].map((tip) => (
          <div key={tip.title} className="card space-y-3">
            <div className="flex items-center gap-2 text-mint font-medium text-sm">
              {tip.icon} {tip.title}
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>
      <div className="card mt-4">
        <h3 className="font-semibold text-white mb-3">What to Bring</h3>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-muted">
          {[
            'Confirmation email or event app entry',
            'Appropriate footwear for the discipline',
            'Race outfit you can move freely in',
            'Water bottle (refill stations on site at most events)',
            'Recovery snack for post-race',
            'Any personal sports nutrition you rely on',
            'Foam roller or resistance band for warm-up',
            'Sunscreen and hat for outdoor events',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-mint mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── FAQs (discipline-aware) ──────────────────────────────────────────────────

function FaqSection({ discipline }: { discipline: string }) {
  type Faq = { q: string; a: string }
  const faqs: Record<string, Faq[]> = {
    'CrossFit': [
      { q: 'What is a CrossFit throwdown?', a: 'A CrossFit throwdown is a local or regional competition held at a CrossFit affiliate box or external venue. Athletes complete a series of WODs (workouts of the day) over one or two days, scored for time, load or reps. Unlike sanctional events, throwdowns are community-organised and the format varies by event.' },
      { q: 'What is the CrossFit Open?', a: 'The CrossFit Open is an annual online qualifier held each February–March. Athletes complete three or four workouts over consecutive weeks and submit their scores online. It is the first stage of the CrossFit Games season and the largest online fitness competition in the world — open to all fitness levels.' },
      { q: 'What divisions are available at CrossFit competitions?', a: 'Most CrossFit competitions offer RX (prescribed — standard weights and movements), Scaled (reduced weights and movement modifications), and Masters divisions by age group (35+, 40+, 45+, 50+, 55+, 60+). Many events also include Team categories (3–5 athletes) and Adaptive divisions.' },
      { q: 'What does RX mean?', a: 'RX means "as prescribed" — the athlete completes every movement at the specified weight and standard without any modifications. Scaled divisions allow athletes to reduce weights or substitute movements, making competition accessible for athletes who are still building strength or technique in movements like muscle-ups or heavy barbell lifts.' },
      { q: 'Do I need to be a CrossFit member to compete?', a: 'No — most CrossFit competitions are open to all athletes regardless of gym affiliation. A CrossFit membership is not required to register. However, if you\'re new to CrossFit movements, training at a CrossFit box before competing will help you learn the standardised movements safely.' },
      { q: 'How are workouts announced at CrossFit competitions?', a: 'Workouts at local throwdowns are typically announced on the event day or the evening before. At larger sanctional events, some workouts may be announced in advance to allow preparation. The element of the unknown — not knowing your workout until close to competition — is fundamental to CrossFit\'s competitive philosophy.' },
    ],
    'HYROX': [
      { q: 'What exactly is HYROX?', a: 'HYROX is a standardised global fitness race: 8 × 1 km runs alternating with 8 workout stations — SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmer\'s Carry, Sandbag Lunges and Wall Balls. Because the format never changes, every finish time is globally comparable.' },
      { q: 'Do I need prior experience to enter?', a: 'No. The Open division is designed for recreational athletes of all fitness levels. If you can run 5 km and have a few months of gym training, you have the base fitness to complete HYROX.' },
      { q: 'What is the difference between Open and Pro?', a: 'Pro athletes must wear a weight vest (10 kg men / 6 kg women) for the entire race and some stations have shorter distances. Pro is self-seeded — you don\'t need to qualify, but expect a harder race.' },
      { q: 'Can I race with a friend or team?', a: 'Yes. Doubles pairs two athletes who alternate stations and running. Relay allows teams of up to four. Both formats are available at most HYROX events.' },
      { q: 'What should I specifically train for?', a: 'Prioritise your running — 8 km of running between heavy stations is harder than it sounds. Then train the specific movements: SkiErg/Row for pulling endurance, Sled work for leg drive, Wall Balls for shoulder stamina, and Sandbag Lunges for single-leg strength.' },
      { q: 'When are results published?', a: 'Results are typically published within 24–48 hours of the event closing. HYROX uses chip timing and all results count toward your global HYROX ranking.' },
    ],
    'Spartan Race': [
      { q: 'What happens if I fail an obstacle?', a: 'Athletes who fail an obstacle must complete a 30-burpee penalty before moving on. There are no skips or bypasses in the competitive waves — burpees are mandatory.' },
      { q: 'What should I wear for a Spartan Race?', a: 'Wear clothes you\'re happy to destroy. Expect mud, water, barbed wire and rope burns. Trail shoes are essential. Many athletes wear compression gear to protect their skin.' },
      { q: 'Can I run with a team?', a: 'Yes — many athletes enter as a group and run together. However, timing is individual unless you enter an official team relay format. Helping teammates with obstacles is encouraged and part of the Spartan culture.' },
      { q: 'Is the Trifecta worth it?', a: 'The Spartan Trifecta — completing a Sprint, Super and Beast in one calendar year — is one of the most popular goals in obstacle racing. You receive a unique Trifecta medal and patch for completing all three. Highly recommended for athletes who want a season-long challenge.' },
      { q: 'Are there cut-off times?', a: 'Most Spartan events have a course cut-off. Athletes who don\'t reach a checkpoint by the cut-off time may be pulled from the course. Cut-off times vary by event and distance — check your specific event details.' },
      { q: 'What is mandatory gear?', a: 'Sprint and Super events typically have minimal mandatory gear. Beast and Ultra events may require a pack with water, emergency blanket and other safety items. Check the mandatory gear list for your specific event before race day.' },
    ],
    'Ironman': [
      { q: 'What is the time limit for an IRONMAN?', a: 'IRONMAN has a 17-hour cut-off from the race start. Individual cut-offs also apply to each leg: typically 2:20 swim, ~10:30 combined swim+bike, and midnight for the run finish.' },
      { q: 'Do I need to qualify for an IRONMAN?', a: 'No qualifying is required to enter most IRONMAN events — registration is first-come, first-served or via ballot. Qualification is only required for Kona (IRONMAN World Championship).' },
      { q: 'How long should I train for?', a: 'Most first-timers follow a 20–30 week specific training plan. You need a solid base in all three disciplines before starting structured IRONMAN prep.' },
      { q: 'Can I use a wetsuit?', a: 'Wetsuit rules depend on water temperature. IRONMAN uses a temperature limit — wetsuits are allowed below 24.5 °C (76.1 °F) in competition. Above that, wetsuits are optional but you won\'t be eligible for age-group awards.' },
      { q: 'What should I eat on race day?', a: 'IRONMAN is too long to race on pre-race fuelling alone. Most athletes consume 60–90+ grams of carbohydrate per hour on the bike and run. Practice your nutrition strategy in training — don\'t try anything new on race day.' },
      { q: 'Are there Kona qualification slots at Asia Pacific events?', a: 'Yes. All IRONMAN events distribute Kona and World Championship qualification slots across age groups. The number of slots depends on race participation numbers. Check the official IRONMAN website for slot allocation details.' },
    ],
    'Ironman 70.3': [
      { q: 'What is the time limit for an IRONMAN 70.3?', a: 'IRONMAN 70.3 has an 8-hour 30-minute cut-off. Individual cut-offs apply to the swim (~1:10) and bike (~5:30 combined). Check your specific event for exact cut-off times.' },
      { q: 'Is 70.3 a good first triathlon?', a: 'Not typically — a sprint or Olympic-distance triathlon first is strongly recommended. IRONMAN 70.3 is best approached after completing shorter-distance events and building at least 6–12 months of structured triathlon training.' },
      { q: 'Does a 70.3 qualify me for the 70.3 World Championship?', a: 'Yes. IRONMAN 70.3 events distribute World Championship slots across age groups. Slots are awarded by roll-down at the post-race awards ceremony.' },
      { q: 'How do I prepare for the open water swim?', a: 'Practice in open water before race day. Pool fitness translates, but sighting, mass starts and wetsuit swimming require specific adaptation. Aim for at least 4–6 open water sessions during your build.' },
      { q: 'What transition do most athletes lose the most time in?', a: 'Most age-group athletes lose avoidable time in T1 (swim to bike). Arriving with a rehearsed routine — helmet, shoes, nutrition — can save 2–5 minutes compared to a disorganised transition.' },
      { q: 'Can I walk the run leg?', a: 'Yes — run-walk strategies are widely used and completely valid. Many athletes follow a run/walk interval plan for their first 70.3. Finishing is the goal.' },
    ],
    'Marathon': [
      { q: 'How long does it take to train for a marathon?', a: 'Most first-timers need 16–20 weeks of structured training with a running base of at least 30–40 km per week before starting. Experienced runners may use a 12–16 week peak block.' },
      { q: 'What is a good first marathon time?', a: 'Finishing is a great time. Most first-time marathoners aim for 4:00–5:30. Focus on completing the distance comfortably before chasing a specific time goal.' },
      { q: 'Should I run the whole marathon or use run-walk?', a: 'Run-walk intervals are a proven strategy for first-timers and can result in faster finish times than running continuously and hitting the wall. The Galloway method is one popular approach.' },
      { q: 'What should I eat the night before and morning of?', a: 'Carbohydrate-rich dinner the night before (pasta, rice, bread). Light, familiar breakfast 2–3 hours before the start. Nothing new on race morning — eat what you\'ve practised in training.' },
      { q: 'How do I avoid hitting the wall?', a: 'The wall (glycogen depletion around the 30–32 km mark) is caused by starting too fast and under-fuelling. Start conservatively, take gels or sports drink every 30–45 minutes from early in the race, and practise your nutrition strategy in your long runs.' },
      { q: 'What shoes should I wear?', a: 'Race in the shoes you\'ve trained in — never debut new shoes on race day. Many runners choose a lighter racing shoe for the event, but it must have been broken in over several training runs first.' },
    ],
    'Trail Running': [
      { q: 'What makes trail running different from road running?', a: 'Trail running involves unpredictable terrain — rocks, roots, mud, elevation change — which demands more from ankles, hips and core than road running. Pace is less relevant than time on feet, and navigation or course-marking awareness is often required.' },
      { q: 'What shoes should I use for trail running?', a: 'Trail-specific shoes with lugged outsoles are essential for grip on loose or wet terrain. The level of cushioning and protection you need depends on the course surface and distance.' },
      { q: 'Are poles allowed in trail races?', a: 'Many trail and ultra-distance events allow trekking poles. Some races require them as mandatory gear for steep mountain events. Check your specific event rules — some shorter trail races prohibit poles.' },
      { q: 'What is mandatory gear?', a: 'Longer trail and ultra events typically require a minimum pack with water capacity, emergency blanket, whistle, first aid kit and sometimes a mobile phone. The specific list is published in the race rulebook — check well in advance.' },
      { q: 'How do I train for a hilly trail race?', a: 'Prioritise vertical — total elevation gain in training matters more than flat kilometre volume. Hill repeats, stair climbing and hiking on technical terrain all contribute. Train on similar surfaces to your race where possible.' },
      { q: 'Can I eat real food during an ultra trail event?', a: 'Yes — and for longer ultras, you should. Most ultra events have aid stations stocked with real food (bananas, broth, sandwiches, potatoes). Real food is often easier to stomach than gels after 6+ hours on feet.' },
    ],
    'Deka Fit': [
      { q: 'What is Deka Fit?', a: 'Deka Fit is an indoor fitness race: 10 × 500 m runs alternating with 10 workout stations. The format is standardised globally, making all results directly comparable.' },
      { q: 'How does Deka Fit compare to HYROX?', a: 'Both are indoor fitness races with a standardised run-station format. Deka has 10 stations (versus HYROX\'s 8), shorter run intervals (500 m vs 1 km), and includes Box Jumps and Battle Ropes not found in HYROX. Total running is 5 km versus HYROX\'s 8 km.' },
      { q: 'Do I need prior experience?', a: 'No. Deka Fit is open to athletes of all fitness levels. If you can run 5 km and have a gym training base, you have the foundation to complete the event.' },
      { q: 'Are results globally ranked?', a: 'Yes. All Deka Fit results are entered into the global Deka ranking system, similar to HYROX\'s global leaderboard.' },
      { q: 'What should I train for Deka Fit?', a: 'Train all 10 station movements: Ski Erg, Sled Push/Pull, Burpee Jumps, Row Erg, Farmer\'s Carry, Sandbag Lunges, Wall Balls, Box Jumps and Battle Ropes. Running fitness matters — 5 km of run intervals between heavy stations accumulates quickly.' },
      { q: 'When are results published?', a: 'Results are typically available within 24–48 hours of the event. Chip timing captures individual splits at each station.' },
    ],
  }

  const rows = faqs[discipline]
  if (!rows) return null

  return (
    <section>
      <SectionHeading>Frequently Asked Questions</SectionHeading>
      <div className="space-y-4">
        {rows.map((faq) => (
          <div key={faq.q} className="card">
            <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Quick facts sidebar (discipline-aware) ───────────────────────────────────

function QuickFactsSidebar({ discipline }: { discipline: string }) {
  type Fact = { label: string; value: string }
  const facts: Record<string, Fact[]> = {
    'CrossFit': [
      { label: 'Format',          value: 'Multiple WODs (workouts of the day)' },
      { label: 'Scoring',         value: 'Time, load, or reps' },
      { label: 'Divisions',       value: 'RX, Scaled, Masters, Team, Adaptive' },
      { label: 'Duration',        value: '1–2 days' },
      { label: 'WODs per event',  value: '3–6 workouts typical' },
      { label: 'Spectators',      value: 'Free entry at most events' },
    ],
    'HYROX': [
      { label: 'Total running',   value: '8 km' },
      { label: 'Stations',        value: '8 workout stations' },
      { label: 'Format',          value: 'Run → Station × 8' },
      { label: 'Divisions',       value: 'Open, Pro, Doubles, Relay' },
      { label: 'Min. age',        value: '16 years' },
      { label: 'Timing',          value: 'Chip timed, global ranking' },
      { label: 'Spectators',      value: 'Free, all welcome' },
    ],
    'Spartan Race': [
      { label: 'Formats',         value: 'Sprint, Super, Beast, Ultra, Stadion' },
      { label: 'Distances',       value: '5 km – 50+ km' },
      { label: 'Obstacles',       value: '20–60+ per race' },
      { label: 'Penalty',         value: '30 burpees per failed obstacle' },
      { label: 'Timing',          value: 'Chip timed' },
      { label: 'Min. age',        value: '14 years (Sprint), 18 (Ultra)' },
    ],
    'Ironman': [
      { label: 'Swim',            value: '3.86 km' },
      { label: 'Bike',            value: '180.25 km' },
      { label: 'Run',             value: '42.2 km (marathon)' },
      { label: 'Total',           value: '226.3 km' },
      { label: 'Cut-off',         value: '17 hours' },
      { label: 'Kona slots',      value: 'Yes — by age group' },
    ],
    'Ironman 70.3': [
      { label: 'Swim',            value: '1.93 km' },
      { label: 'Bike',            value: '90.12 km' },
      { label: 'Run',             value: '21.1 km (half marathon)' },
      { label: 'Total',           value: '113.0 km' },
      { label: 'Cut-off',         value: '8 hr 30 min' },
      { label: 'Worlds slots',    value: 'Yes — 70.3 World Champs' },
    ],
    'Marathon': [
      { label: 'Distance',        value: '42.195 km' },
      { label: 'Average finish',  value: '4:00–4:30 (recreational)' },
      { label: 'Qualifying',      value: 'Most open to all — check event' },
    ],
    'Trail Running': [
      { label: 'Distances',       value: 'Varies — 10 km to 100+ km' },
      { label: 'Terrain',         value: 'Off-road, natural surface' },
      { label: 'Mandatory gear',  value: 'Required for longer events' },
      { label: 'Poles',           value: 'Allowed at most events (check)' },
    ],
    'Deka Fit': [
      { label: 'Total running',   value: '5 km' },
      { label: 'Stations',        value: '10 workout stations' },
      { label: 'Format',          value: 'Run → Station × 10' },
      { label: 'Timing',          value: 'Chip timed, global ranking' },
      { label: 'Min. age',        value: '16 years' },
      { label: 'Spectators',      value: 'Free, all welcome' },
    ],
  }

  const rows = facts[discipline]
  if (!rows) return null

  return (
    <div className="card space-y-3 text-sm">
      <h2 className="font-semibold text-white">Quick Facts</h2>
      {rows.map((fact) => (
        <div key={fact.label} className="flex justify-between gap-4">
          <span className="text-ink-muted">{fact.label}</span>
          <span className="text-ink text-right">{fact.value}</span>
        </div>
      ))}
    </div>
  )
}
