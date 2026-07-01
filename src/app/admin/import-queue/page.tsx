import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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

export default async function ImportQueuePage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('import_queue')
    .select('id, action, status, source_url, confidence, created_at, payload, reviewer_notes')
    .order('created_at', { ascending: false })
    .limit(100)

  const pending = (items ?? []).filter((i) => i.status === 'pending')
  const recent  = (items ?? []).filter((i) => i.status !== 'pending').slice(0, 20)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Import Queue</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Review proposed event imports before they go live. Every change is logged in the change history.
          </p>
        </div>
        <Link href="/admin/import-queue/new" className="btn-primary text-sm">
          + New Import
        </Link>
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
            {pending.map((item) => {
              const payload = item.payload as Record<string, string | null>
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
                    </div>
                    <ImportQueueActions id={item.id} />
                  </div>

                  {/* Payload preview — key fields */}
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
          Use &ldquo;New Import&rdquo; to stage event data from official organiser sources. Every approval
          is logged in the Event Change Log. Automated scraping and API ingestion are planned for Phase 2.
        </p>
      </div>
    </div>
  )
}
