import Link from 'next/link'
import { SignupForm } from './SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign up' }

export default function SignupPage() {
  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-gray-400">Join RaceRadar for free</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300">
          Log in
        </Link>
      </p>
    </div>
  )
}
