import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse upcoming HYROX, Spartan, Tough Mudder, obstacle races, trail runs and endurance events across Australia.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; discipline?: string; type?: string }>
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')
    .order('start_date', { ascending: true })

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }
  if (params.discipline) {
    // 'Ironman' filter matches both 'Ironman' and 'Ironman 70.3'
    if (params.discipline === 'Ironman') {
      query = query.ilike('discipline', 'Ironman%')
    } else {
      query = query.eq('discipline', params.discipline)
    }
  }
  if (params.type) {
    query = query.eq('event_type', params.type)
  }

  const { data: events, error } = await query.limit(48)

  if (error) {
    console.error('[EventsPage] Supabase error:', error.code, error.message)
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="page-title">Events</h1>
        <p className="mt-2 text-gray-400">Upcoming fitness races, obstacle runs, and endurance events.</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <EventFilters />
        </Suspense>
      </div>

      {error ? (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="Failed to load events"
          description="Could not connect to the database. Please try refreshing the page."
        />
      ) : events && events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="No events found"
          description="Try adjusting your filters or check back soon."
        />
      )}
    </div>
  )
}
