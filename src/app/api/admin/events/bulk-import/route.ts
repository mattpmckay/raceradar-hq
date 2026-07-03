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

// Required fields for each event record
const REQUIRED = ['title', 'slug', 'discipline', 'start_date', 'country'] as const

type ImportRecord = Record<string, string | number | boolean | null>

function validateRecord(rec: ImportRecord, index: number): string | null {
  for (const field of REQUIRED) {
    if (!rec[field]) return `Row ${index + 1}: missing required field "${field}"`
  }
  const date = rec.start_date as string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `Row ${index + 1}: start_date must be YYYY-MM-DD, got "${date}"`
  }
  return null
}

// ─── POST /api/admin/events/bulk-import ───────────────────────────────────────
// Accepts a JSON array of event records. Validates each, checks for duplicate
// slugs, then creates a single import batch with one queue item per record.
//
// Request body: { records: ImportRecord[], source_url?: string, notes?: string }
// Response: { batch_id, total, queued, skipped_duplicates, errors: string[] }

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as {
    records: ImportRecord[]
    source_url?: string
    notes?: string
  }

  const records    = body.records ?? []
  const sourceUrl  = body.source_url ?? null
  const notes      = body.notes ?? null

  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: 'records must be a non-empty array' }, { status: 400 })
  }

  if (records.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 records per batch' }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── Validate all records first ────────────────────────────────────────────
  const validationErrors: string[] = []
  for (let i = 0; i < records.length; i++) {
    const err = validateRecord(records[i], i)
    if (err) validationErrors.push(err)
  }
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 422 })
  }

  // ── Check for duplicate slugs in the batch itself ────────────────────────
  const slugCounts = new Map<string, number>()
  for (const rec of records) {
    const slug = String(rec.slug)
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1)
  }
  const batchDuplicates = [...slugCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
  if (batchDuplicates.length > 0) {
    return NextResponse.json({
      error: 'Duplicate slugs within batch',
      details: batchDuplicates.map((s) => `Slug "${s}" appears more than once`),
    }, { status: 422 })
  }

  // ── Check existing slugs in the events table ──────────────────────────────
  const incomingSlugs = records.map((r) => String(r.slug))
  const { data: existingEvents } = await admin
    .from('events')
    .select('slug, title')
    .in('slug', incomingSlugs)

  const existingSlugMap = new Map<string, string>()
  for (const ev of existingEvents ?? []) {
    existingSlugMap.set(ev.slug, ev.title)
  }

  // ── Potential duplicate detection: same title + same start_date ───────────
  const potentialDuplicates: string[] = []
  for (const rec of records) {
    if (existingSlugMap.has(String(rec.slug))) continue // already caught above
    const { data: titleMatches } = await admin
      .from('events')
      .select('slug, title')
      .ilike('title', `%${String(rec.title).slice(0, 40)}%`)
      .eq('start_date', String(rec.start_date))
      .limit(1)
    if (titleMatches && titleMatches.length > 0) {
      potentialDuplicates.push(
        `Row "${rec.title}" (${rec.start_date}): similar to existing event "${titleMatches[0].title}"`
      )
    }
  }

  // ── Separate records into create vs skip ──────────────────────────────────
  const toCreate  = records.filter((r) => !existingSlugMap.has(String(r.slug)))
  const toSkip    = records.filter((r) =>  existingSlugMap.has(String(r.slug)))

  if (toCreate.length === 0) {
    return NextResponse.json({
      batch_id:             null,
      total:                records.length,
      queued:               0,
      skipped_duplicates:   toSkip.length,
      potential_duplicates: potentialDuplicates,
      errors:               [],
    })
  }

  // ── Create import batch ───────────────────────────────────────────────────
  const { data: batch, error: batchErr } = await admin
    .from('import_batches')
    .insert({
      import_type:   'csv',
      status:        'completed',
      total_records: records.length,
      imported:      toCreate.length,
      skipped:       toSkip.length,
      notes,
      started_at:    new Date().toISOString(),
      completed_at:  new Date().toISOString(),
    })
    .select('id')
    .single()

  if (batchErr || !batch) {
    return NextResponse.json({ error: batchErr?.message ?? 'Failed to create batch' }, { status: 500 })
  }

  // ── Create queue items ─────────────────────────────────────────────────────
  const queueItems = toCreate.map((rec) => {
    const confidence = rec.confidence ? Number(rec.confidence) : null
    const { confidence: _c, source_url: _s, notes: _n, ...payload } = rec

    // Normalise booleans that may arrive as strings from CSV
    const normalisedPayload: ImportRecord = {}
    for (const [k, v] of Object.entries(payload)) {
      if (v === 'true')  { normalisedPayload[k] = true;  continue }
      if (v === 'false') { normalisedPayload[k] = false; continue }
      if (v === '' || v === null || v === undefined) { normalisedPayload[k] = null; continue }
      normalisedPayload[k] = v
    }

    // Default required event fields
    if (!normalisedPayload.event_type)        normalisedPayload.event_type = 'race'
    if (!normalisedPayload.event_status)      normalisedPayload.event_status = 'confirmed'
    if (normalisedPayload.is_published == null) normalisedPayload.is_published = false
    if (normalisedPayload.is_featured == null)  normalisedPayload.is_featured  = false

    return {
      batch_id:   batch.id,
      action:     'create' as const,
      status:     'pending' as const,
      payload:    normalisedPayload,
      source_url: (rec.source_url as string | null) ?? sourceUrl,
      confidence: confidence && confidence >= 1 && confidence <= 5 ? confidence : null,
    }
  })

  const { error: insertErr } = await admin.from('import_queue').insert(queueItems)
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({
    batch_id:             batch.id,
    total:                records.length,
    queued:               toCreate.length,
    skipped_duplicates:   toSkip.length,
    potential_duplicates: potentialDuplicates,
    errors:               [],
  })
}
