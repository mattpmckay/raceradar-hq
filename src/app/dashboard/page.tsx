import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Heart, Trophy } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user!.id)
    .single()

  const { count: favouriteCount } = await supabase
    .from('favourites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const displayName = profile?.full_name ?? profile?.username ?? user!.email

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back{displayName ? `, ${displayName}` : ''}.</h1>
        <p className="mt-1 text-gray-400">Here&apos;s your event overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Heart, label: 'Saved Favourites', value: favouriteCount ?? 0, href: '/dashboard/favourites' },
          { icon: Calendar, label: 'Upcoming Events', value: '—', href: '/events' },
          { icon: Trophy, label: 'Series', value: '—', href: '/championships' },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="card hover:border-brand-500/50 transition-colors">
            <Icon className="h-5 w-5 text-brand-500 mb-3" />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/events" className="btn-secondary text-sm">Browse Events</Link>
          <Link href="/tracks" className="btn-secondary text-sm">Browse Venues</Link>
          <Link href="/championships" className="btn-secondary text-sm">Series</Link>
        </div>
      </div>
    </div>
  )
}
