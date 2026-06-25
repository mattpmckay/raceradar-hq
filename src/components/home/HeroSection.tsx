import { HeroSearchBar } from './HeroSearchBar'

export function HeroSection() {
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

      {/* Radar sweep */}
      <RadarBackground />

      {/* Content */}
      <div className="container-page relative z-10 pb-20 pt-36">
        <div className="max-w-4xl">

          {/* Sport labels — above headline */}
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
            One place to discover, compare, plan and travel to every race — from your first HYROX to your next Ironman.
          </p>

          {/* Search bar (client island) */}
          <div className="animate-fade-up [animation-delay:300ms]">
            <HeroSearchBar />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas to-transparent" />
    </section>
  )
}

function RadarBackground() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 flex h-full w-full items-center justify-end overflow-hidden opacity-[0.22]"
      aria-hidden
    >
      {/* Outer positioning: offset to the right so radar feels like it extends off screen */}
      <div className="relative mr-[-12%] h-[700px] w-[700px] shrink-0">

        {/* Concentric rings */}
        {[100, 75, 50, 28].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-mint"
            style={{
              width:  `${pct}%`,
              height: `${pct}%`,
              top:    '50%',
              left:   '50%',
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
