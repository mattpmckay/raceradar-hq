import { ResetPasswordForm } from './ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Set new password</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Choose a strong password for your account.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
