import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Championships — Admin' }

export default async function AdminChampionshipsPage() {
  const supabase = await createClient()
  const { data: championships } = await supabase
    .from('championships')
    .select('id, name, slug, discipline, season_year, is_published')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Championships</h1>
        <Link href="/admin/championships/new" className="btn-primary text-sm">+ New Championship</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Discipline</th>
              <th className="px-4 py-3 font-medium">Season</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {championships?.map((c) => (
              <tr key={c.id} className="hover:bg-surface-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="brand">{c.discipline}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-400">{c.season_year ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.is_published ? 'success' : 'default'}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/championships/${c.id}/edit`} className="btn-ghost p-1.5 text-gray-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!championships || championships.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No championships yet.</p>
        )}
      </div>
    </div>
  )
}
