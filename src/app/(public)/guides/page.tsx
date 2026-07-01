import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronRight, Clock, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Race Guides — Training, Tips & Event Guides | RaceRadar HQ' },
  description:
    'Free race guides for HYROX, Spartan Race, Ironman, Marathon and trail running. Event-specific race guides, training plans, discipline explainers and race day tips across Asia Pacific.',
  openGraph: {
    title: 'Race Guides | RaceRadar HQ',
    description:
      'Event race guides, discipline explainers, training tips and race day checklists for fitness athletes across Asia Pacific.',
  },
}

// ─── Static guide definitions ─────────────────────────────────────────────────

type GuideCategory = 'getting-started' | 'discipline' | 'training' | 'race-day'

interface EditorialGuide {
  title: string
  description: string
  category: GuideCategory
  discipline?: string
  readTime: string
  href: string | null
}

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  'getting-started': 'Getting Started',
  'discipline':      'Discipline Guide',
  'training':        'Training',
  'race-day':        'Race Day',
}

const EDITORIAL_SECTIONS: { heading: string; category: GuideCategory; guides: EditorialGuide[] }[] = [
  {
    heading: 'Getting Started',
    category: 'getting-started',
    guides: [
      {
        title: 'How to Choose Your First Fitness Race',
        description:
          'Not sure whether to sign up for a HYROX, Spartan Race or marathon? This guide walks through the key differences, training demands and what each discipline feels like for a first-timer — so you can match the race to your goals.',
        category: 'getting-started',
        readTime: '6 min read',
        href: '/guides/how-to-choose-your-first-fitness-race',
      },
      {
        title: 'What to Expect at Your First HYROX',
        description:
          'A step-by-step walkthrough of race weekend from registration to finish line — waves, bag drop, warm-up, each station, how the running laps feel, and what happens after you cross the line.',
        category: 'getting-started',
        discipline: 'HYROX',
        readTime: '8 min read',
        href: null,
      },
      {
        title: 'What to Expect at Your First Spartan Race',
        description:
          'From bib pick-up to the finish-line medal and burpee penalty rules — a complete first-timer walkthrough for anyone stepping onto an obstacle course for the first time.',
        category: 'getting-started',
        discipline: 'Spartan Race',
        readTime: '7 min read',
        href: null,
      },
      {
        title: 'Is an Ironman Right for You?',
        description:
          'A realistic assessment of full IRONMAN and 70.3 demands — training volume, cost, time commitment and injury risk — to help you decide if long-course triathlon is the right next step.',
        category: 'getting-started',
        discipline: 'Ironman',
        readTime: '9 min read',
        href: null,
      },
    ],
  },
  {
    heading: 'Discipline Guides',
    category: 'discipline',
    guides: [
      {
        title: 'The Complete HYROX Guide',
        description:
          'Everything about HYROX in one place: the origin story, why it exploded globally, the full race format, every workout station explained, categories, global ranking system and how to approach your first race.',
        category: 'discipline',
        discipline: 'HYROX',
        readTime: '12 min read',
        href: null,
      },
      {
        title: 'Spartan Race: Sprint, Super, Beast & Ultra Explained',
        description:
          'A deep dive into every Spartan format — distances, obstacle counts, mandatory gear, Trifecta challenge, burpee penalty rules and how to approach the jump from Sprint to Beast.',
        category: 'discipline',
        discipline: 'Spartan Race',
        readTime: '10 min read',
        href: null,
      },
      {
        title: 'Ironman vs. Ironman 70.3: Which Should You Enter?',
        description:
          'Side-by-side comparison of distances, cut-off times, training demands, qualification pathways and cost — so you can make the right call for where you are in your triathlon journey.',
        category: 'discipline',
        discipline: 'Ironman',
        readTime: '8 min read',
        href: null,
      },
      {
        title: 'Trail Running 101: Getting Off the Road',
        description:
          'What makes trail running different from road racing — terrain, pacing, kit, mandatory gear, nutrition strategy and how to find your first trail race without ending up in an ultra you weren\'t ready for.',
        category: 'discipline',
        discipline: 'Trail Running',
        readTime: '9 min read',
        href: null,
      },
    ],
  },
  {
    heading: 'Training & Preparation',
    category: 'training',
    guides: [
      {
        title: '12-Week HYROX Training Plan',
        description:
          'A structured 12-week program for HYROX Open athletes, covering running volume, station-specific strength work, and gym-to-run transition training — with built-in rest and deload weeks.',
        category: 'training',
        discipline: 'HYROX',
        readTime: '15 min read',
        href: null,
      },
      {
        title: 'Spartan Race Training: The 8 Movements to Master',
        description:
          'Rig work, bucket carry, spear throw, rope climb, barbed wire crawl — the essential movements that separate finishers from DNFs and how to programme them into your weekly training.',
        category: 'training',
        discipline: 'Spartan Race',
        readTime: '11 min read',
        href: null,
      },
      {
        title: 'Marathon Training for Complete Beginners',
        description:
          'From couch to 42.195 km — a 20-week programme covering progressive long run build, easy pace discipline, cross-training, injury prevention and taper strategy.',
        category: 'training',
        discipline: 'Marathon',
        readTime: '13 min read',
        href: null,
      },
      {
        title: 'Open Water Swimming for Triathletes',
        description:
          'Pool fitness doesn\'t fully prepare you for open water. This guide covers sighting, wetsuit swimming, mass starts, panic management and how to structure your open water sessions before race day.',
        category: 'training',
        discipline: 'Ironman',
        readTime: '10 min read',
        href: null,
      },
    ],
  },
  {
    heading: 'Race Day',
    category: 'race-day',
    guides: [
      {
        title: 'Race Day Checklist: What to Pack',
        description:
          'A printable checklist covering everything from bib and timing chip to nutrition, recovery kit and spectator arrangements — for HYROX, Spartan, triathlon and road races.',
        category: 'race-day',
        readTime: '4 min read',
        href: '/guides/race-day-checklist',
      },
      {
        title: 'Race Nutrition Guide',
        description:
          'How to fuel before, during and after events of different lengths — from a 60-minute HYROX to a 12-hour Ironman. Simple protocols that don\'t require a sports science degree to follow.',
        category: 'race-day',
        readTime: '8 min read',
        href: null,
      },
      {
        title: 'How to Use Run-Walk Intervals in a Race',
        description:
          'The Galloway method and other run-walk strategies that often produce faster finish times than continuous running — especially for first-time marathoners and long-distance Spartan athletes.',
        category: 'race-day',
        readTime: '5 min read',
        href: null,
      },
      {
        title: 'Recovery After Your First Race',
        description:
          'What to do in the 48 hours, first week and first month after a major event — covering sleep, nutrition, movement, soreness management and when to start thinking about your next race.',
        category: 'race-day',
        readTime: '6 min read',
        href: null,
      },
    ],
  },
]

const DISCIPLINE_BADGE: Record<string, 'brand' | 'warning' | 'success' | 'default'> = {
  'HYROX':         'brand',
  'Spartan Race':  'warning',
  'Ironman':       'brand',
  'Ironman 70.3':  'brand',
  'Marathon':      'success',
  'Trail Running': 'success',
  'Deka Fit':      'warning',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractVenue(description: string | null): string | null {
  if (!description) return null
  const m = description.match(/^Venue:\s*(.+)/i)
  return m ? m[1].trim() : null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GuidesPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: featuredEvents } = await supabase
    .from('events')
    .select('id, title, slug, discipline, city, country, start_date, end_date, description')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')
    .order('start_date', { ascending: true })
    .limit(12)

  const events = featuredEvents ?? []

  return (
    <div className="container-page py-10">

      {/* Header */}
      <div className="mb-12 max-w-2xl">
        <h1 className="page-title">Race Guides</h1>
        <p className="mt-3 text-ink-muted text-lg leading-relaxed">
          Everything you need to train, prepare and race — event-specific guides, discipline
          explainers, training plans and race day tips from the RaceRadar team.
        </p>
      </div>

      {/* ── Event Race Guides ─────────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
              Event Race Guides
            </h2>
            <Link
              href="/events"
              className="text-sm text-mint hover:text-mint-300 transition-colors flex items-center gap-1"
            >
              All events <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, idx) => {
              const venue = extractVenue(event.description)
              const badgeVariant = DISCIPLINE_BADGE[event.discipline] ?? 'default'
              const isFeaturedHero = idx === 0

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className={`card group flex flex-col gap-4 hover:border-mint/40 transition-colors ${
                    isFeaturedHero ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  {/* Top: discipline + category */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={badgeVariant}>{event.discipline}</Badge>
                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                      <BookOpen className="h-3 w-3" /> Race Guide
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-ink group-hover:text-mint transition-colors leading-snug">
                    {event.title}
                  </h3>

                  {/* Location + date */}
                  <div className="text-xs text-ink-muted space-y-0.5">
                    {venue && <div>{venue}</div>}
                    <div>
                      {[event.city, event.country].filter(Boolean).join(', ')}
                      {' · '}
                      {formatDate(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date
                        ? ` – ${formatDate(event.end_date)}`
                        : ''}
                    </div>
                  </div>

                  {/* What's inside */}
                  <div className="mt-auto">
                    <p className="text-xs text-ink-muted mb-2 font-medium">Guide covers</p>
                    <ul className="space-y-1">
                      {[
                        'Race format & workout stations',
                        'Entry categories & fees',
                        'Venue, transport & tips',
                        'FAQs for first-timers',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <span className="h-1 w-1 rounded-full bg-mint/60 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-mint group-hover:text-mint-300 transition-colors">
                    Read guide <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Editorial sections (live guides only) ────────────────────── */}
      {(() => {
        const liveSections = EDITORIAL_SECTIONS
          .map((s) => ({ ...s, guides: s.guides.filter((g) => g.href !== null) }))
          .filter((s) => s.guides.length > 0)

        const totalGuides = EDITORIAL_SECTIONS.reduce((n, s) => n + s.guides.length, 0)
        const liveCount   = liveSections.reduce((n, s) => n + s.guides.length, 0)
        const comingCount = totalGuides - liveCount

        return (
          <>
            <div className="space-y-14">
              {liveSections.map((section) => (
                <section key={section.category}>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-muted mb-6">
                    {section.heading}
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {section.guides.map((guide) => (
                      <EditorialGuideCard key={guide.title} guide={guide} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {comingCount > 0 && (
              <p className="mt-8 text-center text-sm text-ink-muted">
                {comingCount} more guides in progress — new guides published regularly.
              </p>
            )}
          </>
        )
      })()}

      {/* ── Suggest a guide CTA ───────────────────────────────────────── */}
      <div className="mt-16 rounded-2xl border border-wire bg-panel p-8 text-center">
        <BookOpen className="h-8 w-8 text-mint mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ink">Want a guide on a specific topic?</h2>
        <p className="mt-2 text-ink-muted max-w-md mx-auto text-sm">
          New guides are published regularly. Browse upcoming events or explore sports to find
          the information you need right now.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/sports" className="btn-primary inline-flex">
            Explore event types
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/events" className="btn-secondary inline-flex">
            Browse events
          </Link>
        </div>
      </div>

    </div>
  )
}

// ─── Editorial guide card ─────────────────────────────────────────────────────

function EditorialGuideCard({ guide }: { guide: EditorialGuide }) {
  const isLive = guide.href !== null
  const badgeVariant = guide.discipline
    ? (DISCIPLINE_BADGE[guide.discipline] ?? 'default')
    : 'default'

  return (
    <div
      className={`card flex flex-col gap-3 ${
        isLive
          ? 'hover:border-mint/40 transition-colors'
          : 'opacity-60'
      }`}
    >
      {/* Category + discipline */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
          {CATEGORY_LABELS[guide.category]}
        </span>
        {guide.discipline && (
          <Badge variant={badgeVariant} className="text-xs">
            {guide.discipline}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-semibold leading-snug ${isLive ? 'text-ink' : 'text-ink-muted'}`}>
        {guide.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-ink-muted leading-relaxed flex-1">
        {guide.description}
      </p>

      {/* Footer: read time + CTA */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="flex items-center gap-1 text-xs text-ink-muted">
          <Clock className="h-3 w-3" />
          {guide.readTime}
        </span>
        {isLive ? (
          <Link
            href={guide.href!}
            className="flex items-center gap-1 text-xs font-medium text-mint hover:text-mint-300 transition-colors"
          >
            Read <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <Lock className="h-3 w-3" /> Coming soon
          </span>
        )}
      </div>
    </div>
  )
}
