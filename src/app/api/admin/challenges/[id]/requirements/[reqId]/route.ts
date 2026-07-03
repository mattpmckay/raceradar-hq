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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; reqId: string }> }
) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: challenge_id, reqId } = await params
  const admin = createAdminClient()

  const { error } = await admin
    .from('challenge_requirements')
    .delete()
    .eq('id', reqId)
    .eq('challenge_id', challenge_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
