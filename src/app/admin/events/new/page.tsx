import { EventForm } from '@/components/admin/EventForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Event — Admin' }

export default function NewEventPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Event</h1>
        <p className="mt-1 text-sm text-ink-muted">Add a new race, track day, or fitness event.</p>
      </div>
      <EventForm />
    </div>
  )
}
