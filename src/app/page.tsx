import { Suspense }       from 'react'
import type { Metadata }  from 'next'
import { Header }                from '@/components/layout/Header'
import { HeroSection }           from '@/components/home/HeroSection'
import { EventsSectionServer }   from '@/components/home/EventsSectionServer'
import { EventsSectionSkeleton } from '@/components/home/EventsSectionSkeleton'
import { RaceGuides }            from '@/components/home/RaceGuides'
import { EmailCapture }          from '@/components/home/EmailCapture'
import { HomeFooter }            from '@/components/home/HomeFooter'

export const metadata: Metadata = {
  title: 'RaceRadar HQ — Every Major Fitness Event Across Asia Pacific',
  description:
    'Discover HYROX, Spartan, Ironman, Triathlon, obstacle races, trail runs and endurance events across Asia Pacific. One platform to find, plan and travel to every race.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <Header />
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={<EventsSectionSkeleton />}>
          <EventsSectionServer />
        </Suspense>
        <RaceGuides />
        <EmailCapture />
      </main>
      <HomeFooter />
    </div>
  )
}
