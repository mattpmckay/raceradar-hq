import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatDateShort } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Events — Admin' }

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, discipline, event_type, start_date, is_published, is_featured')
    .order('start_date', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Events</h1>
        <Link href="/admin/events/new" className="btn-primary text-sm">+ New Event</Link>
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
                <td className="px-4 py-3 font-medium text-ink">{event.title}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDateShort(event.start_date)}</td>
                <td className="px-4 py-3">
                  <Badge variant="brand">{event.discipline}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={event.is_published ? 'success' : 'default'}>
                    {event.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="btn-ghost p-1.5 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!events || events.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No events yet.</p>
        )}
      </div>
    </div>
  )
}
