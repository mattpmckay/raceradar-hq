import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disciplines — Fitness Racing Events | RaceRadar HQ',
  description:
    'Browse fitness racing disciplines — HYROX, Marathon, Obstacle Course Racing, Triathlon, Ironman, Trail Running and more. Find events, guides and race calendars for every sport.',
}

export default async function DisciplinesPage() {
  const supabase = await createClient()

  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('slug, name, short_description, color, event_discipline_values')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const { data: countRows } = await supabase
    .from('events')
    .select('discipline')
    .eq('is_published', true)
    .gte('start_date', today)

  const disciplineCounts = new Map<string, number>()
  for (const row of countRows ?? []) {
    const d = row.discipline ?? ''
    disciplineCounts.set(d, (disciplineCounts.get(d) ?? 0) + 1)
  }

  function countForDiscipline(values: string[]): number {
    return values.reduce((sum, v) => sum + (disciplineCounts.get(v) ?? 0), 0)
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Browse by Discipline
        </h1>
        <p className="mt-2 text-ink-muted">
          Discover upcoming events, race guides and first-timer advice for every fitness racing discipline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(disciplines ?? []).map((d) => {
          const count = countForDiscipline(d.event_discipline_values ?? [])
          return (
            <Link
              key={d.slug}
              href={`/discipline/${d.slug}`}
              className="group card flex flex-col gap-3 hover:border-wire-bright transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold text-ink group-hover:text-mint transition-colors">
                  {d.name}
                </h2>
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color ?? '#00D9A6' }}
                />
              </div>
              {d.short_description && (
                <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">
                  {d.short_description}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-ink-muted">
                  {count > 0 ? `${count} upcoming event${count === 1 ? '' : 's'}` : 'Events coming soon'}
                </span>
                <span className="text-xs font-medium text-mint opacity-0 group-hover:opacity-100 transition-opacity">
                  View guide →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 rounded-xl border border-wire/50 bg-panel p-6 text-sm text-ink-muted">
        <p>
          Can&apos;t find your discipline?{' '}
          <Link href="/events" className="text-mint hover:underline">
            Browse all events →
          </Link>
        </p>
      </div>
    </div>
  )
}
