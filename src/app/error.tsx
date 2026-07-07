'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-wire bg-panel">
        <RadarIcon className="h-7 w-7 text-mint" />
      </div>
      <h1 className="font-heading text-4xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-3 text-base text-ink-muted max-w-sm">
        An unexpected error occurred. Please try again, or head back to the homepage.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-ink-muted/50">Error ID: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
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
