import { createClient } from '@/lib/supabase/server'
import { ChallengeForm } from '@/components/admin/ChallengeForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Challenge — Admin' }

export default async function NewChallengePage() {
  const supabase = await createClient()

  const [{ data: disciplines }, { data: events }] = await Promise.all([
    supabase
      .from('disciplines')
      .select('slug, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('events')
      .select('id, title, slug, discipline')
      .eq('is_published', true)
      .order('title')
      .limit(500),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Challenge</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Create a Series, Pursuit, or Collection challenge. Requirements and titles can be added after saving.
        </p>
      </div>

      <ChallengeForm
        disciplines={disciplines ?? []}
        events={(events ?? []).map(e => ({
          id:         e.id,
          title:      e.title,
          slug:       e.slug,
          discipline: e.discipline,
        }))}
      />
    </div>
  )
}
