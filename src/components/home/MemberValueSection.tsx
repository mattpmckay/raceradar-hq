import Link from 'next/link'

const BENEFITS = [
  { icon: '❤️', label: 'Save races you\'re considering',      comingSoon: false },
  { icon: '📅', label: 'Build your personal race calendar',   comingSoon: false },
  { icon: '🔔', label: 'Know when registration opens',        comingSoon: false },
  { icon: '🏁', label: 'Count down to race day',              comingSoon: false },
  { icon: '💰', label: 'Get early bird and price alerts',     comingSoon: true  },
  { icon: '📊', label: 'Track your completed races',          comingSoon: true  },
  { icon: '🎯', label: 'Discover races you\'ll love',         comingSoon: true  },
  { icon: '📈', label: 'View your race history',              comingSoon: true  },
]

interface Props {
  isLoggedIn: boolean
}

export function MemberValueSection({ isLoggedIn }: Props) {
  if (isLoggedIn) {
    return (
      <section className="relative py-12 md:py-16">
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
              Price change alerts, registration reminders, race history and personalised recommendations are all in development.
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
              background:
                'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(0,217,166,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="relative grid gap-0 md:grid-cols-2">

            {/* Left — headline + CTA */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-xs font-semibold text-mint">
                Free Membership
              </span>

              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
                Never miss the race you&apos;ve been waiting for.
              </h2>

              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:mt-4">
                Free for every athlete. No subscription, no credit card — ever.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px sm:w-auto"
                >
                  Create your free account
                </Link>
                <Link
                  href="/login"
                  className="text-center text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Already a member? Log in
                </Link>
              </div>
            </div>

            {/* Right — outcome list */}
            <div className="border-t border-wire p-6 sm:p-8 md:border-l md:border-t-0 lg:p-12">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.15em] text-ink-muted">
                What athletes use it for
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {BENEFITS.map((b) => (
                  <li key={b.label} className="flex items-start gap-3">
                    <span className="mt-px text-base leading-none" aria-hidden>{b.icon}</span>
                    <span className="text-sm text-ink-muted">
                      {b.label}
                      {b.comingSoon && (
                        <span className="ml-1.5 rounded-full border border-wire px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle">
                          Soon
                        </span>
                      )}
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
