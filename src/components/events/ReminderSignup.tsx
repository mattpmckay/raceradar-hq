'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

export function ReminderSignup({ slug }: { slug: string }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${slug}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
            We&apos;ll notify you as soon as registrations open.
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
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-mint/30 bg-mint/10 px-5 py-3 text-sm font-semibold text-mint transition-all hover:bg-mint/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Bell className="h-4 w-4" />
        {loading ? 'Saving…' : 'Notify me'}
      </button>
      <p className="text-center text-xs text-ink-muted">No spam. Unsubscribe any time.</p>
    </form>
  )
}
