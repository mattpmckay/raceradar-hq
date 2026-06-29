import { createClient } from '@/lib/supabase/server'
import { Header } from './Header'
import { Footer } from './Footer'
import type { HeaderUser } from './Header'

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let headerUser: HeaderUser | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, full_name, profile_photo_url, avatar_url')
      .eq('id', user.id)
      .single()

    const first = profile?.first_name ?? profile?.full_name?.trim().split(' ')[0] ?? ''
    const last  = profile?.last_name  ?? ''

    headerUser = {
      displayName: [first, last].filter(Boolean).join(' ') || (user.email ?? ''),
      initials:    [first[0], last[0]].filter(Boolean).join('').toUpperCase() || (user.email?.[0]?.toUpperCase() ?? '?'),
      photoUrl:    profile?.profile_photo_url ?? profile?.avatar_url ?? null,
      email:       user.email ?? '',
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={headerUser} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
