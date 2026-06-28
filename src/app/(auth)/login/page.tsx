import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from './LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Log in' }

export default function LoginPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Log in to your RaceRadar HQ account</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-mint hover:text-mint/80 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  )
}
