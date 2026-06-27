'use client'

import { useState } from 'react'
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
  'Australia':    '🇦🇺',
  'New Zealand':  '🇳🇿',
  'Singapore':    '🇸🇬',
  'Japan':        '🇯🇵',
  'South Korea':  '🇰🇷',
  'Thailand':     '🇹🇭',
  'Malaysia':     '🇲🇾',
  'Philippines':  '🇵🇭',
  'Indonesia':    '🇮🇩',
  'Vietnam':      '🇻🇳',
  'China':        '🇨🇳',
  'Hong Kong':    '🇭🇰',
  'Taiwan':       '🇹🇼',
  'India':        '🇮🇳',
}

const DISCIPLINE_MAP: Record<string, string> = {
  'HYROX':         'HYROX',
  'Spartan Race':  'Spartan',
  'Ironman':       'Ironman',
  'Ironman 70.3':  'Ironman',
  'Marathon':      'Marathon',
  'Trail Running': 'Trail Running',
  'Deka Fit':      'Deka',
}

function mapDiscipline(discipline: string): string {
  return DISCIPLINE_MAP[discipline] ?? discipline
}

function toDisplayEvent(e: SupabaseEvent): Event {
  const d = new Date(e.start_date)
  return {
    id:      e.id,
    slug:    e.slug,
    name:    e.title,
    sport:   mapDiscipline(e.discipline ?? ''),
    date:    String(d.getUTCDate()).padStart(2, '0'),
    month:   d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    city:    e.city    ?? '',
    country: e.country ?? '',
    flag:    COUNTRY_FLAGS[e.country ?? ''] ?? '',
  }
}

// ─── Sport config ─────────────────────────────────────────────────────────────

const SPORT_FILTERS = ['All', 'HYROX', 'Spartan', 'Ironman', 'Marathon', 'Trail Running', 'Deka']

const SPORT_STYLES: Record<string, { bg: string; text: string }> = {
  HYROX:           { bg: 'rgba(0,217,166,0.12)',   text: '#00D9A6' },
  Spartan:         { bg: 'rgba(255,77,0,0.12)',     text: '#FF6B35' },
  Ironman:         { bg: 'rgba(239,68,68,0.12)',    text: '#F87171' },
  Marathon:        { bg: 'rgba(96,165,250,0.12)',   text: '#60A5FA' },
  'Trail Running': { bg: 'rgba(16,185,129,0.12)',   text: '#34D399' },
  Deka:            { bg: 'rgba(167,139,250,0.12)',  text: '#A78BFA' },
}

const defaultStyle = { bg: 'rgba(107,122,141,0.12)', text: '#6B7A8D' }

// ─── Component ────────────────────────────────────────────────────────────────

export function EventsSection({
  initialEvents = [],
  error,
}: {
  initialEvents?: SupabaseEvent[]
  error?: string
}) {
  const [active, setActive] = useState('All')

  const events   = initialEvents.map(toDisplayEvent)
  const filtered = active === 'All' ? events : events.filter((e) => e.sport === active)

  return (
    <section className="relative pb-24 pt-4">
      <div className="container-page">

        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-mint">
              Upcoming
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Featured Events
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            View all events
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Error state */}
        {error ? (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-red-400">
              Failed to load events. Please try refreshing the page.
            </p>
          </div>
        ) : (
          <>
            {/* Filter strip */}
            <div className="relative mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {SPORT_FILTERS.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setActive(sport)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active === sport
                        ? 'bg-mint text-canvas shadow-md shadow-mint/20'
                        : 'border border-wire bg-panel text-ink-muted hover:border-wire-bright hover:text-ink'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-canvas to-transparent sm:hidden" />
            </div>

            {/* Events grid */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-wire bg-panel py-16 text-center">
                <p className="text-ink-muted">
                  {events.length === 0
                    ? 'No upcoming events found. Check back soon!'
                    : 'No events found for this sport yet.'}
                </p>
                {events.length > 0 && (
                  <button
                    onClick={() => setActive('All')}
                    className="mt-4 text-sm font-medium text-mint hover:underline"
                  >
                    View all events
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Mobile "view all" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            View all events <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  const style = SPORT_STYLES[event.sport] ?? defaultStyle

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-wire bg-panel p-6 transition-all duration-300 hover:border-wire-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Top row: badge + date */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: style.bg, color: style.text }}
        >
          {event.sport}
        </span>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold leading-none text-ink">
            {event.date}
          </div>
          <div className="mt-0.5 text-xs text-ink-muted">{event.month}</div>
        </div>
      </div>

      {/* Event name */}
      <h3 className="font-heading text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-mint">
        {event.name}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <PinIcon className="h-4 w-4 shrink-0" style={{ color: style.text }} />
        <span>
          {event.city}, {event.country}
        </span>
        <span className="ml-auto text-base">{event.flag}</span>
      </div>

      {/* Divider */}
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

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
      />
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} style={style}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} style={style}>
      <path d="M8 1.5a4 4 0 0 1 4 4c0 2.5-4 9-4 9S4 8 4 5.5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="5.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
