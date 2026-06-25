import Link from 'next/link'
import { LoginForm } from './LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Log in' }

export default function LoginPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-400">Log in to your RaceRadar account</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-brand-400 hover:text-brand-300">
          Sign up
        </Link>
      </p>
    </div>
  )
}
