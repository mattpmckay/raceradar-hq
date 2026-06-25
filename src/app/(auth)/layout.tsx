import Link from 'next/link'
import { Flag } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Flag className="h-6 w-6 text-brand-500" />
            <span className="text-xl">RaceRadar</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
