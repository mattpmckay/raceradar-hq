import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Ruler, Globe, ArrowLeft, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/events/EventCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: track } = await supabase
    .from('tracks')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!track) return { title: 'Track not found' }
  return { title: track.name, description: track.description ?? undefined }
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!track) notFound()

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('track_id', track.id)
    .eq('is_published', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(6)

  return (
    <div className="container-page py-10">
      <Link href="/tracks" className="btn-ghost mb-6 inline-flex px-0 text-gray-400">
        <ArrowLeft className="h-4 w-4" /> Back to Tracks
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="page-title">{track.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-500" />
                {[track.city, track.region, track.country].filter(Boolean).join(', ')}
              </span>
              {track.length_km && (
                <span className="flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-brand-500" />
                  {track.length_km} km
                </span>
              )}
              {track.surface && <Badge variant="outline">{track.surface}</Badge>}
            </div>
          </div>

          {track.description && (
            <div className="card">
              <h2 className="font-semibold text-white mb-3">About {track.name}</h2>
              <p className="text-gray-300 whitespace-pre-line">{track.description}</p>
            </div>
          )}

          {upcomingEvents && upcomingEvents.length > 0 && (
            <div>
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand-500" />
                Upcoming Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Track Info</h2>
            {track.website_url && (
              <a
                href={track.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center"
              >
                <Globe className="h-4 w-4" /> Official Website
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
