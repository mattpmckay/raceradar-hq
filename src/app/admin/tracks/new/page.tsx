import { TrackForm } from '@/components/admin/TrackForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Track — Admin' }

export default function NewTrackPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Track</h1>
        <p className="mt-1 text-sm text-ink-muted">Add a circuit or venue to the tracks directory.</p>
      </div>

      <TrackForm />
    </div>
  )
}
