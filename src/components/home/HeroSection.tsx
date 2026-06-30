import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">

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
      <div className="container-page relative z-10 py-16 md:py-36">
        <div className="max-w-2xl">

          {/* Headline */}
          <h1 className="font-heading text-[2rem] font-bold leading-[1.05] tracking-tight text-ink animate-fade-up sm:text-6xl lg:text-[80px]">
            Plan your{' '}
            <span className="sm:block"><span className="text-mint">event season.</span></span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 text-base leading-relaxed text-ink-muted animate-fade-up sm:mt-6 sm:text-xl sm:leading-relaxed [animation-delay:100ms]">
            Discover HYROX, Spartan, Ironman, Marathon, Trail and more across Asia Pacific.
            Save events, track registrations and build your race season in one place.
          </p>

          {/* CTAs */}
          <div className="mt-8 animate-fade-up [animation-delay:200ms]">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-6 py-4 text-base font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px sm:w-auto"
            >
              Build My Season
            </Link>
            <p className="mt-3 text-sm text-ink-muted [animation-delay:300ms]">
              or{' '}
              <Link
                href="/events"
                className="font-medium text-ink-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
              >
                find a specific event
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-canvas to-transparent md:h-24" />
    </section>
  )
}

// ─── Radar background ─────────────────────────────────────────────────────────

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
