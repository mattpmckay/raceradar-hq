import type { CSSProperties } from 'react'
import Link from 'next/link'
import { HeartButton } from '@/components/events/HeartButton'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupabaseEvent = {
  id: string
  title: string
  slug: string
  discipline: string | null
  start_date: string
  created_at: string
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
  isNew: boolean
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
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 21)
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
    isNew:   e.created_at ? new Date(e.created_at) >= cutoff : false,
  }
}

// ─── Row definitions (full directory mode) ────────────────────────────────────

type RowDef = {
  key: string
  label: string
  eyebrow: string
  disciplines: string[] | null
  filterHref: string
  accentColor: string
}

const ROW_DEFS: RowDef[] = [
  { key: 'featured',  label: 'Featured This Month',      eyebrow: 'Curated',  disciplines: null,                           filterHref: '/events',                         accentColor: '#00D9A6' },
  { key: 'hyrox',     label: 'HYROX',                    eyebrow: 'Upcoming', disciplines: ['HYROX'],                      filterHref: '/events?discipline=HYROX',        accentColor: '#00D9A6' },
  { key: 'crossfit',  label: 'CrossFit',                 eyebrow: 'Upcoming', disciplines: ['CrossFit'],                   filterHref: '/events?discipline=CrossFit',     accentColor: '#EF4444' },
  { key: 'spartan',   label: 'Spartan Race',             eyebrow: 'Upcoming', disciplines: ['Spartan Race'],               filterHref: '/events?discipline=Spartan%20Race', accentColor: '#FF6B35' },
  { key: 'ironman',   label: 'Ironman & Triathlon',      eyebrow: 'Upcoming', disciplines: ['Ironman', 'Ironman 70.3'],    filterHref: '/events?discipline=Ironman',      accentColor: '#F87171' },
  { key: 'marathon',  label: 'Marathon & Road Racing',   eyebrow: 'Upcoming', disciplines: ['Marathon', 'Road Racing'],    filterHref: '/events?discipline=Marathon',     accentColor: '#60A5FA' },
  { key: 'trail',     label: 'Trail Running',            eyebrow: 'Upcoming', disciplines: ['Trail Running'],              filterHref: '/events?discipline=Trail%20Running', accentColor: '#34D399' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function EventsSection({
  events,
  error,
  savedIds = new Set(),
  isLoggedIn = false,
  featuredOnly = false,
  totalCount,
  happeningSoon = [],
  newEvents = [],
}: {
  events: SupabaseEvent[]
  error?: string
  savedIds?: Set<string>
  isLoggedIn?: boolean
  featuredOnly?: boolean
  totalCount?: number
  happeningSoon?: SupabaseEvent[]
  newEvents?: SupabaseEvent[]
}) {
  if (error) {
    return (
      <section className="relative pb-12 pt-4">
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

  // ── Featured-only mode (homepage) ─────────────────────────────────────────
  if (featuredOnly) {
    const featured      = events.filter((e) => e.is_featured).slice(0, 3).map(toDisplayEvent)
    const soonEvents    = happeningSoon.slice(0, 3).map(toDisplayEvent)
    const justAdded     = newEvents.slice(0, 3).map(toDisplayEvent)
    const browseCount   = totalCount ?? events.length

    if (featured.length === 0 && soonEvents.length === 0 && justAdded.length === 0) return null

    return (
      <section className="relative pb-4 pt-3">
        <div className="container-page space-y-6">

          {/* Featured Events */}
          {featured.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  Featured Events
                </h2>
                <Link
                  href="/events"
                  className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
                >
                  Browse all
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((event) => (
                  <EventCard key={event.id} event={event} initialSaved={savedIds.has(event.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Happening Soon */}
          {soonEvents.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    Happening Soon
                  </h2>
                  <span className="rounded-full bg-fire/10 px-2 py-0.5 text-[11px] font-semibold text-fire">
                    Next 30 days
                  </span>
                </div>
                <Link
                  href="/events"
                  className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
                >
                  View all
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {soonEvents.map((event) => (
                  <EventCard key={event.id} event={event} initialSaved={savedIds.has(event.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Just Added */}
          {justAdded.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    Just Added
                  </h2>
                  <span className="rounded-full bg-mint/10 px-2 py-0.5 text-[11px] font-semibold text-mint">
                    Last 3 weeks
                  </span>
                </div>
                <Link href="/events" className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex">
                  View all <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {justAdded.map((event) => (
                  <EventCard key={event.id} event={event} initialSaved={savedIds.has(event.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Browse all CTA */}
          <Link
            href="/events"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-wire bg-panel px-6 py-3.5 text-sm font-semibold text-ink-muted transition-all hover:border-wire-bright hover:bg-panel-raised hover:text-ink"
          >
            Browse all {browseCount > 0 ? `${browseCount}+` : ''} events across APAC
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

        </div>
      </section>
    )
  }

  // ── Full directory mode ────────────────────────────────────────────────────
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
      <div className="container-page space-y-10 md:space-y-16">
        {rows.map((row, index) => (
          <div key={row.key}>
            <SportRow row={row} savedIds={savedIds} />
            {!isLoggedIn && index === 0 && <MembershipNudge />}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Membership nudge ─────────────────────────────────────────────────────────

function MembershipNudge() {
  return (
    <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-mint/20 bg-mint/5 px-5 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl leading-none" aria-hidden>❤️</span>
        <div>
          <p className="text-sm font-semibold text-ink">Save events you&apos;re interested in</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Free members get a personal dashboard, race countdowns and personalised alerts.
          </p>
        </div>
      </div>
      <Link
        href="/signup"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:-translate-y-px hover:shadow-md hover:shadow-mint/20"
      >
        Join free
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

// ─── Sport row ────────────────────────────────────────────────────────────────

type BuiltRow = RowDef & { events: Event[] }

function SportRow({ row, savedIds }: { row: BuiltRow; savedIds: Set<string> }) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between md:mb-6">
        <div>
          <p className="section-eyebrow mb-1.5" style={{ color: row.accentColor }}>
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

      <div className="grid gap-2.5 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
        {row.events.map((event) => (
          <EventCard key={event.id} event={event} initialSaved={savedIds.has(event.id)} />
        ))}
      </div>

      <div className="mt-4 sm:hidden">
        <Link href={row.filterHref} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          View all {row.label} events
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event, initialSaved }: { event: Event; initialSaved: boolean }) {
  const style = SPORT_STYLES[event.sport] ?? defaultStyle

  return (
    <div className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-wire bg-panel p-4 transition-all duration-200 hover:border-wire-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 active:scale-[0.98] active:duration-75">
      {/* Badge + save + date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: style.bg, color: style.text }}
          >
            {event.sport}
          </span>
          {event.isNew && (
            <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-mint">
              NEW
            </span>
          )}
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <HeartButton eventId={event.id} initialSaved={initialSaved} />
          <div className="text-right">
            <div className="font-heading text-xl font-bold leading-none text-ink">{event.date}</div>
            <div className="mt-0.5 text-[11px] text-ink-muted">{event.month}</div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-mint sm:text-[18px]">
        {event.name}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <PinIcon className="h-3.5 w-3.5 shrink-0" style={{ color: style.text }} />
        <span className="truncate">{event.city}, {event.country}</span>
        <span className="ml-auto text-xl">{event.flag}</span>
      </div>

      <div className="border-t border-wire" />

      {/* View Event CTA */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-wire bg-panel-raised px-3 py-2.5 transition-all duration-200 group-hover:border-mint/30 group-hover:bg-mint/10">
        <span className="text-sm font-semibold text-ink-muted transition-colors group-hover:text-mint">
          View Event
        </span>
        <ArrowRightIcon
          className="h-4 w-4 text-ink-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-mint"
        />
      </div>

      {/* Full-card invisible link */}
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={`View ${event.name}`}
      />

      {/* Accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
      />
    </div>
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
