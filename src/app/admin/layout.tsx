import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Flag, Calendar, MapPin, Trophy, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/tracks', label: 'Tracks', icon: MapPin },
  { href: '/admin/championships', label: 'Championships', icon: Trophy },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-surface-border bg-surface-card flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-surface-border px-4 font-bold text-white">
          <Flag className="h-5 w-5 text-brand-500" />
          <span>Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-surface-muted hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-border">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-surface-border flex items-center px-8">
          <span className="text-sm text-gray-400">{user.email}</span>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
