import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Globe, ArrowLeft, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!event) return { title: 'Event not found' }

  return {
    title: event.title,
    description: event.description ?? undefined,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, tracks(name, slug, city, country)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!event) notFound()

  return (
    <div className="container-page py-10">
      <Link href="/events" className="btn-ghost mb-6 inline-flex px-0 text-gray-400">
        <ArrowLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="brand">{event.discipline}</Badge>
              <Badge variant="outline">{event.event_type}</Badge>
              {event.is_featured && <Badge variant="warning">Featured</Badge>}
            </div>
            <h1 className="page-title">{event.title}</h1>
          </div>

          {event.description && (
            <div className="card">
              <h2 className="font-semibold text-white mb-3">About this event</h2>
              <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Event Details</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">{formatDate(event.start_date)}</div>
                  {event.end_date && event.end_date !== event.start_date && (
                    <div className="text-gray-400">to {formatDate(event.end_date)}</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                <div>
                  {event.tracks && (
                    <Link
                      href={`/tracks/${(event.tracks as { slug: string }).slug}`}
                      className="font-medium text-white hover:text-brand-400 transition-colors"
                    >
                      {(event.tracks as { name: string }).name}
                    </Link>
                  )}
                  <div className="text-gray-400">
                    {[event.city, event.region, event.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>

              {event.organiser && (
                <div className="flex items-start gap-3">
                  <Flag className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-gray-400 text-xs">Organiser</div>
                    <div className="font-medium text-white">{event.organiser}</div>
                  </div>
                </div>
              )}
            </div>

            {event.registration_deadline && (
              <div className="rounded-lg bg-brand-500/10 border border-brand-500/20 px-3 py-2.5 text-sm">
                <span className="text-brand-400 font-medium">Registration closes</span>
                <div className="text-white">{formatDate(event.registration_deadline)}</div>
              </div>
            )}

            {event.website_url && (
              <a
                href={event.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
              >
                <Globe className="h-4 w-4" /> Visit Website
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
