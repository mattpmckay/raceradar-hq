import { createClient } from '@/lib/supabase/server'
import { HeroSearchBar } from './HeroSearchBar'
import { HeroDisciplinePills } from './HeroDisciplinePills'

// ─── Component ────────────────────────────────────────────────────────────────

export async function HeroSection() {
  // Fetch live stats — fast, single read of published upcoming events
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
  const disciplineCount = new Set(rows?.map((r) => r.discipline).filter(Boolean)).size

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #1E2A38 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Mint radial glow — top-left, behind headline */}
      <div
        className="absolute -top-32 -left-32 h-[640px] w-[640px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0,217,166,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Fire radial glow — bottom-right accent */}
      <div
        className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(255,77,0,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Radar sweep */}
      <RadarBackground />

      {/* Content */}
      <div className="container-page relative z-10 pb-24 pt-36">
        <div className="max-w-4xl">

          {/* Sport labels */}
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted animate-fade-in">
            HYROX &nbsp;·&nbsp; Spartan &nbsp;·&nbsp; Ironman &nbsp;·&nbsp; Triathlon &nbsp;·&nbsp; OCR &nbsp;·&nbsp; Trail
          </p>

          {/* Headline */}
          <h1 className="font-heading text-5xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-[80px] animate-fade-up">
            Every Major Fitness Event
            <br />
            Across{' '}
            <span className="text-mint">Asia Pacific.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl animate-fade-up [animation-delay:150ms]">
            One platform to discover, compare and plan every race — from your first HYROX to your next Ironman.
          </p>

          {/* Live stats */}
          <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-4 animate-fade-up [animation-delay:250ms]">
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

          {/* Discipline quick-links */}
          <div className="animate-fade-up [animation-delay:450ms]">
            <HeroDisciplinePills />
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-heading text-4xl font-bold leading-none text-ink">
        {value > 0 ? value : '—'}
      </span>
      <span className="text-xs uppercase tracking-widest text-ink-muted">{label}</span>
    </div>
  )
}

function Divider() {
  return (
    <div className="hidden h-10 w-px bg-wire sm:block" />
  )
}

function RadarBackground() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 flex h-full w-full items-center justify-end overflow-hidden opacity-[0.22]"
      aria-hidden
    >
      <div className="relative mr-[-12%] h-[700px] w-[700px] shrink-0">

        {/* Concentric rings */}
        {[100, 75, 50, 28].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-mint"
            style={{
              width:     `${pct}%`,
              height:    `${pct}%`,
              top:       '50%',
              left:      '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-px bg-mint opacity-50" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-mint opacity-50" />

        {/* Rotating sweep */}
        <div
          className="absolute inset-0 animate-radar-sweep rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(0,217,166,0.05) 320deg, rgba(0,217,166,0.18) 355deg, rgba(0,217,166,0.22) 360deg)',
          }}
        />

        {/* Centre blip */}
        <div
          className="absolute h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_12px_4px_rgba(0,217,166,0.5)]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}
