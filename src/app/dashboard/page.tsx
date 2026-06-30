import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Heart, Trophy, Search, MapPin } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Season' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, first_name')
    .eq('id', user!.id)
    .single()

  const { count: savedCount } = await supabase
    .from('favourites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const saved = savedCount ?? 0
  const firstName = profile?.first_name ?? profile?.full_name?.trim().split(' ')[0] ?? user!.email
  const isProfileIncomplete = !profile?.first_name

  return (
    <div className="space-y-5 md:space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">
          {saved > 0 ? `Your season, ${firstName}` : `Welcome, ${firstName}`}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {saved > 0
            ? 'Your saved events and upcoming season at a glance.'
            : 'Start planning your season — save events, track registrations and stay organised.'}
        </p>
      </div>

      {/* Complete profile prompt */}
      {isProfileIncomplete && (
        <Link
          href="/dashboard/profile"
          className="flex items-start gap-3 rounded-xl border border-mint/30 bg-mint/8 px-4 py-3.5 transition-colors hover:border-mint/50 hover:bg-mint/12"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-canvas">!</span>
          <div>
            <p className="text-sm font-semibold text-ink">Complete your profile</p>
            <p className="mt-0.5 text-xs text-ink-muted">Add your name, location, and preferred sports to get personalised event recommendations.</p>
          </div>
          <span className="ml-auto self-center text-xs font-semibold text-mint">Set up →</span>
        </Link>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { emoji: '🔍', label: 'Find Events',   href: '/events' },
            { emoji: '❤️', label: 'Saved Events',  href: '/dashboard/favourites' },
            { emoji: '🏆', label: 'Series',         href: '/championships' },
            { emoji: '📍', label: 'Near Me',        href: '/events' },
          ].map(({ emoji, label, href }) => (
            <Link
              key={label}
              href={href}
              className="card flex flex-col items-center gap-2 py-4 text-center transition-colors hover:border-mint/40"
            >
              <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-xs font-medium text-ink-muted">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">

        {/* Saved events */}
        {saved > 0 ? (
          <Link href="/dashboard/favourites" className="card transition-colors hover:border-mint/40">
            <Heart className="mb-3 h-5 w-5 text-mint" />
            <div className="text-2xl font-bold text-ink">{saved}</div>
            <div className="text-sm text-ink-muted">Saved {saved === 1 ? 'Event' : 'Events'}</div>
          </Link>
        ) : (
          <div className="card flex flex-col">
            <Heart className="mb-3 h-5 w-5 text-mint" />
            <div className="mb-1 text-sm font-medium text-ink">Saved Events</div>
            <p className="flex-1 text-xs text-ink-muted">Add events to your season to track them here.</p>
            <Link href="/events" className="mt-4 text-xs font-semibold text-mint transition-colors hover:text-mint/80">
              Browse Events →
            </Link>
          </div>
        )}

        {/* Upcoming */}
        <div className="card flex flex-col">
          <Calendar className="mb-3 h-5 w-5 text-mint" />
          <div className="mb-1 text-sm font-medium text-ink">Upcoming Events</div>
          <p className="flex-1 text-xs text-ink-muted">No upcoming events yet.</p>
          <Link href="/events" className="mt-4 text-xs font-semibold text-mint transition-colors hover:text-mint/80">
            Browse Events →
          </Link>
        </div>

        {/* Series */}
        <div className="card flex flex-col">
          <Trophy className="mb-3 h-5 w-5 text-mint" />
          <div className="mb-1 text-sm font-medium text-ink">Series</div>
          <p className="flex-1 text-xs text-ink-muted">No series followed yet.</p>
          <Link href="/championships" className="mt-4 text-xs font-semibold text-mint transition-colors hover:text-mint/80">
            Explore Series →
          </Link>
        </div>
      </div>

      {/* Getting started — only shown when season is empty */}
      {saved === 0 && (
        <section className="card">
          <h2 className="mb-1 font-semibold text-ink">Start planning your season</h2>
          <p className="mb-4 text-sm text-ink-muted">Everything you need to plan your event year.</p>
          <ul className="space-y-2">
            {[
              { icon: Search, label: 'Browse upcoming events',                href: '/events' },
              { icon: MapPin, label: 'Find events near me',                   href: '/events' },
              { icon: Trophy, label: 'Follow your favourite series',          href: '/championships' },
              { icon: Heart,  label: 'Add events to My Season',               href: '/events' },
            ].map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  <Icon className="h-4 w-4 shrink-0 text-mint" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  )
}
