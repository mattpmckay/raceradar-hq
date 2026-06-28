import Link from 'next/link'
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Locations — Find Events by Country & City | RaceRadar HQ' },
  description:
    'Explore fitness races and endurance events across Asia Pacific. Find HYROX, Spartan Race, Ironman, Marathon and trail events in Australia, Japan, Singapore, Thailand, China, South Korea, New Zealand and more.',
  openGraph: {
    title: 'Locations — Events Across Asia Pacific | RaceRadar HQ',
    description:
      'Browse race events by country and city across 9 Asia Pacific destinations.',
  },
}

// ─── Location definitions ─────────────────────────────────────────────────────

interface CountryDef {
  country: string
  flag: string
  region: string
  blurb: string
  cities: string[]
  disciplines: string[]
}

const REGIONS: { name: string; countries: CountryDef[] }[] = [
  {
    name: 'Oceania',
    countries: [
      {
        country: 'Australia',
        flag: '🇦🇺',
        region: 'Oceania',
        blurb:
          'The heartland of Asia Pacific fitness racing. HYROX, Spartan Race, Ironman and trail runs span city arenas and rugged national parks from Perth to the Gold Coast — with more events per capita than almost anywhere in the region.',
        cities: ['Sydney', 'Melbourne', 'Perth', 'Brisbane', 'Gold Coast', 'Cairns', 'Geelong'],
        disciplines: ['HYROX', 'Spartan Race', 'Ironman', 'Ironman 70.3', 'Marathon', 'Trail Running'],
      },
      {
        country: 'New Zealand',
        flag: '🇳🇿',
        region: 'Oceania',
        blurb:
          "Taupo's volcanic lakefront is one of the world's most celebrated Ironman venues, drawing international fields every March. New Zealand's trail and ultra running scene is equally iconic — remote, technical and breathtakingly scenic.",
        cities: ['Taupo', 'Auckland', 'Queenstown'],
        disciplines: ['Ironman', 'Ironman 70.3', 'Trail Running', 'Marathon'],
      },
    ],
  },
  {
    name: 'East Asia',
    countries: [
      {
        country: 'China',
        flag: '🇨🇳',
        region: 'East Asia',
        blurb:
          "One of the fastest-growing markets for structured fitness racing. HYROX has rapidly expanded across China's major eastern cities, with events in coastal metropolises and mountain resort destinations alike.",
        cities: ['Shanghai', 'Beijing', 'Hangzhou', 'Shenzhen', 'Guangzhou', 'Sanya'],
        disciplines: ['HYROX', 'Spartan Race', 'Trail Running'],
      },
      {
        country: 'Japan',
        flag: '🇯🇵',
        region: 'East Asia',
        blurb:
          'From stadium fitness races in Chiba to Spartan obstacle races on the slopes of Mt Fuji, Japan blends world-class event organisation with extraordinary venues. The Tokyo Marathon and trail culture in the Japanese Alps attract global fields.',
        cities: ['Tokyo', 'Chiba', 'Susono (Mt Fuji)'],
        disciplines: ['HYROX', 'Spartan Race', 'Marathon', 'Trail Running'],
      },
      {
        country: 'South Korea',
        flag: '🇰🇷',
        region: 'East Asia',
        blurb:
          "Seoul's thriving fitness community has embraced HYROX as a flagship indoor race format. The city's purpose-built arena venues and passionate crowds create an electric race-day atmosphere.",
        cities: ['Seoul'],
        disciplines: ['HYROX'],
      },
      {
        country: 'Hong Kong',
        flag: '🇭🇰',
        region: 'East Asia',
        blurb:
          'Trail running is a cultural institution in Hong Kong. Ultra-distances across Lantau Island and the surrounding peaks draw international fields, and the HYROX circuit has added a major indoor race to the city\'s calendar.',
        cities: ['Hong Kong Island', 'Lantau Island'],
        disciplines: ['HYROX', 'Trail Running'],
      },
    ],
  },
  {
    name: 'Southeast Asia',
    countries: [
      {
        country: 'Singapore',
        flag: '🇸🇬',
        region: 'Southeast Asia',
        blurb:
          "A compact, logistically excellent city-state that punches above its weight for international race events. Singapore's HYROX and Ironman events attract athletes from across Southeast Asia and beyond.",
        cities: ['Singapore'],
        disciplines: ['HYROX', 'Ironman 70.3', 'Marathon'],
      },
      {
        country: 'Thailand',
        flag: '🇹🇭',
        region: 'Southeast Asia',
        blurb:
          'Bangkok hosts multiple international HYROX and Spartan events, combining world-class athletics with one of Asia\'s most vibrant host cities. Chiang Mai\'s mountain terrain makes it a natural home for trail and obstacle racing.',
        cities: ['Bangkok', 'Chiang Mai'],
        disciplines: ['HYROX', 'Spartan Race', 'Ironman 70.3', 'Trail Running'],
      },
      {
        country: 'Indonesia',
        flag: '🇮🇩',
        region: 'Southeast Asia',
        blurb:
          "Jakarta has joined the HYROX APAC circuit, bringing the world's premier fitness race format to Southeast Asia's largest city. Bali's trail running and triathlon scene continues to grow as a destination for international athletes.",
        cities: ['Jakarta', 'Bali'],
        disciplines: ['HYROX', 'Ironman 70.3', 'Trail Running'],
      },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LocationsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: raw } = await supabase
    .from('events')
    .select('country')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')

  const counts: Record<string, number> = {}
  for (const row of raw ?? []) {
    if (row.country) counts[row.country] = (counts[row.country] ?? 0) + 1
  }

  const totalEvents = Object.values(counts).reduce((a, b) => a + b, 0)
  const totalCountries = Object.keys(counts).length
  const totalCities = REGIONS.flatMap((r) => r.countries).reduce(
    (acc, c) => acc + c.cities.length,
    0,
  )

  return (
    <div className="container-page py-10">

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <h1 className="page-title">Locations</h1>
        <p className="mt-3 text-ink-muted text-lg leading-relaxed">
          Discover fitness races and endurance events across Asia Pacific — from Sydney&apos;s indoor
          arenas to the slopes of Mt Fuji.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-12 grid grid-cols-3 gap-4 max-w-lg">
        {[
          { value: totalEvents, label: 'upcoming events' },
          { value: totalCountries, label: 'countries' },
          { value: totalCities,   label: 'cities & venues' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center py-4">
            <div className="text-2xl font-bold text-ink">{stat.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Region sections */}
      <div className="space-y-14">
        {REGIONS.map((region) => (
          <section key={region.name}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-muted mb-5">
              {region.name}
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {region.countries.map((loc) => {
                const count = counts[loc.country] ?? 0
                return (
                  <div
                    key={loc.country}
                    className="card flex flex-col gap-4 hover:border-wire transition-colors"
                  >
                    {/* Flag + name + count */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{loc.flag}</span>
                        <div>
                          <h3 className="font-bold text-ink text-lg leading-tight">{loc.country}</h3>
                          <p className="text-xs text-ink-muted">{loc.region}</p>
                        </div>
                      </div>
                      {count > 0 && (
                        <span className="shrink-0 rounded-full bg-panel border border-wire px-2.5 py-0.5 text-xs font-medium text-ink">
                          {count} upcoming
                        </span>
                      )}
                    </div>

                    {/* Blurb */}
                    <p className="text-sm text-ink-muted leading-relaxed flex-1">
                      {loc.blurb}
                    </p>

                    {/* Cities */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin className="h-3 w-3 text-ink-muted" />
                        <span className="text-xs text-ink-muted font-medium">Key cities</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {loc.cities.map((city) => (
                          <span
                            key={city}
                            className="rounded-md bg-panel border border-wire px-2 py-0.5 text-xs text-ink-muted"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Disciplines */}
                    <div className="flex flex-wrap gap-1.5">
                      {loc.disciplines.map((d) => (
                        <span key={d} className="text-xs text-ink-muted">
                          {d}
                          {loc.disciplines.indexOf(d) < loc.disciplines.length - 1 ? ' ·' : ''}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    {count > 0 ? (
                      <Link
                        href={`/events?country=${encodeURIComponent(loc.country)}`}
                        className="flex items-center gap-1 text-sm font-medium text-mint hover:text-mint-300 transition-colors"
                      >
                        View {loc.country} events
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <p className="text-xs text-ink-muted">Events coming soon</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl border border-wire bg-panel p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Browse all events</h2>
        <p className="mt-2 text-ink-muted max-w-md mx-auto">
          View the full calendar across every location, discipline and date — with filters to
          narrow it down.
        </p>
        <Link href="/events" className="btn-primary mt-5 inline-flex">
          View all events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  )
}
