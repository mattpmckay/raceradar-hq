import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Globe, Train, Car, Clock, Users, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BYD HYROX Sydney 2026 — Race Guide, Categories, Venue & Tips',
  description:
    'Everything you need to know about BYD HYROX Sydney 2026. Race format, event categories, entry fees, venue information, weekend tips and FAQs for Sydney Showground Olympic Park.',
  openGraph: {
    title: 'BYD HYROX Sydney 2026 — Race Guide',
    description:
      'Complete guide to BYD HYROX Sydney 2026 at Sydney Showground Olympic Park. Categories, format, entry fees, venue tips and FAQs.',
  },
}

const CATEGORIES = [
  {
    name: 'Open Individual',
    description: 'The entry-level division for recreational athletes. No weight vest required. Complete all 8 runs and 8 workout stations at the standard distances.',
    tag: 'Most Popular',
    tagVariant: 'brand' as const,
  },
  {
    name: 'Pro Individual',
    description: 'Competitive division for experienced athletes. Weight vest required (10 kg men / 6 kg women). Stricter standards and shorter time cut-offs.',
    tag: 'Competitive',
    tagVariant: 'warning' as const,
  },
  {
    name: 'Doubles',
    description: 'Race as a pair — two athletes who alternate completing each workout station and share the running. Great for training partners.',
    tag: 'Team of 2',
    tagVariant: 'success' as const,
  },
  {
    name: 'Relay',
    description: 'Teams of up to four athletes split all exercises between them. The most social format — ideal for corporate teams and groups.',
    tag: 'Team of 4',
    tagVariant: 'success' as const,
  },
]

const WORKOUT_STATIONS = [
  { order: 1, name: 'SkiErg',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 2, name: 'Sled Push',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 3, name: 'Sled Pull',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 4, name: 'Burpee Broad Jump', distance: '80 m',     note: '50 m Women' },
  { order: 5, name: 'Rowing',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 6, name: 'Farmer\'s Carry',   distance: '200 m',    note: '2 × 24 kg Men / 2 × 16 kg Women' },
  { order: 7, name: 'Sandbag Lunges',    distance: '100 m',    note: '20 kg Men / 10 kg Women' },
  { order: 8, name: 'Wall Balls',        distance: '100 reps', note: '6 kg Men / 4 kg Women' },
]

const ENTRY_LEVELS = [
  {
    title: 'Beginner',
    desc: 'You can run 5 km comfortably and have 3–6 months of gym training. HYROX Open is well within reach — start with a 12–16 week prep block.',
    cta: 'Target finish: 90–120 min',
  },
  {
    title: 'Intermediate',
    desc: 'Regular gym-goer with solid cardio. You\'ve done obstacle or running events before. Focus on improving your running pace between stations.',
    cta: 'Target finish: 75–90 min',
  },
  {
    title: 'Competitive',
    desc: 'CrossFit, triathlon or elite running background. Consider the Pro division if you\'re targeting a top-10 age-group finish or sub-60-minute time.',
    cta: 'Target finish: Sub-75 min (Open) / Sub-60 min (Pro)',
  },
]

const FEES = [
  { category: 'Open Individual',  price: '~AUD $175–195' },
  { category: 'Pro Individual',   price: '~AUD $175–195' },
  { category: 'Open Doubles',     price: '~AUD $300–340 per team' },
  { category: 'Open Relay',       price: '~AUD $440–480 per team' },
]

const FAQS = [
  {
    q: 'What exactly is HYROX?',
    a: 'HYROX is a standardised global fitness race created in Germany in 2017. Every event worldwide uses the same format: 8 × 1 km runs alternating with 8 functional workout stations — SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmer\'s Carry, Sandbag Lunges and Wall Balls. Because the format never changes, your time is directly comparable to athletes who raced in Tokyo, London or New York.',
  },
  {
    q: 'Do I need prior experience to enter?',
    a: 'No. The Open division is designed for recreational athletes of all fitness levels. If you can run 5 km and have spent a few months training in a gym, you have the base fitness to complete HYROX. Most first-timers choose Open Individual or Open Doubles for their debut.',
  },
  {
    q: 'What is the difference between Open and Pro?',
    a: 'The main differences are weight vest requirements and workout distances. Pro athletes must wear a 10 kg vest (men) or 6 kg vest (women) for the entire race, and some stations have shortened distances. Pro is a self-seeded competitive division — you don\'t need to qualify, but expect a significantly harder race.',
  },
  {
    q: 'Can I enter with a friend or team?',
    a: 'Yes. The Doubles format pairs two athletes who split all exercises between them and alternate running laps. The Relay format allows teams of up to four, making it the most flexible team option. Both formats are popular for corporate groups, training partners and sporting clubs.',
  },
  {
    q: 'What should I specifically train for?',
    a: 'Prioritise your running — most athletes underestimate how demanding 8 km of running feels after repeated heavy stations. Then train the specific movements: SkiErg and Rowing for pull endurance, Sled work for leg drive, Wall Balls for shoulder and leg stamina, and Sandbag Lunges for single-leg strength. Aim for gym-to-run transitions to simulate the race-day feeling.',
  },
  {
    q: 'Is there a minimum age requirement?',
    a: 'Athletes must be at least 16 years old to enter HYROX Sydney. Athletes aged 16–17 must have written parental or guardian consent. There is no upper age limit — HYROX has age categories through to 70+.',
  },
  {
    q: 'What happens if I can\'t finish a workout station?',
    a: 'You must complete the full station before you can move to the next running lap. There are no skips or substitutions. If you\'re struggling, rest, then continue — you won\'t be disqualified for taking longer than expected. Time penalties apply if you attempt to move on before completing the full distance or reps.',
  },
  {
    q: 'When are results published?',
    a: 'Official results are typically published within 24–48 hours of the event closing. HYROX uses chip timing so your individual net time is captured at each station transition. Results are posted on the official HYROX website and app, and your time counts towards your global HYROX ranking.',
  },
]

export default async function HYROXSydneyPage() {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', 'byd-hyrox-sydney')
    .eq('is_published', true)
    .single()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: 'BYD HYROX Sydney',
    url: `${siteUrl}/events/byd-hyrox-sydney`,
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'HYROX',
    location: {
      '@type': 'Place',
      name: 'Sydney Showground Olympic Park',
      address: { '@type': 'PostalAddress', addressLocality: 'Sydney', addressCountry: 'AU' },
    },
    organizer: { '@type': 'Organization', name: 'HYROX' },
    sameAs: 'https://hyrox.com/event/hyrox-sydney/',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    <div className="container-page py-10">
      <Link href="/events" className="btn-ghost mb-6 inline-flex px-0 text-gray-400">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="brand">HYROX</Badge>
              <Badge variant="outline">Race</Badge>
              <Badge variant="warning">Featured</Badge>
            </div>
            <h1 className="page-title">BYD HYROX Sydney 2026</h1>
            <p className="mt-3 text-gray-400 text-lg">
              Sydney Showground, Olympic Park &nbsp;·&nbsp; 1–5 July 2026 &nbsp;·&nbsp; 🇦🇺 Australia
            </p>
          </div>

          {/* About */}
          <section>
            <SectionHeading>About the Event</SectionHeading>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                HYROX is the world&apos;s fastest-growing fitness race, combining endurance running with
                functional strength workouts in a single, standardised format. Since its launch in
                Hamburg in 2017, the race has expanded to more than 50 cities across six continents,
                attracting both elite athletes and recreational competitors under the same roof on the
                same day. The format is deliberately unchanging: eight 1 km runs, each followed
                immediately by one of eight workout stations — making every finish time globally
                comparable.
              </p>
              <p>
                The BYD HYROX Sydney event is one of the flagship stops on the Asia Pacific calendar.
                Held at Sydney Showground in the heart of Sydney Olympic Park, it draws thousands of
                competitors from across Australia and the wider APAC region, making it one of the
                largest fitness race gatherings on the continent. The Showground&apos;s purpose-built
                arena allows spectators to watch the entire race floor from the stands — an experience
                unique to HYROX among endurance events.
              </p>
              <p>
                Whether you&apos;re racing your first HYROX or chasing a Pro podium, Sydney offers
                world-class organisation, a high-energy crowd and one of the best post-race atmospheres
                of any event on the APAC circuit. The July timing also makes it one of the
                cooler-condition HYROX races in the Australian calendar — a real advantage for athletes
                targeting a personal best.
              </p>
            </div>
          </section>

          {/* Race Format */}
          <section>
            <SectionHeading>Race Format</SectionHeading>
            <p className="text-gray-400 mb-6">
              The race consists of 8 rounds. Each round starts with a 1 km run followed immediately
              by one workout station. Total running distance: 8 km. Total workout volume is fixed
              regardless of category (weights differ by division and gender).
            </p>
            <div className="overflow-x-auto rounded-xl border border-surface-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Station</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Distance / Reps</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKOUT_STATIONS.map((s, i) => (
                    <tr
                      key={s.order}
                      className={`border-b border-surface-border last:border-0 ${i % 2 === 0 ? '' : 'bg-surface-card/40'}`}
                    >
                      <td className="px-4 py-3 text-brand-400 font-bold">{s.order}</td>
                      <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-gray-300">{s.distance}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Each run station begins with 1 km on the race floor before the workout station.
              Pro division distances and weights may vary — confirm with the official HYROX race guide.
            </p>
          </section>

          {/* Categories */}
          <section>
            <SectionHeading>Event Categories</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="card flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <Badge variant={cat.tagVariant}>{cat.tag}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{cat.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Who Should Enter */}
          <section>
            <SectionHeading>Who Should Enter?</SectionHeading>
            <div className="space-y-4">
              {ENTRY_LEVELS.map((level) => (
                <div key={level.title} className="card flex gap-4">
                  <CheckCircle className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">{level.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{level.desc}</p>
                    <p className="mt-2 text-xs font-medium text-brand-400">{level.cta}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Entry Fees */}
          <section>
            <SectionHeading>Entry Fees</SectionHeading>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Category</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Approx. Price</th>
                  </tr>
                </thead>
                <tbody>
                  {FEES.map((fee, i) => (
                    <tr key={fee.category} className={`border-b border-surface-border last:border-0 ${i % 2 === 0 ? '' : 'bg-surface-card/40'}`}>
                      <td className="px-5 py-3.5 text-white font-medium">{fee.category}</td>
                      <td className="px-5 py-3.5 text-gray-300">{fee.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Prices are approximate and based on early-bird rates. Fees increase as the event
              approaches and may vary. Check the official HYROX website for current pricing
              before registering.
            </p>
          </section>

          {/* Venue */}
          <section>
            <SectionHeading>Venue Information</SectionHeading>
            <div className="card space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-1">Sydney Showground, Sydney Olympic Park</h3>
                <p className="text-sm text-gray-400">1 Showground Rd, Sydney Olympic Park NSW 2127</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Sydney Showground is one of Australia&apos;s premier multi-purpose event venues, located
                within the iconic Sydney Olympic Park precinct at Homebush Bay — 14 km west of the
                Sydney CBD. The venue&apos;s main exhibition hall is transformed into the full HYROX race
                floor for the event, with a spectator grandstand that gives friends and family an
                unobstructed view of every workout station and running lap.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Sydney Olympic Park is one of the most well-serviced event precincts in the country,
                with dedicated rail access, large carparks and a wide range of food and hospitality
                options. The surrounding parklands are perfect for a warm-up jog before your wave
                or a recovery walk post-race.
              </p>
            </div>
          </section>

          {/* Tips */}
          <section>
            <SectionHeading>Race Weekend Tips</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Clock className="h-4 w-4" /> Arrival
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Plan to arrive at least 90 minutes before your assigned wave start time. Allow
                  time for bag drop, warm-up and finding your start corral. Late arrivals may
                  forfeit their wave slot.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Train className="h-4 w-4" /> Public Transport
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Take the T1 Western Line to Olympic Park station — a 5-minute walk to the
                  Showground entrance. Trains run frequently from the CBD, Parramatta and
                  surrounding suburbs. Strongly recommended over driving on peak event days.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Car className="h-4 w-4" /> Parking
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Multiple carparks are located within Sydney Olympic Park. P7 is the closest to
                  the Showground. Parking fills quickly — book in advance via Sydney Olympic Park
                  or use ride-share services for a stress-free arrival.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Users className="h-4 w-4" /> Spectators
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Spectators are welcome and do not need a race ticket. The Showground grandstand
                  allows full visibility of the race floor. The crowd atmosphere at HYROX Sydney
                  is a major part of what makes the event special — bring your crew.
                </p>
              </div>

            </div>

            <div className="card mt-4">
              <h3 className="font-semibold text-white mb-3">What to Bring</h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-400">
                {[
                  'Email confirmation or HYROX app entry',
                  'Appropriate training shoes (no spikes)',
                  'Race outfit you can move freely in',
                  'Water bottle (refill stations on site)',
                  'Wireless headphones if permitted in your division',
                  'Recovery snack for post-race',
                  'Foam roller or resistance band for warm-up',
                  'Any personal sports nutrition you rely on',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-brand-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Plan Your Trip */}
          <section>
            <SectionHeading>Plan Your Trip</SectionHeading>
            <div className="card border-dashed text-center py-10">
              <p className="text-gray-400 text-sm font-medium">Coming soon</p>
              <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto">
                Hotel recommendations, flight tips, Sydney things to do and travel packages
                will be listed here closer to the event.
              </p>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <SectionHeading>Frequently Asked Questions</SectionHeading>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="card">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

          {/* Event details from Supabase */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Event Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">
                    {event ? formatDate(event.start_date) : '1 July 2026'}
                  </div>
                  {event?.end_date && event.end_date !== event.start_date && (
                    <div className="text-gray-400">to {formatDate(event.end_date)}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">Sydney Showground</div>
                  <div className="text-gray-400">Sydney Olympic Park, NSW</div>
                </div>
              </div>
            </div>

            {event?.website_url && (
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
          <div className="card space-y-3 text-sm">
            <h2 className="font-semibold text-white">Quick Facts</h2>
            {[
              { label: 'Total distance',  value: '8 km running + 8 stations' },
              { label: 'Format',          value: 'Run → Station × 8' },
              { label: 'Divisions',       value: 'Open, Pro, Doubles, Relay' },
              { label: 'Min. age',        value: '16 years' },
              { label: 'Timing',          value: 'Chip timed, global ranking' },
              { label: 'Spectators',      value: 'Free entry, all welcome' },
            ].map((fact) => (
              <div key={fact.label} className="flex justify-between gap-4">
                <span className="text-gray-500">{fact.label}</span>
                <span className="text-gray-300 text-right">{fact.value}</span>
              </div>
            ))}
          </div>

          {/* More HYROX events */}
          <div className="card space-y-3 text-sm">
            <h2 className="font-semibold text-white">More HYROX Events</h2>
            <ul className="space-y-2 text-gray-400">
              {[
                { label: 'HYROX Perth',        href: '/events/airasia-hyrox-perth' },
                { label: 'HYROX Chiba',        href: '/events/airasia-hyrox-chiba' },
                { label: 'HYROX Bangkok',      href: '/events/byd-hyrox-bangkok' },
                { label: 'HYROX Singapore',    href: '/events/aia-hyrox-singapore' },
              ].map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="hover:text-white transition-colors">
                    {e.label} →
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/events?discipline=HYROX" className="text-brand-400 hover:text-brand-300 transition-colors text-xs">
              View all HYROX events →
            </Link>
          </div>

        </aside>
      </div>
    </div>
    </>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white mb-5 pb-3 border-b border-surface-border">
      {children}
    </h2>
  )
}
