'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const COOLDOWN_SECONDS = 60

function friendlyRateLimitError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('security purposes')) {
    return `You can request another reset link in ${COOLDOWN_SECONDS} seconds.`
  }
  return message
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function sendRequest() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError(friendlyRateLimitError(error.message))
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
    startCooldown()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await sendRequest()
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-mint/30 bg-mint/10 px-4 py-5 space-y-2">
          <p className="font-semibold text-ink">Check your inbox</p>
          <p className="text-sm text-ink-muted">
            We sent a reset link to <span className="text-ink">{email}</span>.
            It expires in 1 hour.
          </p>
          <ul className="text-xs text-ink-subtle space-y-0.5 pt-1">
            <li>• Allow a few minutes for delivery</li>
            <li>• Check your spam or junk folder</li>
            <li>• If you requested a reset recently, wait a few minutes — email providers limit how often reset links can be sent</li>
          </ul>
        </div>

        <div className="text-center text-sm text-ink-muted">
          {cooldown > 0 ? (
            <span>Resend available in <span className="tabular-nums text-ink">{cooldown}s</span></span>
          ) : (
            <button
              type="button"
              onClick={sendRequest}
              disabled={loading}
              className="text-mint hover:text-mint/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Resend reset link'}
            </button>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="email"
        type="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full justify-center" disabled={loading || cooldown > 0}>
        {loading ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send reset link'}
      </Button>
    </form>
  )
}
