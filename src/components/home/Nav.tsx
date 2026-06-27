'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Events',      href: '/events' },
  { label: 'Sports',      href: '/sports' },
  { label: 'Locations',   href: '/locations' },
  { label: 'Race Guides', href: '/guides' },
]

export function Nav() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-canvas/90 backdrop-blur-md border-b border-wire'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-8 md:h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <RadarIcon className="h-7 w-7 text-mint transition-transform duration-500 group-hover:rotate-[36deg]" />
            <span className="font-heading text-[17px] font-bold tracking-tight text-ink">
              RaceRadar <span className="text-mint">HQ</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link
            href="/calendar"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-fire px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-fire-600 hover:-translate-y-px hover:shadow-lg hover:shadow-fire/25"
            prefetch={false}
          >
            Get Free Events Calendar
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-ink-muted transition-colors hover:bg-panel hover:text-ink"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-wire bg-canvas transition-all duration-200 ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="container-page py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link
              href="/calendar"
              className="block rounded-full bg-fire px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get Free Events Calendar
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <circle cx="14" cy="14" r="12"  stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <circle cx="14" cy="14" r="7.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"  />
      <circle cx="14" cy="14" r="3"   stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      <line x1="14" y1="14" x2="22.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
