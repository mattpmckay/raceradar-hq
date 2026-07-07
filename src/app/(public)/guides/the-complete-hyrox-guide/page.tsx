import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'The Complete HYROX Guide 2026 | RaceRadar HQ' },
  description:
    'Everything about HYROX in one place: the race format, all 8 workout stations, categories, how to train, and what to expect on race day. The definitive guide for first-timers and returning athletes.',
  openGraph: {
    title: 'The Complete HYROX Guide 2026 | RaceRadar HQ',
    description:
      'Race format, every station explained, categories, training approach and race day tips — the complete guide to HYROX for athletes across Asia Pacific.',
  },
}

export default function CompleteHyroxGuidePage() {
  return (
    <div className="container-page py-10">

      {/* Back */}
      <Link href="/guides" className="btn-ghost mb-6 inline-flex px-0 text-ink-muted">
        <ArrowLeft className="h-4 w-4" /> Back to Guides
      </Link>

      {/* Header */}
      <div className="mb-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Discipline Guide</span>
          <span className="text-ink-muted">·</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00D9A6' }}>HYROX</span>
          <span className="text-ink-muted">·</span>
          <span className="text-xs text-ink-muted">12 min read</span>
        </div>
        <h1 className="page-title">The Complete HYROX Guide</h1>
        <p className="mt-4 text-ink-muted text-lg leading-relaxed">
          HYROX is the world&apos;s fastest-growing fitness race — and it&apos;s genuinely unlike anything
          else in the events calendar. This guide covers everything: the format, every station,
          how categories work, how to train, and what to expect when you walk into the venue.
        </p>
      </div>

      <div className="max-w-2xl space-y-10">

        {/* What is HYROX */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            What is HYROX?
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-4">
            HYROX is a standardised fitness race held in large indoor arenas worldwide. Created in
            Germany in 2017, it has rapidly expanded across Europe, North America, and Asia Pacific.
            Every HYROX event worldwide runs the same format — same distances, same weights, same
            order of stations — so your time in Sydney is directly comparable to a finish in Singapore,
            Tokyo or London.
          </p>
          <p className="text-ink-muted text-sm leading-relaxed mb-4">
            The format is simple to explain but demanding to execute: you run 1 km, complete a
            functional workout station, run another 1 km, complete the next station — and repeat
            eight times until you cross the finish line. Total distance: 8 km of running and 8
            workout stations.
          </p>
          <p className="text-ink-muted text-sm leading-relaxed">
            What makes it compelling is the repeatability. Finish times range from under 60 minutes
            for elite pro athletes to 2.5 hours for well-prepared first-timers. Everyone competes
            in the same arena, on the same track, against the same clock.
          </p>
        </section>

        {/* Race format */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            The race format
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5">
            The race is structured in nine blocks. Each block begins with a 1 km run around the
            arena floor, immediately followed by a workout station. The sequence never changes.
          </p>
          <div className="rounded-2xl border border-wire bg-panel p-5 text-sm space-y-2 mb-5">
            <div className="font-semibold text-ink mb-3">Race structure at a glance</div>
            {[
              'Run 1 km → Station 1: SkiErg',
              'Run 1 km → Station 2: Sled Push',
              'Run 1 km → Station 3: Sled Pull',
              'Run 1 km → Station 4: Burpee Broad Jump',
              'Run 1 km → Station 5: Rowing',
              'Run 1 km → Station 6: Farmer\'s Carry',
              'Run 1 km → Station 7: Sandbag Lunges',
              'Run 1 km → Station 8: Wall Balls',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(0,217,166,0.15)', color: '#00D9A6' }}>
                  {i + 1}
                </span>
                <span className="text-ink-muted">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-sm leading-relaxed">
            You start each station immediately after finishing your run lap — there is no rest period
            built into the format. The transition itself (running into the station zone, picking up
            equipment) is part of the race.
          </p>
        </section>

        {/* Every station explained */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            Every workout station explained
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5">
            All distances and weights are for the Open category. Pro category has modified distances
            on stations 1 and 5. Women&apos;s weights and distances are shown where they differ from men&apos;s.
          </p>
          <div className="space-y-3">
            {[
              {
                number: 1,
                name: 'SkiErg',
                spec: '1,000 m',
                womenSpec: '1,000 m (500 m Women Pro)',
                description: 'A cable-based cardio machine that mimics the double-pole motion of cross-country skiing. Pull the handles down from overhead in a continuous rhythm. Pacing is critical — most athletes go out too hard and pay for it on the run that follows.',
              },
              {
                number: 2,
                name: 'Sled Push',
                spec: '50 m — +152 kg Men / +102 kg Women',
                womenSpec: null,
                description: 'Drive a loaded sled across 50 m of turf. Lean forward at roughly 45°, keep your back flat, and take short powerful steps. The weight feels manageable early in the race; by station 2 your legs are already accumulating fatigue from two runs.',
              },
              {
                number: 3,
                name: 'Sled Pull',
                spec: '50 m — +152 kg Men / +102 kg Women',
                womenSpec: null,
                description: 'Facing the sled, pull it toward you hand-over-hand using an attached rope. Then walk backward to repeat across the 50 m. Upper back and grip are the limiting factors. Keep the rope low and pull from your lats, not just your arms.',
              },
              {
                number: 4,
                name: 'Burpee Broad Jump',
                spec: '80 m Men / 50 m Women',
                womenSpec: null,
                description: 'Drop to the floor, perform a full burpee, then jump forward as far as possible. Repeat continuously until you have covered the full distance. Your chest must touch the floor on each rep. This is the station most athletes underestimate — the combination of full-body fatigue and distance can feel brutal mid-race.',
              },
              {
                number: 5,
                name: 'Rowing',
                spec: '1,000 m',
                womenSpec: '1,000 m (500 m Women Pro)',
                description: 'A Concept2 rowing machine. Drive with your legs first, not your arms — the legs generate about 60% of the power. Most athletes find rowing the most recoverable station if they pace it sensibly. Aim for a consistent stroke rate rather than maximal effort.',
              },
              {
                number: 6,
                name: "Farmer's Carry",
                spec: '200 m — 2 × 24 kg Men / 2 × 16 kg Women',
                womenSpec: null,
                description: 'Walk 200 m while holding a kettlebell in each hand. You may put the kettlebells down, but the clock keeps running. Grip and core stability are the bottleneck. Keep your shoulders back, core braced, and avoid leaning to one side. Many athletes break this into two or three sets.',
              },
              {
                number: 7,
                name: 'Sandbag Lunges',
                spec: '100 m — 20 kg Men / 10 kg Women',
                womenSpec: null,
                description: 'Walking lunges across 100 m while holding a sandbag on your shoulders. The forward knee must not extend past the toes; the back knee must touch the floor on each rep. Quad fatigue from running compounds quickly here — controlled breathing and consistent rhythm matter more than speed.',
              },
              {
                number: 8,
                name: 'Wall Balls',
                spec: '100 reps — 6 kg Men / 4 kg Women',
                womenSpec: null,
                description: 'Squat to below parallel holding a medicine ball, then explosively stand and throw the ball to a target on the wall. Catch and repeat. 100 reps at this point in the race is a genuine physical test. Pacing into sets of 15–20 with brief rests is usually more efficient than grinding for large unbroken sets.',
              },
            ].map((station) => (
              <div key={station.number} className="rounded-xl border border-wire bg-panel p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(0,217,166,0.15)', color: '#00D9A6' }}>
                    {station.number}
                  </span>
                  <span className="font-semibold text-ink">{station.name}</span>
                  <span className="ml-auto text-xs text-ink-muted">{station.spec}</span>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed pl-9">{station.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            Categories and who they are for
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5">
            HYROX events offer multiple categories to suit different athletes and goals.
          </p>
          <div className="space-y-3 text-sm">
            {[
              {
                name: 'Singles — Open',
                badge: 'Most popular',
                description: 'The standard individual category. You complete all 8 km of running and all 8 stations solo. Men\'s and Women\'s divisions are separate. Age group sub-categories (e.g. 16–24, 25–29, 30–34...) allow you to compete against athletes of your own age for ranking purposes.',
              },
              {
                name: 'Singles — Pro',
                badge: 'Competitive',
                description: 'The elite individual category. The SkiErg and Rowing distances are halved for Women\'s Pro (500 m instead of 1,000 m) and the Burpee Broad Jump is reduced to 50 m. Pro athletes compete for HYROX World Championship qualification points.',
              },
              {
                name: 'Doubles',
                badge: 'Two athletes',
                description: 'Two athletes complete the race together, splitting all the work however they choose. The full station distance/rep count must still be completed — partners share the load. Popular for training partners and couples. Mixed Doubles (one male, one female) is a separate division.',
              },
              {
                name: 'Relay',
                badge: 'Four athletes',
                description: 'A team of four. Each athlete completes two stations (and their preceding 1 km runs). Assign stations strategically based on each athlete\'s strengths. Relay is the most social HYROX format — widely used for corporate teams and gym groups.',
              },
            ].map((cat) => (
              <div key={cat.name} className="rounded-xl border border-wire bg-panel p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{cat.name}</span>
                  <span className="rounded-full text-xs px-2 py-0.5 font-medium" style={{ background: 'rgba(0,217,166,0.1)', color: '#00D9A6' }}>{cat.badge}</span>
                </div>
                <p className="text-ink-muted leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typical finish times */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            What finish times look like
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5">
            First-timers frequently ask what a &quot;good&quot; finish time looks like. The honest answer:
            any finish time is a good time at your first HYROX. Here is a rough orientation.
          </p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-wire">
                  {['Finish time', 'Who typically gets here'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4 first:pl-4 sm:first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-wire text-sm">
                {[
                  { time: 'Under 60 min', who: 'Elite Pro athletes. Top 1% of the field globally.' },
                  { time: '60–75 min',    who: 'Competitive Open athletes. Strong gym fitness, 5 km run under 22 min.' },
                  { time: '75–90 min',    who: 'Well-prepared Open athletes. Solid training base over 3–4 months.' },
                  { time: '90–110 min',   who: 'First-timers with good general fitness. Typical debut range.' },
                  { time: '110–135 min',  who: 'First-timers focusing on completion. Entirely respectable.' },
                  { time: 'Over 135 min', who: 'Beginners or those managing injury. Crossing the line is the goal.' },
                ].map(({ time, who }) => (
                  <tr key={time} className="hover:bg-panel/50 transition-colors">
                    <td className="py-3 pr-4 pl-4 sm:pl-0 font-medium whitespace-nowrap" style={{ color: '#00D9A6' }}>{time}</td>
                    <td className="py-3 text-ink-muted">{who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How to train */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            How to train for HYROX
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-5">
            HYROX rewards athletes who can sustain output across both running and functional
            movements under fatigue. You need both — and you need to train them together, not in
            isolation.
          </p>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-wire bg-panel p-5 space-y-2">
              <h3 className="font-semibold text-ink">Running base (non-negotiable)</h3>
              <p className="text-ink-muted leading-relaxed">
                You need to be comfortable running 8 km at a conversational pace before you start
                stacking station work on top. If 8 km is currently hard, build your base first —
                3 runs per week over 6–8 weeks. You do not need to be fast; you need to be
                consistent under fatigue.
              </p>
            </div>
            <div className="rounded-xl border border-wire bg-panel p-5 space-y-2">
              <h3 className="font-semibold text-ink">Station-specific training</h3>
              <p className="text-ink-muted leading-relaxed">
                Prioritise the stations you find hardest. For most first-timers that is Wall Balls
                (grip and quad endurance), Sandbag Lunges (hip flexor fatigue), and Burpee Broad
                Jump (full-body cardiovascular demand). SkiErg and Rowing are learnable movements —
                technique practice pays dividends on race day.
              </p>
            </div>
            <div className="rounded-xl border border-wire bg-panel p-5 space-y-2">
              <h3 className="font-semibold text-ink">Gym-to-run transitions</h3>
              <p className="text-ink-muted leading-relaxed">
                The unique challenge of HYROX is the transition between functional work and
                running. Train this deliberately: complete a station, step outside (or onto a
                treadmill), and run a km. This teaches your body to shift from anaerobic effort
                back to aerobic running — a skill race day will demand eight times.
              </p>
            </div>
            <div className="rounded-xl border border-wire bg-panel p-5 space-y-2">
              <h3 className="font-semibold text-ink">A realistic timeline</h3>
              <p className="text-ink-muted leading-relaxed">
                With an existing gym base and a 5 km run under 25 minutes: 8–12 weeks of focused
                HYROX training is enough to finish well. If you are starting from general fitness
                with no specific HYROX preparation: 16 weeks is a comfortable window for a first
                completion. Do not underestimate the cumulative fatigue of running 8 km with
                loaded stations in between.
              </p>
            </div>
          </div>
        </section>

        {/* Race day */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            What to expect on race day
          </h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Venue check-in',       body: 'Arrive at least 90 minutes before your wave start time. Large HYROX events (Sydney, Singapore) process thousands of athletes. You will collect your bib, timing chip, and wristband. Bag drop is available but bring only what you need trackside — there is no access to your bag during the race.' },
              { label: 'Wave starts',          body: 'Athletes are released in waves of 20–50 every few minutes. Your wave is assigned at registration based on your predicted finish time. Seed yourself honestly — starting in a wave too fast for your ability means you will be passed repeatedly, which is demoralising.' },
              { label: 'The arena floor',      body: 'All stations are visible from the start. The running track loops around the stations — you will see what is coming. This is deliberately designed: the anticipation of each station is part of the experience.' },
              { label: 'Station queuing',      body: 'At busy events, short queues form at popular stations (Wall Balls, SkiErg). If you arrive at a station and equipment is occupied, you wait — the clock keeps running. This is normal and factored into finish times at high-attendance events.' },
              { label: 'Pacing strategy',      body: 'Go out conservative. The most common mistake is running the first 1–2 km too fast, then arriving at the SkiErg in oxygen debt. Run at a pace you can sustain for all 8 laps — not the pace you use for a 5 km parkrun. Every experienced HYROX athlete will tell you the same thing.' },
              { label: 'After the finish',     body: 'Your time is recorded by chip and immediately uploaded. Results are typically available in the HYROX app within minutes of finishing. Medals, photos, and a finish-line area are standard at all events. Recovery food and sponsor activations are usually available.' },
            ].map(({ label, body }) => (
              <div key={label} className="rounded-xl border border-wire bg-panel p-4 space-y-1">
                <div className="font-semibold text-ink">{label}</div>
                <p className="text-ink-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HYROX in Asia Pacific */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4 pb-3 border-b border-wire">
            HYROX in Asia Pacific
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-4">
            HYROX Asia Pacific has grown substantially since its first events in Australia in 2022.
            The current calendar spans Australia, New Zealand, Singapore, Japan, and South Korea,
            with new markets added each season.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            {[
              { country: 'Australia', note: 'The largest HYROX market in APAC. Sydney, Melbourne, Brisbane, Perth, Adelaide and Auckland events run annually. Sydney typically hosts the regional championships qualifier.' },
              { country: 'Singapore', note: 'Strong and growing. The Singapore HYROX event sells out quickly — register early. A hub for Southeast Asian athletes.' },
              { country: 'Japan',     note: 'Tokyo events are expanding. Increasing local athlete participation alongside international entrants.' },
            ].map(({ country, note }) => (
              <div key={country} className="card space-y-1.5">
                <div className="font-semibold text-ink">{country}</div>
                <p className="text-xs text-ink-muted leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-ink-muted text-sm leading-relaxed">
            The HYROX World Championships are held annually in Hamburg, Germany. APAC athletes
            who qualify in Pro or top Open age group positions can compete for a World
            Championship start. Qualification criteria are published on the official HYROX website
            each season.
          </p>
        </section>

        {/* Tips callout */}
        <section className="rounded-2xl border border-mint/20 bg-mint/5 p-6 text-sm">
          <h3 className="font-semibold text-ink mb-3">Five things experienced HYROX athletes wish they knew before their first race</h3>
          <ul className="space-y-2 text-ink-muted">
            {[
              'Pace the first 1 km run as if it\'s embarrassingly slow. You will thank yourself at station 7.',
              'Break Wall Balls into sets from the start — even if you feel fine. Unbroken sets at 60–70 reps almost always collapse.',
              'The Burpee Broad Jump is the most undertraining-punished station. Practice it specifically.',
              'Bring your own chalk or grip spray for the Farmer\'s Carry and Sled Pull. Not all venues provide it.',
              'Arrive early and walk the arena before your wave. Knowing where each station is removes one cognitive load on race day.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#00D9A6' }} />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-wire bg-panel p-8 text-center">
          <h2 className="text-lg font-bold text-ink">Find a HYROX event near you</h2>
          <p className="mt-2 text-ink-muted text-sm max-w-sm mx-auto">
            Browse upcoming HYROX events across Australia, Singapore, Japan and the rest of Asia Pacific.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/events?discipline=HYROX" className="btn-primary inline-flex">
              Browse HYROX events
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/guides" className="btn-secondary inline-flex">
              More guides
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
