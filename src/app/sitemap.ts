import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const supabase = await createClient()

  const [{ data: events }, { data: tracks }, { data: championships }] = await Promise.all([
    supabase.from('events').select('slug, updated_at').eq('is_published', true),
    supabase.from('tracks').select('slug, updated_at').eq('is_published', true),
    supabase.from('championships').select('slug, updated_at').eq('is_published', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                        changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/events`,            changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/sports`,            changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/locations`,         changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/guides`,            changeFrequency: 'weekly',  priority: 0.8 },
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

  return [...staticRoutes, ...eventRoutes, ...trackRoutes, ...championshipRoutes]
}
