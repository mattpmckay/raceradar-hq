import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function icsDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

function esc(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, slug, discipline, city, country, start_date, end_date, website_url, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!event) {
    return new NextResponse('Event not found', { status: 404 })
  }

  const venueMatch = event.description?.match(/^Venue:\s*(.+)/i)
  const venue = venueMatch?.[1]?.trim()
  const location = [venue, event.city, event.country].filter(Boolean).join(', ')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'

  const startDate = icsDate(event.start_date)
  const endDate =
    event.end_date && event.end_date !== event.start_date
      ? nextDay(event.end_date)
      : nextDay(event.start_date)

  const dtstamp =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const description = esc(
    `${event.discipline} event in ${location}. Full race guide and registration: ${siteUrl}/events/${event.slug}`,
  )

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RaceRadar HQ//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(location)}`,
    `URL:${siteUrl}/events/${event.slug}`,
    `DESCRIPTION:${description}`,
    `DTSTAMP:${dtstamp}`,
    `UID:${event.slug}@raceradar`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  })
}
