import { Suspense }       from 'react'
import type { Metadata }  from 'next'
import { createClient }          from '@/lib/supabase/server'
import { Header }                from '@/components/layout/Header'
import { HeroSection }           from '@/components/home/HeroSection'
import { EventsSectionServer }   from '@/components/home/EventsSectionServer'
import { EventsSectionSkeleton } from '@/components/home/EventsSectionSkeleton'
import { MemberValueSection }    from '@/components/home/MemberValueSection'
import { BrowseByType }          from '@/components/home/BrowseByType'
import { EmailCapture }          from '@/components/home/EmailCapture'
import { HomeFooter }            from '@/components/home/HomeFooter'
import type { HeaderUser }       from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'RaceRadar HQ — Every Major Fitness Event Across Asia Pacific',
  description:
    'Discover HYROX, Spartan, Ironman, Triathlon, trail running and endurance events across Asia-Pacific. Browse free. Join free. Never miss a race.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let headerUser: HeaderUser | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, full_name, profile_photo_url, avatar_url')
      .eq('id', user.id)
      .single()

    const first = profile?.first_name ?? (profile?.full_name?.trim().split(' ')[0] ?? '')
    const last  = profile?.last_name ?? ''

    headerUser = {
      displayName: [first, last].filter(Boolean).join(' ') || (user.email ?? ''),
      initials:    [first[0], last[0]].filter(Boolean).join('').toUpperCase() || (user.email?.[0]?.toUpperCase() ?? '?'),
      photoUrl:    profile?.profile_photo_url ?? profile?.avatar_url ?? null,
      email:       user.email ?? '',
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <Header user={headerUser} />
      <main id="main-content">
        <HeroSection />
        <Suspense fallback={<EventsSectionSkeleton />}>
          <EventsSectionServer featuredOnly />
        </Suspense>
        <Suspense fallback={null}>
          <BrowseByType />
        </Suspense>
        <MemberValueSection isLoggedIn={!!user} />
        <EmailCapture />
      </main>
      <HomeFooter />
    </div>
  )
}
