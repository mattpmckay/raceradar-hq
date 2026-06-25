'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: string
  name: string
  sport: string
  date: string
  month: string
  city: string
  country: string
  flag: string
}

// ─── Placeholder data ─────────────────────────────────────────────────────────

const EVENTS: Event[] = [
  {
    id: '1',
    name: 'HYROX World Series Sydney',
    sport: 'HYROX',
    date: '22',
    month: 'Feb 2026',
    city: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
  },
  {
    id: '2',
    name: 'Spartan Race Melbourne Sprint',
    sport: 'Spartan',
    date: '14',
    month: 'Mar 2026',
    city: 'Melbourne',
    country: 'Australia',
    flag: '🇦🇺',
  },
  {
    id: '3',
    name: 'Ironman 70.3 Auckland',
    sport: 'Ironman',
    date: '05',
    month: 'Apr 2026',
    city: 'Auckland',
    country: 'New Zealand',
    flag: '🇳🇿',
  },
  {
    id: '4',
    name: 'HYROX Singapore',
    sport: 'HYROX',
    date: '26',
    month: 'Apr 2026',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
  },
  {
    id: '5',
    name: 'Spartan Ultra Hokkaido',
    sport: 'Spartan',
    date: '21',
    month: 'Jun 2026',
    city: 'Hokkaido',
    country: 'Japan',
    flag: '🇯🇵',
  },
  {
    id: '6',
    name: 'Ironman Asia-Pacific Championship',
    sport: 'Ironman',
    date: '18',
    month: 'Jul 2026',
    city: 'Brisbane',
    country: 'Australia',
    flag: '🇦🇺',
  },
]

const SPORT_FILTERS = [
  'All', 'HYROX', 'Spartan', 'Ironman', 'Triathlon',
  'Deka', 'CrossFit', 'OCR', 'Trail Running', 'Powerlifting',
]

// ─── Sport badge styles ───────────────────────────────────────────────────────

const SPORT_STYLES: Record<string, { bg: string; text: string }> = {
  HYROX:           { bg: 'rgba(0,217,166,0.12)',   text: '#00D9A6' },
  Spartan:         { bg: 'rgba(255,77,0,0.12)',     text: '#FF6B35' },
  Ironman:         { bg: 'rgba(239,68,68,0.12)',    text: '#F87171' },
  Triathlon:       { bg: 'rgba(96,165,250,0.12)',   text: '#60A5FA' },
  Deka:            { bg: 'rgba(167,139,250,0.12)',  text: '#A78BFA' },
  CrossFit:        { bg: 'rgba(251,191,36,0.12)',   text: '#FBB724' },
  OCR:             { bg: 'rgba(34,197,94,0.12)',    text: '#4ADE80' },
  'Trail Running': { bg: 'rgba(16,185,129,0.12)',   text: '#34D399' },
  Powerlifting:    { bg: 'rgba(236,72,153,0.12)',   text: '#F472B6' },
}

const defaultStyle = { bg: 'rgba(107,122,141,0.12)', text: '#6B7A8D' }

// ─── Component ────────────────────────────────────────────────────────────────

export function EventsSection() {
  const [active, setActive] = useState('All')

  const filtered =
    active === 'All' ? EVENTS : EVENTS.filter((e) => e.sport === active)

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
          {/* Edge fade for scroll affordance */}
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
            <p className="text-ink-muted">No events found for this sport yet.</p>
            <button
              onClick={() => setActive('All')}
              className="mt-4 text-sm font-medium text-mint hover:underline"
            >
              View all events
            </button>
          </div>
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
      href={`/events/${event.id}`}
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
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full border border-wire transition-all duration-200 group-hover:border-transparent group-hover:text-canvas"
          style={{
            background: 'transparent',
          }}
        >
          <ArrowRightIcon
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: style.text }}
          />
        </span>
      </div>

      {/* Subtle top accent line */}
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
