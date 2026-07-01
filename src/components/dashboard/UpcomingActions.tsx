import Link from 'next/link'
import type { SeasonAction, Urgency } from '@/lib/season'

const URGENCY_DOT: Record<Urgency, string> = {
  critical: 'bg-red-500',
  high:     'bg-amber-400',
  medium:   'bg-green-400',
  low:      'bg-blue-400/70',
}

const URGENCY_TEXT: Record<Urgency, string> = {
  critical: 'text-red-400',
  high:     'text-amber-400',
  medium:   'text-green-400',
  low:      'text-ink-muted',
}

const MAX_SHOWN = 6

function isExternal(href: string) {
  return href.startsWith('http')
}

export function UpcomingActions({ actions }: { actions: SeasonAction[] }) {
  if (actions.length === 0) return null

  const shown = actions.slice(0, MAX_SHOWN)
  const overflow = actions.length - MAX_SHOWN

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <ZapIcon className="h-4 w-4 text-mint" />
        <h2 className="text-sm font-semibold text-ink">Upcoming Actions</h2>
        <span className="ml-auto rounded-full bg-mint/10 px-2 py-0.5 text-xs font-semibold text-mint">
          {actions.length}
        </span>
      </div>

      <div className="divide-y divide-wire overflow-hidden rounded-2xl border border-wire bg-panel">
        {shown.map((action) => (
          <div
            key={`${action.eventId}-${action.type}`}
            className="flex items-center gap-4 px-4 py-3.5 sm:px-5"
          >
            {/* Urgency dot */}
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[action.urgency]} ${
                action.urgency === 'critical' ? 'animate-pulse' : ''
              }`}
            />

            {/* Label + event name */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${URGENCY_TEXT[action.urgency]}`}>
                {action.label}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-subtle">
                {action.eventTitle}
              </p>
            </div>

            {/* Action button */}
            {isExternal(action.actionHref) ? (
              <a
                href={action.actionHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-wire bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wire-bright hover:text-mint"
              >
                {action.actionLabel}
              </a>
            ) : (
              <Link
                href={action.actionHref}
                className="shrink-0 rounded-lg border border-wire bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wire-bright hover:text-mint"
              >
                {action.actionLabel}
              </Link>
            )}
          </div>
        ))}

        {overflow > 0 && (
          <div className="px-5 py-3 text-center">
            <span className="text-xs text-ink-subtle">
              +{overflow} more action{overflow !== 1 ? 's' : ''} across your season
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M9.5 1.5 3 9h6l-2.5 5.5L14 7H8L9.5 1.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
