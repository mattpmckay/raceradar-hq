import { createClient } from '@/lib/supabase/server'
import { HeroSearchBar } from './HeroSearchBar'
import { HeroDisciplinePills } from './HeroDisciplinePills'

export async function HeroSection() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: rows } = await supabase
    .from('events')
    .select('country, discipline')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')

  const eventCount      = rows?.length ?? 0
  const countryCount    = new Set(rows?.map((r) => r.country).filter(Boolean)).size
  const disciplineCount = 10

  return (
    <section className="relative overflow-hidden md:min-h-screen">

      {/* Dot-grid texture — desktop only */}
      <div
        className="absolute inset-0 hidden opacity-40 md:block"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1E2A38 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Mint radial glow */}
      <div
        className="absolute -left-32 -top-32 h-[640px] w-[640px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,217,166,0.08) 0%, transparent 70%)' }}
      />

      {/* Radar — desktop only */}
      <div className="hidden md:block">
        <RadarBackground />
      </div>

      {/* Content */}
      <div className="container-page relative z-10 pb-2 pt-2 md:pb-24 md:pt-10 md:flex md:min-h-screen md:items-center">
        <div className="max-w-4xl w-full">

          {/* Sport labels — desktop only */}
          <p className="mb-5 hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted animate-fade-in md:block">
            HYROX &nbsp;·&nbsp; CrossFit &nbsp;·&nbsp; Spartan &nbsp;·&nbsp; Ironman &nbsp;·&nbsp; Triathlon &nbsp;·&nbsp; OCR &nbsp;·&nbsp; Trail
          </p>

          {/* Headline */}
          <h1 className="font-heading text-[1.85rem] font-bold leading-[1.05] tracking-tight text-ink animate-fade-up sm:text-6xl lg:text-[80px]">
            Plan your{' '}
            <span className="sm:block"><span className="text-mint">event season.</span></span>
          </h1>

          {/* Subheading — shorter on mobile */}
          <p className="mt-1 text-sm leading-snug animate-fade-up sm:mt-6 sm:text-xl sm:leading-relaxed [animation-delay:150ms]">
            <span className="sm:hidden text-ink-muted">Discover events, save your picks and build your season across Asia Pacific.</span>
            <span className="hidden sm:inline text-ink-muted">
              Discover HYROX, Spartan, Ironman, Marathon, Trail and more across Asia Pacific.{' '}
              Save events, track registrations and keep your entire season organised in one place.
            </span>
          </p>

          {/* Live stats — desktop only (shown above search) */}
          <div className="mt-8 hidden animate-fade-up md:flex flex-wrap items-end gap-x-10 gap-y-3 [animation-delay:250ms]">
            <StatItem value={eventCount}      label="upcoming events" />
            <Divider />
            <StatItem value={countryCount}    label="countries" />
            <Divider />
            <StatItem value={disciplineCount} label="disciplines" />
          </div>

          {/* Search — primary action on mobile */}
          <div className="animate-fade-up [animation-delay:350ms]">
            <HeroSearchBar />
          </div>

          {/* Compact stats line — mobile only, below search so it doesn't compete */}
          <p className="mt-2 text-xs text-ink-subtle animate-fade-up md:hidden [animation-delay:450ms]">
            {eventCount > 0 ? `${eventCount}+` : '—'} events &middot; {countryCount} countries &middot; {disciplineCount} disciplines
          </p>

          {/* Discipline pills — desktop only */}
          <div className="hidden animate-fade-up md:block [animation-delay:450ms]">
            <HeroDisciplinePills />
          </div>

          {/* Trust line — desktop only (mobile gets compact stats instead) */}
          <p className="mt-5 hidden text-sm text-ink-subtle animate-fade-up md:block [animation-delay:550ms]">
            Free to browse. Free to join.{' '}
            <span className="text-ink-muted">No credit card.</span>
          </p>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-canvas to-transparent md:h-40" />
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="tabular-nums font-heading text-5xl font-bold leading-none text-ink">
        {value > 0 ? `${value}+` : '—'}
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="h-8 w-px bg-wire" />
}

function RadarBackground() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 flex h-full w-full items-center justify-end overflow-hidden opacity-[0.22]"
      aria-hidden
    >
      <div className="relative mr-[-12%] h-[700px] w-[700px] shrink-0">
        {[100, 75, 50, 28].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-mint"
            style={{
              width: `${pct}%`, height: `${pct}%`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-mint opacity-50" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-mint opacity-50" />
        <div
          className="absolute inset-0 animate-radar-sweep rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(0,217,166,0.05) 320deg, rgba(0,217,166,0.18) 355deg, rgba(0,217,166,0.22) 360deg)',
          }}
        />
        <div
          className="absolute h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_12px_4px_rgba(0,217,166,0.5)]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}
