import type { Metadata } from 'next'
import { Nav }           from '@/components/home/Nav'
import { HeroSection }   from '@/components/home/HeroSection'
import { EventsSection } from '@/components/home/EventsSection'
import { RaceGuides }    from '@/components/home/RaceGuides'
import { EmailCapture }  from '@/components/home/EmailCapture'
import { HomeFooter }    from '@/components/home/HomeFooter'
import { createClient }  from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'RaceRadar HQ — Every Major Fitness Event Across Asia Pacific',
  description:
    'Discover HYROX, Spartan, Ironman, Triathlon, obstacle races, trail runs and endurance events across Asia Pacific. One platform to find, plan and travel to every race.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const today    = new Date().toISOString().split('T')[0]

  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, discipline, start_date, city, country')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')
    .order('start_date', { ascending: true })
    .limit(6)

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <Nav />
      <main>
        <HeroSection />
        <EventsSection initialEvents={events ?? []} />
        <RaceGuides />
        <EmailCapture />
      </main>
      <HomeFooter />
    </div>
  )
}
