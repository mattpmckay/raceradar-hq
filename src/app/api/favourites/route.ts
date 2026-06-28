import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const raw_type  = (body as Record<string, unknown>)?.entity_type
  const entity_id = (body as Record<string, unknown>)?.entity_id as string | undefined

  const VALID_TYPES = ['event', 'track', 'championship'] as const
  type EntityType = typeof VALID_TYPES[number]

  if (!raw_type || !VALID_TYPES.includes(raw_type as EntityType) || !entity_id) {
    return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
  }

  const entity_type = raw_type as EntityType

  const { data: existing } = await supabase
    .from('favourites')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .single()

  if (existing) {
    await supabase.from('favourites').delete().eq('id', existing.id)
    return NextResponse.json({ saved: false })
  }

  await supabase.from('favourites').insert({ user_id: user.id, entity_type, entity_id })
  return NextResponse.json({ saved: true })
}
