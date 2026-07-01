import Link from 'next/link'
import type { Tables } from '@/types/supabase'
import { HeartButton } from '@/components/events/HeartButton'
import { Badge } from '@/components/ui/Badge'
import { getEventStatus, countdown } from '@/lib/season'

type Event = Tables<'events'>

const DISCIPLINE_COLORS: Record<string, { bg: string; text: string }> = {
  'HYROX':         { bg: 'rgba(0,217,166,0.12)',   text: '#00D9A6' },
  'CrossFit':      { bg: 'rgba(239,68,68,0.12)',    text: '#EF4444' },
  'Deka Fit':      { bg: 'rgba(167,139,250,0.12)',  text: '#A78BFA' },
  'Spartan Race':  { bg: 'rgba(255,107,53,0.12)',   text: '#FF6B35' },
  'Tough Mudder':  { bg: 'rgba(245,158,11,0.12)',   text: '#F59E0B' },
  'Ironman':       { bg: 'rgba(248,113,113,0.12)',  text: '#F87171' },
  'Ironman 70.3':  { bg: 'rgba(248,113,113,0.12)',  text: '#F87171' },
  'Marathon':      { bg: 'rgba(96,165,250,0.12)',   text: '#60A5FA' },
  'Road Racing':   { bg: 'rgba(148,163,184,0.12)',  text: '#94A3B8' },
  'Trail Running': { bg: 'rgba(52,211,153,0.12)',   text: '#34D399' },
}
const defaultStyle = { bg: 'rgba(107,122,141,0.12)', text: '#8896A8' }

const COUNTRY_FLAGS: Record<string, string> = {
  'Australia':   '🇦🇺', 'New Zealand': '🇳🇿', 'Singapore':   '🇸🇬',
  'Japan':       '🇯🇵', 'South Korea': '🇰🇷', 'Thailand':    '🇹🇭',
  'Malaysia':    '🇲🇾', 'Philippines': '🇵🇭', 'Indonesia':   '🇮🇩',
  'Vietnam':     '🇻🇳', 'China':       '🇨🇳', 'Hong Kong':   '🇭🇰',
  'Taiwan':      '🇹🇼', 'India':       '🇮🇳',
}

function getPrimaryAction(event: Event): { label: string; href: string; isExternal: boolean } {
  if (event.ballot_required && event.ballot_apply_url) {
    return { label: 'Apply for Ballot', href: event.ballot_apply_url, isExternal: true }
  }
  if (event.waitlist_open && event.waitlist_url) {
    return { label: 'Join Waitlist', href: event.waitlist_url, isExternal: true }
  }
  if (
    event.registration_url &&
    event.registration_status !== 'sold_out' &&
    event.registration_status !== 'ballot_closed'
  ) {
    return { label: 'Register', href: event.registration_url, isExternal: true }
  }
  return { label: 'View Event', href: `/events/${event.slug}`, isExternal: false }
}

export function SeasonEventCard({ event, today }: { event: Event; today: Date }) {
  const style = DISCIPLINE_COLORS[event.discipline] ?? defaultStyle
  const d = new Date(event.start_date)
  const dateStr = d.toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
  const flag = COUNTRY_FLAGS[event.country ?? ''] ?? ''
  const location = [event.city, event.country].filter(Boolean).join(', ')
  const countdownStr = countdown(event.start_date, today)
  const status = getEventStatus(event, today)
  const action = getPrimaryAction(event)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-wire bg-panel transition-all duration-300 hover:border-wire-bright hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">

      {/* Accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-3.5 p-5">

        {/* Row 1: discipline badge + countdown + heart */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: style.bg, color: style.text }}
          >
            {event.discipline}
          </span>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-wire bg-canvas px-2.5 py-1 text-xs font-semibold text-ink-muted">
              {countdownStr}
            </span>
            <HeartButton eventId={event.id} initialSaved={true} />
          </div>
        </div>

        {/* Event name */}
        <h3 className="font-heading text-base font-semibold leading-snug text-ink line-clamp-2 transition-colors group-hover:text-mint">
          {event.title}
        </h3>

        {/* Date + location */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-ink-muted">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
            <span>{dateStr}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-ink-muted">
              <PinIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
              <span className="truncate">{location}</span>
              {flag && <span className="ml-auto pl-2">{flag}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer: status badge + action */}
      <div className="flex items-center justify-between gap-3 border-t border-wire px-5 py-3.5">
        <div className="min-w-0">
          {status ? (
            <Badge variant={status.variant}>{status.label}</Badge>
          ) : (
            <span className="text-xs text-ink-subtle">In My Season</span>
          )}
        </div>
        <div className="relative z-10 shrink-0">
          {action.isExternal ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-wire bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wire-bright hover:text-mint"
            >
              {action.label} →
            </a>
          ) : (
            <Link
              href={action.href}
              className="rounded-lg border border-wire bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wire-bright hover:text-mint"
            >
              {action.label} →
            </Link>
          )}
        </div>
      </div>

      {/* Invisible full-card link — behind interactive elements */}
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={`View ${event.title}`}
      />
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M8 1.5a4 4 0 0 1 4 4c0 2.5-4 9-4 9S4 8 4 5.5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="5.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
