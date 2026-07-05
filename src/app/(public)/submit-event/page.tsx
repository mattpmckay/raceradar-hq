import { SubmitEventForm } from '@/components/submit/SubmitEventForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Submit Your Event | RaceRadar HQ',
  description: 'Submit your race, fitness event or track day for listing on RaceRadar HQ. Our team reviews every submission before it goes live.',
}

export default function SubmitEventPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8">
          <h1 className="page-title">Submit Your Event</h1>
          <p className="mt-3 text-ink-muted">
            Got a race, track day, or fitness event you&apos;d like listed? Fill in the details below
            and our team will review and verify the information before it goes live.
          </p>
          <p className="mt-2 text-sm text-ink-subtle">Fields marked with * are required.</p>
        </div>

        <SubmitEventForm />

      </div>
    </div>
  )
}
