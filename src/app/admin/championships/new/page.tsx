import { createAdminClient } from '@/lib/supabase/server'
import { ChampionshipForm } from '@/components/admin/ChampionshipForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Championship — Admin' }

export default async function NewChampionshipPage() {
  const supabase = createAdminClient()

  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('slug, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Championship</h1>
        <p className="mt-1 text-sm text-ink-muted">Add a series or championship to the directory.</p>
      </div>

      <ChampionshipForm disciplines={disciplines ?? []} />
    </div>
  )
}
