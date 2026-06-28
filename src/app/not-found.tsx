import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-wire bg-panel">
        <RadarIcon className="h-7 w-7 text-mint" />
      </div>
      <h1 className="font-heading text-5xl font-bold text-ink">404</h1>
      <p className="mt-3 text-base text-ink-muted">This page doesn&apos;t exist — or has moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
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
