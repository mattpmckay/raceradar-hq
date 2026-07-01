import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'How to Choose Your First Fitness Race | RaceRadar HQ' },
  description:
    'Not sure whether to enter a HYROX, Spartan Race, marathon or CrossFit throwdown? This guide walks through fitness level, time commitment, cost and environment so you can pick the right first race.',
  openGraph: {
    title: 'How to Choose Your First Fitness Race | RaceRadar HQ',
    description:
      'A practical guide to choosing your first fitness event — comparing HYROX, Spartan Race, Ironman, Marathon, CrossFit and Trail Running across training requirements, cost and experience.',
  },
}

export default function HowToChooseYourFirstRacePage() {
  return (
    <div className="container-page py-10">

      {/* Back */}
      <Link href="/guides" className="btn-ghost mb-6 inline-flex px-0 text-ink-muted">
        <ArrowLeft className="h-4 w-4" /> Back to Guides
      </Link>

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Getting Started</span>
          <span className="text-ink-muted">·</span>
          <span className="text-xs text-ink-muted">6 min read</span>
        </div>
        <h1 className="page-title">How to Choose Your First Fitness Race</h1>
        <p className="mt-4 text-ink-muted text-lg leading-relaxed">
          There are more fitness events than ever across Asia Pacific — which is great news, but it
          makes picking your first one harder. This guide cuts through the noise so you can register
          with confidence.
        </p>
      </div>

      <div className="max-w-2xl space-y-10">

        {/* Step 1 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            1. Be honest about your current fitness
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-4">
            Your starting point determines how long you need to prepare — and which events are
            realistic in that window. Answer these questions honestly:
          </p>
          <ul className="space-y-3">
            {[
              { q: 'How many days a week are you currently training?', note: 'Less than 2 days → start with a shorter, lower-intensity event. 3–5 days → most events are achievable with proper preparation.' },
              { q: 'What is your current running base?', note: 'If you can comfortably run 5 km, a HYROX or Spartan Sprint is accessible. If you can\'t yet run 5 km continuously, a marathon is not a 12-week project.' },
              { q: 'Do you train in a gym regularly?', note: 'Gym-based athletes adapt quickly to HYROX, Deka Fit and CrossFit throwdowns. Pure runners may need to build strength before OCR or functional fitness events.' },
            ].map(({ q, note }) => (
              <li key={q} className="rounded-xl border border-wire bg-panel p-4 text-sm space-y-1">
                <div className="font-semibold text-ink">{q}</div>
                <div className="text-ink-muted">{note}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            2. How much time do you have to prepare?
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { window: 'Under 8 weeks', best: 'HYROX (if you already train), a 10 km road race, or a local CrossFit throwdown scaled division.' },
              { window: '2–4 months', best: 'Spartan Sprint, HYROX, half marathon (if you have a running base), or Tough Mudder.' },
              { window: '4–6 months', best: 'Spartan Super, full marathon (if current running base is 20+ km/week), Deka Fit.' },
              { window: '6–12 months', best: 'Any event — including Spartan Beast, Ironman 70.3 and ultra-trail events. Build methodically.' },
              { window: '12+ months', best: 'Full IRONMAN or 100 km trail ultras. These require sustained commitment — one disciplined year is realistic for most athletes.' },
            ].map(({ window, best }) => (
              <div key={window} className="flex gap-4 rounded-xl border border-wire bg-panel p-4">
                <div className="text-mint font-semibold shrink-0 w-28">{window}</div>
                <div className="text-ink-muted">{best}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 3 — Comparison table */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            3. Compare the disciplines
          </h2>
          <p className="text-ink-muted text-sm mb-5">
            Here is a quick reference across the major fitness disciplines available in Asia Pacific.
          </p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-wire">
                  {['Discipline', 'Race time', 'Training focus', 'Cost (entry)', 'Best for'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4 first:pl-4 sm:first:pl-0 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-wire">
                {[
                  { name: 'HYROX',         time: '45–90 min',   training: 'Gym + running',       cost: '$120–$200', for: 'Gym athletes wanting a race format' },
                  { name: 'CrossFit',       time: '1–3 hrs',     training: 'CrossFit box',        cost: '$60–$150',  for: 'CrossFit members, community events' },
                  { name: 'Deka Fit',       time: '45–75 min',   training: 'Gym + running',       cost: '$80–$150',  for: 'HYROX fans, indoor athletes' },
                  { name: 'Spartan Sprint', time: '1.5–2.5 hrs', training: 'Running + strength',  cost: '$80–$140',  for: 'First-time OCR racers' },
                  { name: 'Tough Mudder',   time: '2–3 hrs',     training: 'Running + basic gym', cost: '$90–$160',  for: 'Groups, fun-focused first-timers' },
                  { name: 'Half marathon',  time: '1.5–3 hrs',   training: 'Running',             cost: '$50–$100',  for: 'Runners wanting a first race' },
                  { name: 'Marathon',       time: '3–6 hrs',     training: 'High running volume', cost: '$80–$200',  for: 'Committed runners, 4–6 month prep' },
                  { name: 'Trail run 25K',  time: '2–4 hrs',     training: 'Trail running',       cost: '$80–$150',  for: 'Hikers, road runners going off-road' },
                  { name: 'Ironman 70.3',   time: '4–8 hrs',     training: 'Swim, bike, run',     cost: '$250–$450', for: 'Multi-sport athletes, 6+ months prep' },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-panel/50 transition-colors">
                    <td className="py-3 pr-4 pl-4 sm:pl-0 font-medium text-ink">{row.name}</td>
                    <td className="py-3 pr-4 text-ink-muted whitespace-nowrap">{row.time}</td>
                    <td className="py-3 pr-4 text-ink-muted">{row.training}</td>
                    <td className="py-3 pr-4 text-ink-muted whitespace-nowrap">{row.cost}</td>
                    <td className="py-3 text-ink-muted">{row.for}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Step 4 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            4. What environment suits you?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            {[
              { type: 'Indoor', events: 'HYROX, CrossFit, Deka Fit', note: 'Controlled environment, spectator-friendly, no weather risk. Great for first-timers who want predictability.' },
              { type: 'Outdoor road', events: 'Marathon, Road Racing', note: 'Urban courses, large crowds, flat terrain. High spectator energy at major events.' },
              { type: 'Outdoor off-road', events: 'Spartan Race, Tough Mudder, Trail Running', note: 'Natural terrain, elevation, mud and weather. More adventure, less predictability.' },
            ].map(({ type, events, note }) => (
              <div key={type} className="card space-y-2">
                <div className="font-semibold text-ink">{type}</div>
                <div className="text-mint text-xs">{events}</div>
                <div className="text-ink-muted text-xs leading-relaxed">{note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 5 — Decision guide */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            5. A quick decision guide
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { if: 'You train in a gym 3+ days a week', then: '→ Start with HYROX or a local CrossFit throwdown.' },
              { if: 'You run 3+ times a week but rarely lift', then: '→ A half marathon or marathon is your natural first race.' },
              { if: 'You want something with friends or groups', then: '→ Tough Mudder is built for teams; register together.' },
              { if: 'You want challenge but with a safety net', then: '→ Spartan Sprint has penalty burpees but is genuinely beginner-friendly.' },
              { if: 'You already swim, bike and run', then: '→ Enter an Ironman 70.3 — the 12-week window to your first is achievable.' },
              { if: 'You want the most intense experience', then: '→ Work toward a Spartan Beast or ultra-trail event with 6–12 months of structured preparation.' },
            ].map(({ if: condition, then: action }) => (
              <div key={condition} className="rounded-xl border border-wire bg-panel p-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="text-ink-muted sm:flex-1">{condition}</div>
                <div className="text-mint font-medium sm:text-right">{action}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-ink-muted text-sm">
            One practical rule: register for an event that is slightly beyond your current comfort zone, but not
            so far that the training itself becomes unsustainable. A race you finish is better than a race you
            enter and withdraw from.
          </p>
        </section>

        {/* Final tip */}
        <section className="rounded-2xl border border-mint/20 bg-mint/5 p-6 text-sm">
          <h3 className="font-semibold text-ink mb-2">One more thing: register early</h3>
          <p className="text-ink-muted leading-relaxed">
            Popular APAC events — HYROX, Spartan Trifecta weekends, the Sydney Marathon, Ironman 70.3 Sunshine Coast — sell out months in advance.
            Once you&apos;ve picked your discipline, browse the calendar and lock in your entry. The registration deadline
            is a powerful training motivator.
          </p>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-wire bg-panel p-8 text-center">
          <h2 className="text-lg font-bold text-ink">Find your first race</h2>
          <p className="mt-2 text-ink-muted text-sm max-w-sm mx-auto">
            Browse upcoming events across Asia Pacific — filter by discipline, country or date to find the right fit.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/events" className="btn-primary inline-flex">
              Browse events
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sports" className="btn-secondary inline-flex">
              Explore event types
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
