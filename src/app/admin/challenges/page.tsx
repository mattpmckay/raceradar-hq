import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Pencil } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Challenges — Admin' }

const FAMILY_LABELS = {
  series:     'Series',
  pursuit:    'Pursuit',
  collection: 'Collection',
}

const TIER_LABELS = {
  starter:  'Starter',
  achiever: 'Achiever',
  explorer: 'Explorer',
  legend:   'Legend',
}

const TIER_VARIANT: Record<string, 'default' | 'brand' | 'warning' | 'danger'> = {
  starter:  'default',
  achiever: 'brand',
  explorer: 'warning',
  legend:   'danger',
}

export default async function AdminChallengesPage() {
  const supabase = createAdminClient()
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, name, slug, family, tier, is_published, events_required_total, primary_discipline_slug')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Challenges</h1>
        <Link href="/admin/challenges/new" className="btn-primary text-sm">+ New Challenge</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire text-left text-xs text-ink-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Family</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Events req.</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wire">
            {challenges?.map((c) => (
              <tr key={c.id} className="hover:bg-panel-raised/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{FAMILY_LABELS[c.family]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={TIER_VARIANT[c.tier] ?? 'default'}>
                    {TIER_LABELS[c.tier]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-muted">{c.events_required_total}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.is_published ? 'success' : 'default'}>
                    {c.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/challenges/${c.id}/edit`}
                    className="btn-ghost p-1.5 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!challenges || challenges.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">No challenges yet.</p>
        )}
      </div>
    </div>
  )
}
