/**
 * Seed APAC events from the CSV into Supabase.
 *
 * Prerequisites:
 *   1. Create .env.local with:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...
 *   2. Run: npx tsx scripts/seed-events.ts
 *
 * NOTE: The fastest approach is to run scripts/seed-events.sql directly
 * in the Supabase Dashboard → SQL Editor — no local setup required.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

interface CsvRow {
  id: string
  event_name: string
  sport: string
  city: string
  country: string
  start_date: string
  end_date: string
  venue: string
  registration_url: string
  format: string
  status: string
  source_verified: string
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseDate(raw: string): string | null {
  if (!raw || raw === 'TBC' || raw.includes('TBC')) return '2099-01-01'
  return raw
}

function parseCsv(raw: string): CsvRow[] {
  const lines = raw.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as unknown as CsvRow
  })
}

async function main() {
  const csvPath = join(process.cwd(), 'raceradarhq_apac_events_2026_27.csv')
  const raw     = readFileSync(csvPath, 'utf-8')
  const rows: CsvRow[] = parseCsv(raw)

  console.log(`Parsed ${rows.length} rows from CSV`)

  let inserted = 0
  let failed   = 0

  for (const row of rows) {
    const record = {
      title:        row.event_name,
      slug:         toSlug(row.event_name),
      discipline:   row.sport,
      event_type:   'race',
      city:         row.city,
      country:      row.country,
      start_date:   parseDate(row.start_date) ?? '2099-01-01',
      end_date:     parseDate(row.end_date) === '2099-01-01' ? null : parseDate(row.end_date),
      website_url:  row.registration_url || null,
      description:  row.venue && row.venue !== 'TBC' ? `Venue: ${row.venue}` : null,
      is_published: row.status !== 'completed',
      is_featured:  false,
    }

    const { error } = await supabase
      .from('events')
      .upsert(record, { onConflict: 'slug' })

    if (error) {
      console.error(`✗ ${row.event_name}: ${error.message}`)
      failed++
    } else {
      console.log(`✓ ${row.event_name}`)
      inserted++
    }
  }

  console.log(`\nDone: ${inserted} upserted, ${failed} failed`)

  // Verify
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
  console.log(`Total rows in events table: ${count}`)
}

main().catch(console.error)
