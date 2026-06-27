import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | RaceRadar HQ' },
  description: 'Terms of Service for RaceRadar HQ.',
}

export default function TermsPage() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">

        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: June 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-muted">

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">1. Acceptance of terms</h2>
            <p>
              By accessing or using RaceRadar HQ (&quot;the site&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">2. Event information accuracy</h2>
            <p>
              RaceRadar HQ aggregates event information from public sources and event organisers.
              While we aim to keep listings accurate and up-to-date, event dates, venues, entry
              fees and categories may change without notice. Always verify details on the official
              event organiser&apos;s website before registering or making travel arrangements.
            </p>
            <p className="mt-2">
              We accept no liability for loss or inconvenience arising from inaccurate event
              information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">3. Third-party links</h2>
            <p>
              The site contains links to external registration pages and event organiser websites.
              These are provided for convenience and we have no control over, and accept no
              responsibility for, the content or practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">4. Intellectual property</h2>
            <p>
              All original content on RaceRadar HQ (editorial copy, site design, code) is owned by
              RaceRadar HQ. Event names, logos and trademarks belong to their respective owners.
              Do not reproduce site content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">5. Disclaimer of warranties</h2>
            <p>
              The site is provided &quot;as is&quot; without warranty of any kind. We do not
              warrant that the site will be available at all times, error-free, or that information
              will be current or complete.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">6. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, RaceRadar HQ and its operators shall not be
              liable for any indirect, incidental, special or consequential damages arising from
              your use of the site or reliance on information published on it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">7. Governing law</h2>
            <p>
              These terms are governed by the laws of New South Wales, Australia. Any disputes
              will be subject to the exclusive jurisdiction of the courts of New South Wales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">8. Changes to these terms</h2>
            <p>
              We may update these terms at any time. The &quot;last updated&quot; date at the top
              reflects the most recent revision. Continued use of the site constitutes acceptance
              of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">9. Contact</h2>
            <p>
              Questions about these terms?{' '}
              <a href="mailto:hello@raceradar.com.au" className="text-mint hover:underline">
                hello@raceradar.com.au
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
