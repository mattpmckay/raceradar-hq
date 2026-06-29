'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'


function friendlyAuthError(message: string): string {
  if (message.toLowerCase().includes('invalid login credentials') || message.toLowerCase().includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Please confirm your email address before logging in.'
  }
  if (message.toLowerCase().includes('too many requests')) {
    return 'Too many login attempts. Please wait a few minutes and try again.'
  }
  return message
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const passwordReset = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient(remember)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(friendlyAuthError(error.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {passwordReset && (
        <p className="rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
          Password updated — log in with your new password.
        </p>
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <PasswordInput
        id="password"
        label="Password"
        labelRight={
          <Link href="/forgot-password" className="text-xs text-ink-muted hover:text-mint transition-colors">
            Forgot password?
          </Link>
        }
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-wire bg-canvas accent-mint"
        />
        <span className="text-sm text-ink-muted">Remember me</span>
      </label>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full justify-center" disabled={loading}>
        {loading ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  )
}
