import Link from 'next/link'
import type { Tables } from '@/types/supabase'

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

export function EventCard({ event }: { event: Event }) {
  const style = DISCIPLINE_COLORS[event.discipline] ?? defaultStyle
  const d     = new Date(event.start_date)
  const day   = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  const flag  = COUNTRY_FLAGS[event.country ?? ''] ?? ''
  const location = [event.city, event.country].filter(Boolean).join(', ')

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-wire bg-panel p-6 transition-all duration-300 hover:border-wire-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Top row: discipline badge + date */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: style.bg, color: style.text }}
        >
          {event.discipline}
        </span>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold leading-none text-ink">{day}</div>
          <div className="mt-0.5 text-xs text-ink-muted">{month}</div>
        </div>
      </div>

      {/* Event name */}
      <h3 className="font-heading text-base font-semibold leading-snug text-ink line-clamp-2 transition-colors group-hover:text-mint">
        {event.title}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <PinIcon className="h-4 w-4 shrink-0" style={{ color: style.text }} />
        <span className="truncate">{location}</span>
        {flag && <span className="ml-auto text-base">{flag}</span>}
      </div>

      {/* Divider */}
      <div className="border-t border-wire" />

      {/* CTA row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-muted transition-colors group-hover:text-ink">
          View Event
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-wire transition-all duration-200 group-hover:border-wire-bright">
          <ArrowRightIcon className="h-3.5 w-3.5" style={{ color: style.text }} />
        </span>
      </div>

      {/* Top accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
      />
    </Link>
  )
}

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
