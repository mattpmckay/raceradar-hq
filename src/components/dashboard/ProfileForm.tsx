'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export function ProfileForm({
  initialFullName,
  initialUsername,
  email,
}: {
  initialFullName: string | null
  initialUsername: string | null
  email: string
}) {
  const [fullName, setFullName] = useState(initialFullName ?? '')
  const [username, setUsername]  = useState(initialUsername ?? '')
  const [status, setStatus]      = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError]        = useState('')

  async function save() {
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          username:  username.trim()  || null,
        }),
      })
      if (res.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Something went wrong.')
        setStatus('error')
      }
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="card max-w-md space-y-5">
      {/* Email — read-only */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-wire bg-panel/50 px-4 py-2.5 text-sm text-ink-muted"
        />
        <p className="text-xs text-ink-subtle">Email cannot be changed here.</p>
      </div>

      {/* Display name */}
      <div className="space-y-1.5">
        <label htmlFor="full-name" className="text-sm font-medium text-ink">
          Display Name
        </label>
        <input
          id="full-name"
          type="text"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setStatus('idle') }}
          placeholder="Your full name"
          className="w-full rounded-xl border border-wire bg-panel px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-colors"
        />
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-ink">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setStatus('idle') }}
          placeholder="your_username"
          className="w-full rounded-xl border border-wire bg-panel px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-colors"
        />
        <p className="text-xs text-ink-subtle">Letters, numbers, and underscores. 2–30 characters.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="btn-primary disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>

        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-mint">
            <CheckCircle className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
