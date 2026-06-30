'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const DISCIPLINE_CATEGORY: Record<string, string[]> = {
  'HYROX':         ['hyrox'],
  'Deka Fit':      ['hybrid'],
  'CrossFit':      ['functional'],
  'Spartan Race':  ['ocr'],
  'Ironman':       ['ironman', 'triathlon'],
  'Ironman 70.3':  ['ironman', 'triathlon'],
  'Marathon':      ['marathon'],
  'Trail Running': ['trail'],
}

export function CalendarCtaInline({ discipline }: { discipline: string }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = DISCIPLINE_CATEGORY[discipline] ?? ['all']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, categories, source: 'event_page' }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/15 ring-1 ring-mint/30">
          <Check className="h-6 w-6 text-mint" />
        </div>
        <div>
          <p className="font-semibold text-ink">You&apos;re on the list</p>
          <p className="mt-1 text-sm text-ink-muted">
            We&apos;ll send your calendar as soon as it&apos;s ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError('') }}
        placeholder="your@email.com"
        className="w-full rounded-xl border border-wire bg-panel px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint transition-colors"
        aria-label="Email address"
        autoComplete="email"
      />
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-5 py-3 text-sm font-semibold text-canvas transition-all hover:bg-mint-300 hover:shadow-lg hover:shadow-mint/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Subscribing…' : 'Send me the calendar'}
      </button>
      <p className="text-center text-xs text-ink-muted">No spam. Unsubscribe any time.</p>
    </form>
  )
}
