'use client'

import { useState, type FormEvent } from 'react'

export function InlineCalendarCapture() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return <p className="text-xs text-mint">Done — you&apos;re on the list.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value) }}
        placeholder="your@email.com"
        aria-label="Email address for calendar"
        className="min-w-0 flex-1 rounded-lg border border-wire bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-muted transition-colors focus:border-mint focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-lg border border-wire px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-wire-bright hover:text-ink disabled:opacity-50"
      >
        {loading ? '…' : 'Get it'}
      </button>
    </form>
  )
}
