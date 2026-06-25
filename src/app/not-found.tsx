import Link from 'next/link'
import { Flag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <Flag className="h-12 w-12 text-brand-500 mb-4" />
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="mt-2 text-gray-400">Page not found.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  )
}
