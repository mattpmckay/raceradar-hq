import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChallengeForm } from '@/components/admin/ChallengeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Challenge — Admin' }

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: challenge },
    { data: requirements },
    { data: challengeTitle },
    { data: disciplines },
    { data: events },
  ] = await Promise.all([
    supabase.from('challenges').select('*').eq('id', id).single(),
    supabase
      .from('challenge_requirements')
      .select('*')
      .eq('challenge_id', id)
      .order('sort_order'),
    supabase
      .from('challenge_titles')
      .select('*')
      .eq('challenge_id', id)
      .maybeSingle(),
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

  if (!challenge) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/challenges"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Challenges
        </Link>
        <h1 className="text-2xl font-bold text-ink">{challenge.name}</h1>
        <p className="mt-1 text-sm text-ink-muted">Edit challenge details, requirements, and earner title.</p>
      </div>

      <ChallengeForm
        challenge={challenge}
        requirements={requirements ?? []}
        challengeTitle={challengeTitle}
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
