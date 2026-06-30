import Link from 'next/link'

const LIVE_BENEFITS = [
  { icon: '❤️', label: 'Save races to your season plan' },
  { icon: '🔔', label: 'Get notified before registrations open' },
  { icon: '📅', label: 'Build your personal race calendar' },
  { icon: '🏁', label: 'Count down to race day' },
]

const SOON_BENEFITS = [
  { icon: '📊', label: 'Track races you\'ve completed' },
  { icon: '💰', label: 'Get early bird and price alerts' },
  { icon: '🎯', label: 'Discover races you\'ll love' },
  { icon: '📈', label: 'View your full race history' },
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
    <section className="relative py-4 md:py-6">
      <div className="container-page">
        <div className="overflow-hidden rounded-2xl border border-wire bg-panel/60">

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
                Save races to your season plan, get registration reminders and never miss an event you care about.
              </p>

              <div className="mt-6 sm:mt-8">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px sm:w-auto"
                >
                  Join free
                </Link>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-xs text-ink-subtle">
                  Free to browse. Free to join. No credit card.
                </p>
                <Link
                  href="/login"
                  className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Already a member? Log in
                </Link>
              </div>
            </div>

            {/* Right — benefits */}
            <div className="border-t border-wire p-6 sm:p-8 md:border-l md:border-t-0 lg:p-12">
              <ul className="space-y-3">
                {LIVE_BENEFITS.map((b) => (
                  <li key={b.label} className="flex items-center gap-3">
                    <span className="text-base leading-none" aria-hidden>{b.icon}</span>
                    <span className="text-sm font-medium text-ink">{b.label}</span>
                  </li>
                ))}
              </ul>

              <div className="my-4 hidden border-t border-wire sm:block" />

              <ul className="hidden space-y-3 sm:block">
                {SOON_BENEFITS.map((b) => (
                  <li key={b.label} className="flex items-center gap-3">
                    <span className="text-base leading-none opacity-50" aria-hidden>{b.icon}</span>
                    <span className="text-sm text-ink-muted">
                      {b.label}
                      <span className="ml-1.5 rounded-full border border-wire px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle">
                        Soon
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
