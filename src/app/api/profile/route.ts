import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const full_name = ((body as Record<string, unknown>)?.full_name ?? null) as string | null
  const username  = ((body as Record<string, unknown>)?.username  ?? null) as string | null

  if (username && !/^[a-zA-Z0-9_]{2,30}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 2–30 characters and contain only letters, numbers, or underscores.' },
      { status: 422 },
    )
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: full_name?.trim() || null,
      username:  username?.trim()  || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
