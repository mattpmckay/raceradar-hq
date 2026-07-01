import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, MapPin, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import type { Tables } from '@/types/supabase'
import type { Metadata } from 'next'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

type Discipline = Tables<'disciplines'>
type EventRow   = Tables<'events'>

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('disciplines')
      .select('slug')
      .eq('is_active', true)
    return (data ?? []).map((d) => ({ slug: d.slug }))
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createClient()
  const { data }  = await supabase
    .from('disciplines')
    .select('name, short_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Discipline not found' }

  const title = `${data.name} Events Australia 2026 | RaceRadar HQ`
  const description =
    data.short_description ??
    `Find upcoming ${data.name} events in Australia — race dates, entry fees, categories and race guides.`

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
  }
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function buildSchema(discipline: Discipline, events: EventRow[]) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const faqs = discipline.faqs as Array<{ question: string; answer: string }>

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${discipline.name} Events Australia`,
      description: discipline.short_description,
      url: `${base}/discipline/${discipline.slug}`,
      numberOfItems: events.length,
      itemListElement: events.slice(0, 10).map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SportsEvent',
          name: e.title,
          url: `${base}/events/${e.slug}`,
          startDate: e.start_date,
          location: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: e.city,
              addressCountry: 'AU',
            },
          },
        },
      })),
    },
  ]

  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return schemas
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DisciplinePage({ params }: PageProps) {
  const { slug }  = await params
  const supabase  = await createClient()
  const today     = new Date().toISOString().split('T')[0]

  const [{ data: discipline }, { data: { user } }] = await Promise.all([
    supabase
      .from('disciplines')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!discipline) notFound()

  const disciplineValues = (discipline.event_discipline_values ?? []) as string[]

  const [{ data: events }, relatedResult] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .gte('start_date', today)
      .in('discipline', disciplineValues.length > 0 ? disciplineValues : ['__none__'])
      .order('is_featured', { ascending: false })
      .order('start_date', { ascending: true })
      .limit(24),
    discipline.related_discipline_slugs?.length > 0
      ? supabase
          .from('disciplines')
          .select('slug, name, short_description, color')
          .in('slug', discipline.related_discipline_slugs as string[])
          .eq('is_active', true)
      : Promise.resolve({ data: [] as Pick<Discipline, 'slug' | 'name' | 'short_description' | 'color'>[] }),
  ])

  const upcomingEvents = events ?? []
  const relatedDisciplines = relatedResult.data ?? []

  const savedIds = new Set<string>()
  if (user) {
    const { data: favs } = await supabase
      .from('favourites')
      .select('entity_id')
      .eq('user_id', user.id)
      .eq('entity_type', 'event')
    for (const f of favs ?? []) savedIds.add(f.entity_id)
  }

  const uniqueCities = [
    ...new Map(
      upcomingEvents
        .filter((e) => e.city)
        .map((e) => [e.city, { city: e.city!, region: e.region, country: e.country }]),
    ).values(),
  ]

  const faqs = discipline.faqs as Array<{ question: string; answer: string }>
  const schemas = buildSchema(discipline, upcomingEvents)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <DisciplineHero discipline={discipline} eventCount={upcomingEvents.length} />

      <div className="container-page py-10 space-y-14">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted -mt-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/discipline" className="hover:text-ink transition-colors">Disciplines</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">{discipline.name}</span>
        </nav>

        {/* ── Upcoming Events ─────────────────────────────────────────── */}
        <UpcomingEventsSection
          discipline={discipline}
          events={upcomingEvents}
          savedIds={savedIds}
        />

        {/* ── Overview ───────────────────────────────────────────────── */}
        {(discipline.overview_content ?? discipline.short_description) && (
          <OverviewSection discipline={discipline} />
        )}

        {/* ── Registration Guide ─────────────────────────────────────── */}
        <RegistrationGuideSection discipline={discipline} events={upcomingEvents} />

        {/* ── First Timer Guide ──────────────────────────────────────── */}
        {discipline.first_timer_guide && (
          <FirstTimerSection discipline={discipline} />
        )}

        {/* ── FAQs ───────────────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <FaqSection discipline={discipline} faqs={faqs} />
        )}

        {/* ── Related Locations ──────────────────────────────────────── */}
        {uniqueCities.length > 1 && (
          <RelatedLocationsSection discipline={discipline} cities={uniqueCities} />
        )}

        {/* ── Similar Disciplines ────────────────────────────────────── */}
        {relatedDisciplines.length > 0 && (
          <SimilarDisciplinesSection disciplines={relatedDisciplines} />
        )}
      </div>
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function DisciplineHero({
  discipline,
  eventCount,
}: {
  discipline: Discipline
  eventCount: number
}) {
  return (
    <div
      className="border-b border-wire"
      style={{ background: `linear-gradient(135deg, ${discipline.color}08 0%, transparent 60%)` }}
    >
      <div className="container-page py-12 lg:py-16">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: discipline.color ?? '#00D9A6' }}
          />
          <span className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            Discipline Guide
          </span>
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {discipline.name}
        </h1>
        {discipline.short_description && (
          <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
            {discipline.short_description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#events" className="btn-primary">
            <Calendar className="h-4 w-4" />
            {eventCount > 0
              ? `${eventCount} Upcoming Event${eventCount === 1 ? '' : 's'}`
              : 'View Events'}
          </Link>
          <Link href="/events" className="btn-secondary">
            Browse All Events
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Upcoming Events ──────────────────────────────────────────────────────────

function UpcomingEventsSection({
  discipline,
  events,
  savedIds,
}: {
  discipline: Discipline
  events: EventRow[]
  savedIds: Set<string>
}) {
  return (
    <section id="events">
      <SectionHeading>Upcoming {discipline.name} Events</SectionHeading>
      {events.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialSaved={savedIds.has(event.id)}
              />
            ))}
          </div>
          <div className="mt-6 text-sm text-ink-muted">
            <Link
              href={`/events?discipline=${encodeURIComponent(discipline.event_discipline_values?.[0] ?? discipline.name)}`}
              className="text-mint hover:underline"
            >
              View all {discipline.name} events →
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-wire bg-panel px-6 py-10 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-ink-muted" />
          <p className="font-medium text-ink">No upcoming events found</p>
          <p className="mt-1 text-sm text-ink-muted">
            Check back soon — {discipline.name} events are added as dates are confirmed.
          </p>
          <Link href="/events" className="mt-4 inline-block text-sm text-mint hover:underline">
            Browse all events →
          </Link>
        </div>
      )}
    </section>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewSection({ discipline }: { discipline: Discipline }) {
  const content = discipline.overview_content ?? discipline.short_description
  if (!content) return null
  return (
    <section id="overview">
      <SectionHeading>About {discipline.name}</SectionHeading>
      <div className="prose prose-invert max-w-none text-ink leading-relaxed text-[0.9375rem] space-y-4">
        {(discipline.overview_content ?? '').split('\n\n').filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        {!discipline.overview_content && (
          <p>{discipline.short_description}</p>
        )}
      </div>
    </section>
  )
}

// ─── Registration Guide ───────────────────────────────────────────────────────

function RegistrationGuideSection({
  discipline,
  events,
}: {
  discipline: Discipline
  events: EventRow[]
}) {
  const hasRegData = events.some(
    (e) => e.registration_url || e.registration_deadline || e.entry_fee_from != null,
  )

  const priceMin = events
    .filter((e) => e.entry_fee_from != null)
    .map((e) => e.entry_fee_from!)
    .sort((a, b) => a - b)[0]

  const priceMax = events
    .filter((e) => e.entry_fee_to != null)
    .map((e) => e.entry_fee_to!)
    .sort((a, b) => b - a)[0]

  return (
    <section id="registration">
      <SectionHeading>Registration Information</SectionHeading>
      <div className="space-y-4">
        {(priceMin != null || priceMax != null) && (
          <div className="card flex items-start gap-4">
            <div className="shrink-0 rounded-lg bg-mint/10 p-3">
              <Calendar className="h-5 w-5 text-mint" />
            </div>
            <div>
              <h3 className="font-semibold text-ink">Typical Entry Fees</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {priceMin != null && priceMax != null
                  ? `${discipline.name} events in Australia typically cost $${priceMin.toLocaleString()} – $${priceMax.toLocaleString()} AUD.`
                  : priceMin != null
                  ? `From $${priceMin.toLocaleString()} AUD.`
                  : `Up to $${priceMax!.toLocaleString()} AUD.`}
                {' '}Early bird pricing is often available weeks to months before the event date.
              </p>
            </div>
          </div>
        )}

        <div className="card flex items-start gap-4">
          <div className="shrink-0 rounded-lg bg-mint/10 p-3">
            <CheckCircle className="h-5 w-5 text-mint" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">Registration Tips</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-muted list-none">
              <li>→ Register early — popular events sell out months in advance</li>
              <li>→ Early bird pricing typically saves 15–25% compared to standard entry</li>
              <li>→ Check transfer and deferral policies before registering</li>
              <li>→ Some events use ballot systems — set a reminder for the ballot opening date</li>
            </ul>
          </div>
        </div>

        {!hasRegData && (
          <p className="text-sm text-ink-muted">
            Registration details are added as events are confirmed. Check individual event pages for the latest information.
          </p>
        )}
      </div>
    </section>
  )
}

// ─── First Timer Guide ────────────────────────────────────────────────────────

function FirstTimerSection({ discipline }: { discipline: Discipline }) {
  if (!discipline.first_timer_guide) return null
  return (
    <section id="first-timer">
      <SectionHeading>First Timer Guide</SectionHeading>
      <div className="rounded-xl border border-wire bg-panel p-6 space-y-4 text-[0.9375rem] leading-relaxed">
        {discipline.first_timer_guide.split('\n\n').filter(Boolean).map((para, i) => (
          <p key={i} className="text-ink-muted">{para}</p>
        ))}
      </div>
    </section>
  )
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

function FaqSection({
  discipline,
  faqs,
}: {
  discipline: Discipline
  faqs: Array<{ question: string; answer: string }>
}) {
  return (
    <section id="faq">
      <SectionHeading>Frequently Asked Questions</SectionHeading>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-wire bg-panel">
            <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4">
              <span className="font-medium text-ink leading-snug">{faq.question}</span>
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-wire px-5 py-4 text-sm text-ink-muted leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

// ─── Related Locations ────────────────────────────────────────────────────────

function RelatedLocationsSection({
  discipline,
  cities,
}: {
  discipline: Discipline
  cities: Array<{ city: string; region: string | null; country: string }>
}) {
  return (
    <section id="locations">
      <SectionHeading>
        {discipline.name} Events by Location
      </SectionHeading>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map(({ city, region, country }) => {
          const locationSlug = city.toLowerCase().replace(/\s+/g, '-')
          return (
            <Link
              key={city}
              href={`/discipline/${discipline.slug}/${locationSlug}`}
              className="group card flex items-center justify-between gap-3 hover:border-wire-bright transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-ink-muted" />
                <div>
                  <span className="font-medium text-ink group-hover:text-mint transition-colors">
                    {city}
                  </span>
                  {region && (
                    <span className="ml-1.5 text-xs text-ink-muted">{region}</span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-mint transition-colors" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ─── Similar Disciplines ──────────────────────────────────────────────────────

function SimilarDisciplinesSection({
  disciplines,
}: {
  disciplines: Array<Pick<Discipline, 'slug' | 'name' | 'short_description' | 'color'>>
}) {
  return (
    <section id="similar">
      <SectionHeading>Similar Disciplines</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {disciplines.map((d) => (
          <Link
            key={d.slug}
            href={`/discipline/${d.slug}`}
            className="group card flex flex-col gap-2 hover:border-wire-bright transition-all"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: d.color ?? '#00D9A6' }}
              />
              <span className="font-semibold text-ink group-hover:text-mint transition-colors">
                {d.name}
              </span>
            </div>
            {d.short_description && (
              <p className="text-sm text-ink-muted line-clamp-2">{d.short_description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-b border-wire pb-3 font-heading text-xl font-bold text-ink">
      {children}
    </h2>
  )
}

