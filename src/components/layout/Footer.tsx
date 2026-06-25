import Link from 'next/link'
import { Flag } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <Flag className="h-5 w-5 text-brand-500" />
              <span>RaceRadar</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              Motorsport intelligence for racers, teams, and fans.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Discover</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/tracks" className="hover:text-white transition-colors">Tracks</Link></li>
              <li><Link href="/championships" className="hover:text-white transition-colors">Championships</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign up</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-border pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} RaceRadar. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
