import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { SubmissionActions } from '@/components/admin/SubmissionActions'
import { formatDateShort } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Events — Admin' }

interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const { filter } = await searchParams
  const isPendingFilter = filter === 'pending'

  const supabase = createAdminClient()

  let query = supabase
    .from('events')
    .select('id, title, slug, discipline, event_type, start_date, is_published, is_featured, submission_source, submitter_name, submitter_email, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (isPendingFilter) {
    query = query
      .eq('submission_source', 'organiser_submission')
      .eq('is_published', false)
  }

  const { data: events } = await query

  const pendingCount = events
    ? isPendingFilter
      ? events.length
      : events.filter((e) => e.submission_source === 'organiser_submission' && !e.is_published).length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Events</h1>
        <Link href="/admin/events/new" className="btn-primary text-sm">+ New Event</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-wire">
        <Link
          href="/admin/events"
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !isPendingFilter
              ? 'border-b-2 border-mint text-ink'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          All Events
        </Link>
        <Link
          href="/admin/events?filter=pending"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            isPendingFilter
              ? 'border-b-2 border-mint text-ink'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Pending Submissions
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire text-left text-xs text-ink-muted">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Discipline</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wire">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-panel-raised/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">{event.title}</span>
                  {event.submission_source === 'organiser_submission' && (
                    <div className="mt-0.5 space-y-0.5">
                      {event.submitter_name && (
                        <p className="text-xs text-ink-muted">{event.submitter_name}</p>
                      )}
                      {event.submitter_email && (
                        <p className="text-xs text-ink-subtle">{event.submitter_email}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  <div>{formatDateShort(event.start_date)}</div>
                  {isPendingFilter && event.created_at && (
                    <div className="text-xs text-ink-subtle">
                      Submitted {formatDateShort(event.created_at)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="brand">{event.discipline}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {event.submission_source === 'organiser_submission' && (
                      <Badge variant="warning">Submitted</Badge>
                    )}
                    <Badge variant={event.is_published ? 'success' : 'default'}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isPendingFilter && event.submission_source === 'organiser_submission' ? (
                    <SubmissionActions
                      eventId={event.id}
                      eventSlug={event.slug}
                      eventTitle={event.title}
                    />
                  ) : (
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="btn-ghost p-1.5 text-ink-muted hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">
            {isPendingFilter ? 'No pending submissions.' : 'No events yet.'}
          </p>
        )}
      </div>
    </div>
  )
}
