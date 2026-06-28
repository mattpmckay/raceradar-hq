import { Suspense }   from 'react'
import Link          from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EventCard }    from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { EmptyState }   from '@/components/ui/EmptyState'
import { Calendar }     from 'lucide-react'
import { cn }           from '@/lib/utils'
import type { Metadata } from 'next'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; discipline?: string; country?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const parts: string[] = []
  if (params.discipline) parts.push(params.discipline)
  if (params.country)   parts.push(`in ${params.country}`)

  const title = parts.length
    ? `${parts.join(' ')} Events | RaceRadar HQ`
    : 'Events — Fitness Races Across Asia Pacific | RaceRadar HQ'

  const description = params.discipline
    ? `Find upcoming ${params.discipline} events${params.country ? ` in ${params.country}` : ' across Asia Pacific'} — race dates, categories, entry fees and venue guides.`
    : 'Browse upcoming HYROX, Spartan Race, Ironman, Marathon, Trail Running and Deka Fit events across Asia Pacific. Find your next race.'

  return { title: { absolute: title }, description }
}

// ─── Discipline pills (server-rendered) ───────────────────────────────────────

const DISCIPLINES = [
  { label: 'All Events',   value: '' },
  { label: 'HYROX',        value: 'HYROX' },
  { label: 'CrossFit',     value: 'CrossFit' },
  { label: 'Deka Fit',     value: 'Deka Fit' },
  { label: 'Spartan Race', value: 'Spartan Race' },
  { label: 'Tough Mudder', value: 'Tough Mudder' },
  { label: 'Ironman',      value: 'Ironman' },
  { label: 'Marathon',     value: 'Marathon' },
  { label: 'Road Racing',  value: 'Road Racing' },
  { label: 'Trail Running',value: 'Trail Running' },
]

const DISCIPLINE_COLORS: Record<string, string> = {
  'HYROX':         '#00D9A6',
  'Spartan Race':  '#FF6B35',
  'Tough Mudder':  '#F59E0B',
  'Ironman':       '#F87171',
  'Marathon':      '#60A5FA',
  'Road Racing':   '#94A3B8',
  'Trail Running': '#34D399',
  'Deka Fit':      '#A78BFA',
  'CrossFit':      '#EF4444',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ q?: string; discipline?: string; type?: string; country?: string }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const today    = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')
    .order('start_date', { ascending: true })

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }
  if (params.discipline) {
    query = params.discipline === 'Ironman'
      ? query.ilike('discipline', 'Ironman%')
      : query.eq('discipline', params.discipline)
  }
  if (params.country) {
    query = query.eq('country', params.country)
  }

  const { data: events, error } = await query.limit(48)

  if (error) {
    console.error('[EventsPage] Supabase error:', error.code, error.message)
  }

  // ── Hero content ────────────────────────────────────────────────────────────
  const count = events?.length ?? 0
  const countLabel = count === 48 ? '48+' : String(count)

  const heroTitle = buildTitle(params)
  const heroSubtitle = buildSubtitle(params, count, countLabel)

  // ── Discipline pill href builder ────────────────────────────────────────────
  function pillHref(value: string) {
    const p = new URLSearchParams()
    if (value)          p.set('discipline', value)
    if (params.country) p.set('country', params.country)
    if (params.q)       p.set('q', params.q)
    return `/events${p.size ? `?${p}` : ''}`
  }

  const activeDiscipline = params.discipline ?? ''

  return (
    <>
      {/* ── Hero / header ─────────────────────────────────────────────────── */}
      <div className="border-b border-wire/60 bg-gradient-to-b from-panel/40 to-transparent">
        <div className="container-page pt-10 pb-8 lg:pt-14 lg:pb-10">

          {/* Title + subtitle */}
          <div className="mb-7">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-2 text-ink-muted">
              {heroSubtitle}
            </p>
          </div>

          {/* Discipline pills */}
          <div className="relative -mx-4 mb-6 sm:mx-0">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-0 sm:flex-wrap scrollbar-hide">
              {DISCIPLINES.map((d) => {
                const isActive  = d.value === activeDiscipline
                const color     = DISCIPLINE_COLORS[d.value]
                const activeStyle = isActive && color
                  ? { background: `${color}18`, borderColor: `${color}60`, color }
                  : {}

                return (
                  <Link
                    key={d.value}
                    href={pillHref(d.value)}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'border-transparent shadow-sm'
                        : 'border-wire bg-panel text-ink-muted hover:border-wire-bright hover:text-ink',
                    )}
                    style={activeStyle}
                  >
                    {d.label}
                  </Link>
                )
              })}
            </div>
            {/* Mobile fade-out on right edge */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas to-transparent sm:hidden" />
          </div>

          {/* Filter bar + active chips */}
          <Suspense fallback={null}>
            <EventFilters />
          </Suspense>

        </div>
      </div>

      {/* ── Events grid ────────────────────────────────────────────────────── */}
      <div className="container-page py-8">
        {error ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title="Failed to load events"
            description="Could not connect to the database. Please try refreshing the page."
          />
        ) : events && events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title={params.discipline || params.country || params.q
              ? 'No events found'
              : 'No upcoming events found'}
            description={
              params.discipline && !params.country && !params.q
                ? `${params.discipline} events are being added soon — check back shortly.`
                : params.discipline || params.country || params.q
                ? 'Try adjusting or clearing your filters.'
                : 'Check back soon — new events are added regularly.'
            }
            action={
              params.discipline && !params.country && !params.q ? (
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-2 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-fire-600 hover:-translate-y-px hover:shadow-lg hover:shadow-fire/25"
                >
                  Join the free calendar
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTitle(params: { discipline?: string; country?: string; q?: string }) {
  const { discipline, country, q } = params

  if (discipline && country) return `${discipline} Events · ${country}`
  if (discipline)            return `${discipline} Events`
  if (country)               return `Events · ${country}`
  if (q)                     return 'Events'
  return 'Fitness Events'
}

function buildSubtitle(
  params: { discipline?: string; country?: string; q?: string },
  count: number,
  countLabel: string,
) {
  const { discipline, country, q } = params

  if (count === 0) {
    if (discipline || country || q) return 'No upcoming events match your current filters.'
    return 'No upcoming events found. Check back soon.'
  }

  const showing = `${countLabel} upcoming`

  if (discipline && country) return `${showing} ${discipline} events in ${country}`
  if (discipline)            return `${showing} ${discipline} events across Asia Pacific`
  if (country)               return `${showing} events in ${country}`
  if (q)                     return `${showing} events matching "${q}"`
  return `${showing} fitness races and endurance events across Asia Pacific`
}
