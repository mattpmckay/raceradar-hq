import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

const TIER_VARIANT: Record<string, 'default' | 'brand' | 'warning' | 'danger'> = {
  starter:  'default',
  achiever: 'brand',
  explorer: 'warning',
  legend:   'danger',
}

const TIER_LABELS: Record<string, string> = {
  starter:  'Starter',
  achiever: 'Achiever',
  explorer: 'Explorer',
  legend:   'Legend',
}

const FAMILY_LABELS: Record<string, string> = {
  series:     'Series',
  pursuit:    'Pursuit',
  collection: 'Collection',
}

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  series:     'Depth within one discipline',
  pursuit:    'Breadth across multiple disciplines',
  collection: 'Geographic or iconic events',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: c } = await supabase
    .from('challenges')
    .select('name, tagline, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!c) return { title: 'Challenge not found' }
  return {
    title: `${c.name} Challenge | RaceRadar HQ`,
    description: c.tagline ?? c.description ?? undefined,
  }
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!challenge) notFound()

  const [{ data: requirements }, { data: challengeTitle }] = await Promise.all([
    supabase
      .from('challenge_requirements')
      .select('id, requirement_type, display_label, min_count, discipline, country, region')
      .eq('challenge_id', challenge.id)
      .order('sort_order'),
    supabase
      .from('challenge_titles')
      .select('title, description')
      .eq('challenge_id', challenge.id)
      .maybeSingle(),
  ])

  return (
    <div className="container-page py-10">
      <Link
        href="/challenges"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Challenges
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={TIER_VARIANT[challenge.tier] ?? 'default'}>
                {TIER_LABELS[challenge.tier] ?? challenge.tier}
              </Badge>
              <Badge variant="outline">
                {FAMILY_LABELS[challenge.family] ?? challenge.family}
              </Badge>
              {challenge.is_seasonal && challenge.season_year && (
                <Badge variant="outline">{challenge.season_year} Season</Badge>
              )}
            </div>
            <h1 className="page-title">{challenge.name}</h1>
            {challenge.tagline && (
              <p className="mt-2 text-lg text-ink-muted">{challenge.tagline}</p>
            )}
          </div>

          {/* Description */}
          {challenge.description && (
            <div className="prose prose-invert prose-sm max-w-none text-ink-muted">
              {challenge.description}
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink mb-4">
                What you need to complete
              </h2>
              <ul className="space-y-3">
                {requirements.map((req) => (
                  <li key={req.id} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                    <div>
                      <p className="text-sm font-medium text-ink">{req.display_label}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {req.requirement_type === 'discipline' && req.discipline && (
                          <>Any {req.discipline} event · {req.min_count}×</>
                        )}
                        {req.requirement_type === 'geographic' && (
                          <>{[req.region, req.country].filter(Boolean).join(', ')} · {req.min_count}×</>
                        )}
                        {req.requirement_type === 'specific_event' && (
                          <>Specific event · {req.min_count}×</>
                        )}
                        {req.requirement_type === 'any_event' && (
                          <>Any verified event · {req.min_count}×</>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Stats card */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Challenge details</h2>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Type</dt>
                <dd className="text-ink">{FAMILY_LABELS[challenge.family] ?? challenge.family}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-muted">Tier</dt>
                <dd><Badge variant={TIER_VARIANT[challenge.tier] ?? 'default'} className="text-xs">
                  {TIER_LABELS[challenge.tier] ?? challenge.tier}
                </Badge></dd>
              </div>
              {challenge.events_required_total > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Events required</dt>
                  <dd className="text-ink font-medium">{challenge.events_required_total}</dd>
                </div>
              )}
              {challenge.primary_discipline_slug && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Discipline</dt>
                  <dd className="text-ink capitalize">{challenge.primary_discipline_slug.replace(/-/g, ' ')}</dd>
                </div>
              )}
              {challenge.geographic_scope && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Scope</dt>
                  <dd className="text-ink capitalize">{challenge.geographic_scope}</dd>
                </div>
              )}
            </dl>

            <p className="text-xs text-ink-subtle border-t border-wire pt-3">
              {FAMILY_DESCRIPTIONS[challenge.family]}
            </p>
          </div>

          {/* Earner title */}
          {challengeTitle && (
            <div className="card space-y-2 border-mint/30 bg-mint/5">
              <p className="text-xs font-medium text-mint uppercase tracking-wide">Earner title</p>
              <p className="font-semibold text-ink">{challengeTitle.title}</p>
              {challengeTitle.description && (
                <p className="text-xs text-ink-muted">{challengeTitle.description}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
