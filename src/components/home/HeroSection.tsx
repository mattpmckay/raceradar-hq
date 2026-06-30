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
    <section className="relative flex min-h-[55vh] items-center overflow-hidden md:min-h-screen">

      {/* Dot-grid texture — desktop only (mobile: reduce visual noise) */}
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

      {/* Radar — desktop only (mobile: saves render, reduces distraction) */}
      <div className="hidden md:block">
        <RadarBackground />
      </div>

      {/* Content */}
      <div className="container-page relative z-10 pb-8 pt-4 md:pb-24 md:pt-10">
        <div className="max-w-4xl">

          {/* Sport labels — desktop only */}
          <p className="mb-5 hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted animate-fade-in md:block">
            HYROX &nbsp;·&nbsp; CrossFit &nbsp;·&nbsp; Spartan &nbsp;·&nbsp; Ironman &nbsp;·&nbsp; Triathlon &nbsp;·&nbsp; OCR &nbsp;·&nbsp; Trail
          </p>

          {/* Headline */}
          <h1 className="font-heading text-[2.25rem] font-bold leading-[1.08] tracking-tight text-ink animate-fade-up sm:text-6xl lg:text-[80px]">
            Every Major Fitness Event
            <br className="hidden sm:block" />{' '}
            Across{' '}
            <span className="text-mint">Asia Pacific.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted animate-fade-up sm:mt-6 sm:text-xl [animation-delay:150ms]">
            Discover, compare and plan endurance events across APAC.
            <span className="hidden sm:inline"> From your first HYROX to your next Ironman.</span>
          </p>

          {/* Live stats — compact on mobile */}
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3 animate-fade-up sm:mt-8 sm:gap-x-10 [animation-delay:250ms]">
            <StatItem value={eventCount}      label="upcoming events" />
            <Divider />
            <StatItem value={countryCount}    label="countries" />
            <Divider />
            <StatItem value={disciplineCount} label="disciplines" />
          </div>

          {/* Search bar */}
          <div className="animate-fade-up [animation-delay:350ms]">
            <HeroSearchBar />
          </div>

          {/* Discipline pills — desktop only */}
          <div className="hidden animate-fade-up md:block [animation-delay:450ms]">
            <HeroDisciplinePills />
          </div>

          {/* Trust line */}
          <p className="mt-5 text-sm text-ink-subtle animate-fade-up md:mt-8 [animation-delay:550ms]">
            Free to browse. Free to join.{' '}
            <span className="text-ink-muted">No credit card.</span>
          </p>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent md:h-40" />
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="tabular-nums font-heading text-2xl font-bold leading-none text-ink sm:text-5xl">
        {value > 0 ? `${value}+` : '—'}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink-muted sm:text-xs">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="hidden h-8 w-px bg-wire sm:block" />
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
