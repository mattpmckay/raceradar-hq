import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/admin/EventForm'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Event — Admin' }

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/events"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-ink">{event.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">Edit event details.</p>
        </div>
        {event.is_published && (
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-mint transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View live
          </Link>
        )}
      </div>

      <EventForm event={event} />
    </div>
  )
}
