import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Radar, Heart, UserCircle, Settings, LayoutDashboard } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const navItems = [
  { href: '/dashboard',             label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/favourites',  label: 'Favourites', icon: Heart },
  { href: '/dashboard/profile',     label: 'Profile',    icon: Settings },
]

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !DEV_BYPASS) redirect('/login')

  const email = user?.email ?? ''

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-wire bg-canvas/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink">
            <Radar className="h-5 w-5 text-mint" />
            <span>RaceRadar HQ</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden text-sm text-ink-muted sm:block mr-2">{email}</span>
            <Link
              href="/dashboard/profile"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel hover:text-ink"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-page flex flex-1 gap-8 py-4 pb-24 md:py-8 md:pb-8">
        {/* Sidebar — desktop only */}
        <nav className="hidden w-48 shrink-0 md:block">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-wire bg-canvas/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="flex items-center justify-around h-14">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 px-4 py-1 text-ink-muted transition-colors hover:text-mint"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
