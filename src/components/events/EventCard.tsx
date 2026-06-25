import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatDateShort } from '@/lib/utils'
import type { Tables } from '@/types/supabase'

type Event = Tables<'events'>

interface EventCardProps {
  event: Event
}

const disciplineColour: Record<string, 'brand' | 'success' | 'warning' | 'default'> = {
  hyrox:        'brand',
  spartan:      'warning',
  ocr:          'success',
  trail:        'success',
  'tough-mudder': 'warning',
  'fun-run':    'default',
  endurance:    'brand',
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group flex flex-col gap-3 hover:border-brand-500/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant={disciplineColour[event.discipline] ?? 'default'}>
          {event.discipline}
        </Badge>
        <Badge variant="outline">{event.event_type}</Badge>
      </div>

      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
        {event.title}
      </h3>

      <div className="mt-auto space-y-1.5 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-500" />
          <span>{formatDateShort(event.start_date)}</span>
          {event.end_date && event.end_date !== event.start_date && (
            <span>– {formatDateShort(event.end_date)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
          <span className="truncate">
            {[event.city, event.region, event.country].filter(Boolean).join(', ')}
          </span>
        </div>
      </div>
    </Link>
  )
}
