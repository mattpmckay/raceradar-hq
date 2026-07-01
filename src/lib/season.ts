import type { Tables } from '@/types/supabase'

type Event = Tables<'events'>

export type Urgency = 'critical' | 'high' | 'medium' | 'low'

export type ActionType =
  | 'race_week'
  | 'registration_closing'
  | 'early_bird_closing'
  | 'registration_opens'
  | 'ballot_opens'
  | 'ballot_closing'
  | 'waitlist_available'

export type SeasonAction = {
  eventId: string
  eventSlug: string
  eventTitle: string
  eventDiscipline: string
  type: ActionType
  daysUntil: number
  urgency: Urgency
  label: string
  actionLabel: string
  actionHref: string
}

export type EventStatus = {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'brand' | 'default'
}

function daysFrom(today: Date, dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86_400_000)
}

function toUrgency(days: number): Urgency {
  if (days <= 3) return 'critical'
  if (days <= 7) return 'high'
  if (days <= 14) return 'medium'
  return 'low'
}

function daysLabel(n: number, unit = 'day'): string {
  return `${n} ${unit}${n !== 1 ? 's' : ''}`
}

export function computeSeasonActions(events: Event[], today: Date): SeasonAction[] {
  const actions: SeasonAction[] = []

  for (const event of events) {
    const raceDays = daysFrom(today, event.start_date)
    if (raceDays < -1) continue // past event

    // Race week — takes priority; skip other action types for this event
    if (raceDays >= 0 && raceDays <= 7) {
      const label =
        raceDays === 0 ? 'Race day is today!'
        : raceDays === 1 ? 'Race day is tomorrow'
        : `Race day in ${daysLabel(raceDays)}`
      actions.push({
        eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
        eventDiscipline: event.discipline, type: 'race_week', daysUntil: raceDays,
        urgency: raceDays <= 2 ? 'critical' : 'high',
        label, actionLabel: 'View Details', actionHref: `/events/${event.slug}`,
      })
      continue
    }

    // Registration closing
    if (event.registration_deadline) {
      const days = daysFrom(today, event.registration_deadline)
      if (days > 0 && days <= 30) {
        actions.push({
          eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
          eventDiscipline: event.discipline, type: 'registration_closing', daysUntil: days,
          urgency: toUrgency(days),
          label: days === 1 ? 'Registration closes tomorrow' : `Registration closes in ${daysLabel(days)}`,
          actionLabel: 'Register Now',
          actionHref: event.registration_url ?? event.website_url ?? `/events/${event.slug}`,
        })
      }
    }

    // Early bird closing
    if (event.early_bird_closes_date) {
      const days = daysFrom(today, event.early_bird_closes_date)
      if (days > 0 && days <= 14) {
        const saving =
          event.early_bird_price_from != null && event.entry_fee_from != null
            ? ` — save $${Math.round(event.entry_fee_from - event.early_bird_price_from)}`
            : ''
        actions.push({
          eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
          eventDiscipline: event.discipline, type: 'early_bird_closing', daysUntil: days,
          urgency: toUrgency(days),
          label: `Early bird closes in ${daysLabel(days)}${saving}`,
          actionLabel: 'Register Early',
          actionHref: event.registration_url ?? event.website_url ?? `/events/${event.slug}`,
        })
      }
    }

    // Registration opens soon
    if (event.registration_opens_date) {
      const days = daysFrom(today, event.registration_opens_date)
      if (days > 0 && days <= 30) {
        actions.push({
          eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
          eventDiscipline: event.discipline, type: 'registration_opens', daysUntil: days,
          urgency: days <= 3 ? 'high' : days <= 7 ? 'medium' : 'low',
          label: days === 1 ? 'Registration opens tomorrow' : `Registration opens in ${daysLabel(days)}`,
          actionLabel: 'View Event', actionHref: `/events/${event.slug}`,
        })
      }
    }

    // Ballot opens soon
    if (event.ballot_opens_date) {
      const days = daysFrom(today, event.ballot_opens_date)
      if (days > 0 && days <= 30) {
        actions.push({
          eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
          eventDiscipline: event.discipline, type: 'ballot_opens', daysUntil: days,
          urgency: days <= 7 ? 'high' : 'medium',
          label: days === 1 ? 'Ballot opens tomorrow' : `Ballot opens in ${daysLabel(days)}`,
          actionLabel: 'View Event', actionHref: `/events/${event.slug}`,
        })
      }
    }

    // Ballot closing
    if (event.ballot_closes_date) {
      const days = daysFrom(today, event.ballot_closes_date)
      if (days > 0 && days <= 14) {
        actions.push({
          eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
          eventDiscipline: event.discipline, type: 'ballot_closing', daysUntil: days,
          urgency: toUrgency(days),
          label: days === 1 ? 'Ballot closes tomorrow' : `Ballot closes in ${daysLabel(days)}`,
          actionLabel: 'Apply Now',
          actionHref: event.ballot_apply_url ?? event.website_url ?? `/events/${event.slug}`,
        })
      }
    }

    // Waitlist available
    if (event.waitlist_open) {
      actions.push({
        eventId: event.id, eventSlug: event.slug, eventTitle: event.title,
        eventDiscipline: event.discipline, type: 'waitlist_available', daysUntil: raceDays,
        urgency: 'low', label: 'Waitlist now available',
        actionLabel: 'Join Waitlist',
        actionHref: event.waitlist_url ?? event.registration_url ?? `/events/${event.slug}`,
      })
    }
  }

  const order: Record<Urgency, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  return actions.sort((a, b) => {
    const u = order[a.urgency] - order[b.urgency]
    return u !== 0 ? u : a.daysUntil - b.daysUntil
  })
}

export function getEventStatus(event: Event, today: Date): EventStatus | null {
  const days = (d: string) => daysFrom(today, d)

  if (event.registration_status === 'sold_out') {
    return { label: 'Sold Out', variant: 'danger' }
  }
  if (event.waitlist_open) {
    return { label: 'Waitlist Available', variant: 'warning' }
  }
  if (event.ballot_required) {
    if (event.ballot_closes_date && days(event.ballot_closes_date) <= 0) {
      return { label: 'Ballot Closed', variant: 'default' }
    }
    if (event.ballot_closes_date && event.ballot_opens_date && days(event.ballot_opens_date) <= 0) {
      const d = days(event.ballot_closes_date)
      return { label: d <= 7 ? `Ballot closes in ${daysLabel(d)}` : 'Ballot Open', variant: 'brand' }
    }
    if (event.ballot_opens_date && days(event.ballot_opens_date) > 0) {
      const d = days(event.ballot_opens_date)
      return { label: d === 1 ? 'Ballot opens tomorrow' : `Ballot opens in ${daysLabel(d)}`, variant: 'default' }
    }
    return null
  }
  if (event.registration_deadline) {
    const d = days(event.registration_deadline)
    if (d <= 0) return { label: 'Registration Closed', variant: 'danger' }
    if (d <= 3) return { label: `Closes in ${daysLabel(d)}`, variant: 'danger' }
    if (d <= 7) return { label: `Closes in ${daysLabel(d)}`, variant: 'warning' }
  }
  if (event.early_bird_closes_date && days(event.early_bird_closes_date) > 0) {
    return { label: 'Early Bird Open', variant: 'brand' }
  }
  if (event.registration_opens_date && days(event.registration_opens_date) > 0) {
    const d = days(event.registration_opens_date)
    return { label: d === 1 ? 'Opens tomorrow' : `Opens in ${daysLabel(d)}`, variant: 'default' }
  }
  if (event.qualification_required) {
    return { label: 'Qualification Required', variant: 'warning' }
  }
  if (event.is_qualifier && event.qualifier_for) {
    return { label: `Qualifier for ${event.qualifier_for}`, variant: 'brand' }
  }
  if (event.transfer_available) {
    return { label: 'Transfer Available', variant: 'default' }
  }
  if (event.deferral_available) {
    return { label: 'Deferral Available', variant: 'default' }
  }
  if (event.registration_status === 'open') {
    return { label: 'Registration Open', variant: 'success' }
  }
  if (event.registration_status === 'closing_soon') {
    return { label: 'Closing Soon', variant: 'warning' }
  }
  return null
}

export function countdown(startDate: string, today: Date): string {
  const days = daysFrom(today, startDate)
  if (days < 0) return 'Past event'
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days <= 13) return `In ${daysLabel(days)}`
  if (days < 60) return `${days} days away`
  const weeks = Math.round(days / 7)
  if (weeks < 12) return `${weeks} weeks away`
  const months = Math.round(days / 30.4)
  return `${months} months away`
}

export function groupByYear(events: Event[]): Map<number, Event[]> {
  const map = new Map<number, Event[]>()
  for (const e of events) {
    const year = new Date(e.start_date).getUTCFullYear()
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(e)
  }
  return map
}
