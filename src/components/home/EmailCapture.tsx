'use client'

import { useState, type FormEvent } from 'react'

export function EmailCapture() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(
          (data as { error?: string }).error ??
            'Something went wrong. Please try again.',
        )
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden py-24">
      {/* Mint tint background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(0,217,166,0.05) 0%, transparent 70%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-wire-bright to-transparent" />

      <div className="container-page relative z-10">
        <div className="mx-auto max-w-xl text-center">

          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-xs font-semibold text-mint">
            <CalendarIcon className="h-3.5 w-3.5" />
            Free 2026 Calendar
          </span>

          <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Get the Free 2026 APAC
            <br />
            <span className="text-mint">Fitness Events Calendar</span>
          </h2>

          <p className="mt-4 text-base text-ink-muted">
            Every major HYROX, Spartan, Ironman and OCR event across Asia Pacific — curated, dated, and delivered to your inbox.
          </p>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/10">
                <CheckIcon className="h-6 w-6 text-mint" />
              </div>
              <p className="font-semibold text-ink">Got it — you&apos;re on the list!</p>
              <p className="text-sm text-ink-muted">We&apos;ll be in touch when the 2026 calendar is ready.</p>
              <div className="mt-2 rounded-xl border border-wire bg-panel/60 px-5 py-4 text-center">
                <p className="text-sm text-ink-muted">
                  While you wait,{' '}
                  <a href="/signup" className="font-medium text-mint hover:underline">
                    create a free account
                  </a>{' '}
                  to save events and get personalised alerts.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-wire bg-panel px-4 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint transition-colors"
                  aria-label="Email address"
                  aria-describedby={error ? 'subscribe-error' : undefined}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-mint px-6 py-3.5 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? 'Sending…' : 'Get Calendar'}
                </button>
              </div>
              {error && (
                <p id="subscribe-error" className="mt-3 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-4 text-xs text-ink-muted">
                Athletes across Asia Pacific. No spam — ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
