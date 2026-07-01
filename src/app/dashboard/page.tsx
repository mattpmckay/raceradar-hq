import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { computeSeasonActions, groupByYear } from '@/lib/season'
import { SeasonEventCard } from '@/components/dashboard/SeasonEventCard'
import { UpcomingActions } from '@/components/dashboard/UpcomingActions'
import { EventCard } from '@/components/events/EventCard'

export const metadata: Metadata = { title: 'My Season — RaceRadar HQ' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: favourites }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, full_name')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user!.id)
      .eq('entity_type', 'event'),
  ])

  const firstName =
    profile?.first_name ??
    profile?.full_name?.trim().split(' ')[0] ??
    user!.email?.split('@')[0] ??
    'there'

  const eventIds = favourites?.map((f) => f.entity_id) ?? []

  let savedEvents: Tables<'events'>[] = []
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .eq('is_published', true)
      .order('start_date', { ascending: true })
    savedEvents = data ?? []
  }

  const today = new Date()

  // ── Empty state ────────────────────────────────────────────────
  if (savedEvents.length === 0) {
    const { data: featured } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .gte('start_date', today.toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(3)

    const featuredEvents: Tables<'events'>[] = featured ?? []

    return (
      <div className="space-y-8 md:space-y-10">

        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">My Season</h1>
          <p className="mt-1 text-sm text-ink-muted">Hey {firstName}, let's plan your season.</p>
        </div>

        {/* Value proposition */}
        <div className="rounded-2xl border border-wire bg-panel p-6 sm:p-8">
          <div className="mx-auto max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10">
              <SeasonIcon className="h-7 w-7 text-mint" />
            </div>
            <h2 className="font-heading text-lg font-bold text-ink">
              Your race season starts here
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Save any event to track registration windows, ballot dates, and race day countdowns — all in one place.
            </p>
            <div className="mt-5 space-y-2 text-left">
              {[
                'Never miss an early bird or registration deadline',
                'Track ballot dates and know exactly when to apply',
                'See your entire season at a glance',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                  <span className="text-sm text-ink-muted">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/events" className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
              Browse Events
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Featured events — one-tap to add */}
        {featuredEvents.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-ink">
                Featured Events
              </h2>
              <Link href="/events" className="text-xs font-semibold text-mint transition-colors hover:text-mint/80">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} initialSaved={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  // ── My Season (has saved events) ──────────────────────────────
  const actions = computeSeasonActions(savedEvents, today)
  const byYear = groupByYear(savedEvents)
  const sortedYears = Array.from(byYear.keys()).sort()

  return (
    <div className="space-y-8 md:space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">My Season</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {savedEvents.length} event{savedEvents.length !== 1 ? 's' : ''} planned
            {actions.length > 0 ? ` · ${actions.length} action${actions.length !== 1 ? 's' : ''} need attention` : ''}
          </p>
        </div>
        <Link
          href="/events"
          className="shrink-0 rounded-lg border border-wire bg-panel px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-wire-bright hover:text-ink"
        >
          + Add Events
        </Link>
      </div>

      {/* Upcoming Actions */}
      <UpcomingActions actions={actions} />

      {/* Season sections by year */}
      {sortedYears.map((year) => {
        const events = byYear.get(year)!
        const currentYear = today.getFullYear()
        const label = year === currentYear ? `My ${year} Season` : `${year} Season`

        return (
          <section key={year}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-heading text-lg font-bold text-ink">{label}</h2>
              <span className="rounded-full bg-panel-raised px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {events.map((event) => (
                <SeasonEventCard key={event.id} event={event} today={today} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function SeasonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" />
      <path d="M14 3v3M14 22v3M3 14h3M22 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
