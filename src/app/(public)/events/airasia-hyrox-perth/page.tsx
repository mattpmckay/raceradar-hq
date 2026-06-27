import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Globe, Train, Car, Clock, Users, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AirAsia HYROX Perth 2026 — Race Guide, Categories, Venue & Tips',
  description:
    'Everything you need to know about AirAsia HYROX Perth 2026. Race format, event categories, entry fees, venue information at Perth Convention & Exhibition Centre, weekend tips and FAQs.',
  openGraph: {
    title: 'AirAsia HYROX Perth 2026 — Race Guide',
    description:
      'Complete guide to AirAsia HYROX Perth 2026 at Perth Convention & Exhibition Centre. Categories, format, entry fees, venue tips and FAQs.',
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
    description: 'Teams of up to four athletes split all exercises between them. The most social format — ideal for corporate teams and sporting clubs.',
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
    desc: 'You can run 5 km comfortably and have 3–6 months of gym training. HYROX Open Individual is a great first target — follow a 12–16 week prep block and you\'ll be ready.',
    cta: 'Target finish: 90–120 min',
  },
  {
    title: 'Intermediate',
    desc: 'Regular gym-goer with solid cardio. You\'ve done a run or obstacle event before. Work on your running pace between stations — that\'s where most athletes lose time.',
    cta: 'Target finish: 75–90 min',
  },
  {
    title: 'Competitive',
    desc: 'CrossFit, triathlon or elite running background. Consider the Pro division if you\'re chasing a top-10 age-group result or targeting sub-60 minutes.',
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
    q: 'What is HYROX and how does it differ from a regular fun run?',
    a: 'HYROX is a standardised global fitness race that combines running with functional workout stations. Unlike a road race, which is purely a running event, HYROX alternates 8 × 1 km runs with 8 workout stations — SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmer\'s Carry, Sandbag Lunges and Wall Balls. Every HYROX event worldwide uses the same format, so your Perth finish time is directly comparable to athletes who raced in London, Tokyo or New York.',
  },
  {
    q: 'Why is AirAsia the naming sponsor for the Perth event?',
    a: 'AirAsia has partnered with HYROX as the title sponsor for selected Asia Pacific events. The branding is purely commercial — the race format, rules, and organisation are identical to every other HYROX event globally. Your result still counts toward your HYROX global ranking.',
  },
  {
    q: 'Do I need prior experience to enter HYROX Perth?',
    a: 'No. The Open division is designed for recreational athletes of all fitness levels. If you can run 5 km and have a base of gym training, you have the foundation to complete HYROX. Most first-timers choose Open Individual or Open Doubles for their debut event.',
  },
  {
    q: 'What is the difference between Open and Pro?',
    a: 'The main differences are the weight vest and some station distances. Pro athletes must wear a 10 kg vest (men) or 6 kg vest (women) for the entire race, and several stations have reduced distances. Pro is self-seeded — you don\'t need to qualify — but expect a significantly harder race and faster field around you.',
  },
  {
    q: 'Can I race with a friend or a corporate team?',
    a: 'Yes. The Doubles format pairs two athletes who alternate running laps and split workout stations. The Relay format allows teams of up to four athletes to divide all exercises between them — the most popular option for corporate groups, sporting clubs and friend squads. Both formats are included in the standard registration portal.',
  },
  {
    q: 'Why is late August a great time to race in Perth?',
    a: 'August falls in Perth\'s late winter / early spring window. Average temperatures are typically 18–22 °C with low humidity — among the best race-day conditions in Australia. Athletes targeting a personal best or first HYROX completion often find the cooler Perth conditions far more manageable than summer events on the east coast.',
  },
  {
    q: 'What should I train specifically for HYROX Perth?',
    a: 'Prioritise your running — most athletes underestimate how heavy the legs feel after repeated stations. Then focus on the specific HYROX movements: SkiErg and Rowing for pulling endurance, Sled work for leg drive, Wall Balls for shoulder and leg stamina, and Sandbag Lunges for single-leg strength under fatigue. Practice gym-to-run transitions: finish a hard set, then immediately step on a treadmill or hit the road.',
  },
  {
    q: 'When are results published and do they count toward a global ranking?',
    a: 'Official results are typically published within 24–48 hours of the event closing. HYROX uses chip timing to capture your net time at each transition. All results are posted on the official HYROX website and app and count towards your global HYROX ranking — opening the door to HYROX World Championships qualification.',
  },
]

export default async function HYROXPerthPage() {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', 'airasia-hyrox-perth')
    .eq('is_published', true)
    .single()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: 'AirAsia HYROX Perth',
    url: `${siteUrl}/events/airasia-hyrox-perth`,
    startDate: '2026-08-21',
    endDate: '2026-08-23',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'HYROX',
    location: {
      '@type': 'Place',
      name: 'Perth Convention & Exhibition Centre',
      address: { '@type': 'PostalAddress', addressLocality: 'Perth', addressCountry: 'AU' },
    },
    organizer: { '@type': 'Organization', name: 'HYROX' },
    sameAs: 'https://hyrox.com/event/hyrox-perth/',
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
            <h1 className="page-title">AirAsia HYROX Perth 2026</h1>
            <p className="mt-3 text-gray-400 text-lg">
              Perth Convention &amp; Exhibition Centre &nbsp;·&nbsp; 21–23 August 2026 &nbsp;·&nbsp; 🇦🇺 Australia
            </p>
          </div>

          {/* About */}
          <section>
            <SectionHeading>About the Event</SectionHeading>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                AirAsia HYROX Perth brings the world&apos;s fastest-growing fitness race to Western
                Australia for the first time as a major APAC calendar fixture. HYROX was founded in
                Hamburg in 2017 with a simple but powerful idea: combine long-distance running with
                functional strength workouts in a fully standardised format — so that every finish
                time, in every city, on every continent, is directly comparable. The race has since
                expanded to more than 50 cities worldwide, and the Perth edition joins Sydney,
                Melbourne, Singapore and Chiba as one of the headline Asia Pacific stops.
              </p>
              <p>
                The event is held at the Perth Convention &amp; Exhibition Centre (PCEC), one of
                Western Australia&apos;s premier multi-purpose venues, located on the banks of the Swan
                River in the heart of the CBD. The PCEC&apos;s main exhibition hall is transformed into
                the full HYROX race floor — a setup that allows spectators to watch every workout
                station and every running lap from the same vantage point, creating an atmosphere
                more like an indoor stadium event than a traditional running race.
              </p>
              <p>
                Late August in Perth means cool morning temperatures, low humidity and reliably dry
                conditions — making it one of the most athlete-friendly weather windows on the
                entire HYROX APAC calendar. Whether you&apos;re a first-timer chasing a completion or a
                seasoned HYROX racer targeting a qualifier time for the HYROX World Championships,
                Perth offers the right conditions to race your best.
              </p>
            </div>
          </section>

          {/* Race Format */}
          <section>
            <SectionHeading>Race Format</SectionHeading>
            <p className="text-gray-400 mb-6">
              Every HYROX event uses the same format: 8 rounds, each starting with a 1 km run
              followed immediately by one workout station. Total running distance: 8 km. Workout
              volume is fixed across all categories — only weights and vest requirements differ by
              division and gender.
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
              Each round begins with a 1 km run before the workout station. Pro division distances
              and weights may vary — confirm with the official HYROX race guide closer to the event.
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
                <h3 className="font-semibold text-white mb-1">Perth Convention &amp; Exhibition Centre (PCEC)</h3>
                <p className="text-sm text-gray-400">21 Mounts Bay Rd, Perth WA 6000</p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                The Perth Convention &amp; Exhibition Centre sits on the southern bank of the Swan
                River, a short walk from the Perth CBD and Elizabeth Quay. The venue is one of the
                largest and most technically capable event facilities in Western Australia, with a
                main exhibition hall large enough to host the full HYROX race floor — including all
                eight workout stations and a running track — under a single roof. The layout means
                spectators can stand trackside or find an elevated vantage point to watch the
                complete race without moving.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                The PCEC is surrounded by the Elizabeth Quay precinct, with waterfront dining,
                bars and accommodation all within walking distance. Post-race recovery with a view
                of the Swan River is one of the more unique post-HYROX experiences available
                anywhere on the circuit.
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
                  Plan to arrive at least 90 minutes before your wave start time. Allow time for
                  bag drop, warm-up and locating your start corral. Late arrivals risk forfeiting
                  their wave slot and will not be reseeded.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Train className="h-4 w-4" /> Public Transport
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The PCEC is a 10-minute walk from Perth Station and well-connected to the free
                  CAT bus network. Transperth trains serve the CBD from Fremantle, Joondalup,
                  Midland and Mandurah. Train travel is strongly recommended on event days.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Car className="h-4 w-4" /> Parking
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Wilson Parking and Secure Parking operate multiple undercover carparks within
                  200 m of the PCEC. Street parking on Mounts Bay Rd is limited on event days.
                  Book in advance via the PCEC website or use ride-share for a stress-free arrival.
                </p>
              </div>

              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-brand-400 font-medium text-sm">
                  <Users className="h-4 w-4" /> Spectators
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Spectators are welcome and do not need a race ticket. The exhibition hall
                  layout provides clear sightlines to all eight workout stations and the running
                  track — bring supporters and make the most of the crowd atmosphere.
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
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div className="card space-y-2">
                <h3 className="font-semibold text-white text-sm">Getting to Perth</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Perth Airport (PER) is served by Qantas, Virgin Australia, Jetstar and AirAsia
                  from all major Australian cities. Direct international routes connect Perth to
                  Singapore, Kuala Lumpur, Bali and Doha. Domestic flights to Perth from Sydney
                  or Melbourne are approximately 4–5 hours.
                </p>
              </div>
              <div className="card space-y-2">
                <h3 className="font-semibold text-white text-sm">Staying Near the Venue</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The Elizabeth Quay and Perth CBD area has a wide range of accommodation from
                  budget to luxury, all within walking distance of the PCEC. Booking 2–3 months
                  in advance is recommended for August event weekends when Perth fills quickly.
                </p>
              </div>
            </div>
            <div className="card border-dashed text-center py-8">
              <p className="text-gray-400 text-sm font-medium">Hotel &amp; flight packages — coming soon</p>
              <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto">
                Curated hotel recommendations and travel packages will be listed here closer to the event.
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
                    {event ? formatDate(event.start_date) : '21 August 2026'}
                  </div>
                  {event?.end_date && event.end_date !== event.start_date && (
                    <div className="text-gray-400">to {formatDate(event.end_date)}</div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">Perth Convention &amp; Exhibition Centre</div>
                  <div className="text-gray-400">21 Mounts Bay Rd, Perth WA</div>
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
              { label: 'Weather (Aug)',   value: '~18–22 °C, low humidity' },
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
                { label: 'HYROX Sydney',    href: '/events/byd-hyrox-sydney' },
                { label: 'HYROX Chiba',     href: '/events/airasia-hyrox-chiba' },
                { label: 'HYROX Bangkok',   href: '/events/byd-hyrox-bangkok' },
                { label: 'HYROX Singapore', href: '/events/aia-hyrox-singapore' },
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
