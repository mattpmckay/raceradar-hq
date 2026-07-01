import { Suspense }      from 'react'
import Link             from 'next/link'
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
  searchParams: Promise<{ q?: string; discipline?: string; country?: string; region?: string; window?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const title =
    params.discipline && params.country
      ? `${params.discipline} Events in ${params.country} | RaceRadar HQ`
      : params.discipline
      ? `${params.discipline} Events | RaceRadar HQ`
      : params.country
      ? `Events in ${params.country} | RaceRadar HQ`
      : 'Events for Your Season — Fitness Racing Across Asia Pacific | RaceRadar HQ'

  const description = params.discipline
    ? `Find upcoming ${params.discipline} events${params.country ? ` in ${params.country}` : ' across Asia Pacific'} — race dates, categories, entry fees and venue guides.`
    : 'Find the events that belong in your season. Browse HYROX, Spartan Race, Ironman, Marathon, Trail Running and more across Asia Pacific. Save your picks and build your 2026 race calendar.'

  return { title: { absolute: title }, description }
}

// ─── Discipline pills ─────────────────────────────────────────────────────────
// Values must match events.discipline exactly (case-sensitive).
// Ironman filter uses ilike to match both 'Ironman' and 'Ironman 70.3'.

const DISCIPLINES = [
  { label: 'All Events',    value: '',                disciplineSlug: '' },
  { label: 'HYROX',         value: 'HYROX',           disciplineSlug: 'hyrox' },
  { label: 'Ironman',       value: 'Ironman',         disciplineSlug: 'ironman' },
  { label: 'Marathon',      value: 'Marathon',        disciplineSlug: 'marathon' },
  { label: 'Road Running',  value: 'Road Running',    disciplineSlug: 'road-running' },
  { label: 'Obstacle Race', value: 'Obstacle Race',   disciplineSlug: 'obstacle-race' },
  { label: 'Triathlon',     value: 'Triathlon',       disciplineSlug: 'triathlon' },
  { label: 'Trail Running', value: 'Trail Running',   disciplineSlug: 'trail-running' },
  { label: 'CrossFit',      value: 'CrossFit',        disciplineSlug: 'crossfit' },
  { label: 'Deka Fit',      value: 'Deka Fit',        disciplineSlug: 'deka-fit' },
]

const DISCIPLINE_COLORS: Record<string, string> = {
  'HYROX':         '#00D9A6',
  'Ironman':       '#F87171',
  'Ironman 70.3':  '#F87171',
  'Marathon':      '#60A5FA',
  'Road Running':  '#94A3B8',
  'Obstacle Race': '#FF6B35',
  'Triathlon':     '#818CF8',
  'Trail Running': '#34D399',
  'Deka Fit':      '#A78BFA',
  'CrossFit':      '#EF4444',
}

// ─── Date window helpers ───────────────────────────────────────────────────────

function windowEndDate(window: string | undefined, today: string): string {
  if (!window) return '2099-01-01'
  const d = new Date(today + 'T00:00:00')
  if (window === 'this-month') {
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
  } else if (window === '3months') {
    d.setMonth(d.getMonth() + 3)
  } else if (window === '6months') {
    d.setMonth(d.getMonth() + 6)
  } else {
    return '2099-01-01'
  }
  return d.toISOString().split('T')[0]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ q?: string; discipline?: string; country?: string; region?: string; window?: string }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params    = await searchParams
  const supabase  = await createClient()
  const today     = new Date().toISOString().split('T')[0]
  const dateEnd   = windowEndDate(params.window, today)

  // ── Parallel data fetches ────────────────────────────────────────────────
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', dateEnd)
    .order('start_date', { ascending: true })

  if (params.q) {
    const q = params.q.trim()
    eventsQuery = eventsQuery.or(
      `title.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%,discipline.ilike.%${q}%`,
    )
  }
  if (params.discipline) {
    eventsQuery = params.discipline === 'Ironman'
      ? eventsQuery.ilike('discipline', 'Ironman%')
      : eventsQuery.eq('discipline', params.discipline)
  }
  if (params.country) {
    eventsQuery = eventsQuery.eq('country', params.country)
  }
  if (params.region) {
    eventsQuery = eventsQuery.eq('region', params.region)
  }

  const [
    { data: events, error },
    { data: countRows },
    { data: { user } },
  ] = await Promise.all([
    eventsQuery.limit(48),
    // Counts: no discipline filter, same date window — drives pill badges
    supabase
      .from('events')
      .select('discipline')
      .eq('is_published', true)
      .gte('start_date', today)
      .lt('start_date', dateEnd),
    supabase.auth.getUser(),
  ])

  if (error) {
    console.error('[EventsPage] Supabase error:', error.code, error.message)
  }

  // Per-discipline counts for pill badges
  const disciplineCounts = new Map<string, number>()
  let totalCount = 0
  for (const row of countRows ?? []) {
    const d = row.discipline ?? ''
    disciplineCounts.set(d, (disciplineCounts.get(d) ?? 0) + 1)
    totalCount++
  }
  // Group Ironman 70.3 under the Ironman pill
  const ironmanTotal = (disciplineCounts.get('Ironman') ?? 0) + (disciplineCounts.get('Ironman 70.3') ?? 0)
  disciplineCounts.set('Ironman', ironmanTotal)

  // Saved event IDs for the current user
  let savedIds = new Set<string>()
  if (user) {
    const { data: favs } = await supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user.id)
      .eq('entity_type', 'event')
    savedIds = new Set((favs ?? []).map((f) => f.entity_id))
  }

  // ── Hero ────────────────────────────────────────────────────────────────
  const count      = events?.length ?? 0
  const countLabel = count === 48 ? '48+' : String(count)
  const heroTitle    = buildTitle(params)
  const heroSubtitle = buildSubtitle(params, count, countLabel)

  // ── Pill href (preserves all active filters except discipline) ──────────
  function pillHref(value: string) {
    const p = new URLSearchParams()
    if (value)          p.set('discipline', value)
    if (params.country) p.set('country', params.country)
    if (params.q)       p.set('q', params.q)
    if (params.window)  p.set('window', params.window)
    return `/events${p.size ? `?${p}` : ''}`
  }

  const activeDiscipline    = params.discipline ?? ''
  const activeDisciplineObj = DISCIPLINES.find((d) => d.value === activeDiscipline)

  // ── Reset-filters href ──────────────────────────────────────────────────
  const hasFilters = !!(params.q || params.country || params.window)
  const resetHref  = params.discipline
    ? `/events?discipline=${encodeURIComponent(params.discipline)}`
    : '/events'

  return (
    <>
      {/* ── Hero / header ─────────────────────────────────────────────────── */}
      <div className="border-b border-wire/60 bg-gradient-to-b from-panel/40 to-transparent">
        <div className="container-page pt-10 pb-8 lg:pt-14 lg:pb-10">

          <div className="mb-7">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-2 text-ink-muted">{heroSubtitle}</p>
          </div>

          {/* Discipline pills */}
          <div className="relative -mx-4 mb-6 sm:mx-0">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-0 sm:flex-wrap scrollbar-hide">
              {DISCIPLINES.map((d) => {
                const isActive    = d.value === activeDiscipline
                const color       = DISCIPLINE_COLORS[d.value]
                const activeStyle = isActive && color
                  ? { background: `${color}18`, borderColor: `${color}60`, color }
                  : {}
                const count = d.value === ''
                  ? totalCount
                  : disciplineCounts.get(d.value) ?? 0

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
                    {count > 0 && (
                      <span className="ml-1.5 text-xs opacity-60">{count}</span>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas to-transparent sm:hidden" />
          </div>

          {/* Discipline guide link */}
          {activeDisciplineObj?.disciplineSlug && (
            <p className="mb-4 text-xs text-ink-muted">
              Looking for training guides, FAQs and race advice?{' '}
              <Link
                href={`/discipline/${activeDisciplineObj.disciplineSlug}`}
                className="text-mint hover:underline"
              >
                View the {activeDisciplineObj.label} guide →
              </Link>
            </p>
          )}

          {/* Filter bar */}
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
              <EventCard
                key={event.id}
                event={event}
                initialSaved={savedIds.has(event.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title={hasFilters || params.discipline ? 'No events found' : 'No upcoming events found'}
            description={
              hasFilters || params.discipline
                ? 'Try adjusting or clearing your filters to see more events.'
                : 'Check back soon — new events are added regularly.'
            }
            action={
              (hasFilters || params.discipline) ? (
                <Link href={resetHref} className="btn-secondary">
                  Reset filters
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

const WINDOW_LABELS: Record<string, string> = {
  'this-month': 'this month',
  '3months':    'next 3 months',
  '6months':    'next 6 months',
}

function buildTitle(params: { discipline?: string; country?: string; q?: string }) {
  const { discipline, country, q } = params
  if (discipline && country) return `${discipline} Events · ${country}`
  if (discipline)            return `${discipline} Events`
  if (country)               return `Events · ${country}`
  if (q)                     return 'Events'
  return 'Events for Your Season'
}

function buildSubtitle(
  params: { discipline?: string; country?: string; q?: string; window?: string },
  count: number,
  countLabel: string,
) {
  const { discipline, country, q, window } = params
  const windowLabel = window ? ` · ${WINDOW_LABELS[window] ?? ''}` : ''

  if (count === 0) {
    if (discipline || country || q || window) return 'No upcoming events match your current filters.'
    return 'No upcoming events found. Check back soon.'
  }

  const showing = `${countLabel} upcoming`

  if (discipline && country) return `${showing} ${discipline} events in ${country}${windowLabel}`
  if (discipline)            return `${showing} ${discipline} events across Asia Pacific${windowLabel}`
  if (country)               return `${showing} events in ${country}${windowLabel}`
  if (q)                     return `${showing} events matching "${q}"${windowLabel}`
  return `${showing} events to add to your season${windowLabel}`
}
