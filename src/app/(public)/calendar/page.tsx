import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CalendarSignup, sportsToCategories } from '@/components/home/CalendarSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Free 2026 APAC Fitness Events Calendar | RaceRadar HQ' },
  description:
    'Get the free 2026 Asia Pacific fitness events calendar — every major HYROX, Spartan Race, Ironman, Marathon and Trail Running event, curated and delivered to your inbox.',
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let preferredCategories: string[] = []
  let isPersonalised = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_sports')
      .eq('id', user.id)
      .single()

    if (profile?.preferred_sports && profile.preferred_sports.length > 0) {
      preferredCategories = sportsToCategories(profile.preferred_sports)
      isPersonalised = true
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-wire/60 bg-gradient-to-b from-panel/40 to-transparent">
        <div className="container-page pt-12 pb-10 lg:pt-16 lg:pb-12 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-xs font-semibold text-mint">
            Free Resource
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            2026 APAC Fitness Events Calendar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-2xl mx-auto">
            Every major HYROX, Spartan Race, Ironman, Marathon, Trail Running and Deka Fit
            event across Asia Pacific — curated, dated, and delivered to your inbox.
          </p>
        </div>
      </div>

      {/* Calendar selector */}
      <section id="calendar-signup" className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-lg">
          <CalendarSignup
            preferredCategories={preferredCategories}
            isPersonalised={isPersonalised}
          />
        </div>
      </section>

      {/* Browse now CTA */}
      <div className="container-page pb-12 text-center">
        <p className="text-ink-muted text-sm mb-4">
          Can&apos;t wait? Browse all confirmed upcoming events right now.
        </p>
        <Link href="/events" className="btn-primary inline-flex">
          Browse Events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
