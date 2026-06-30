import Link from 'next/link'
import { InlineCalendarCapture } from './InlineCalendarCapture'

const LIVE_BENEFITS = [
  { icon: '❤️', label: 'Your race calendar, always up to date' },
  { icon: '🔔', label: 'Reminders before registrations sell out' },
  { icon: '📅', label: 'Build a season that actually happens' },
  { icon: '🏁', label: 'Count down to your next start line' },
]

interface Props {
  isLoggedIn: boolean
}

export function MemberValueSection({ isLoggedIn }: Props) {
  if (isLoggedIn) {
    return (
      <section className="relative py-10 md:py-14">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-xs font-semibold text-mint">
              Coming Soon
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              More great features on the way
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              Price alerts, registration reminders, race history and personalised recommendations are all in development.
            </p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />
      </section>
    )
  }

  return (
    <section className="relative py-8 md:py-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl border border-wire bg-panel/60">

          {/* Mint glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(0,217,166,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="relative grid gap-0 md:grid-cols-2">

            {/* Left — pitch */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
                Never miss another race.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                Keep your entire season in one place. Save events, get registration reminders and never miss another start line.
              </p>

              <div className="mt-6 sm:mt-8">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px sm:w-auto"
                >
                  Build My Season
                </Link>
                <p className="mt-2 text-xs text-ink-muted">
                  Create your free account in less than 30 seconds.
                </p>
              </div>

              {/* Calendar fallback */}
              <div className="mt-6 border-t border-wire pt-5">
                <p className="mb-2 text-xs text-ink-muted">
                  Not ready to sign up? Get the 2026 APAC calendar delivered to your inbox.
                </p>
                <InlineCalendarCapture />
              </div>
            </div>

            {/* Right — benefits */}
            <div className="border-t border-wire p-6 sm:p-8 md:border-l md:border-t-0 lg:p-12">
              <ul className="space-y-4">
                {LIVE_BENEFITS.map((b) => (
                  <li key={b.label} className="flex items-center gap-3">
                    <span className="text-base leading-none" aria-hidden>{b.icon}</span>
                    <span className="text-sm font-medium text-ink">{b.label}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />
    </section>
  )
}
