import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

async function requireAdmin() {
  if (DEV_BYPASS) return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

function str(v: unknown): string | null {
  const s = v as string
  return s && s.trim() ? s.trim() : null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: challenge_id } = await params
  const body  = await request.json() as Record<string, unknown>
  const admin = createAdminClient()

  const title = str(body.title)
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const { data, error } = await admin
    .from('challenge_titles')
    .upsert(
      { challenge_id, title, description: str(body.description) },
      { onConflict: 'challenge_id' }
    )
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: challenge_id } = await params
  const admin = createAdminClient()

  const { error } = await admin
    .from('challenge_titles')
    .delete()
    .eq('challenge_id', challenge_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
