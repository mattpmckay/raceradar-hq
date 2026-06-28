import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Race Day Checklist: What to Pack | RaceRadar HQ' },
  description:
    'Everything to pack and prepare the night before and morning of your race — for HYROX, Spartan, Ironman, marathon and trail running events.',
  openGraph: {
    title: 'Race Day Checklist: What to Pack | RaceRadar HQ',
    description:
      'A complete race day checklist covering kit, nutrition, recovery and race morning logistics for every fitness discipline.',
  },
}

export default function RaceDayChecklistPage() {
  return (
    <div className="container-page py-10">

      {/* Back */}
      <Link href="/guides" className="btn-ghost mb-6 inline-flex px-0 text-ink-muted">
        <ArrowLeft className="h-4 w-4" /> Back to Guides
      </Link>

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Race Day</span>
          <span className="text-ink-muted">·</span>
          <span className="text-xs text-ink-muted">4 min read</span>
        </div>
        <h1 className="page-title">Race Day Checklist: What to Pack</h1>
        <p className="mt-4 text-ink-muted text-lg leading-relaxed">
          The night before a race is not the time to figure out what to bring. Use this checklist to pack
          your bag, sort your nutrition and arrive at the venue calm and ready.
        </p>
      </div>

      <div className="max-w-2xl space-y-10">

        {/* The Night Before */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            The Night Before
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-4">
            Do everything below the night before — not on race morning. Morning logistics are stressful enough.
          </p>
          <ul className="space-y-3">
            {[
              'Lay out your complete race kit: bib, timing chip, shoes, socks, and race outfit. Check for any dress or equipment requirements specific to your event.',
              'Prepare and portion your race-day nutrition: pre-race breakfast, any mid-race fuel (gels, chews, bars), and a post-race snack.',
              'Pack your bag using the checklist below — leave it by the front door.',
              'Check the venue address and confirm your route. If you\'ve never driven there, look it up now. Race-day traffic and parking are different from a normal day.',
              'Set two alarms. Give yourself more time than you think you need.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                <CheckCircle className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* What to Pack */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            What to Pack
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">

            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-ink">Core Race Kit</h3>
              <ul className="space-y-2">
                {[
                  'Race bib + safety pins (4 pins)',
                  'Timing chip (if provided separately)',
                  'Race shoes, already broken in',
                  'Race-specific socks (no cotton)',
                  'Race outfit — check event dress rules',
                  'Sunscreen, hat or visor for outdoor events',
                  'Gloves for cold-weather events',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-ink-muted">
                    <span className="h-1 w-1 rounded-full bg-mint/60 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-ink">Nutrition & Hydration</h3>
              <ul className="space-y-2">
                {[
                  'Water bottle (fill at home)',
                  'Pre-race snack: banana or energy bar',
                  'Mid-race fuel for events over 90 minutes',
                  'Energy gels — 1 per 45–60 min of racing',
                  'Electrolyte tabs or sachets',
                  'Post-race snack for the finish line',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-ink-muted">
                    <span className="h-1 w-1 rounded-full bg-mint/60 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-ink">Recovery & Comfort</h3>
              <ul className="space-y-2">
                {[
                  'Change of clothes for post-race',
                  'Dry towel',
                  'Flip-flops or recovery slides',
                  'Blister kit: tape, Vaseline',
                  'Anti-chafe balm (BodyGlide or similar)',
                  'Warm layer if racing in cold weather',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-ink-muted">
                    <span className="h-1 w-1 rounded-full bg-mint/60 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card space-y-3">
              <h3 className="text-sm font-semibold text-ink">Admin & Extras</h3>
              <ul className="space-y-2">
                {[
                  'Photo ID (required at most events)',
                  'Confirmation email or QR code',
                  'Phone — fully charged',
                  'Cash for food stalls and parking',
                  'Small padlock for bag drop (some venues)',
                  'Headphones if permitted in your event',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-ink-muted">
                    <span className="h-1 w-1 rounded-full bg-mint/60 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* Race Morning */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            Race Morning
          </h2>
          <ul className="space-y-3">
            {[
              { time: '3 hours before', note: 'Wake up. Eat a familiar breakfast — nothing new today. Oats, toast and eggs, or whatever you\'ve trained on.' },
              { time: '2 hours before', note: 'Leave home. Account for traffic, parking queues and anything unexpected. Early is always better.' },
              { time: '60–90 min before', note: 'Arrive at the venue. Find bag drop, toilets, and the warm-up area before you do anything else.' },
              { time: '20–30 min before', note: 'Start your warm-up. For high-intensity events like HYROX or CrossFit, a thorough warm-up is especially important. For marathons, a short jog and dynamic stretches are enough.' },
              { time: '10 min before', note: 'Get into your starting wave or corral. Take a breath. You\'ve done the preparation.' },
            ].map(({ time, note }) => (
              <li key={time} className="rounded-xl border border-wire bg-panel p-4 text-sm">
                <div className="font-semibold text-ink mb-1">{time}</div>
                <div className="text-ink-muted">{note}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* After the Race */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            After the Race
          </h2>
          <ul className="space-y-3">
            {[
              'Keep moving for 10–15 minutes after finishing — walk, do not sit down immediately. This helps flush lactate from your muscles.',
              'Refuel within 30 minutes: aim for a combination of protein and carbohydrates. Chocolate milk, a recovery shake, or a full meal all work.',
              'Change into dry clothes as soon as possible, especially in cold weather.',
              'Save your official results and photos — most events post results within an hour. Screenshot your chip time before the link expires.',
              'Rest for at least 48 hours after events over 2 hours. For full marathons and Ironman, plan a full recovery week with no hard training.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                <CheckCircle className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-wire bg-panel p-8 text-center">
          <h2 className="text-lg font-bold text-ink">Ready to find your next race?</h2>
          <p className="mt-2 text-ink-muted text-sm max-w-sm mx-auto">
            Browse upcoming HYROX, Spartan, Ironman, Marathon and CrossFit events across Asia Pacific.
          </p>
          <Link href="/events" className="btn-primary mt-5 inline-flex">
            Browse events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
