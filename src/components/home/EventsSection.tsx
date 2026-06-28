import type { CSSProperties } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupabaseEvent = {
  id: string
  title: string
  slug: string
  discipline: string | null
  start_date: string
  city: string | null
  country: string | null
  is_featured: boolean | null
}

type Event = {
  id: string
  slug: string
  name: string
  sport: string
  date: string
  month: string
  city: string
  country: string
  flag: string
}

// ─── Data maps ────────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  'Australia':   '🇦🇺',
  'New Zealand': '🇳🇿',
  'Singapore':   '🇸🇬',
  'Japan':       '🇯🇵',
  'South Korea': '🇰🇷',
  'Thailand':    '🇹🇭',
  'Malaysia':    '🇲🇾',
  'Philippines': '🇵🇭',
  'Indonesia':   '🇮🇩',
  'Vietnam':     '🇻🇳',
  'China':       '🇨🇳',
  'Hong Kong':   '🇭🇰',
  'Taiwan':      '🇹🇼',
  'India':       '🇮🇳',
}

const DISCIPLINE_MAP: Record<string, string> = {
  'HYROX':         'HYROX',
  'CrossFit':      'CrossFit',
  'Spartan Race':  'Spartan',
  'Ironman':       'Ironman',
  'Ironman 70.3':  'Ironman 70.3',
  'Marathon':      'Marathon',
  'Road Racing':   'Road Racing',
  'Trail Running': 'Trail Running',
  'Deka Fit':      'Deka',
  'Tough Mudder':  'Tough Mudder',
}

const SPORT_STYLES: Record<string, { bg: string; text: string }> = {
  'HYROX':         { bg: 'rgba(0,217,166,0.12)',   text: '#00D9A6' },
  'CrossFit':      { bg: 'rgba(239,68,68,0.12)',    text: '#EF4444' },
  'Spartan':       { bg: 'rgba(255,107,53,0.12)',   text: '#FF6B35' },
  'Ironman':       { bg: 'rgba(248,113,113,0.12)',  text: '#F87171' },
  'Ironman 70.3':  { bg: 'rgba(248,113,113,0.12)',  text: '#F87171' },
  'Marathon':      { bg: 'rgba(96,165,250,0.12)',   text: '#60A5FA' },
  'Road Racing':   { bg: 'rgba(148,163,184,0.12)',  text: '#94A3B8' },
  'Trail Running': { bg: 'rgba(52,211,153,0.12)',   text: '#34D399' },
  'Deka':          { bg: 'rgba(167,139,250,0.12)',  text: '#A78BFA' },
  'Tough Mudder':  { bg: 'rgba(245,158,11,0.12)',   text: '#F59E0B' },
}

const defaultStyle = { bg: 'rgba(107,122,141,0.12)', text: '#8896A8' }

function toDisplayEvent(e: SupabaseEvent): Event {
  const d = new Date(e.start_date)
  return {
    id:      e.id,
    slug:    e.slug,
    name:    e.title,
    sport:   DISCIPLINE_MAP[e.discipline ?? ''] ?? (e.discipline ?? ''),
    date:    String(d.getUTCDate()).padStart(2, '0'),
    month:   d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    city:    e.city    ?? '',
    country: e.country ?? '',
    flag:    COUNTRY_FLAGS[e.country ?? ''] ?? '',
  }
}

// ─── Row definitions ──────────────────────────────────────────────────────────

type RowDef = {
  key: string
  label: string
  eyebrow: string
  disciplines: string[] | null  // null = filter by is_featured
  filterHref: string
  accentColor: string
}

const ROW_DEFS: RowDef[] = [
  {
    key:          'featured',
    label:        'Featured This Month',
    eyebrow:      'Curated',
    disciplines:  null,
    filterHref:   '/events',
    accentColor:  '#00D9A6',
  },
  {
    key:          'hyrox',
    label:        'HYROX',
    eyebrow:      'Upcoming',
    disciplines:  ['HYROX'],
    filterHref:   '/events?discipline=HYROX',
    accentColor:  '#00D9A6',
  },
  {
    key:          'crossfit',
    label:        'CrossFit',
    eyebrow:      'Upcoming',
    disciplines:  ['CrossFit'],
    filterHref:   '/events?discipline=CrossFit',
    accentColor:  '#EF4444',
  },
  {
    key:          'spartan',
    label:        'Spartan Race',
    eyebrow:      'Upcoming',
    disciplines:  ['Spartan Race'],
    filterHref:   '/events?discipline=Spartan%20Race',
    accentColor:  '#FF6B35',
  },
  {
    key:          'ironman',
    label:        'Ironman & Triathlon',
    eyebrow:      'Upcoming',
    disciplines:  ['Ironman', 'Ironman 70.3'],
    filterHref:   '/events?discipline=Ironman',
    accentColor:  '#F87171',
  },
  {
    key:          'marathon',
    label:        'Marathon & Road Racing',
    eyebrow:      'Upcoming',
    disciplines:  ['Marathon', 'Road Racing'],
    filterHref:   '/events?discipline=Marathon',
    accentColor:  '#60A5FA',
  },
  {
    key:          'trail',
    label:        'Trail Running',
    eyebrow:      'Upcoming',
    disciplines:  ['Trail Running'],
    filterHref:   '/events?discipline=Trail%20Running',
    accentColor:  '#34D399',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function EventsSection({
  events,
  error,
}: {
  events: SupabaseEvent[]
  error?: string
}) {
  if (error) {
    return (
      <section className="relative pb-24 pt-4">
        <div className="container-page">
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-red-400">
              Failed to load events. Please try refreshing the page.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const rows = ROW_DEFS
    .map((def) => {
      const raw =
        def.disciplines === null
          ? events.filter((e) => e.is_featured)
          : events.filter((e) => def.disciplines!.includes(e.discipline ?? ''))
      return { ...def, events: raw.slice(0, 3).map(toDisplayEvent) }
    })
    .filter((row) => row.events.length > 0)

  if (rows.length === 0) {
    return (
      <section className="relative pb-24 pt-4">
        <div className="container-page">
          <div className="rounded-2xl border border-wire bg-panel py-16 text-center">
            <p className="text-ink-muted">No upcoming events found. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative pb-24 pt-4">
      <div className="container-page space-y-16">
        {rows.map((row) => (
          <SportRow key={row.key} row={row} />
        ))}
      </div>
    </section>
  )
}

// ─── Sport row ────────────────────────────────────────────────────────────────

type BuiltRow = RowDef & { events: Event[] }

function SportRow({ row }: { row: BuiltRow }) {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p
            className="mb-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: row.accentColor }}
          >
            {row.eyebrow}
          </p>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {row.label}
          </h2>
        </div>
        <Link
          href={row.filterHref}
          className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
        >
          View all
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {row.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div className="mt-5 sm:hidden">
        <Link
          href={row.filterHref}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          View all {row.label} events
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const style = SPORT_STYLES[event.sport] ?? defaultStyle

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-wire bg-panel p-6 transition-all duration-300 hover:border-wire-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Badge + date */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: style.bg, color: style.text }}
        >
          {event.sport}
        </span>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold leading-none text-ink">{event.date}</div>
          <div className="mt-0.5 text-xs text-ink-muted">{event.month}</div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-mint">
        {event.name}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <PinIcon className="h-4 w-4 shrink-0" style={{ color: style.text }} />
        <span>{event.city}, {event.country}</span>
        <span className="ml-auto text-base">{event.flag}</span>
      </div>

      <div className="border-t border-wire" />

      {/* CTA */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-muted transition-colors group-hover:text-ink">
          View Event
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-wire transition-all duration-200 group-hover:border-transparent">
          <ArrowRightIcon
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: style.text }}
          />
        </span>
      </div>

      {/* Accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
      />
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} style={style}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} style={style}>
      <path d="M8 1.5a4 4 0 0 1 4 4c0 2.5-4 9-4 9S4 8 4 5.5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="5.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
