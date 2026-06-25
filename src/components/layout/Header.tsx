'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Radar } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/events', label: 'Events' },
  { href: '/tracks', label: 'Venues' },
  { href: '/championships', label: 'Series' },
]

interface HeaderProps {
  user?: { email?: string } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Radar className="h-5 w-5 text-brand-500" />
            <span className="text-lg">RaceRadar HQ</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-surface-card text-white'
                    : 'text-gray-400 hover:text-white hover:bg-surface-card',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm">
                  My Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-surface-card hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface pb-4">
          <div className="container-page pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-surface-card text-white'
                    : 'text-gray-400 hover:text-white hover:bg-surface-card',
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-surface-border flex flex-col gap-2">
              {user ? (
                <Link href="/dashboard" className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>
                  My Account
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
