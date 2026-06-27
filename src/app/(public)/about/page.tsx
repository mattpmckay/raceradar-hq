import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'About RaceRadar HQ — Asia Pacific Fitness Events Platform' },
  description:
    'RaceRadar HQ is the home of fitness racing across Asia Pacific. We help athletes discover, plan and travel to every major HYROX, Spartan Race, Ironman, Marathon and Trail Running event in the region.',
}

export default function AboutPage() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">

        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          About RaceRadar HQ
        </h1>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted">
          <p>
            RaceRadar HQ is a fitness events discovery platform built for athletes across Asia
            Pacific. We aggregate, curate and publish information about every major HYROX, Spartan
            Race, IRONMAN, Marathon, Trail Running and Deka Fit event in the region — so you can
            find your next race, plan your travel and show up prepared.
          </p>
          <p>
            Asia Pacific is one of the fastest-growing markets for endurance and functional fitness
            racing. Events sell out in days. Race calendars are scattered across dozens of
            organiser websites. We built RaceRadar HQ to fix that — one platform covering every
            discipline, every country, every date.
          </p>
          <p>
            Each event page includes race format breakdowns, venue details, entry categories,
            weekend tips and FAQs — written for athletes who take their racing seriously.
          </p>
        </div>

        <div className="mt-10 border-t border-wire pt-8 space-y-3">
          <h2 className="font-heading text-lg font-semibold text-ink">What we cover</h2>
          <ul className="space-y-2 text-sm text-ink-muted">
            {[
              'HYROX — Asia Pacific World Series events',
              'Spartan Race — Sprint, Super, Beast, Ultra',
              'IRONMAN & IRONMAN 70.3 — full and half-distance triathlon',
              'Marathon — major city and destination marathons',
              'Trail Running — UTMB, local mountain and wilderness races',
              'Deka Fit — 10-station functional fitness competitions',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mint shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/events" className="btn-primary inline-flex">
            Browse Events <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-secondary inline-flex">
            Contact Us
          </Link>
        </div>

      </div>
    </div>
  )
}
