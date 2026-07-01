import { createClient } from '@/lib/supabase/server'
import { NewImportForm } from './NewImportForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Import — Admin' }

export default async function NewImportPage() {
  const supabase = await createClient()

  const [{ data: disciplines }, { data: seriesList }] = await Promise.all([
    supabase.from('disciplines').select('name, event_discipline_values').eq('is_active', true).order('order_index'),
    supabase.from('series').select('slug, name').eq('is_active', true).order('name'),
  ])

  // Build a flat, deduplicated list of discipline string values for the dropdown
  const disciplineValues = [
    ...new Set(
      (disciplines ?? []).flatMap((d) => (d.event_discipline_values as string[]) ?? [])
    ),
  ].sort()

  const seriesOptions = (seriesList ?? []).map((s) => ({ slug: s.slug, name: s.name }))

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Manual Import</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Stage an event from an official source for admin review. The event will not go live until approved.
        </p>
      </div>
      <NewImportForm disciplineValues={disciplineValues} seriesOptions={seriesOptions} />
    </div>
  )
}
