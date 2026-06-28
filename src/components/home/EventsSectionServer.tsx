import { createClient } from '@/lib/supabase/server'
import { EventsSection } from './EventsSection'

export async function EventsSectionServer() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, discipline, start_date, city, country, is_featured')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')
    .order('start_date', { ascending: true })
    .limit(300)

  if (error) {
    console.error('[EventsSectionServer] Supabase error:', error.code, error.message, error.details)
  }

  return (
    <EventsSection
      events={data ?? []}
      error={error?.message}
    />
  )
}
