import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Radar, UserCircle } from 'lucide-react'
import { LogoutButton } from './LogoutButton'
import { DashboardNav } from './DashboardNav'

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !DEV_BYPASS) redirect('/login')

  const email = user?.email ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, full_name')
    .eq('id', user!.id)
    .single()

  const displayName = profile?.first_name
    ?? profile?.full_name?.trim().split(' ')[0]
    ?? email

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-wire bg-canvas/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-ink">
            <Radar className="h-5 w-5 text-mint" />
            <span>RaceRadar <span className="text-mint">HQ</span></span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="hidden text-sm text-ink-muted sm:block mr-2">{displayName}</span>
            <Link
              href="/dashboard/profile"
              aria-label="Profile settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-panel hover:text-ink"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-page flex flex-1 gap-8 py-4 pb-24 md:py-8 md:pb-8">
        <DashboardNav />
        <main id="main-content" className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
