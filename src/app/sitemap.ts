import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: events },
    { data: tracks },
    { data: championships },
    { data: disciplines },
    { data: seriesList },
    { data: eventLocations },
    { data: challenges },
  ] = await Promise.all([
    supabase.from('events').select('slug, updated_at').eq('is_published', true).lt('start_date', '2099-01-01'),
    supabase.from('tracks').select('slug, updated_at').eq('is_published', true),
    supabase.from('championships').select('slug, updated_at').eq('is_published', true),
    supabase.from('disciplines').select('slug, updated_at, event_discipline_values').eq('is_active', true),
    supabase.from('series').select('slug, updated_at').eq('is_active', true),
    supabase
      .from('events')
      .select('discipline, city')
      .eq('is_published', true)
      .gte('start_date', today)
      .not('city', 'is', null),
    supabase.from('challenges').select('slug, updated_at').eq('is_published', true).eq('is_retired', false),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                        changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/events`,            changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/discipline`,        changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/sports`,            changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/locations`,         changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/challenges`,        changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/guides`,            changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/guides/how-to-choose-your-first-fitness-race`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guides/race-day-checklist`,                    changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/guides/the-complete-hyrox-guide`,             changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tracks`,            changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/championships`,     changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/about`,             changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/contact`,           changeFrequency: 'monthly', priority: 0.3 },
  ]

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: e.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const disciplineRoutes: MetadataRoute.Sitemap = (disciplines ?? []).map((d) => ({
    url: `${base}/discipline/${d.slug}`,
    lastModified: d.updated_at,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // Discipline + location combos (e.g. /discipline/hyrox/sydney)
  const disciplineLocationRoutes: MetadataRoute.Sitemap = []
  for (const discipline of disciplines ?? []) {
    const values = (discipline.event_discipline_values ?? []) as string[]
    const cities = [
      ...new Set(
        (eventLocations ?? [])
          .filter((e) => values.includes(e.discipline))
          .map((e) => e.city!)
          .filter(Boolean),
      ),
    ]
    for (const city of cities) {
      disciplineLocationRoutes.push({
        url: `${base}/discipline/${discipline.slug}/${city.toLowerCase().replace(/\s+/g, '-')}`,
        changeFrequency: 'weekly',
        priority: 0.75,
      })
    }
  }

  const seriesRoutes: MetadataRoute.Sitemap = (seriesList ?? []).map((s) => ({
    url: `${base}/series/${s.slug}`,
    lastModified: s.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const trackRoutes: MetadataRoute.Sitemap = (tracks ?? []).map((t) => ({
    url: `${base}/tracks/${t.slug}`,
    lastModified: t.updated_at,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const championshipRoutes: MetadataRoute.Sitemap = (championships ?? []).map((c) => ({
    url: `${base}/championships/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const challengeRoutes: MetadataRoute.Sitemap = (challenges ?? []).map((c) => ({
    url: `${base}/challenges/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...eventRoutes,
    ...disciplineRoutes,
    ...disciplineLocationRoutes,
    ...seriesRoutes,
    ...trackRoutes,
    ...championshipRoutes,
    ...challengeRoutes,
  ]
}
