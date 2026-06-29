'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordRules, validatePassword } from '@/components/ui/PasswordRules'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const passwordError = validatePassword(password)
    if (passwordError) { setError(passwordError); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(
        error.message.includes('Auth session missing')
          ? 'Your reset link has expired or is invalid. Please request a new one.'
          : error.message
      )
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/login?reset=success')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        id="password"
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
      />
      <PasswordRules password={password} />

      <PasswordInput
        id="confirm"
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        placeholder="Repeat your new password"
        required
      />

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}{' '}
          {error.includes('expired') && (
            <a href="/forgot-password" className="underline hover:no-underline">Request a new link</a>
          )}
        </p>
      )}

      <Button type="submit" className="w-full justify-center" disabled={loading}>
        {loading ? 'Saving…' : 'Set new password'}
      </Button>
    </form>
  )
}
