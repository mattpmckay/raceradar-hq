import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Contact | RaceRadar HQ' },
  description: 'Get in touch with the RaceRadar HQ team — event corrections, partnership enquiries, or general feedback.',
}

export default function ContactPage() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-xl">

        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Contact
        </h1>

        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Have a question, spotted an incorrect event listing, or interested in featuring your
          event on RaceRadar HQ? Reach out — we read every message.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-wire bg-panel p-5">
            <h2 className="text-sm font-semibold text-ink mb-1">General enquiries</h2>
            <p className="text-sm text-ink-muted">
              Email us at{' '}
              <a
                href="mailto:hello@raceradar.com.au"
                className="text-mint hover:underline"
              >
                hello@raceradar.com.au
              </a>
            </p>
          </div>

          <div className="rounded-xl border border-wire bg-panel p-5">
            <h2 className="text-sm font-semibold text-ink mb-1">Event corrections or additions</h2>
            <p className="text-sm text-ink-muted">
              If an event listing has incorrect dates, venue or entry details, email us with
              the correction and a link to the official source.
            </p>
          </div>

          <div className="rounded-xl border border-wire bg-panel p-5">
            <h2 className="text-sm font-semibold text-ink mb-1">Partnerships & sponsorship</h2>
            <p className="text-sm text-ink-muted">
              Interested in featuring your event or brand on RaceRadar HQ? Get in touch to
              discuss options.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-ink-muted">
          We aim to respond within 2 business days.
        </p>

      </div>
    </div>
  )
}
