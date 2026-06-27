import Link from 'next/link'
import { Radar } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-white">
              <Radar className="h-5 w-5 text-brand-500" />
              <span>RaceRadar HQ</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              Your guide to fitness races, obstacle runs, and endurance events across Asia Pacific.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Discover</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li><Link href="/events"    className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/sports"    className="hover:text-white transition-colors">Sports</Link></li>
              <li><Link href="/locations" className="hover:text-white transition-colors">Locations</Link></li>
              <li><Link href="/guides"    className="hover:text-white transition-colors">Race Guides</Link></li>
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
          © {new Date().getFullYear()} RaceRadar HQ. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
