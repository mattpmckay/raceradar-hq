import Link from 'next/link'

interface Guide {
  id: string
  event: string
  destination: string
  description: string
  gradient: string
  accentColor: string
  tags: string[]
}

const GUIDES: Guide[] = [
  {
    id: 'sydney-hyrox',
    event: 'HYROX World Series',
    destination: 'Sydney, Australia',
    description:
      'Race-day logistics, accommodation near Sydney Olympic Park, and the best spots to recover with harbour views.',
    gradient: 'linear-gradient(145deg, #0f2027 0%, #1a3a4a 50%, #0d2137 100%)',
    accentColor: '#00D9A6',
    tags: ['Accommodation', 'Travel', 'Nutrition'],
  },
  {
    id: 'singapore-ironman',
    event: 'Ironman 70.3',
    destination: 'Singapore',
    description:
      'Navigate Marina Bay, acclimatise to the heat, and discover hawker centres that will fuel your race-week carb load.',
    gradient: 'linear-gradient(145deg, #0a0e1a 0%, #0f2040 50%, #1a1060 100%)',
    accentColor: '#FF4D00',
    tags: ['Heat Training', 'Race Course', 'Recovery'],
  },
  {
    id: 'hokkaido-spartan',
    event: 'Spartan Ultra',
    destination: 'Hokkaido, Japan',
    description:
      'Mountain logistics, ryokan stays, and the best post-race onsens in Hokkaido\'s spectacular wilderness terrain.',
    gradient: 'linear-gradient(145deg, #1a0533 0%, #2d1060 50%, #0d1525 100%)',
    accentColor: '#A78BFA',
    tags: ['Mountains', 'Onsen', 'Culture'],
  },
]

export function RaceGuides() {
  return (
    <section className="py-24">
      <div className="container-page">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-fire">
              Editorial
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Plan Your Race Weekend
            </h2>
            <p className="mt-3 max-w-lg text-base text-ink-muted">
              Deep-dive guides covering accommodation, travel, nutrition and local tips — written for serious competitors.
            </p>
          </div>
          <Link
            href="/guides"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            All guides
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-wire bg-panel transition-all duration-300 hover:border-wire-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Image placeholder */}
      <div
        className="relative h-48 overflow-hidden"
        style={{ background: guide.gradient }}
      >
        {/* Destination label */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `${guide.accentColor}20`,
              color: guide.accentColor,
              border: `1px solid ${guide.accentColor}40`,
            }}
          >
            {guide.destination}
          </span>
        </div>

        {/* Subtle grid overlay on image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {guide.event}
          </p>
          <h3 className="font-heading text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-mint">
            Race Weekend in {guide.destination.split(',')[0]}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-ink-muted flex-1">
          {guide.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-wire px-2.5 py-1 text-xs font-medium text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read guide CTA */}
        <div className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: guide.accentColor }}
        >
          Read Guide
          <ChevronRightIcon
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
