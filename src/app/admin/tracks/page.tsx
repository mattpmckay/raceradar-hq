import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Tracks — Admin' }

export default async function AdminTracksPage() {
  const supabase = await createClient()
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, name, slug, country, length_km, is_published')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tracks</h1>
        <Link href="/admin/tracks/new" className="btn-primary text-sm">+ New Track</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Length</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {tracks?.map((track) => (
              <tr key={track.id} className="hover:bg-surface-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{track.name}</td>
                <td className="px-4 py-3 text-gray-400">{track.country}</td>
                <td className="px-4 py-3 text-gray-400">{track.length_km ? `${track.length_km} km` : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={track.is_published ? 'success' : 'default'}>
                    {track.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tracks/${track.id}/edit`} className="btn-ghost p-1.5 text-gray-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!tracks || tracks.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No tracks yet.</p>
        )}
      </div>
    </div>
  )
}
