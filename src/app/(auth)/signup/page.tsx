import Link from 'next/link'
import { SignupForm } from './SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account' }

export default function SignupPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Join RaceRadar HQ — it&apos;s free</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-mint hover:text-mint/80 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}
