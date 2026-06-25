import type { Metadata } from 'next'
import { Nav }           from '@/components/home/Nav'
import { HeroSection }   from '@/components/home/HeroSection'
import { EventsSection } from '@/components/home/EventsSection'
import { RaceGuides }    from '@/components/home/RaceGuides'
import { EmailCapture }  from '@/components/home/EmailCapture'
import { HomeFooter }    from '@/components/home/HomeFooter'

export const metadata: Metadata = {
  title: 'RaceRadar HQ — Every Major Fitness Event Across Asia Pacific',
  description:
    'Discover HYROX, Spartan, Ironman, Triathlon, obstacle races, trail runs and endurance events across Asia Pacific. One platform to find, plan and travel to every race.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <Nav />
      <main>
        <HeroSection />
        <EventsSection />
        <RaceGuides />
        <EmailCapture />
      </main>
      <HomeFooter />
    </div>
  )
}
