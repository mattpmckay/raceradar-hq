import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, Globe, MapPin, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('series').select('slug').eq('is_active', true)
    return (data ?? []).map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug }  = await params
  const supabase  = await createClient()
  const { data }  = await supabase
    .from('series')
    .select('name, short_description, country')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Series not found' }

  const title = `${data.name} 2026 — Race Calendar | RaceRadar HQ`
  const description =
    data.short_description ??
    `${data.name} race calendar — upcoming events, dates, entry fees and guides.`

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SeriesPage({ params }: PageProps) {
  const { slug }  = await params
  const supabase  = await createClient()
  const today     = new Date().toISOString().split('T')[0]

  const [{ data: series }, { data: { user } }] = await Promise.all([
    supabase
      .from('series')
      .select('*, disciplines(slug, name, color)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!series) notFound()

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('series_slug', slug)
      .eq('is_published', true)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(24),
    supabase
      .from('events')
      .select('id, title, slug, start_date, city, country, discipline, entry_fee_from, entry_fee_currency')
      .eq('series_slug', slug)
      .eq('is_published', true)
      .lt('start_date', today)
      .order('start_date', { ascending: false })
      .limit(6),
  ])

  const savedIds = new Set<string>()
  if (user) {
    const { data: favs } = await supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user.id)
      .eq('entity_type', 'event')
    for (const f of favs ?? []) savedIds.add(f.entity_id)
  }

  const upcomingEvents = upcoming ?? []
  const pastEvents     = past     ?? []

  const uniqueCities = [
    ...new Set(upcomingEvents.filter((e) => e.city).map((e) => e.city!)),
  ]

  const discipline = series.disciplines as { slug: string; name: string; color: string } | null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    name: series.name,
    description: series.short_description,
    url: series.website_url,
    organizer: series.organiser ? { '@type': 'Organization', name: series.organiser } : undefined,
    location: { '@type': 'Country', name: series.country },
    subEvent: upcomingEvents.slice(0, 10).map((e) => ({
      '@type': 'SportsEvent',
      name: e.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'}/events/${e.slug}`,
      startDate: e.start_date,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div
        className="border-b border-wire"
        style={{
          background: discipline?.color
            ? `linear-gradient(135deg, ${discipline.color}08 0%, transparent 60%)`
            : 'none',
        }}
      >
        <div className="container-page py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-6">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            {discipline && (
              <>
                <Link href={`/discipline/${discipline.slug}`} className="hover:text-ink transition-colors">
                  {discipline.name}
                </Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-ink">{series.name}</span>
          </nav>

          <div className="flex items-center gap-2 mb-3">
            {discipline && (
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: discipline.color ?? '#00D9A6' }}
              />
            )}
            <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">
              Race Series
            </span>
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {series.name}
          </h1>

          {series.short_description && (
            <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
              {series.short_description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            {series.organiser && (
              <span>Organiser: <strong className="text-ink">{series.organiser}</strong></span>
            )}
            {uniqueCities.length > 0 && (
              <span>
                <MapPin className="inline h-3.5 w-3.5 mr-1" />
                {uniqueCities.join(', ')}
              </span>
            )}
            {upcomingEvents.length > 0 && (
              <span>
                <Calendar className="inline h-3.5 w-3.5 mr-1" />
                {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {series.website_url && (
              <a
                href={series.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                <Globe className="h-4 w-4" />
                Official Website
              </a>
            )}
            {discipline && (
              <Link href={`/discipline/${discipline.slug}`} className="btn-secondary text-sm">
                All {discipline.name} Events
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-page py-10 space-y-14">

        {/* ── Upcoming Events ─────────────────────────────────────────── */}
        <section>
          <h2 className="mb-6 border-b border-wire pb-3 font-heading text-xl font-bold text-ink">
            Upcoming Events
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  initialSaved={savedIds.has(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-wire bg-panel px-6 py-10 text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
              <p className="font-medium text-ink">No upcoming events scheduled</p>
              <p className="mt-1 text-sm text-ink-muted">
                Events are added as dates are confirmed by the organiser.
              </p>
              {series.website_url && (
                <a
                  href={series.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-mint hover:underline"
                >
                  Check official website <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── About the series ─────────────────────────────────────────── */}
        {series.short_description && (
          <section>
            <h2 className="mb-6 border-b border-wire pb-3 font-heading text-xl font-bold text-ink">
              About {series.name}
            </h2>
            <p className="text-ink-muted leading-relaxed text-[0.9375rem]">
              {series.short_description}
            </p>
            {series.website_url && (
              <a
                href={series.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-mint hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Visit the official website
              </a>
            )}
          </section>
        )}

        {/* ── Past events ──────────────────────────────────────────────── */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="mb-6 border-b border-wire pb-3 font-heading text-xl font-bold text-ink">
              Past Events
            </h2>
            <div className="space-y-2">
              {pastEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-wire bg-panel px-4 py-3 hover:border-wire-bright transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate group-hover:text-mint transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {formatDate(event.start_date)}{event.city ? ` · ${event.city}` : ''}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-mint transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
