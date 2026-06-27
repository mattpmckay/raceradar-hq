import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | RaceRadar HQ' },
  description: 'Privacy Policy for RaceRadar HQ — how we collect, use and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">

        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: June 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-muted">

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">1. Who we are</h2>
            <p>
              RaceRadar HQ (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a fitness events
              discovery platform covering Asia Pacific. Our website is located at{' '}
              <span className="text-ink">raceradar.com.au</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">2. Information we collect</h2>
            <ul className="space-y-2">
              <li>
                <span className="text-ink font-medium">Email address</span> — when you subscribe to
                our newsletter or events calendar via the sign-up form.
              </li>
              <li>
                <span className="text-ink font-medium">Account information</span> — if you create an
                account (name, email address, password hash). Passwords are never stored in plain text.
              </li>
              <li>
                <span className="text-ink font-medium">Usage data</span> — standard web server logs
                (IP address, browser type, pages visited, referrer). We do not run advertising
                trackers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">3. How we use your information</h2>
            <ul className="space-y-2">
              <li>To send you the RaceRadar HQ newsletter and events calendar (email subscribers only).</li>
              <li>To provide and maintain your account and saved favourites.</li>
              <li>To improve the platform based on usage patterns.</li>
              <li>We do not sell your personal information to third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">4. Third-party services</h2>
            <ul className="space-y-2">
              <li>
                <span className="text-ink font-medium">Supabase</span> — database and authentication
                provider. Your account data and saved events are stored on Supabase infrastructure.
                See{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
                  supabase.com/privacy
                </a>.
              </li>
              <li>
                <span className="text-ink font-medium">Beehiiv</span> — email newsletter platform.
                If you subscribe to our newsletter, your email is stored with Beehiiv. You can
                unsubscribe at any time via the link in any email. See{' '}
                <a href="https://www.beehiiv.com/privacy" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
                  beehiiv.com/privacy
                </a>.
              </li>
              <li>
                <span className="text-ink font-medium">Vercel</span> — hosting provider. See{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
                  vercel.com/legal/privacy-policy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">5. Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting us at{' '}
              <a href="mailto:hello@raceradar.com.au" className="text-mint hover:underline">
                hello@raceradar.com.au
              </a>
              . Newsletter subscribers can also unsubscribe via the link at the bottom of any email.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">6. Cookies</h2>
            <p>
              We use session cookies for authentication (if you are logged in). We do not use
              advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">7. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The &quot;last updated&quot; date at the
              top of this page reflects the most recent revision. Continued use of the site after
              changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-3">8. Contact</h2>
            <p>
              Questions about this policy?{' '}
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
