import Link from 'next/link'
import { MapPin, Ruler } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tracks & Venues',
  description: 'Explore circuits, tracks and event venues for fitness races and endurance events across Asia Pacific.',
}

export default async function TracksPage() {
  const supabase = await createClient()
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, slug, name, city, country, length_km, surface')
    .eq('is_published', true)
    .order('name', { ascending: true })

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="page-title">Tracks &amp; Venues</h1>
        <p className="mt-2 text-ink-muted max-w-xl">
          Circuits, stadiums and event venues hosting fitness races across Asia Pacific.
        </p>
      </div>

      {tracks && tracks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.slug}`}
              className="card group hover:border-mint/40 transition-colors space-y-3"
            >
              <h3 className="font-semibold text-ink group-hover:text-mint transition-colors">
                {track.name}
              </h3>

              <div className="space-y-1.5 text-sm text-ink-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-mint" />
                  <span>{[track.city, track.country].filter(Boolean).join(', ')}</span>
                </div>
                {track.length_km && (
                  <div className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 shrink-0 text-mint" />
                    <span>{track.length_km} km</span>
                  </div>
                )}
              </div>

              {track.surface && (
                <Badge variant="outline" className="capitalize">{track.surface}</Badge>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title="No tracks listed yet"
          description="Track and venue listings are coming soon."
        />
      )}
    </div>
  )
}
