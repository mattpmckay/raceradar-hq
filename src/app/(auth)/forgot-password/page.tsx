import Link from 'next/link'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Forgot Password — RaceRadar HQ' }

export default function ForgotPasswordPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-ink-muted">
        Remembered it?{' '}
        <Link href="/login" className="text-mint hover:text-mint/80 transition-colors">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
