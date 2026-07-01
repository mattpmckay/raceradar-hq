import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, Trophy, Inbox } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: eventCount },
    { count: trackCount },
    { count: championshipCount },
    { count: queueCount },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('tracks').select('*', { count: 'exact', head: true }),
    supabase.from('championships').select('*', { count: 'exact', head: true }),
    supabase.from('import_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { icon: Calendar, label: 'Events', value: eventCount ?? 0, href: '/admin/events' },
    { icon: Inbox, label: 'Pending Imports', value: queueCount ?? 0, href: '/admin/import-queue' },
    { icon: MapPin, label: 'Tracks', value: trackCount ?? 0, href: '/admin/tracks' },
    { icon: Trophy, label: 'Championships', value: championshipCount ?? 0, href: '/admin/championships' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-ink">Admin Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="card hover:border-mint/30 transition-colors"
          >
            <Icon className="h-5 w-5 text-mint mb-3" />
            <div className="text-3xl font-bold text-ink">{value}</div>
            <div className="text-sm text-ink-muted">{label}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/events/new" className="btn-primary text-sm">+ New Event</Link>
          <Link href="/admin/import-queue/new" className="btn-secondary text-sm">+ New Import</Link>
          <Link href="/admin/tracks/new" className="btn-secondary text-sm">+ New Track</Link>
          <Link href="/admin/championships/new" className="btn-secondary text-sm">+ New Championship</Link>
        </div>
      </div>
    </div>
  )
}
