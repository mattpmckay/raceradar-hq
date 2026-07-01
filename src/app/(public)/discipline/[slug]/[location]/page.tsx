import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import type { Metadata } from 'next'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToCity(locationSlug: string): string {
  return locationSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const today    = new Date().toISOString().split('T')[0]

    const [{ data: disciplines }, { data: events }] = await Promise.all([
      supabase.from('disciplines').select('slug, event_discipline_values').eq('is_active', true),
      supabase
        .from('events')
        .select('discipline, city')
        .eq('is_published', true)
        .gte('start_date', today)
        .not('city', 'is', null),
    ])

    if (!disciplines || !events) return []

    const params: Array<{ slug: string; location: string }> = []

    for (const discipline of disciplines) {
      const values = (discipline.event_discipline_values ?? []) as string[]
      const cities = [
        ...new Set(
          events
            .filter((e) => values.includes(e.discipline))
            .map((e) => e.city!)
            .filter(Boolean),
        ),
      ]
      for (const city of cities) {
        params.push({
          slug: discipline.slug,
          location: city.toLowerCase().replace(/\s+/g, '-'),
        })
      }
    }

    return params
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; location: string }>
}): Promise<Metadata> {
  const { slug, location } = await params
  const supabase = await createClient()
  const cityName = slugToCity(location)

  const { data: discipline } = await supabase
    .from('disciplines')
    .select('name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!discipline) return { title: 'Not found' }

  const title       = `${discipline.name} ${cityName} 2026 | RaceRadar HQ`
  const description = `Find upcoming ${discipline.name} events in ${cityName} — race dates, entry fees and event guides.`

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DisciplineLocationPage({
  params,
}: {
  params: Promise<{ slug: string; location: string }>
}) {
  const { slug, location } = await params
  const supabase  = await createClient()
  const today     = new Date().toISOString().split('T')[0]
  const cityName  = slugToCity(location)

  const [{ data: discipline }, { data: { user } }] = await Promise.all([
    supabase
      .from('disciplines')
      .select('slug, name, short_description, color, event_discipline_values')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!discipline) notFound()

  const disciplineValues = (discipline.event_discipline_values ?? []) as string[]

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_date', today)
    .in('discipline', disciplineValues.length > 0 ? disciplineValues : ['__none__'])
    .ilike('city', cityName)
    .order('start_date', { ascending: true })
    .limit(24)

  if (!events || events.length === 0) {
    notFound()
  }

  const savedIds = new Set<string>()
  if (user) {
    const { data: favs } = await supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user.id)
      .eq('entity_type', 'event')
    for (const f of favs ?? []) savedIds.add(f.entity_id)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${discipline.name} Events in ${cityName}`,
    description: `Upcoming ${discipline.name} events in ${cityName}, Australia`,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SportsEvent',
        name: e.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'}/events/${e.slug}`,
        startDate: e.start_date,
        location: {
          '@type': 'Place',
          address: { '@type': 'PostalAddress', addressLocality: e.city, addressCountry: 'AU' },
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div
        className="border-b border-wire"
        style={{ background: `linear-gradient(135deg, ${discipline.color ?? '#00D9A6'}08 0%, transparent 60%)` }}
      >
        <div className="container-page py-12 lg:py-16">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-4">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/discipline" className="hover:text-ink transition-colors">Disciplines</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/discipline/${discipline.slug}`} className="hover:text-ink transition-colors">
              {discipline.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">{cityName}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-ink-muted" />
            <span className="text-sm text-ink-muted">{cityName}, Australia</span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {discipline.name} {cityName}
          </h1>
          <p className="mt-3 text-ink-muted">
            {events.length} upcoming {discipline.name.toLowerCase()} event{events.length !== 1 ? 's' : ''} in {cityName}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/discipline/${discipline.slug}`} className="btn-secondary text-sm">
              ← All {discipline.name} Events
            </Link>
          </div>
        </div>
      </div>

      {/* Event grid */}
      <div className="container-page py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-ink-muted">
          <Calendar className="h-4 w-4" />
          <span>{events.length} upcoming event{events.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              initialSaved={savedIds.has(event.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
