'use client'

import Link from 'next/link'

const DISCIPLINE_PILLS = [
  { label: 'HYROX',         href: '/events?discipline=HYROX',         color: '#00D9A6' },
  { label: 'Spartan Race',  href: '/events?discipline=Spartan+Race',  color: '#FF6B35' },
  { label: 'Tough Mudder',  href: '/events?discipline=Tough+Mudder',  color: '#F59E0B' },
  { label: 'Ironman',       href: '/events?discipline=Ironman',       color: '#F87171' },
  { label: 'Ironman 70.3',  href: '/events?discipline=Ironman+70.3',  color: '#F87171' },
  { label: 'Marathon',      href: '/events?discipline=Marathon',      color: '#60A5FA' },
  { label: 'Road Racing',   href: '/events?discipline=Road+Racing',   color: '#94A3B8' },
  { label: 'Trail Running', href: '/events?discipline=Trail+Running', color: '#34D399' },
  { label: 'Deka Fit',      href: '/events?discipline=Deka+Fit',      color: '#A78BFA' },
  { label: 'CrossFit',      href: '/events?discipline=CrossFit',      color: '#EF4444' },
]

export function HeroDisciplinePills() {
  return (
    <div className="mt-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-muted">
        Browse by sport
      </p>
      <div className="flex flex-wrap gap-2">
        {DISCIPLINE_PILLS.map((pill) => (
          <PillLink key={pill.href} {...pill} />
        ))}
      </div>
    </div>
  )
}

function PillLink({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-wire bg-panel/60 px-3.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md"
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color
        e.currentTarget.style.borderColor = `${color}55`
        e.currentTarget.style.background = `${color}12`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = ''
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.background = ''
      }}
    >
      {label}
    </Link>
  )
}
