import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = [
  { label: 'HYROX',         disciplines: ['HYROX'],                   href: '/events?discipline=HYROX',          color: '#00D9A6', bg: 'rgba(0,217,166,0.12)',  icon: '⚡' },
  { label: 'CrossFit',      disciplines: ['CrossFit'],                href: '/events?discipline=CrossFit',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: '🔥' },
  { label: 'Spartan Race',  disciplines: ['Spartan Race'],            href: '/events?discipline=Spartan+Race',   color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', icon: '🛡️' },
  { label: 'Ironman',       disciplines: ['Ironman', 'Ironman 70.3'], href: '/events?discipline=Ironman',        color: '#F87171', bg: 'rgba(248,113,113,0.12)',icon: '🏊' },
  { label: 'Marathon',      disciplines: ['Marathon'],                href: '/events?discipline=Marathon',       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', icon: '🏃' },
  { label: 'Trail Running', disciplines: ['Trail Running'],           href: '/events?discipline=Trail+Running',  color: '#34D399', bg: 'rgba(52,211,153,0.12)', icon: '🌄' },
  { label: 'Deka Fit',      disciplines: ['Deka Fit'],               href: '/events?discipline=Deka+Fit',       color: '#A78BFA', bg: 'rgba(167,139,250,0.12)',icon: '💪' },
  { label: 'Tough Mudder',  disciplines: ['Tough Mudder'],           href: '/events?discipline=Tough+Mudder',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: '💧' },
]

export async function BrowseByType() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('events')
    .select('discipline')
    .eq('is_published', true)
    .gte('start_date', today)
    .lt('start_date', '2099-01-01')

  const counts = (data ?? []).reduce<Record<string, number>>((acc, e) => {
    if (e.discipline) acc[e.discipline] = (acc[e.discipline] ?? 0) + 1
    return acc
  }, {})

  const getCount = (disciplines: string[]) =>
    disciplines.reduce((sum, d) => sum + (counts[d] ?? 0), 0)

  const visible = CATEGORIES.filter((cat) => getCount(cat.disciplines) > 0)
  if (visible.length === 0) return null

  return (
    <section className="py-4 md:py-6">
      <div className="container-page">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Browse by Event Type
          </h2>
          <Link
            href="/events"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll strip. sm+: 2-col grid. lg+: 4-col grid. */}
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-x-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {visible.map((cat) => {
            const count = getCount(cat.disciplines)
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-none w-[152px] items-center gap-3 rounded-2xl border border-wire bg-panel p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-wire-bright hover:shadow-md hover:shadow-black/20 sm:w-auto active:scale-[0.98] active:duration-75"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ background: cat.bg }}
                >
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-mint">
                    {cat.label}
                  </p>
                  <p className="text-xs text-ink-muted">{count} upcoming</p>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-subtle transition-colors group-hover:text-mint" />
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
