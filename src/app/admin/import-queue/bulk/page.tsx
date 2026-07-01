import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BulkImportForm } from './BulkImportForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bulk Import — Admin' }

export default function BulkImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-3">
          <Link href="/admin/import-queue" className="hover:text-ink transition-colors">Import Queue</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">Bulk Import</span>
        </nav>
        <h1 className="text-2xl font-bold text-ink">Bulk Import</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Import multiple events at once from CSV or JSON. All records are staged in the Import Queue for review — nothing goes live automatically.
        </p>
      </div>

      <BulkImportForm />
    </div>
  )
}
