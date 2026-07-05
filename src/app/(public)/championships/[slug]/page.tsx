import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EventCard } from '@/components/events/EventCard'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: c } = await supabase
    .from('championships')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!c) return { title: 'Championship not found' }
  return {
    title: `${c.name} | RaceRadar HQ`,
    description: c.description ?? undefined,
  }
}

export default async function ChampionshipDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: championship } = await supabase
    .from('championships')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!championship) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('championship_id', championship.id)
    .eq('is_published', true)
    .order('start_date', { ascending: true })
    .limit(12)

  return (
    <div className="container-page py-10">
      <Link
        href="/championships"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Championships
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="brand">{championship.discipline}</Badge>
              {championship.season_year && (
                <Badge variant="outline">{championship.season_year} Season</Badge>
              )}
            </div>
            <h1 className="page-title">{championship.name}</h1>
          </div>

          {championship.description && (
            <div className="card">
              <p className="text-ink-muted whitespace-pre-line">{championship.description}</p>
            </div>
          )}

          {events && events.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-mint" />
                Championship Rounds
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} initialSaved={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-ink">Details</h2>
            <dl className="space-y-2 text-sm">
              {championship.organiser && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Organiser</dt>
                  <dd className="text-ink font-medium">{championship.organiser}</dd>
                </div>
              )}
              {championship.country && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Country</dt>
                  <dd className="text-ink">{championship.country}</dd>
                </div>
              )}
              {championship.season_year && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-muted">Season</dt>
                  <dd className="text-ink">{championship.season_year}</dd>
                </div>
              )}
            </dl>
            {championship.website_url && (
              <a
                href={championship.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center"
              >
                <Globe className="h-4 w-4" />
                Official Website
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
