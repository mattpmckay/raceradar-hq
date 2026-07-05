import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Championships & Series',
  description: 'Explore endurance championships, race series and multi-event fitness programs across Asia Pacific.',
}

export default async function ChampionshipsPage() {
  const supabase = await createClient()
  const { data: championships } = await supabase
    .from('championships')
    .select('id, slug, name, discipline, season_year, organiser, country')
    .eq('is_published', true)
    .order('name', { ascending: true })

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="page-title">Championships &amp; Series</h1>
        <p className="mt-2 text-ink-muted max-w-xl">
          Endurance championships, race series and multi-event programs across Asia Pacific.
        </p>
      </div>

      {championships && championships.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {championships.map((c) => (
            <Link
              key={c.id}
              href={`/championships/${c.slug}`}
              className="card group hover:border-mint/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="brand">{c.discipline}</Badge>
                {c.season_year && (
                  <span className="text-xs text-ink-subtle">{c.season_year}</span>
                )}
              </div>

              <h3 className="font-semibold text-ink group-hover:text-mint transition-colors">
                {c.name}
              </h3>

              {c.organiser && (
                <p className="text-sm text-ink-muted">{c.organiser}</p>
              )}

              {c.country && (
                <p className="text-xs text-ink-subtle">{c.country}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy className="h-10 w-10" />}
          title="No championships listed yet"
          description="Championship and series listings are coming soon."
        />
      )}
    </div>
  )
}
