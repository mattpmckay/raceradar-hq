import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { TablesUpdate } from '@/types/supabase'

const VALID_GENDERS = ['male', 'female', 'non_binary', 'prefer_not_to_say'] as const

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

  const str = (key: string): string | null => {
    const v = body[key]
    return typeof v === 'string' ? v.trim() || null : null
  }

  const gender = 'gender' in body ? str('gender') : undefined
  if (gender !== undefined && gender && !(VALID_GENDERS as readonly string[]).includes(gender)) {
    return NextResponse.json({ error: 'Invalid gender value.' }, { status: 422 })
  }

  // Build update object — only include keys explicitly sent in the request body
  const updates: TablesUpdate<'profiles'> = {
    updated_at: new Date().toISOString(),
  }

  if ('first_name'        in body) updates.first_name        = str('first_name')
  if ('last_name'         in body) updates.last_name         = str('last_name')
  if ('date_of_birth'     in body) updates.date_of_birth     = str('date_of_birth')
  if ('gender'            in body) updates.gender            = gender as typeof VALID_GENDERS[number] | null
  if ('country'           in body) updates.country           = str('country')
  if ('state'             in body) updates.state             = str('state')
  if ('city'              in body) updates.city              = str('city')
  if ('profile_photo_url' in body) updates.profile_photo_url = str('profile_photo_url')

  if ('preferred_sports' in body) {
    updates.preferred_sports = Array.isArray(body.preferred_sports)
      ? (body.preferred_sports as unknown[]).filter((s): s is string => typeof s === 'string')
      : null
  }

  // Derive full_name whenever either name field is being updated
  if ('first_name' in body || 'last_name' in body) {
    const first = ('first_name' in updates ? updates.first_name : null)
    const last  = ('last_name'  in updates ? updates.last_name  : null)
    updates.full_name = [first, last].filter(Boolean).join(' ') || null
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('[PATCH /api/profile]', {
      code:    error.code,
      message: error.message,
      details: error.details,
      hint:    error.hint,
    })

    if (error.code === '42703') {
      return NextResponse.json(
        { error: 'Database schema is out of date. Please apply the pending migration.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
