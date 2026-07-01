'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, LogOut, Settings, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type HeaderUser = {
  displayName: string
  initials: string
  photoUrl: string | null
  email: string
}

// ─── Single navigation source of truth ───────────────────────────────────────
// Desktop renders PRIMARY_NAV horizontally + MORE_NAV in a dropdown.
// Mobile renders the same items in a drawer — primary links first, More below a divider.
// Authenticated users see My Season added to PRIMARY_NAV.
// This is the only place navigation is defined. Never duplicate it.

const PRIMARY_NAV = [
  { href: '/events', label: 'Events' },
] as const

const MORE_NAV = [
  { href: '/sports',    label: 'Sports' },
  { href: '/locations', label: 'Locations' },
  { href: '/guides',    label: 'Race Guides' },
] as const

const MY_SEASON = { href: '/dashboard', label: 'My Season' } as const

// ─── Component ────────────────────────────────────────────────────────────────

export function Header({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname()
  const router   = useRouter()

  const [menuOpen,    setMenuOpen]    = useState(false)
  const [moreOpen,    setMoreOpen]    = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const moreRef    = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    if (!moreOpen && !accountOpen) return
    function onMouseDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [moreOpen, accountOpen])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setMoreOpen(false) }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    setAccountOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 border-b border-wire bg-canvas/95 backdrop-blur-md">
      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-3 md:h-[68px] md:gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setMenuOpen(false)}
          >
            <RadarIcon className="h-7 w-7 text-mint transition-transform duration-500 group-hover:rotate-[36deg]" />
            <span className="font-heading text-[17px] font-bold tracking-tight text-ink">
              RaceRadar <span className="text-mint">HQ</span>
            </span>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden flex-1 items-center gap-0.5 md:flex">

            {/* Primary links */}
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive(link.href) ? 'bg-panel text-ink' : 'text-ink-muted hover:bg-panel hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* My Season — authenticated only */}
            {user && (
              <Link
                href={MY_SEASON.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                  isActive(MY_SEASON.href) ? 'text-mint' : 'text-mint/70 hover:text-mint',
                )}
              >
                {MY_SEASON.label}
              </Link>
            )}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  MORE_NAV.some((l) => isActive(l.href))
                    ? 'bg-panel text-ink'
                    : 'text-ink-muted hover:bg-panel hover:text-ink',
                )}
              >
                More
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform duration-200', moreOpen && 'rotate-180')}
                />
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-wire bg-panel shadow-2xl shadow-canvas/60">
                  <div className="p-1.5">
                    {MORE_NAV.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive(link.href)
                            ? 'bg-panel-raised text-ink'
                            : 'text-ink-muted hover:bg-panel-raised hover:text-ink',
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* ── Desktop right — authenticated ───────────────────────────────── */}
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/50"
                >
                  <Avatar user={user} size="sm" />
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 text-ink-muted transition-transform duration-200', accountOpen && 'rotate-180')}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-wire bg-panel shadow-2xl shadow-canvas/60">
                    <div className="flex items-center gap-3 border-b border-wire p-4">
                      <Avatar user={user} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
                        <p className="truncate text-xs text-ink-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <DropdownLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                        My Season
                      </DropdownLink>
                      <DropdownLink href="/dashboard/profile" icon={<Settings className="h-4 w-4" />} onClick={() => setAccountOpen(false)}>
                        Profile Settings
                      </DropdownLink>
                    </div>
                    <div className="border-t border-wire p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Desktop right — guest ──────────────────────────────────────── */
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 hover:shadow-md hover:shadow-mint/20 hover:-translate-y-px"
              >
                Build My Season
              </Link>
            </div>
          )}

          {/* ── Mobile: persistent right actions ────────────────────────────── */}
          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open account menu"
                className="rounded-full p-0.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/50"
              >
                <Avatar user={user} size="sm" />
              </button>
            ) : (
              <Link
                href="/signup"
                className="rounded-full bg-mint px-3.5 py-1.5 text-xs font-semibold text-canvas transition-all duration-200 hover:bg-mint-300 active:scale-95"
                onClick={() => setMenuOpen(false)}
              >
                Build My Season
              </Link>
            )}
            <button
              className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-panel hover:text-ink"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        id="mobile-nav"
        className={cn(
          'border-t border-wire bg-canvas transition-all duration-200 md:hidden',
          menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 overflow-hidden opacity-0',
        )}
      >
        <div className="container-page py-3">
          <nav aria-label="Mobile navigation" className="space-y-0.5">

            {/* My Season — authenticated, shown first */}
            {user && (
              <Link
                href={MY_SEASON.href}
                className={cn(
                  'flex items-center rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-colors',
                  isActive(MY_SEASON.href) ? 'bg-mint/10 text-mint' : 'text-mint hover:bg-mint/10',
                )}
                onClick={() => setMenuOpen(false)}
              >
                My Season
              </Link>
            )}

            {/* Primary nav links */}
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors',
                  isActive(link.href) ? 'bg-panel text-ink' : 'text-ink-muted hover:bg-panel hover:text-ink',
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* More links — below a divider */}
            <div className="pt-1">
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink-subtle">
                More
              </p>
              {MORE_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                    isActive(link.href) ? 'bg-panel text-ink' : 'text-ink-muted hover:bg-panel hover:text-ink',
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Account section */}
          <div className="mt-3 border-t border-wire pt-3">
            {user ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar user={user} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-mint" />
                  My Season
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 shrink-0 text-mint" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ user, size }: { user: HeaderUser; size: 'sm' | 'md' }) {
  const dim = size === 'md' ? 36 : 28
  const cls = size === 'md' ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-xs'

  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint/15 ring-1 ring-mint/30', cls)}>
      {user.photoUrl ? (
        <Image
          src={user.photoUrl}
          alt={user.displayName}
          width={dim}
          height={dim}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="font-bold text-mint">{user.initials}</span>
      )}
    </div>
  )
}

function DropdownLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-panel-raised hover:text-ink"
    >
      <span className="text-mint">{icon}</span>
      {children}
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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
