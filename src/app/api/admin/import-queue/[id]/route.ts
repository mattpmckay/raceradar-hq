import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const DEV_BYPASS = process.env.DEV_ADMIN_BYPASS === 'true'

async function requireAdmin() {
  if (DEV_BYPASS) return { id: 'dev' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

// ─── POST /api/admin/import-queue/[id]/approve ────────────────────────────────
// Applies the queue item payload to create or update an event.
// Logs every changed field in event_change_log.

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body   = await request.json() as { action: 'approve' | 'reject'; reviewer_notes?: string }
  const admin  = await createAdminClient()

  // Fetch the queue item
  const { data: item, error: fetchErr } = await admin
    .from('import_queue')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
  if (item.status !== 'pending') {
    return NextResponse.json({ error: `Item is already ${item.status}` }, { status: 409 })
  }

  if (body.action === 'reject') {
    await admin.from('import_queue').update({
      status:         'rejected',
      reviewer_notes: body.reviewer_notes ?? null,
      reviewed_at:    new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ status: 'rejected' })
  }

  // ── Approve: create or update the event ──────────────────────────────────────

  const payload = item.payload as Record<string, unknown>

  // Mark approved before applying (so partial failure is visible)
  await admin.from('import_queue').update({
    status:         'approved',
    reviewer_notes: body.reviewer_notes ?? null,
    reviewed_at:    new Date().toISOString(),
  }).eq('id', id)

  let eventId: string

  if (item.action === 'create') {
    // Insert a new event
    const { data: newEvent, error: insertErr } = await admin
      .from('events')
      .insert(payload as never)
      .select('id')
      .single()

    if (insertErr) {
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'An event with that slug already exists.' }, { status: 409 })
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    eventId = newEvent.id

    // Log each non-null field as a new value (old_value = null)
    const logEntries = Object.entries(payload)
      .filter(([, v]) => v != null && v !== '')
      .map(([field, value]) => ({
        event_id:        eventId,
        changed_by:      'id' in user && user.id !== 'dev' ? user.id : null,
        change_source:   'import_queue' as const,
        import_queue_id: id,
        field_name:      field,
        old_value:       null,
        new_value:       String(value),
        source_url:      item.source_url,
        confidence:      item.confidence,
      }))

    if (logEntries.length > 0) {
      await admin.from('event_change_log').insert(logEntries)
    }

  } else if (item.action === 'update' && item.matched_event_id) {
    eventId = item.matched_event_id

    // Fetch existing event to build diff
    const { data: existing } = await admin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    const { error: updateErr } = await admin
      .from('events')
      .update(payload as never)
      .eq('id', eventId)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Log changed fields
    if (existing) {
      const existingRecord = existing as Record<string, unknown>
      const logEntries = Object.entries(payload)
        .filter(([field, newVal]) => {
          const oldVal = existingRecord[field]
          return String(oldVal ?? '') !== String(newVal ?? '')
        })
        .map(([field, newVal]) => ({
          event_id:        eventId,
          changed_by:      'id' in user && user.id !== 'dev' ? user.id : null,
          change_source:   'import_queue' as const,
          import_queue_id: id,
          field_name:      field,
          old_value:       String(existingRecord[field] ?? ''),
          new_value:       String(newVal ?? ''),
          source_url:      item.source_url,
          confidence:      item.confidence,
        }))

      if (logEntries.length > 0) {
        await admin.from('event_change_log').insert(logEntries)
      }
    }
  } else {
    return NextResponse.json({ error: 'Invalid action type for this item' }, { status: 400 })
  }

  // Mark as fully applied
  await admin.from('import_queue').update({ status: 'applied' }).eq('id', id)

  return NextResponse.json({ status: 'applied', event_id: eventId })
}
