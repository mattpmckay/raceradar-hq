import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const str = (key: string) => {
    const v = body[key]
    return typeof v === 'string' ? v.trim() || null : null
  }

  const username          = str('username')
  const first_name        = str('first_name')
  const last_name         = str('last_name')
  const date_of_birth     = str('date_of_birth')
  const gender            = str('gender')
  const country           = str('country')
  const state             = str('state')
  const city              = str('city')
  const profile_photo_url = str('profile_photo_url')

  const preferred_sports = Array.isArray(body.preferred_sports)
    ? (body.preferred_sports as unknown[]).filter((s): s is string => typeof s === 'string')
    : null

  if (username && !/^[a-zA-Z0-9_]{2,30}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 2–30 characters: letters, numbers, or underscores only.' },
      { status: 422 },
    )
  }

  const VALID_GENDERS = ['male', 'female', 'non_binary', 'prefer_not_to_say']
  if (gender && !VALID_GENDERS.includes(gender)) {
    return NextResponse.json({ error: 'Invalid gender value.' }, { status: 422 })
  }

  const full_name = [first_name, last_name].filter(Boolean).join(' ') || null

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      first_name,
      last_name,
      full_name,
      date_of_birth,
      gender: gender as 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null,
      country,
      state,
      city,
      preferred_sports,
      profile_photo_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
    console.error('[PATCH /api/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
