import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ImportQueueActions } from './ImportQueueActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Import Queue — Admin' }

const CONFIDENCE_LABEL: Record<number, string> = {
  1: '1 — Uncertain',
  2: '2 — Possible',
  3: '3 — Likely',
  4: '4 — High',
  5: '5 — Verified',
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'brand' | 'danger'> = {
  pending:  'brand',
  approved: 'success',
  rejected: 'danger',
  applied:  'success',
}

// Lightweight duplicate check: does an event with the same slug, OR the same
// title + start_date, already exist in the events table?
async function checkForDuplicates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: Record<string, string | null>,
): Promise<string | null> {
  const slug  = payload.slug
  const title = payload.title
  const date  = payload.start_date

  if (!slug && !title) return null

  if (slug) {
    const { data } = await supabase
      .from('events')
      .select('title')
      .eq('slug', slug)
      .maybeSingle()
    if (data) return `Slug "${slug}" already exists: "${data.title}"`
  }

  if (title && date) {
    const { data } = await supabase
      .from('events')
      .select('slug, title')
      .ilike('title', `%${title.slice(0, 40)}%`)
      .eq('start_date', date)
      .limit(1)
    if (data && data.length > 0) {
      return `Similar event on ${date}: "${data[0].title}" (${data[0].slug})`
    }
  }

  return null
}

export default async function ImportQueuePage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('import_queue')
    .select('id, action, status, source_url, confidence, created_at, payload, reviewer_notes')
    .order('created_at', { ascending: false })
    .limit(100)

  const pending = (items ?? []).filter((i) => i.status === 'pending')
  const recent  = (items ?? []).filter((i) => i.status !== 'pending').slice(0, 20)

  // Run duplicate checks on all pending items in parallel
  const duplicateWarnings = await Promise.all(
    pending.map((item) =>
      checkForDuplicates(supabase, item.payload as Record<string, string | null>)
    )
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Import Queue</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Review proposed event imports before they go live. Every change is logged in the change history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/import-queue/bulk" className="btn-secondary text-sm">
            Bulk Import
          </Link>
          <Link href="/admin/import-queue/new" className="btn-primary text-sm">
            + New Import
          </Link>
        </div>
      </div>

      {/* Pending items */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Pending Review{pending.length > 0 && ` (${pending.length})`}
        </h2>

        {pending.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-sm text-ink-muted">No items pending review.</p>
            <Link href="/admin/import-queue/new" className="mt-3 inline-block text-sm text-mint hover:underline">
              Create a new import →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((item, idx) => {
              const payload     = item.payload as Record<string, string | null>
              const dupWarning  = duplicateWarnings[idx]
              return (
                <div key={item.id} className="card space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="brand">{item.action}</Badge>
                        {item.confidence != null && (
                          <span className="text-xs text-ink-muted">
                            {CONFIDENCE_LABEL[item.confidence] ?? `Confidence ${item.confidence}`}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-ink truncate">
                        {payload.title ?? '(untitled)'}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {[payload.discipline, payload.city, payload.country].filter(Boolean).join(' · ')}
                        {payload.start_date && ` · ${payload.start_date}`}
                      </p>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-xs text-mint hover:underline"
                        >
                          {item.source_url}
                        </a>
                      )}

                      {/* Duplicate warning */}
                      {dupWarning && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-yellow-500/30 bg-yellow-500/8 px-2.5 py-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-400 mt-0.5" />
                          <p className="text-xs text-yellow-400">
                            <strong>Potential duplicate:</strong> {dupWarning}
                          </p>
                        </div>
                      )}
                    </div>
                    <ImportQueueActions id={item.id} hasDuplicateWarning={!!dupWarning} />
                  </div>

                  {/* Payload preview */}
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-ink-muted hover:text-ink">
                      View full payload
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-canvas p-3 text-xs text-ink-muted leading-relaxed">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent history */}
      {recent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Recent History
          </h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wire text-left text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wire">
                {recent.map((item) => {
                  const payload = item.payload as Record<string, string | null>
                  return (
                    <tr key={item.id} className="hover:bg-panel-raised/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">
                        {payload.title ?? '(untitled)'}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{item.action}</td>
                      <td className="px-4 py-3">
                        <Badge variant={(STATUS_VARIANT[item.status] ?? 'default') as 'default' | 'success' | 'brand' | 'danger'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-muted text-xs">
                        {new Date(item.created_at).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Context box */}
      <div className="rounded-lg border border-wire/50 bg-panel p-4 text-xs text-ink-muted space-y-1">
        <p className="font-semibold text-ink-muted">Phase 1 — Manual Import Workflow</p>
        <p>
          Use &ldquo;New Import&rdquo; to stage a single event, or &ldquo;Bulk Import&rdquo; for CSV/JSON batches.
          Every approval is logged in the Event Change Log. Automated scraping and API ingestion are planned for Phase 2.
        </p>
      </div>
    </div>
  )
}
