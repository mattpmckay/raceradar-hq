import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Championships',
  description: 'Explore motorsport championships and series.',
}

export default async function ChampionshipsPage() {
  const supabase = await createClient()
  const { data: championships } = await supabase
    .from('championships')
    .select('*')
    .eq('is_published', true)
    .order('name', { ascending: true })

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="page-title">Championships</h1>
        <p className="mt-2 text-gray-400">Motorsport series and championships.</p>
      </div>

      {championships && championships.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {championships.map((c) => (
            <Link
              key={c.id}
              href={`/championships/${c.slug}`}
              className="card group hover:border-brand-500/50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="brand">{c.discipline}</Badge>
                {c.season_year && (
                  <span className="text-xs text-gray-500">{c.season_year}</span>
                )}
              </div>

              <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                {c.name}
              </h3>

              {c.organiser && (
                <p className="text-sm text-gray-400">{c.organiser}</p>
              )}

              {c.country && (
                <p className="text-xs text-gray-500">{c.country}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy className="h-10 w-10" />}
          title="No championships listed yet"
          description="Championship listings are coming soon."
        />
      )}
    </div>
  )
}
