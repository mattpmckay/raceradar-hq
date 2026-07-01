'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react'

// Expected CSV columns (order must match this list)
const CSV_HEADERS = [
  'title', 'slug', 'discipline', 'start_date', 'end_date',
  'country', 'region', 'city', 'venue_name', 'organiser', 'series_slug',
  'website_url', 'registration_url',
  'entry_fee_from', 'entry_fee_to', 'entry_fee_currency', 'surface_type',
  'description', 'source_url', 'confidence',
]

const EXAMPLE_CSV = `title,slug,discipline,start_date,end_date,country,region,city,venue_name,organiser,series_slug,website_url,registration_url,entry_fee_from,entry_fee_to,entry_fee_currency,surface_type,description,source_url,confidence
"Example Marathon 2026","example-marathon-2026","Marathon","2026-08-02","","Australia","QLD","Brisbane","South Bank Parklands","Example Events","","https://example.com","https://example.com/enter",75,145,"AUD","road","A great marathon event.","https://example.com",3`

type ImportRecord = Record<string, string | number | boolean | null>

type ParseResult = { records: ImportRecord[]; errors: string[] }

function parseCSV(text: string): ParseResult {
  const lines  = text.trim().split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { records: [], errors: ['CSV must have a header row and at least one data row'] }

  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
  const records: ImportRecord[] = []
  const errors:  string[]       = []

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV split that handles quoted fields with commas inside
    const values = splitCSVLine(lines[i])
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: expected ${headers.length} columns, got ${values.length}`)
      continue
    }
    const record: ImportRecord = {}
    for (let j = 0; j < headers.length; j++) {
      const val = values[j]?.trim() ?? ''
      record[headers[j]] = val === '' ? null : val
    }
    records.push(record)
  }

  return { records, errors }
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

type SubmitResult = {
  batch_id: string | null
  total: number
  queued: number
  skipped_duplicates: number
  potential_duplicates: string[]
  errors: string[]
}

export function BulkImportForm() {
  const router = useRouter()
  const [input,   setInput]   = useState('')
  const [tab,     setTab]     = useState<'csv' | 'json'>('csv')
  const [parsed,  setParsed]  = useState<ImportRecord[] | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [notes,   setNotes]   = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result,  setResult]  = useState<SubmitResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleParse = useCallback(() => {
    setResult(null)
    setApiError(null)
    if (!input.trim()) { setParseErrors(['Paste data first']); setParsed(null); return }

    if (tab === 'csv') {
      const { records, errors } = parseCSV(input)
      setParseErrors(errors)
      setParsed(errors.length === 0 ? records : null)
    } else {
      try {
        const data = JSON.parse(input) as unknown
        if (!Array.isArray(data)) { setParseErrors(['JSON must be an array of objects']); setParsed(null); return }
        setParseErrors([])
        setParsed(data as ImportRecord[])
      } catch (e) {
        setParseErrors([`JSON parse error: ${e instanceof Error ? e.message : String(e)}`])
        setParsed(null)
      }
    }
  }, [input, tab])

  async function handleSubmit() {
    if (!parsed || parsed.length === 0) return
    setSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch('/api/admin/events/bulk-import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          records:    parsed,
          source_url: sourceUrl.trim() || null,
          notes:      notes.trim() || null,
        }),
      })
      const data = await res.json() as SubmitResult & { error?: string; details?: string[] }

      if (!res.ok) {
        setApiError(data.error ?? 'Import failed')
        if (data.details) setParseErrors(data.details)
        return
      }

      setResult(data)
      if (data.queued > 0) {
        setTimeout(() => router.push('/admin/import-queue'), 1800)
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Format selector */}
      <div className="flex gap-1 rounded-lg border border-wire bg-panel p-1 w-fit">
        {(['csv', 'json'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setParsed(null); setParseErrors([]); setInput('') }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-mint text-canvas' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-wire/50 bg-panel p-4 text-xs text-ink-muted space-y-2">
        {tab === 'csv' ? (
          <>
            <p className="font-semibold text-ink-muted">CSV Format</p>
            <p>First row must be a header row. Required columns: <code className="text-mint">title, slug, discipline, start_date, country</code></p>
            <p>Optional columns: <code className="text-ink-muted">{CSV_HEADERS.filter((h) => !['title','slug','discipline','start_date','country'].includes(h)).join(', ')}</code></p>
            <details className="mt-1">
              <summary className="cursor-pointer hover:text-ink">View example CSV →</summary>
              <pre className="mt-2 overflow-x-auto rounded bg-canvas p-2 text-xs leading-relaxed">{EXAMPLE_CSV}</pre>
            </details>
          </>
        ) : (
          <>
            <p className="font-semibold text-ink-muted">JSON Format</p>
            <p>Paste a JSON array of event objects. Each object must include: <code className="text-mint">title, slug, discipline, start_date, country</code></p>
            <p>All other event fields are optional. Booleans should be <code className="text-ink-muted">true</code>/<code className="text-ink-muted">false</code>, not strings.</p>
          </>
        )}
      </div>

      {/* Source provenance */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Batch Provenance</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Source URL (applies to all records unless overridden per-row)</span>
            <input
              type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
              className="form-input" placeholder="https://www.goldcoastmarathon.com.au/2026/"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-ink-muted">Batch Notes</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              className="form-input" placeholder="Sourced from official event calendars, July 2026" />
          </label>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-ink-muted">
          {tab === 'csv' ? 'Paste CSV data' : 'Paste JSON array'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          className="form-input w-full resize-y font-mono text-xs leading-relaxed"
          placeholder={tab === 'csv' ? 'title,slug,discipline,...\nEvent Name 2026,event-name-2026,Marathon,...' : '[\n  { "title": "...", "slug": "...", ... }\n]'}
          spellCheck={false}
        />
      </div>

      {/* Parse button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleParse}
          className="rounded-lg border border-wire px-5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-wire-bright hover:text-ink"
        >
          Preview ({input.split('\n').filter(Boolean).length} lines)
        </button>
        {parsed && (
          <span className="text-sm text-ink-muted">
            {parsed.length} record{parsed.length !== 1 ? 's' : ''} parsed — ready to import
          </span>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-1">
          <p className="text-sm font-medium text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Parse errors
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-red-400/80">
            {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Preview table */}
      {parsed && parsed.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-wire flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Preview — {parsed.length} records</p>
            <span className="text-xs text-ink-muted">Showing first 10</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-wire text-left text-ink-muted">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Discipline</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 font-medium">Conf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wire">
                {parsed.slice(0, 10).map((rec, i) => (
                  <tr key={i} className="hover:bg-panel-raised/30">
                    <td className="px-3 py-2 text-ink-muted">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-ink max-w-[200px] truncate">{String(rec.title ?? '')}</td>
                    <td className="px-3 py-2 font-mono text-ink-muted max-w-[160px] truncate">{String(rec.slug ?? '')}</td>
                    <td className="px-3 py-2 text-ink-muted">{String(rec.discipline ?? '')}</td>
                    <td className="px-3 py-2 text-ink-muted">{String(rec.start_date ?? '')}</td>
                    <td className="px-3 py-2 text-ink-muted">{[rec.city, rec.country].filter(Boolean).join(', ')}</td>
                    <td className="px-3 py-2 text-ink-muted">{rec.confidence ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.length > 10 && (
            <p className="px-4 py-2 text-xs text-ink-muted border-t border-wire">
              + {parsed.length - 10} more records not shown
            </p>
          )}
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="rounded-lg border border-mint/30 bg-mint/5 p-4 space-y-3">
          <p className="text-sm font-medium text-mint flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Import batch created
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-wire bg-panel px-3 py-2">
              <p className="text-lg font-bold text-ink">{result.queued}</p>
              <p className="text-xs text-ink-muted">Queued for review</p>
            </div>
            <div className="rounded-lg border border-wire bg-panel px-3 py-2">
              <p className="text-lg font-bold text-ink">{result.skipped_duplicates}</p>
              <p className="text-xs text-ink-muted">Skipped (slug exists)</p>
            </div>
            <div className="rounded-lg border border-wire bg-panel px-3 py-2">
              <p className="text-lg font-bold text-ink">{result.total}</p>
              <p className="text-xs text-ink-muted">Total records</p>
            </div>
          </div>
          {result.potential_duplicates.length > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <p className="text-xs font-medium text-yellow-400 flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {result.potential_duplicates.length} potential duplicate{result.potential_duplicates.length !== 1 ? 's' : ''} — review carefully before approving
              </p>
              <ul className="space-y-0.5 text-xs text-yellow-400/80">
                {result.potential_duplicates.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-ink-muted">Redirecting to Import Queue…</p>
        </div>
      )}

      {/* Submit */}
      {parsed && parsed.length > 0 && !result && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {submitting ? 'Importing…' : `Import ${parsed.length} Record${parsed.length !== 1 ? 's' : ''}`}
          </button>
          <p className="text-xs text-ink-muted">Records will be added to the Import Queue for review. Nothing goes live automatically.</p>
        </div>
      )}
    </div>
  )
}
