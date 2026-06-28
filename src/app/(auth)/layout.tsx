import Link from 'next/link'
import { Radar } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink">
            <Radar className="h-6 w-6 text-mint" />
            <span className="text-xl">RaceRadar HQ</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
