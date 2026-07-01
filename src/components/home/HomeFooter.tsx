import Link from 'next/link'

const DISCOVER_LINKS = [
  { label: 'Events',         href: '/events' },
  { label: 'Event Types',    href: '/sports' },
  { label: 'Locations',      href: '/locations' },
  { label: 'Race Guides',    href: '/guides' },
  { label: 'Free Calendar',  href: '/calendar' },
]

const SPORTS_LINKS = [
  { label: 'HYROX',         href: '/events?discipline=HYROX' },
  { label: 'Spartan Race',  href: '/events?discipline=Spartan+Race' },
  { label: 'Ironman',       href: '/events?discipline=Ironman' },
  { label: 'Trail Running', href: '/events?discipline=Trail+Running' },
  { label: 'Marathon',      href: '/events?discipline=Marathon' },
]

export function HomeFooter() {
  return (
    <footer className="border-t border-wire bg-canvas">
      <div className="container-page py-10 md:py-14">

        {/* Main grid — on mobile: brand full-width + discover. Sports hidden on mobile. */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <RadarIcon className="h-7 w-7 text-mint" />
              <span className="font-heading text-[17px] font-bold tracking-tight text-ink">
                RaceRadar <span className="text-mint">HQ</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Your race planning HQ for Asia Pacific. Discover events, save races and plan your season.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
              Discover
            </h3>
            <ul className="space-y-2.5">
              {DISCOVER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Types — hidden on mobile to keep footer compact */}
          <div className="hidden sm:block">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
              Event Types
            </h3>
            <ul className="space-y-2.5">
              {SPORTS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-wire pt-6 sm:flex-row md:mt-12 md:pt-8">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} RaceRadar HQ. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Privacy',  href: '/privacy' },
              { label: 'Terms',    href: '/terms' },
              { label: 'About',    href: '/about' },
              { label: 'Contact',  href: '/contact' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-ink-muted transition-colors hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <circle cx="14" cy="14" r="12"  stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <circle cx="14" cy="14" r="7.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"  />
      <circle cx="14" cy="14" r="3"   stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      <line x1="14" y1="14" x2="22.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}
