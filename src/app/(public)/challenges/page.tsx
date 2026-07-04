import Link from 'next/link'
import { Medal } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Challenges — Build Your Fitness Passport | RaceRadar HQ',
  description:
    'Browse endurance challenges across HYROX, Spartan Race, Ironman, trail running and more. Complete a Series, Pursuit, or Collection challenge to earn your Passport title.',
}

const FAMILY_LABELS: Record<string, string> = {
  series:     'Series',
  pursuit:    'Pursuit',
  collection: 'Collection',
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

const FAMILY_FILTERS = [
  { value: '',           label: 'All Challenges' },
  { value: 'series',     label: 'Series' },
  { value: 'pursuit',    label: 'Pursuit' },
  { value: 'collection', label: 'Collection' },
]

interface PageProps {
  searchParams: Promise<{ family?: string }>
}

export default async function ChallengesPage({ searchParams }: PageProps) {
  const { family } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('challenges')
    .select('id, slug, name, tagline, family, tier, events_required_total, primary_discipline_slug, badge_image_url')
    .eq('is_published', true)
    .eq('is_retired', false)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (family) query = query.eq('family', family as 'series' | 'pursuit' | 'collection')

  const { data: challenges } = await query

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="page-title">Challenges</h1>
        <p className="mt-2 text-gray-400 max-w-xl">
          Complete a challenge to earn your Fitness Passport title. Pick a Series to go deep,
          a Pursuit to go broad, or a Collection to tick off iconic events.
        </p>
      </div>

      {/* Family filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FAMILY_FILTERS.map((f) => {
          const isActive = (family ?? '') === f.value
          const href = f.value ? `/challenges?family=${f.value}` : '/challenges'
          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'border-mint bg-mint/10 text-mint'
                  : 'border-wire text-ink-muted hover:border-mint/50 hover:text-ink'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {challenges && challenges.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <Link
              key={c.id}
              href={`/challenges/${c.slug}`}
              className="card group hover:border-mint/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={TIER_VARIANT[c.tier] ?? 'default'}>
                    {TIER_LABELS[c.tier] ?? c.tier}
                  </Badge>
                  <Badge variant="outline">
                    {FAMILY_LABELS[c.family] ?? c.family}
                  </Badge>
                </div>
                {c.events_required_total > 0 && (
                  <span className="shrink-0 text-xs text-ink-muted whitespace-nowrap">
                    {c.events_required_total} {c.events_required_total === 1 ? 'event' : 'events'}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-ink group-hover:text-mint transition-colors">
                {c.name}
              </h3>

              {c.tagline && (
                <p className="text-sm text-ink-muted line-clamp-2">{c.tagline}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Medal className="h-10 w-10" />}
          title="No challenges yet"
          description={
            family
              ? `No ${FAMILY_LABELS[family] ?? family} challenges published yet.`
              : 'Challenges are coming soon.'
          }
          action={
            family ? (
              <Link href="/challenges" className="btn-primary">View all challenges</Link>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
