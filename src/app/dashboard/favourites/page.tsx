import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Saved Events — My Season' }

export default async function FavouritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: favourites } = await supabase
    .from('favourites')
    .select('entity_id, entity_type')
    .eq('user_id', user!.id)
    .eq('entity_type', 'event')

  const eventIds = favourites?.map((f) => f.entity_id) ?? []

  const { data: events } = eventIds.length > 0
    ? await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .eq('is_published', true)
    : { data: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Saved Events</h1>
        {events && events.length > 0 && (
          <p className="mt-1 text-sm text-ink-muted">
            {events.length} {events.length === 1 ? 'event' : 'events'} saved to your season
          </p>
        )}
      </div>

      {events && events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} initialSaved={true} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10" />}
          title="Your season is empty"
          description="Browse events and tap 'Add to My Season' to save the ones you're planning."
          action={<Link href="/events" className="btn-primary">Browse Events</Link>}
        />
      )}
    </div>
  )
}
