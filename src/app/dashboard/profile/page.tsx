import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile — RaceRadar HQ' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, first_name, last_name, date_of_birth, gender, country, state, city, preferred_sports, profile_photo_url, avatar_url, role, created_at, updated_at')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your personal details and preferences.</p>
      </div>

      <ProfileForm
        profile={profile ?? null}
        email={user!.email ?? ''}
      />
    </div>
  )
}
