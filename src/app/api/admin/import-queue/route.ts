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

// ─── POST /api/admin/import-queue ─────────────────────────────────────────────
// Creates a new manual import batch + queue item for admin review.

export async function POST(request: Request) {
  const authed = await requireAdmin()
  if (!authed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as Record<string, unknown>
  const admin = createAdminClient()

  const sourceUrl  = body.source_url as string | undefined
  const notes      = body.notes as string | undefined
  const payload    = body.payload as Record<string, unknown>
  const confidence = body.confidence ? Number(body.confidence) : null

  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'payload is required' }, { status: 400 })
  }

  // Create a batch for this manual import
  const { data: batch, error: batchErr } = await admin
    .from('import_batches')
    .insert({
      import_type:   'manual',
      status:        'completed',
      total_records: 1,
      notes,
      started_at:    new Date().toISOString(),
      completed_at:  new Date().toISOString(),
    })
    .select('id')
    .single()

  if (batchErr) return NextResponse.json({ error: batchErr.message }, { status: 500 })

  // Create the queue item
  const { data: queueItem, error: queueErr } = await admin
    .from('import_queue')
    .insert({
      batch_id:   batch.id,
      action:     'create',
      status:     'pending',
      payload,
      source_url: sourceUrl ?? null,
      confidence: confidence && confidence >= 1 && confidence <= 5 ? confidence : null,
    })
    .select('id')
    .single()

  if (queueErr) return NextResponse.json({ error: queueErr.message }, { status: 500 })

  // Update batch total
  await admin.from('import_batches').update({ imported: 1 }).eq('id', batch.id)

  return NextResponse.json({ id: queueItem.id, batch_id: batch.id }, { status: 201 })
}
