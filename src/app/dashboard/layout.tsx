import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Radar, Heart, User, LogOut } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: User },
  { href: '/dashboard/favourites', label: 'Favourites', icon: Heart },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Radar className="h-5 w-5 text-brand-500" />
            <span>RaceRadar HQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-400 sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-page flex flex-1 gap-8 py-8">
        {/* Sidebar */}
        <nav className="hidden w-48 shrink-0 md:block">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-surface-card hover:text-white"
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
    </div>
  )
}
