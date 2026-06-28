import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile — RaceRadar HQ' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-ink-muted">Update your display name and username.</p>
      </div>

      <ProfileForm
        initialFullName={profile?.full_name ?? null}
        initialUsername={profile?.username ?? null}
        email={user!.email ?? ''}
      />
    </div>
  )
}
