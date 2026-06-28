import Link from 'next/link'

const FOOTER_LINKS = {
  Discover: [
    { label: 'Events',      href: '/events' },
    { label: 'Sports',      href: '/sports' },
    { label: 'Locations',   href: '/locations' },
    { label: 'Race Guides', href: '/guides' },
  ],
  Sports: [
    { label: 'HYROX',         href: '/events?discipline=HYROX' },
    { label: 'Spartan Race',  href: '/events?discipline=Spartan+Race' },
    { label: 'Tough Mudder',  href: '/events?discipline=Tough+Mudder' },
    { label: 'Ironman',       href: '/events?discipline=Ironman' },
    { label: 'Marathon',      href: '/events?discipline=Marathon' },
    { label: 'Road Racing',   href: '/events?discipline=Road+Racing' },
    { label: 'Trail Running', href: '/events?discipline=Trail+Running' },
    { label: 'Deka Fit',      href: '/events?discipline=Deka+Fit' },
    { label: 'CrossFit',      href: '/events?discipline=CrossFit' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-wire bg-canvas">
      <div className="container-page py-16">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:gap-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <RadarIcon className="h-7 w-7 text-mint" />
              <span className="font-heading text-[17px] font-bold tracking-tight text-ink">
                RaceRadar <span className="text-mint">HQ</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              The home of fitness racing across Asia Pacific. Discover, plan and travel to every major event.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-ink">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-wire pt-8 sm:flex-row">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} RaceRadar HQ. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: 'About',          href: '/about' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Contact',        href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-ink-muted transition-colors hover:text-ink"
              >
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
