const STEPS = [
  {
    number: '01',
    title: 'Find events',
    description:
      'Browse HYROX, Spartan, Ironman, Marathon, Trail and more across Asia Pacific.',
  },
  {
    number: '02',
    title: 'Save to your season',
    description:
      'Add the events you want to do with one tap. Your season builds as you browse.',
  },
  {
    number: '03',
    title: 'Get reminded',
    description:
      "We'll notify you before registrations open so you never miss a race.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-10 md:py-14">
      <div className="container-page">
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-4">
              <span className="shrink-0 pt-0.5 font-heading text-xs font-bold tracking-[0.2em] text-mint">
                {step.number}
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
