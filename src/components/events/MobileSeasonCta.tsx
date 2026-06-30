'use client'

import { useState } from 'react'
import { Heart, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useFavourite } from '@/hooks/useFavourite'
import { formatDate } from '@/lib/utils'

interface Props {
  eventId: string
  slug: string
  initialSaved: boolean
  hasUser: boolean
  eventTitle: string
  startDate: string
  discipline: string
  isTBC: boolean
}

export function MobileSeasonCta({
  eventId,
  slug,
  initialSaved,
  hasUser,
  eventTitle,
  startDate,
  discipline,
  isTBC,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { saved, loading, toggle } = useFavourite(eventId, initialSaved)

  function handleClick() {
    if (hasUser) {
      toggle()
    } else {
      setSheetOpen(true)
    }
  }

  const dateStr = isTBC ? 'Date TBC' : formatDate(startDate)

  return (
    <>
      {/* Sticky bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-wire bg-canvas/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted">{dateStr} · {discipline}</p>
            <p className="truncate text-sm font-semibold text-ink">{eventTitle}</p>
          </div>
          <button
            onClick={handleClick}
            disabled={loading}
            className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${
              saved && hasUser
                ? 'border border-mint/40 bg-mint/10 text-mint'
                : 'bg-mint text-canvas hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20'
            }`}
          >
            <Heart className={`h-4 w-4 ${saved && hasUser ? 'fill-mint' : ''}`} />
            {!hasUser ? 'Build My Season' : saved ? 'In My Season' : 'Add to My Season'}
          </button>
        </div>
      </div>

      {/* Bottom sheet — logged-out value prop */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-canvas/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl border-t border-wire bg-panel px-5 pt-5 lg:hidden"
            style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
            role="dialog"
            aria-modal="true"
            aria-label="Build My Season"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-wire-bright" />

            <button
              onClick={() => setSheetOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-panel-raised"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="mb-4 text-4xl" aria-hidden>❤️</div>
              <h2 className="font-heading text-xl font-bold text-ink">Build My Season</h2>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                Build your season one event at a time. Save events, track registration dates and keep your entire season organised in one place.
              </p>
            </div>

            <ul className="mb-7 space-y-3">
              {[
                'Save events to your season',
                'Track upcoming registrations',
                'Plan your full season calendar',
                'Access your season from any device',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-ink">
                  <Check className="h-4 w-4 shrink-0 text-mint" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Link
                href={`/signup?next=/events/${slug}`}
                className="btn-primary w-full justify-center py-3 text-base"
                onClick={() => setSheetOpen(false)}
              >
                Start My Season
              </Link>
              <p className="text-center text-xs text-ink-muted">Create your free account in less than 30 seconds.</p>
              <Link
                href={`/login?next=/events/${slug}`}
                className="block pt-1 text-center text-sm text-ink-muted transition-colors hover:text-ink"
                onClick={() => setSheetOpen(false)}
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
