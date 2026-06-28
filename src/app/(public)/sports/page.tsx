import Link from 'next/link'
import { ArrowRight, Dumbbell, Shield, Waves, Mountain, Timer, Zap, ChevronRight, Users, Flame, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Sports — Fitness Races & Endurance Events | RaceRadar HQ' },
  description:
    'Explore every sport on RaceRadar HQ: HYROX, Spartan Race, Tough Mudder, IRONMAN, Marathon, Road Racing, Trail Running, Deka Fit and CrossFit. Find upcoming events across Asia Pacific.',
  openGraph: {
    title: 'Sports — Explore Fitness Disciplines | RaceRadar HQ',
    description:
      'Discover HYROX, Spartan, Tough Mudder, Ironman, Marathon, Road Racing, CrossFit and more across Asia Pacific.',
  },
}

// ─── Sport definitions ────────────────────────────────────────────────────────

type AccentColor = 'brand' | 'warning' | 'success' | 'default'

interface SportDef {
  discipline: string
  slug: string
  label: string
  tagline: string
  description: string
  format: string
  distance: string
  whoFor: string
  icon: React.ReactNode
  accent: AccentColor
}

const accentClasses: Record<AccentColor, { icon: string; badge: string; border: string; cta: string }> = {
  brand:   { icon: 'bg-mint/15 text-mint',             badge: 'bg-mint/10 text-mint border-mint/20',                  border: 'hover:border-mint/50',        cta: 'text-mint hover:text-mint-300' },
  warning: { icon: 'bg-yellow-500/15 text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', border: 'hover:border-yellow-500/50', cta: 'text-yellow-400 hover:text-yellow-300' },
  success: { icon: 'bg-green-500/15 text-green-400',   badge: 'bg-green-500/10 text-green-400 border-green-500/20',   border: 'hover:border-green-500/50',  cta: 'text-green-400 hover:text-green-300' },
  default: { icon: 'bg-panel text-ink-muted',          badge: 'bg-panel text-ink-muted border-wire',                  border: 'hover:border-wire-bright',    cta: 'text-ink-muted hover:text-ink' },
}

const SPORTS: SportDef[] = [
  {
    discipline: 'HYROX',
    slug: 'HYROX',
    label: 'HYROX',
    tagline: "The world's premier fitness race",
    description:
      'HYROX combines 8 × 1 km runs with 8 standardised workout stations — SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmer\'s Carry, Sandbag Lunges and Wall Balls. Because the format never changes, every finish time worldwide is directly comparable.',
    format: 'Run + Lift × 8',
    distance: '8 km total running',
    whoFor: 'All fitness levels',
    icon: <Dumbbell className="h-6 w-6" />,
    accent: 'brand',
  },
  {
    discipline: 'CrossFit',
    slug: 'CrossFit',
    label: 'CrossFit',
    tagline: 'Constantly varied functional fitness competition',
    description:
      'CrossFit events test athletes across weightlifting, gymnastics and metabolic conditioning in constantly varied workouts scored for time or load. The CrossFit Open — the world\'s largest online qualifier — runs annually and feeds into Sanctional events and the CrossFit Games. Local throwdowns and team competitions run throughout the year.',
    format: 'WODs + Barbell',
    distance: 'Varied',
    whoFor: 'CrossFit athletes',
    icon: <Flame className="h-6 w-6" />,
    accent: 'brand',
  },
  {
    discipline: 'Deka Fit',
    slug: 'Deka Fit',
    label: 'Deka Fit',
    tagline: '10 stations. 5 km. No excuses.',
    description:
      'Deka Fit extends the HYROX concept to 10 × 500 m runs paired with 10 workout stations — adding Box Jumps and Battle Ropes to the classic lineup. Held indoors with a fully standardised global format, all results feed directly into the Deka global ranking.',
    format: 'Run + Lift × 10',
    distance: '5 km total running',
    whoFor: 'Gym-based athletes, HYROX fans',
    icon: <Zap className="h-6 w-6" />,
    accent: 'warning',
  },
  {
    discipline: 'Spartan Race',
    slug: 'Spartan Race',
    label: 'Spartan Race',
    tagline: "The world's largest obstacle course race series",
    description:
      'Spartan Race sends athletes over mountains, through mud and past 20–60+ purpose-built obstacles across distances from 5 km Sprints to 50+ km Ultras. Fail an obstacle and you complete 30 burpees — no exceptions. Raw, elemental and deeply satisfying.',
    format: 'Run + Obstacles',
    distance: '5 km – 50+ km',
    whoFor: 'Beginner to ultra-endurance',
    icon: <Shield className="h-6 w-6" />,
    accent: 'warning',
  },
  {
    discipline: 'Tough Mudder',
    slug: 'Tough Mudder',
    label: 'Tough Mudder',
    tagline: 'The original team obstacle mud run',
    description:
      'Tough Mudder is a 15–20 km obstacle course series built around camaraderie and mental toughness — not competitive racing. Courses feature 20–25 obstacles including electric shocks, ice baths and fire pits. Unlike Spartan Race, there are no penalties, no mandatory race bibs, and the finish line is collective. Teams are the point.',
    format: 'Team + Obstacles',
    distance: '15 – 20 km',
    whoFor: 'Groups and first-timers',
    icon: <Users className="h-6 w-6" />,
    accent: 'warning',
  },
  {
    discipline: 'Ironman',
    slug: 'Ironman',
    label: 'IRONMAN',
    tagline: 'The pinnacle of long-course triathlon',
    description:
      'A continuous 3.86 km ocean swim, 180.25 km bike ride and 42.2 km run — completed in a single day within a 17-hour cut-off. Every IRONMAN event offers Kona and World Championship qualification slots. There is nothing else quite like crossing the finish line.',
    format: 'Swim → Bike → Run',
    distance: '226.3 km total',
    whoFor: 'Experienced triathletes',
    icon: <Waves className="h-6 w-6" />,
    accent: 'brand',
  },
  {
    discipline: 'Ironman 70.3',
    slug: 'Ironman 70.3',
    label: 'IRONMAN 70.3',
    tagline: 'Half the distance. All the challenge.',
    description:
      'Named after the total race distance in miles — 1.93 km swim, 90.12 km bike and a half marathon run — the 70.3 is the most popular long-course format for athletes building toward a full IRONMAN, and qualifies athletes for the annual 70.3 World Championship.',
    format: 'Swim → Bike → Half marathon',
    distance: '113.0 km total',
    whoFor: 'Intermediate to experienced',
    icon: <Waves className="h-6 w-6" />,
    accent: 'success',
  },
  {
    discipline: 'Marathon',
    slug: 'Marathon',
    label: 'Marathon',
    tagline: 'The original endurance benchmark',
    description:
      '42.195 km of sustained effort — the marathon has defined human endurance for over a century. Whether you\'re a first-timer targeting completion or a seasoned runner chasing a personal best or qualifying standard, the marathon remains the ultimate running goal.',
    format: 'Road running',
    distance: '42.195 km',
    whoFor: 'Runners of all levels',
    icon: <Timer className="h-6 w-6" />,
    accent: 'default',
  },
  {
    discipline: 'Road Racing',
    slug: 'Road Racing',
    label: 'Road Racing',
    tagline: 'City runs from 5 km to half marathon',
    description:
      'Road racing covers the full spectrum of timed running events on sealed roads below marathon distance — 5 km fun runs, 10 km classics, half marathons and iconic city races like City2Surf. The format is pure running: no obstacles, no bike legs, no transitions. The most accessible entry point into competitive fitness events.',
    format: 'Road running',
    distance: '5 km – 21.1 km',
    whoFor: 'All runners',
    icon: <Activity className="h-6 w-6" />,
    accent: 'default',
  },
  {
    discipline: 'Trail Running',
    slug: 'Trail Running',
    label: 'Trail Running',
    tagline: 'Run the roads less travelled',
    description:
      'Trail running takes you off bitumen and onto mountain paths, volcanic ridges, forest singletrack and coastal clifftops — terrain that demands technical footwork, hill strength and navigation awareness. Events range from 10 km social trail runs to 100+ km ultra-distance races.',
    format: 'Off-road running',
    distance: '10 km – 100+ km',
    whoFor: 'Road runners and mountain athletes',
    icon: <Mountain className="h-6 w-6" />,
    accent: 'success',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SportsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: raw } = await supabase
    .from('events')
    .select('discipline')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')

  const counts: Record<string, number> = {}
  for (const row of raw ?? []) {
    counts[row.discipline] = (counts[row.discipline] ?? 0) + 1
  }
  // Merge Ironman + Ironman 70.3 under the 'Ironman' filter key
  const ironmanTotal = (counts['Ironman'] ?? 0) + (counts['Ironman 70.3'] ?? 0)

  function eventCount(discipline: string): number {
    if (discipline === 'Ironman' || discipline === 'Ironman 70.3') return ironmanTotal
    return counts[discipline] ?? 0
  }

  function filterHref(discipline: string): string {
    if (discipline === 'Ironman' || discipline === 'Ironman 70.3') {
      return '/events?discipline=Ironman'
    }
    return `/events?discipline=${encodeURIComponent(discipline)}`
  }

  return (
    <div className="container-page py-10">

      {/* Header */}
      <div className="mb-12 max-w-2xl">
        <h1 className="page-title">Explore Sports</h1>
        <p className="mt-3 text-ink-muted text-lg leading-relaxed">
          From indoor fitness races to mountain ultras, discover every discipline on RaceRadar HQ
          and find events that match your training goals.
        </p>
      </div>

      {/* Sports grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPORTS.map((sport) => {
          const a = accentClasses[sport.accent]
          const count = eventCount(sport.discipline)
          const href = filterHref(sport.discipline)

          return (
            <div
              key={sport.discipline}
              className={`card flex flex-col gap-5 transition-colors ${a.border}`}
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-xl p-3 ${a.icon}`}>
                  {sport.icon}
                </div>
                {count > 0 && (
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${a.badge}`}>
                    {count} upcoming
                  </span>
                )}
              </div>

              {/* Name + tagline */}
              <div>
                <h2 className="text-lg font-bold text-ink">{sport.label}</h2>
                <p className={`text-sm font-medium mt-0.5 ${a.cta}`}>{sport.tagline}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-ink-muted leading-relaxed flex-1">
                {sport.description}
              </p>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-panel p-3 text-center text-xs">
                <div>
                  <div className="text-ink-muted mb-0.5">Format</div>
                  <div className="text-ink font-medium leading-tight">{sport.format}</div>
                </div>
                <div className="border-x border-wire">
                  <div className="text-ink-muted mb-0.5">Distance</div>
                  <div className="text-ink font-medium leading-tight">{sport.distance}</div>
                </div>
                <div>
                  <div className="text-ink-muted mb-0.5">Who for</div>
                  <div className="text-ink font-medium leading-tight">{sport.whoFor}</div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${a.cta}`}
              >
                View {sport.label} events
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl border border-wire bg-panel p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Not sure where to start?</h2>
        <p className="mt-2 text-ink-muted max-w-md mx-auto">
          Browse all upcoming events across every discipline, filtered by date, location or sport.
        </p>
        <Link href="/events" className="btn-primary mt-5 inline-flex">
          Browse all events
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  )
}
