import { NewImportForm } from './NewImportForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Import — Admin' }

export default function NewImportPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Manual Import</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Stage an event from an official source for admin review. The event will not go live until approved.
        </p>
      </div>
      <NewImportForm />
    </div>
  )
}
