import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RaceRadar — Motorsport Intelligence',
  description: 'Discover race events, track days, championships and motorsport opportunities.',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(6)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-transparent" />
        <div className="container-page relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="page-title">
              Your motorsport radar,{' '}
              <span className="text-brand-500">always on.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 sm:text-xl">
              Discover race events, track days, championships, and opportunities
              across Australia and beyond.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/events" className="btn-primary text-base px-6 py-3">
                Browse Events <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tracks" className="btn-secondary text-base px-6 py-3">
                Explore Tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-surface-border">
        <div className="container-page py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { icon: Calendar, label: 'Upcoming Events', value: '200+' },
              { icon: MapPin, label: 'Circuits & Venues', value: '80+' },
              { icon: Trophy, label: 'Championships', value: '40+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="mx-auto h-6 w-6 text-brand-500 mb-2" />
                <div className="text-2xl font-bold text-white sm:text-3xl">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="container-page py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Featured Events</h2>
          <Link href="/events" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredEvents && featuredEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-400">Featured events coming soon.</p>
            <Link href="/events" className="btn-primary mt-4 inline-flex">
              Browse all events
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="card bg-gradient-to-r from-brand-900/40 to-surface-card text-center py-12 sm:py-16">
          <h2 className="section-title">Never miss a race</h2>
          <p className="mt-3 text-gray-400 max-w-md mx-auto">
            Create a free account to save events, track championships and get personalised alerts.
          </p>
          <Link href="/signup" className="btn-primary mt-6 inline-flex text-base px-6 py-3">
            Get started free
          </Link>
        </div>
      </section>
    </>
  )
}
