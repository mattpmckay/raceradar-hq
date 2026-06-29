'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Heart, Settings, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',            label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/favourites', label: 'Favourites', icon: Heart },
  { href: '/dashboard/profile',    label: 'Profile',    icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Sidebar — desktop only */}
      <nav aria-label="Dashboard sidebar navigation" className="hidden w-48 shrink-0 md:block">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-panel text-ink'
                      : 'text-ink-muted hover:bg-panel hover:text-ink',
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', active ? 'text-mint' : '')}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Dashboard mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-wire bg-canvas/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex h-14 items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-4 py-1 transition-colors',
                    active ? 'text-mint' : 'text-ink-muted hover:text-mint',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              </li>
            )
          })}
          <li>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-4 py-1 text-ink-muted transition-colors hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-medium">Log out</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
