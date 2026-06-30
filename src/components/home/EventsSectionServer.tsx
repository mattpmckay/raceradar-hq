import { createClient } from '@/lib/supabase/server'
import { EventsSection } from './EventsSection'

export async function EventsSectionServer({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data, error }, { data: { user } }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, slug, discipline, start_date, city, country, is_featured')
      .eq('is_published', true)
      .gte('start_date', today)
      .lt('start_date', '2099-01-01')
      .order('start_date', { ascending: true })
      .limit(300),
    supabase.auth.getUser(),
  ])

  if (error) {
    console.error('[EventsSectionServer] Supabase error:', error.code, error.message, error.details)
  }

  let savedIds = new Set<string>()
  if (user) {
    const { data: favs } = await supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user.id)
      .eq('entity_type', 'event')
    savedIds = new Set((favs ?? []).map((f) => f.entity_id))
  }

  // "Happening Soon" — events starting within 30 days, not in featured list
  const in30 = new Date()
  in30.setDate(in30.getDate() + 30)
  const happeningSoon = featuredOnly
    ? (data ?? []).filter((e) => !e.is_featured && new Date(e.start_date) <= in30).slice(0, 3)
    : []

  return (
    <EventsSection
      events={data ?? []}
      error={error?.message}
      savedIds={savedIds}
      isLoggedIn={!!user}
      featuredOnly={featuredOnly}
      totalCount={data?.length ?? 0}
      happeningSoon={happeningSoon}
    />
  )
}
