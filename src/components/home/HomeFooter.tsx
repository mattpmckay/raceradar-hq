import Link from 'next/link'

const FOOTER_LINKS = {
  Discover: [
    { label: 'Events',      href: '/events' },
    { label: 'Sports',      href: '/sports' },
    { label: 'Locations',   href: '/locations' },
    { label: 'Race Guides', href: '/guides' },
  ],
  Sports: [
    { label: 'HYROX',         href: '/sports/hyrox' },
    { label: 'Spartan Race',  href: '/sports/spartan' },
    { label: 'Ironman',       href: '/sports/ironman' },
    { label: 'Triathlon',     href: '/sports/triathlon' },
    { label: 'Trail Running', href: '/sports/trail-running' },
    { label: 'CrossFit',      href: '/sports/crossfit' },
  ],
  Account: [
    { label: 'Log in',    href: '/login' },
    { label: 'Sign up',   href: '/signup' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
}

export function HomeFooter() {
  return (
    <footer className="border-t border-wire bg-canvas">
      <div className="container-page py-16">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <RadarIcon className="h-7 w-7 text-mint" />
              <span className="font-heading text-[17px] font-bold tracking-tight text-ink">
                RaceRadar <span className="text-mint">HQ</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              The home of fitness racing across Asia Pacific. Discover, plan and travel to every major event.
            </p>
            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              <SocialLink href="https://instagram.com" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://strava.com" label="Strava">
                <StravaIcon />
              </SocialLink>
              <SocialLink href="https://youtube.com" label="YouTube">
                <YouTubeIcon />
              </SocialLink>
            </div>
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
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Contact', href: '/contact' },
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

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-wire text-ink-muted transition-all duration-200 hover:border-wire-bright hover:text-ink hover:bg-panel"
    >
      {children}
    </a>
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

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function StravaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 19l4-8 4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11l-4-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9l6 3-6 3V9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
