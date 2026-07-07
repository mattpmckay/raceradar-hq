import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar, MapPin, Globe, ArrowLeft, Flag, CheckCircle, Clock,
  Train, Users, Thermometer, Heart, BookOpen, Map, Download,
  Mountain, ChevronRight, AlertTriangle, XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/supabase'
import { Badge } from '@/components/ui/Badge'
import { SaveButton } from '@/components/events/SaveButton'
import { ReminderSignup } from '@/components/events/ReminderSignup'
import { CalendarCtaInline } from '@/components/events/CalendarCtaInline'
import { MobileSeasonCta } from '@/components/events/MobileSeasonCta'
import { DeadlineCountdown } from '@/components/events/DeadlineCountdown'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

// ─── Discipline constants ─────────────────────────────────────────────────────

const HYROX_STATIONS = [
  { order: 1, name: 'SkiErg',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 2, name: 'Sled Push',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 3, name: 'Sled Pull',         distance: '50 m',     note: '+150 kg Men / +100 kg Women' },
  { order: 4, name: 'Burpee Broad Jump', distance: '80 m',     note: '50 m Women' },
  { order: 5, name: 'Rowing',            distance: '1,000 m',  note: '500 m Women Pro' },
  { order: 6, name: "Farmer's Carry",    distance: '200 m',    note: '2 × 24 kg Men / 2 × 16 kg Women' },
  { order: 7, name: 'Sandbag Lunges',    distance: '100 m',    note: '20 kg Men / 10 kg Women' },
  { order: 8, name: 'Wall Balls',        distance: '100 reps', note: '6 kg Men / 4 kg Women' },
]

const DEKA_STATIONS = [
  { order: 1,  name: 'Ski Erg',       distance: '500 m' },
  { order: 2,  name: 'Sled Push',     distance: '25 m' },
  { order: 3,  name: 'Sled Pull',     distance: '25 m' },
  { order: 4,  name: 'Burpee Jump',   distance: '50 m' },
  { order: 5,  name: 'Row Erg',       distance: '500 m' },
  { order: 6,  name: 'Farmers Carry', distance: '50 m' },
  { order: 7,  name: 'Sandbag Lunge', distance: '25 m' },
  { order: 8,  name: 'Wall Balls',    distance: '50 reps' },
  { order: 9,  name: 'Box Jump',      distance: '50 reps' },
  { order: 10, name: 'Battle Ropes',  distance: '30 sec' },
]

const IRONMAN_DISTANCES: Record<string, { swim: string; bike: string; run: string; total: string }> = {
  'Ironman': {
    swim: '3.86 km (2.4 mi)',
    bike: '180.25 km (112 mi)',
    run: '42.2 km (26.2 mi)',
    total: '226.3 km',
  },
  'Ironman 70.3': {
    swim: '1.93 km (1.2 mi)',
    bike: '90.12 km (56 mi)',
    run: '21.1 km (13.1 mi)',
    total: '113.0 km',
  },
}

const SPARTAN_FORMATS = [
  { name: 'Spartan Sprint',  distance: '~5 km',   obstacles: '20+', level: 'Beginner-friendly' },
  { name: 'Spartan Super',   distance: '~10 km',  obstacles: '25+', level: 'Intermediate' },
  { name: 'Spartan Beast',   distance: '~20 km',  obstacles: '30+', level: 'Experienced' },
  { name: 'Spartan Ultra',   distance: '~50 km',  obstacles: '60+', level: 'Elite / Ultra-endurance' },
  { name: 'Stadion',         distance: '~5 km',   obstacles: '20+', level: 'Stadium / flat course' },
]

// ─── City travel data ─────────────────────────────────────────────────────────

type CityEntry = {
  airport: string
  transport: string
  climate: Record<number, string>
}

const CITY_DATA: Record<string, CityEntry> = {
  'Sydney': {
    airport: 'Sydney Kingsford Smith Airport (SYD), 25–40 min by taxi or rideshare from the CBD',
    transport: 'Airport Link train to Central Station in 13 min. On race days, public transport is strongly recommended — parking near the SCG, ICC Sydney, and Sydney Olympic Park fills hours before start.',
    climate: {
      1:  'Hot, 20–28°C. Afternoon storms possible — choose early waves.',
      2:  'Hot, 19–27°C. Heatwaves possible. Hydrate heavily.',
      3:  'Warm, 18–25°C. Late summer. Pleasant racing conditions.',
      4:  'Mild, 14–22°C. Ideal conditions. Best autumn racing month.',
      5:  'Cool, 11–19°C. Good conditions. Layer for warm-up.',
      6:  'Cool and dry, 9–17°C. Excellent for endurance events.',
      7:  'Cool and dry, 8–16°C. Best month for outdoor racing.',
      8:  'Mild and dry, 9–18°C. Excellent racing conditions.',
      9:  'Spring, 12–21°C. Warming up. Comfortable.',
      10: 'Warm, 14–23°C. Spring. Can be breezy near the coast.',
      11: 'Warm, 17–25°C. Heating up. Pre-hydrate and start conservative.',
      12: 'Hot, 19–27°C. Full summer. Seek early wave starts.',
    },
  },
  'Melbourne': {
    airport: 'Melbourne Airport (MEL), 30–50 min by taxi or SkyBus from the CBD',
    transport: 'SkyBus to Southern Cross Station (30–40 min). No direct train link. CBD trams are free in the central zone — the most convenient option for CBD venues.',
    climate: {
      1:  'Unpredictable, 14–26°C. Famous four-seasons-in-one-day — always pack a layer.',
      2:  'Warm, 14–25°C. Heatwaves possible.',
      3:  'Warm, 13–23°C. Autumn conditions settling in.',
      4:  'Cool, 10–19°C. Variable but good racing conditions.',
      5:  'Cool, 8–15°C. Brisk mornings. Warm-up gear needed.',
      6:  'Cold and wet, 6–13°C. Waterproof layer essential for outdoor events.',
      7:  'Cold, 5–13°C. Coldest month. Allow extra warm-up time.',
      8:  'Cool, 6–14°C. Conditions improving through the month.',
      9:  'Mild, 8–16°C. Spring begins but weather stays unpredictable.',
      10: 'Mild, 9–19°C. Layers still helpful.',
      11: 'Warm, 12–22°C. Can be hot or stormy.',
      12: 'Warm, 13–24°C. Summer arrives. Watch for extreme heat days.',
    },
  },
  'Perth': {
    airport: 'Perth Airport (PER), 20–30 min by taxi or rideshare from the CBD',
    transport: 'Transperth train from Airport Central station to Perth Station (15 min). Free CAT buses operate in the CBD. RAC Arena and Perth venues are well-served by public transport.',
    climate: {
      1:  'Very hot and dry, 18–31°C. Start early — heat builds quickly.',
      2:  'Hot and dry, 18–31°C. Hottest month. Shade and hydration critical.',
      3:  'Hot, 16–29°C. Heat easing through the month.',
      4:  'Warm, 13–25°C. Autumn. Very pleasant racing conditions.',
      5:  'Mild, 10–20°C. Excellent conditions. Minimal rain.',
      6:  'Cool and wet, 8–17°C. Perth winter — main rain season.',
      7:  'Cool and wet, 8–17°C. Wettest month. Prepare for rain.',
      8:  'Cool, 8–17°C. Rain easing. Good for endurance events.',
      9:  'Mild, 9–19°C. Spring — near-ideal racing conditions.',
      10: 'Warm, 11–22°C. Heating up. Good conditions.',
      11: 'Warm, 14–26°C. Heating up. Recommend early starts.',
      12: 'Hot, 17–30°C. Full summer heat returns.',
    },
  },
  'Brisbane': {
    airport: 'Brisbane Airport (BNE), 25–35 min by Airtrain or taxi from the CBD',
    transport: 'Airtrain to Central Station every 15 min (30 min journey). Go Card accepted. Well-connected to the CBD and South Bank venues.',
    climate: {
      1:  'Hot and humid, 20–29°C. Wet season — afternoon storms.',
      2:  'Hot and humid, 20–29°C. Wettest month.',
      3:  'Warm, 18–28°C. Humidity easing.',
      4:  'Warm, 15–26°C. Excellent autumn conditions.',
      5:  'Mild, 11–23°C. Near-perfect racing weather.',
      6:  'Cool and dry, 9–21°C. Best racing month.',
      7:  'Cool and dry, 9–20°C. Brisbane winter is mild and dry.',
      8:  'Mild, 10–23°C. Excellent conditions.',
      9:  'Warm, 13–26°C. Spring warming.',
      10: 'Warm, 16–28°C. Getting warmer and humid.',
      11: 'Hot, 18–29°C. Storm season begins.',
      12: 'Hot and humid, 20–29°C. Wet season approaching.',
    },
  },
  'Gold Coast': {
    airport: 'Gold Coast Airport (OOL), 35–45 min by taxi or bus to Broadbeach/Surfers Paradise',
    transport: 'G:link light rail connects Broadbeach South to Helensvale. Bus routes cover the broader Gold Coast area.',
    climate: {
      1:  'Hot, 22–29°C. Summer. Humid with afternoon rain.',
      2:  'Hot, 22–29°C. Wet season peak.',
      3:  'Warm, 20–27°C. Late summer cooling.',
      4:  'Warm, 17–25°C. Excellent autumn conditions.',
      5:  'Mild, 13–22°C. Good racing weather.',
      6:  'Cool, 10–20°C. Best month for outdoor events.',
      7:  'Cool, 10–20°C. Dry and comfortable. Ideal racing conditions.',
      8:  'Mild, 11–21°C. Excellent conditions.',
      9:  'Mild, 14–23°C. Spring warmth.',
      10: 'Warm, 17–26°C. Heating up.',
      11: 'Warm, 19–27°C. Pre-summer.',
      12: 'Hot, 21–29°C. Summer returns.',
    },
  },
  'Cairns': {
    airport: 'Cairns Airport (CNS), 10–15 min by taxi or rideshare from the CBD',
    transport: 'No train or light rail. Taxi and rideshare are the main options. The city centre is compact — most venues are within 15 min of the CBD or airport.',
    climate: {
      1:  'Hot and wet, 23–32°C. Wet season. Heavy rain and high humidity.',
      2:  'Hot and wet, 23–32°C. Wettest and most humid month.',
      3:  'Hot and wet, 23–32°C. Wet season winding down.',
      4:  'Warm, 22–31°C. Transitional. Humidity easing.',
      5:  'Warm and dry, 19–29°C. Excellent conditions. Dry season begins.',
      6:  'Warm and dry, 17–27°C. Best month for outdoor racing in Cairns.',
      7:  'Warm and dry, 17–26°C. Ideal conditions. Cool evenings.',
      8:  'Warm and dry, 18–27°C. Excellent racing weather.',
      9:  'Warm, 20–29°C. Build-up season beginning.',
      10: 'Warm and humid, 22–31°C. Humidity rising.',
      11: 'Hot and humid, 23–32°C. Storm season begins.',
      12: 'Hot and wet, 23–32°C. Wet season returns.',
    },
  },
  'Auckland': {
    airport: 'Auckland International Airport (AKL), 35–60 min by rail or taxi to the CBD',
    transport: 'AT Metro Rail to Britomart in 45 min. Highly recommended — Auckland road traffic is heavy, especially on weekends. Snapper card for transit.',
    climate: {
      1:  'Warm, 16–24°C. Summer. Can be humid.',
      2:  'Warm, 16–24°C. Peak summer. Sunscreen essential.',
      3:  'Warm, 14–22°C. Late summer cooling.',
      4:  'Mild, 12–19°C. Autumn. Variable but pleasant.',
      5:  'Cool, 9–16°C. Comfortable for racing.',
      6:  'Cool and wet, 7–13°C. Auckland winter. Rain gear recommended.',
      7:  'Cool and wet, 7–13°C. Wettest month. Prepare accordingly.',
      8:  'Cool, 7–14°C. Winter conditions easing.',
      9:  'Mild, 9–16°C. Spring begins.',
      10: 'Mild, 11–18°C. Good outdoor conditions.',
      11: 'Warm, 12–20°C. Spring warming.',
      12: 'Warm, 14–22°C. Summer returning.',
    },
  },
  'Taupo': {
    airport: "Taupo Airport (TUO) for regional flights, or Hamilton Airport (HLZ, 130 km) or Rotorua Airport (ROT, 80 km) for more connections",
    transport: "Car hire is strongly recommended — Taupo has very limited public transport. From Auckland, it's a 4 hr drive on SH1. From Rotorua, 1 hr on SH5.",
    climate: {
      1:  'Warm, 13–24°C. Summer. Great conditions for IRONMAN Taupo.',
      2:  'Warm, 13–23°C. Consistent summer conditions.',
      3:  'Mild, 11–21°C. Cooling. Still comfortable.',
      4:  'Cool, 7–16°C. Autumn. Lake water cooling quickly.',
      5:  'Cool, 5–13°C. Cold mornings. Layer up.',
      6:  'Cold, 2–10°C. Winter. Snow possible on nearby peaks.',
      7:  'Cold, 2–9°C. Coldest month. Lake is cold.',
      8:  'Cold, 2–10°C. Cold but dry.',
      9:  'Cool, 5–14°C. Spring beginning.',
      10: 'Mild, 7–16°C. Good conditions.',
      11: 'Warm, 9–19°C. Spring warming.',
      12: 'Warm, 12–22°C. Summer approaching.',
    },
  },
  'Singapore': {
    airport: 'Singapore Changi Airport (SIN), 30–40 min by MRT or taxi to Marina Bay / CBD',
    transport: 'MRT East West Line from Changi to City Hall in ~30 min (SGD $2.50). The MRT is the best option — efficient, air-conditioned and direct to most race venues.',
    climate: {
      1:  'Hot and humid, 24–31°C. Northeast monsoon. Frequent rain.',
      2:  'Hot and humid, 24–32°C. Drier period relative to other months.',
      3:  'Hot and humid, 25–32°C. Inter-monsoon. Occasional heavy rain.',
      4:  'Hot and humid, 25–33°C. One of the warmest months.',
      5:  'Hot and humid, 25–33°C. Afternoon thunderstorms common.',
      6:  'Hot and humid, 25–32°C. Southwest monsoon begins.',
      7:  'Hot and humid, 25–31°C. Relatively drier.',
      8:  'Hot and humid, 25–31°C. Haze season possible.',
      9:  'Hot and humid, 25–31°C. Inter-monsoon. Heavy showers.',
      10: 'Hot and humid, 24–31°C. Rain increases.',
      11: 'Hot and humid, 24–31°C. Northeast monsoon. Wet.',
      12: 'Hot and humid, 24–30°C. Wettest month. Start early, hydrate heavily.',
    },
  },
  'Bangkok': {
    airport: 'Suvarnabhumi Airport (BKK), 45–90 min by Airport Rail Link or taxi to central Bangkok',
    transport: 'Airport Rail Link to Phaya Thai (28 min, THB 45) connects to the BTS Skytrain network. Traffic in Bangkok is severe — public transit is highly recommended for event days.',
    climate: {
      1:  'Warm and dry, 20–32°C. Cool season. Best outdoor racing month.',
      2:  'Warm and dry, 22–33°C. Excellent conditions.',
      3:  'Hot, 24–35°C. Getting very hot. Early starts essential.',
      4:  'Very hot, 25–36°C. Hottest month. Pre-dawn starts for outdoor events.',
      5:  'Hot and humid, 24–34°C. Monsoon begins.',
      6:  'Hot and wet, 24–33°C. Heavy rain season.',
      7:  'Hot and wet, 24–32°C. Consistent rain.',
      8:  'Hot and wet, 24–32°C. Wettest period.',
      9:  'Hot and wet, 24–32°C. Rain continues.',
      10: 'Warm and wet, 23–31°C. Rain easing late month.',
      11: 'Warm, 21–31°C. Dry season returning. Good conditions.',
      12: 'Warm and dry, 19–31°C. Cool season. Excellent for racing.',
    },
  },
  'Tokyo': {
    airport: 'Haneda Airport (HND, 30–40 min to central Tokyo) or Narita Airport (NRT, 60–90 min)',
    transport: 'From Haneda: Tokyo Monorail or Keikyu Line (30 min). From Narita: Narita Express (60 min). The Tokyo Metro and JR lines are the best way to reach any event venue — extremely punctual.',
    climate: {
      1:  'Cold and dry, 2–10°C. Coldest month. Dress in layers.',
      2:  'Cold, 2–11°C. Snow possible. Warm gear essential.',
      3:  'Cool, 5–15°C. Cherry blossom season. Excellent outdoor conditions.',
      4:  'Mild, 10–20°C. Perfect racing weather. Peak spring.',
      5:  'Warm, 14–24°C. Excellent conditions before summer heat.',
      6:  'Warm and rainy, 18–27°C. Rainy season (tsuyu) — expect rain.',
      7:  'Hot and humid, 22–31°C. Very humid. Hydrate aggressively.',
      8:  'Very hot and humid, 23–33°C. Hottest month. Early starts essential.',
      9:  'Warm, 20–29°C. Humidity easing. Some typhoon risk.',
      10: 'Mild, 14–22°C. Excellent autumn conditions. Best racing month.',
      11: 'Cool, 8–17°C. Comfortable. Autumn colours.',
      12: 'Cold, 4–12°C. Crisp and dry. Good for winter racing.',
    },
  },
  'Seoul': {
    airport: 'Incheon International Airport (ICN), 50–60 min by AREX express train to Seoul Station',
    transport: 'AREX Direct Train to Seoul Station (43 min, KRW 9,500). Highly efficient. Seoul subway connects to all major event venues.',
    climate: {
      1:  'Very cold, -6–3°C. Korean winter. Multiple thermal layers essential.',
      2:  'Cold, -4–5°C. Still sub-zero. Full winter gear required.',
      3:  'Cool, 1–12°C. Spring approaching. Variable conditions.',
      4:  'Mild, 7–18°C. Good racing conditions.',
      5:  'Warm, 12–24°C. Excellent month for outdoor events.',
      6:  'Warm and humid, 17–28°C. Pre-monsoon. Warming quickly.',
      7:  'Hot and rainy, 21–30°C. Monsoon season. Heavy rain.',
      8:  'Hot and humid, 22–31°C. Typhoon risk. Very humid.',
      9:  'Warm, 16–26°C. Humidity easing. Good racing conditions.',
      10: 'Mild, 9–20°C. Excellent autumn conditions. Ideal month for racing.',
      11: 'Cool, 2–12°C. Cold arriving quickly. Layer up.',
      12: 'Cold, -4–4°C. Winter returns.',
    },
  },
  'Hong Kong': {
    airport: 'Hong Kong International Airport (HKG), 24 min by Airport Express to Hong Kong Station',
    transport: 'Airport Express is the clear best option (HKD 115, 24 min). The MTR covers all major event areas on Hong Kong Island and Kowloon. Driving or parking on event days is not recommended.',
    climate: {
      1:  'Cool and dry, 14–18°C. Comfortable for racing.',
      2:  'Cool, 14–19°C. Can be misty and damp.',
      3:  'Mild, 17–22°C. Humid and occasionally foggy.',
      4:  'Warm and humid, 21–26°C. Humidity building.',
      5:  'Warm and humid, 24–29°C. Getting hot.',
      6:  'Hot and wet, 26–31°C. Typhoon season begins.',
      7:  'Hot and wet, 27–32°C. Peak typhoon season. Check race status.',
      8:  'Hot and wet, 27–32°C. Hottest and wettest month.',
      9:  'Hot and humid, 26–31°C. Typhoon risk. High humidity.',
      10: 'Warm, 22–28°C. Typhoon risk easing. Good conditions.',
      11: 'Mild, 18–24°C. Excellent racing weather.',
      12: 'Cool, 15–20°C. Best outdoor racing month. Dry and comfortable.',
    },
  },
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const COUNTRY_CODES: Record<string, string> = {
  'Australia':   'AU',
  'New Zealand': 'NZ',
  'Singapore':   'SG',
  'Japan':       'JP',
  'South Korea': 'KR',
  'Thailand':    'TH',
  'Indonesia':   'ID',
  'Hong Kong':   'HK',
  'China':       'CN',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

type EventRow = Tables<'events'>

type EventCategory = {
  id: string
  name: string
  distance_label: string | null
  entry_fee: number | null
  cutoff_minutes: number | null
  max_participants: number | null
  is_sold_out: boolean
  sort_order: number
}

// ─── Schema ───────────────────────────────────────────────────────────────────

function buildEventSchema(event: EventRow, venue: string | null) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au'
  const regUrl = event.registration_url ?? event.website_url
  const isSoldOut = event.registration_status === 'sold_out'

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    url: `${siteUrl}/events/${event.slug}`,
    ...(event.start_date !== '2099-01-01' ? { startDate: event.start_date } : {}),
    ...(event.end_date && event.start_date !== '2099-01-01' ? { endDate: event.end_date } : {}),
    eventStatus:
      event.event_status === 'cancelled'  ? 'https://schema.org/EventCancelled' :
      event.event_status === 'postponed'  ? 'https://schema.org/EventPostponed' :
      event.event_status === 'tbc'        ? 'https://schema.org/EventPostponed' :
      event.start_date === '2099-01-01'   ? 'https://schema.org/EventPostponed' :
                                            'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: event.discipline,
    location: {
      '@type': 'Place',
      ...(venue ? { name: venue } : {}),
      ...(event.venue_address ? { address: { '@type': 'PostalAddress', streetAddress: event.venue_address, ...(event.city ? { addressLocality: event.city } : {}), ...(event.country ? { addressCountry: COUNTRY_CODES[event.country] ?? event.country } : {}) } } : {
        address: {
          '@type': 'PostalAddress',
          ...(event.city ? { addressLocality: event.city } : {}),
          ...(event.country ? { addressCountry: COUNTRY_CODES[event.country] ?? event.country } : {}),
        },
      }),
    },
    ...(event.organiser || event.discipline
      ? { organizer: { '@type': 'Organization', name: event.organiser ?? event.discipline } }
      : {}),
    ...(event.website_url ? { sameAs: event.website_url } : {}),
    ...(regUrl && event.entry_fee_from != null ? {
      offers: {
        '@type': 'Offer',
        url: regUrl,
        price: event.entry_fee_from,
        priceCurrency: event.entry_fee_currency ?? 'AUD',
        availability: isSoldOut
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
        ...(event.registration_deadline ? { validThrough: event.registration_deadline } : {}),
      },
    } : {}),
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, discipline, city, country, venue_name, hero_image_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!event) return { title: 'Event not found' }

  const location = [event.city, event.country].filter(Boolean).join(', ')
  const metaDesc =
    event.description && !event.description.startsWith('Venue:')
      ? event.description
      : `${event.title} — ${event.discipline} in ${location}. Dates, categories, entry fees, venue and race guide.`

  const ogImage = event.hero_image_url
    ? { url: event.hero_image_url, width: 1200, height: 630 }
    : { url: '/opengraph-image', width: 1200, height: 630 }

  return {
    title: `${event.title} — ${event.discipline} Race Guide`,
    description: metaDesc,
    openGraph: {
      title: `${event.title} — Race Guide`,
      description: metaDesc,
      type: 'article',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} — Race Guide`,
      description: metaDesc,
      images: [ogImage.url],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: event }, { data: { user } }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!event) notFound()

  const today = new Date().toISOString().split('T')[0]
  const isTBC = event.start_date === '2099-01-01'
  const venue = event.venue_name ?? extractVenue(event.description)
  const location = [event.city, event.region, event.country].filter(Boolean).join(', ')

  const [categories, seriesRaw, relatedRaw, isSaved, saveCount] = await Promise.all([
    supabase
      .from('event_categories')
      .select('id, name, distance_label, entry_fee, cutoff_minutes, max_participants, is_sold_out, sort_order')
      .eq('event_id', event.id)
      .order('sort_order')
      .then(({ data }) => (data ?? []) as EventCategory[]),
    event.series_slug
      ? supabase
          .from('events')
          .select('title, slug, city, country, start_date, discipline')
          .eq('series_slug', event.series_slug)
          .eq('is_published', true)
          .neq('slug', slug)
          .gte('start_date', today)
          .order('start_date', { ascending: true })
          .limit(4)
          .then(({ data }) => data ?? [])
      : Promise.resolve([]),
    supabase
      .from('events')
      .select('title, slug, city, country, start_date, discipline')
      .eq('is_published', true)
      .neq('slug', slug)
      .order('start_date', { ascending: true })
      .limit(20)
      .then(({ data }) => data ?? []),
    user
      ? supabase
          .from('favourites')
          .select('id')
          .eq('user_id', user.id)
          .eq('entity_type', 'event')
          .eq('entity_id', event.id)
          .single()
          .then(({ data }) => !!data)
      : Promise.resolve(false),
    supabase
      .rpc('get_event_save_count', { p_event_id: event.id })
      .then(({ data }) => (data as number | null) ?? 0),
  ])

  const seriesEvents = seriesRaw as typeof relatedRaw
  const related = seriesEvents.length > 0
    ? seriesEvents
    : relatedRaw.filter((e) => e.discipline === event.discipline && e.start_date >= today).slice(0, 4)
  const relatedHeading = seriesEvents.length > 0 ? 'Also in This Series' : `More ${event.discipline} Events`

  const eventSchema = buildEventSchema(event, venue)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      {/* Hero */}
      <HeroSection event={event} isTBC={isTBC} venue={venue} />

      <div className={`container-page pt-6 pb-10${event.website_url ? ' pb-32 lg:pb-10' : ''}`}>
        <Link href="/events" className="btn-ghost mb-6 inline-flex px-0 text-ink-muted">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {/* ── Event status banner ─────────────────────────────────────────── */}
        <EventStatusBanner status={event.event_status} />

        <div className="grid gap-10 lg:grid-cols-3">

          {/* ── Main content ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <AboutSection discipline={event.discipline} event={event} />

            {/* Race format (discipline-specific stations / distances) */}
            {event.discipline === 'HYROX' && <HYROXRaceFormat />}
            {event.discipline === 'Deka Fit' && <DekaRaceFormat />}
            {(event.discipline === 'Ironman' || event.discipline === 'Ironman 70.3') && (
              <IronmanDistances discipline={event.discipline} />
            )}

            {/* Event categories — DB-driven, discipline fallback */}
            <EventCategoriesSection categories={categories} discipline={event.discipline} />

            {/* Who should enter — discipline-specific */}
            {event.discipline === 'HYROX' && <HYROXWhoShouldEnter />}
            {event.discipline === 'Spartan Race' && <SpartanWhoShouldEnter />}
            {(event.discipline === 'Ironman' || event.discipline === 'Ironman 70.3') && (
              <IronmanWhoShouldEnter discipline={event.discipline} />
            )}
            {(event.discipline === 'Marathon' || event.discipline === 'Trail Running') && (
              <RunningWhoShouldEnter discipline={event.discipline} />
            )}

            {/* Registration information */}
            <RegistrationSection event={event} />

            {/* Registration policies — transfer, deferral, qualification, age */}
            <RegistrationPoliciesSection event={event} />

            {/* Entry fees */}
            <EntryFeesSection event={event} categories={categories} />

            {/* Difficulty */}
            {event.difficulty !== null && <DifficultySection difficulty={event.difficulty} />}

            {/* What's included */}
            {(event.whats_included?.length ?? 0) > 0 && (
              <WhatsIncludedSection items={event.whats_included!} />
            )}

            {/* Venue */}
            <VenueSection event={event} venue={venue} />

            {/* Race weekend resources — athlete guide, course map, GPX */}
            <RaceWeekendResourcesSection event={event} />

            {/* Travel & logistics */}
            <TravelLogisticsSection event={event} isTBC={isTBC} />

            {/* Race weekend tips */}
            <WeekendTipsSection />

            {/* FAQs */}
            <FaqSection discipline={event.discipline} />
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            <div className="card space-y-4">
              <h2 className="font-heading font-semibold text-ink">Event Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-ink">
                      {isTBC ? 'Date TBC' : formatDate(event.start_date)}
                    </div>
                    {!isTBC && event.end_date && event.end_date !== event.start_date && (
                      <div className="text-ink-muted">to {formatDate(event.end_date)}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                  <div>
                    {venue && <div className="font-medium text-ink">{venue}</div>}
                    <div className="text-ink-muted">{location}</div>
                  </div>
                </div>
                {event.organiser && (
                  <div className="flex items-start gap-3">
                    <Flag className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                    <div>
                      <div className="text-ink-muted text-xs">Organiser</div>
                      <div className="font-medium text-ink">{event.organiser}</div>
                    </div>
                  </div>
                )}
                {(event.elevation_gain_m || event.surface_type) && (
                  <div className="flex items-start gap-3">
                    <Mountain className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      {event.elevation_gain_m && (
                        <div className="font-medium text-ink">{event.elevation_gain_m.toLocaleString()} m elevation</div>
                      )}
                      {event.surface_type && (
                        <div className="text-ink-muted capitalize">{event.surface_type} surface</div>
                      )}
                    </div>
                  </div>
                )}
                {(event.relay_available || event.team_available || event.wheelchair_available) && (
                  <div className="flex flex-wrap gap-1.5">
                    {event.relay_available && (
                      <span className="rounded-full border border-wire px-2 py-0.5 text-xs text-ink-muted">Relay</span>
                    )}
                    {event.team_available && (
                      <span className="rounded-full border border-wire px-2 py-0.5 text-xs text-ink-muted">Team</span>
                    )}
                    {event.wheelchair_available && (
                      <span className="rounded-full border border-wire px-2 py-0.5 text-xs text-ink-muted">Wheelchair</span>
                    )}
                  </div>
                )}
              </div>

              {event.registration_status && (
                <RegistrationStatusBadge status={event.registration_status} />
              )}

              {!isTBC && (() => {
                const days = getDaysUntil(event.start_date)
                if (days < 0) return null
                return (
                  <div className="rounded-lg bg-panel-raised px-4 py-3 text-center">
                    <div className="tabular-nums font-heading text-3xl font-bold text-mint leading-none">
                      {days === 0 ? 'Today' : days}
                    </div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-widest text-ink-muted">
                      {days === 0 ? 'Race day!' : days === 1 ? 'day to race day' : 'days to race day'}
                    </div>
                  </div>
                )
              })()}

              {event.early_bird_closes_date && (() => {
                const d = new Date(event.early_bird_closes_date + 'T00:00:00')
                const days = Math.round((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000)
                if (days <= 0 || days > 30) return null
                return (
                  <div className="rounded-lg bg-mint/10 border border-mint/20 px-3 py-2.5 text-sm">
                    <span className="text-mint font-medium">Early bird closes in {days} day{days !== 1 ? 's' : ''}</span>
                    {event.early_bird_price_from != null && (
                      <div className="mt-0.5 text-ink">From ${event.early_bird_price_from.toLocaleString('en-AU', { minimumFractionDigits: 0 })} {event.entry_fee_currency}</div>
                    )}
                  </div>
                )
              })()}

              {event.ballot_opens_date && (() => {
                const d = new Date(event.ballot_opens_date + 'T00:00:00')
                const days = Math.round((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000)
                if (days <= 0 || days > 30) return null
                return (
                  <div className="rounded-lg bg-mint/10 border border-mint/20 px-3 py-2.5 text-sm">
                    <span className="text-mint font-medium">Ballot opens in {days} day{days !== 1 ? 's' : ''}</span>
                    <div className="mt-0.5 text-ink">{formatDate(event.ballot_opens_date)}</div>
                  </div>
                )
              })()}

              {event.registration_deadline && (
                <DeadlineCountdown
                  date={event.registration_deadline}
                  label="Registration"
                  variant="registration"
                />
              )}
              {event.next_price_increase_date && (
                <DeadlineCountdown
                  date={event.next_price_increase_date}
                  label="Price increase"
                  variant="price"
                />
              )}

              {(event.registration_url ?? event.website_url) && (
                <a
                  href={(event.registration_url ?? event.website_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <Globe className="h-4 w-4" />
                  {event.ballot_required ? 'Apply for Ballot' : event.waitlist_open ? 'Join Waitlist' : 'Register Now'}
                </a>
              )}

              <a href={`/api/events/${event.slug}/ical`} className="btn-secondary w-full justify-center">
                <Calendar className="h-4 w-4" /> Add to Calendar
              </a>

              <SaveButton eventId={event.id} initialSaved={isSaved} />

              {saveCount > 0 && (
                <p className="text-center text-xs text-ink-subtle">
                  {saveCount} {saveCount === 1 ? 'athlete' : 'athletes'} saved this event
                </p>
              )}
            </div>

            <QuickFactsSidebar discipline={event.discipline} />

            {related.length > 0 && (
              <div className="card space-y-3 text-sm">
                <h2 className="font-heading font-semibold text-ink">{relatedHeading}</h2>
                <ul className="space-y-2 text-ink-muted">
                  {related.map((e) => (
                    <li key={e.slug}>
                      <Link href={`/events/${e.slug}`} className="hover:text-ink transition-colors">
                        {e.title} →
                      </Link>
                      <div className="text-ink-muted text-xs mt-0.5">
                        {e.city}, {e.country} · {formatDate(e.start_date)}
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/events?discipline=${encodeURIComponent(event.discipline)}`}
                  className="text-mint hover:text-mint-300 transition-colors text-xs"
                >
                  View all {event.discipline} events →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Conversion CTAs */}
      <ConversionCTAsSection
        event={event}
        isSaved={isSaved}
        saveCount={saveCount}
        hasUser={!!user}
      />

      {/* Sticky mobile CTA — My Season */}
      <MobileSeasonCta
        eventId={event.id}
        slug={event.slug}
        initialSaved={isSaved}
        hasUser={!!user}
        eventTitle={event.title}
        startDate={event.start_date}
        discipline={event.discipline}
        isTBC={isTBC}
      />
    </>
  )
}

// ─── Event status banner ──────────────────────────────────────────────────────

function EventStatusBanner({ status }: { status: string }) {
  if (!status || status === 'confirmed' || status === 'completed') return null

  if (status === 'cancelled') {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
        <XCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
        <div>
          <p className="font-semibold text-red-400">This event has been cancelled</p>
          <p className="mt-0.5 text-sm text-red-400/70">
            Check the official website for details and refund information.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'postponed') {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-400">This event has been postponed</p>
          <p className="mt-0.5 text-sm text-amber-400/70">
            A new date will be announced by the organiser. Check the official website for updates.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'tbc') {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-wire bg-panel px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-ink-muted mt-0.5" />
        <p className="text-sm text-ink-muted">
          Details for this event have not yet been officially confirmed. Dates and information are subject to change.
        </p>
      </div>
    )
  }

  return null
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-wire pb-3 font-heading text-xl font-bold text-ink">
      {children}
    </h2>
  )
}

function extractVenue(description: string | null): string | null {
  if (!description) return null
  const match = description.match(/^Venue:\s*(.+)/i)
  return match ? match[1].trim() : null
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection({ event, isTBC, venue }: { event: EventRow; isTBC: boolean; venue: string | null }) {
  const dateStr = isTBC ? 'Date TBC' : formatDate(event.start_date)
  const endStr =
    !isTBC && event.end_date && event.end_date !== event.start_date
      ? ` – ${formatDate(event.end_date)}`
      : ''
  const heroLocation = [venue ?? event.city, event.country].filter(Boolean).join(', ')

  const content = (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="brand">{event.discipline}</Badge>
        <Badge variant="outline">{event.event_type}</Badge>
        {event.is_featured && <Badge variant="warning">Featured</Badge>}
      </div>
      <h1 className="font-heading text-3xl font-bold text-white leading-tight md:text-4xl">
        {event.title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
        {heroLocation && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-mint shrink-0" />
            {heroLocation}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-mint shrink-0" />
          {dateStr}{endStr}
        </span>
      </div>
      {(event.registration_url ?? event.website_url) && (
        <div className="pt-2">
          <a
            href={(event.registration_url ?? event.website_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Globe className="h-4 w-4" />
            {event.ballot_required ? 'Apply for Ballot' : event.waitlist_open ? 'Join Waitlist' : 'Register Now'}
          </a>
        </div>
      )}
    </div>
  )

  if (event.hero_image_url) {
    return (
      <div className="relative min-h-72 overflow-hidden bg-slate-950 flex items-end md:min-h-96">
        <Image
          src={event.hero_image_url}
          alt={event.title}
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent" />
        <div className="relative container-page pb-10 pt-8 w-full">{content}</div>
      </div>
    )
  }

  return (
    <div className="border-b border-wire bg-gradient-to-b from-panel to-canvas">
      <div className="container-page py-12 md:py-16">{content}</div>
    </div>
  )
}

// ─── About section ────────────────────────────────────────────────────────────

function AboutSection({ discipline, event }: { discipline: string; event: EventRow }) {
  const location = [event.city, event.country].filter(Boolean).join(', ')

  // When event-specific overview is available, show it instead of generic copy
  if (event.event_specific_overview) {
    return (
      <section>
        <SectionHeading>About the Event</SectionHeading>
        <div className="space-y-4 text-ink leading-relaxed text-[0.9375rem]">
          {event.event_specific_overview.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          {event.format_notes && (
            <div className="mt-4 rounded-xl border border-wire bg-panel px-5 py-4 text-sm text-ink-muted leading-relaxed">
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-2">Format Notes</span>
              {event.format_notes}
            </div>
          )}
        </div>
      </section>
    )
  }

  const editorialCopy: Record<string, React.ReactNode> = {
    'CrossFit': (
      <>
        <p>CrossFit competitions test athletes across weightlifting, gymnastics and metabolic conditioning in constantly varied workouts (WODs) scored for time, load or reps. Events range from local box throwdowns and regional invitationals to Licensed Sanctional competitions that qualify athletes for the CrossFit Games.</p>
        <p>The CrossFit Open, held annually in February and March, is the world&apos;s largest online fitness competition. The top finishers progress to the Quarterfinals, Semifinals and ultimately the CrossFit Games. Local throwdowns run throughout the year, providing competitive opportunities at every fitness level.</p>
        <p>CrossFit competitions typically span one or two days and include multiple WODs announced at or shortly before the event. Most events offer RX, Scaled and Masters divisions, making competition accessible for athletes at every stage of their CrossFit journey.</p>
      </>
    ),
    'HYROX': (
      <>
        <p>HYROX is the world&apos;s fastest-growing fitness race — a standardised format that combines 8 × 1 km runs with 8 functional workout stations under a single roof. Every HYROX event worldwide uses the exact same stations, distances and weights, meaning your finish time in {location} is directly comparable to athletes who raced in London, Tokyo or New York.</p>
        <p>The event attracts athletes of all levels: recreational gym-goers chasing their first completion race side-by-side with competitive athletes targeting a HYROX World Championships qualification. With Open, Pro, Doubles and Relay divisions, there is a format for everyone.</p>
        <p>HYROX events are held indoors, which means spectators get an unobstructed view of the full race floor — every workout station and every running lap — making HYROX one of the most spectator-friendly fitness races on the planet.</p>
      </>
    ),
    'Spartan Race': (
      <>
        <p>Spartan Race is the world&apos;s largest obstacle course race series, with over 200 events annually across 40+ countries. Races are held on rugged, natural terrain — mountains, farms and open land — and include a mix of running and purpose-built obstacles including rope climbs, barbed wire crawls, bucket carries, spear throws and heavy carries.</p>
        <p>Unlike road races, Spartan events are held on private property and often involve significant elevation gain. Athletes who fail an obstacle must complete a 30-burpee penalty before continuing.</p>
        <p>Multiple race formats mean that whether you&apos;re a first-time obstacle racer or a seasoned ultra-endurance competitor, there is a Spartan distance suited to your fitness level.</p>
      </>
    ),
    'Ironman': (
      <>
        <p>IRONMAN is the pinnacle of long-course triathlon: a continuous 3.86 km swim, 180.25 km bike ride and 42.2 km marathon run, completed in a single day within a 17-hour cut-off. It is widely regarded as one of the most demanding one-day endurance challenges in sport.</p>
        <p>The Asia Pacific circuit includes events in New Zealand, Australia, Malaysia and Japan — each with its own character in terms of course terrain, water conditions and crowd atmosphere. All IRONMAN events offer Kona and World Championship qualification slots distributed across age groups.</p>
      </>
    ),
    'Ironman 70.3': (
      <>
        <p>IRONMAN 70.3 — named after the total race distance in miles — combines a 1.93 km swim, 90.12 km bike and 21.1 km run. The 8:30 cut-off makes it the natural progression from sprint and Olympic-distance triathlon, and the most popular long-course format for athletes preparing for a full IRONMAN.</p>
        <p>IRONMAN 70.3 events qualify athletes for the annual 70.3 World Championship. The Asia Pacific circuit offers multiple 70.3 options across Australia, New Zealand and Southeast Asia.</p>
      </>
    ),
    'Marathon': (
      <>
        <p>The marathon — 42.195 km — is one of the oldest and most celebrated distance running events in the world. Whether you&apos;re running your first marathon or targeting a qualifying time, road marathons remain the benchmark distance goal for long-distance runners at every level.</p>
        <p>Marathons in the Asia Pacific region range from flat, fast city courses ideal for personal bests to scenic coastal and mountain routes designed for the experience over the clock.</p>
      </>
    ),
    'Trail Running': (
      <>
        <p>Trail running takes the marathon concept off-road — onto mountain paths, forest tracks and natural terrain where elevation, surface and distance combine to challenge athletes in entirely different ways to road racing. Events range from 10 km social trail runs to 100+ km ultra-distance races.</p>
        <p>Asia Pacific&apos;s trail running scene spans some of the world&apos;s most spectacular terrain — from Japan&apos;s volcanic mountain trails to New Zealand&apos;s alpine wilderness and Australia&apos;s rugged national parks.</p>
      </>
    ),
    'Deka Fit': (
      <>
        <p>Deka Fit is an indoor fitness race that blends the HYROX concept with its own unique format: 10 × 500 m runs alternating with 10 workout stations — Ski Erg, Sled Push, Sled Pull, Burpee Jumps, Row Erg, Farmer&apos;s Carry, Sandbag Lunges, Wall Balls, Box Jumps and Battle Ropes.</p>
        <p>Like HYROX, Deka Fit uses a standardised global format so all results are directly comparable. The race is held indoors, spectator-friendly, and offers divisions for athletes of all fitness backgrounds.</p>
      </>
    ),
  }

  const hasDescription = event.description && !event.description.startsWith('Venue:')
  const fallback = hasDescription
    ? <p>{event.description}</p>
    : <p>{event.title} is a {discipline} event in {location}. Visit the official website for full event details, course information and registration.</p>

  return (
    <section>
      <SectionHeading>About the Event</SectionHeading>
      <div className="space-y-4 text-ink leading-relaxed text-[0.9375rem]">
        {editorialCopy[discipline] ?? fallback}
        {event.format_notes && (
          <div className="mt-4 rounded-xl border border-wire bg-panel px-5 py-4 text-sm text-ink-muted leading-relaxed">
            <span className="block text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-2">Format Notes</span>
            {event.format_notes}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── HYROX race format ────────────────────────────────────────────────────────

function HYROXRaceFormat() {
  return (
    <section>
      <SectionHeading>Race Format</SectionHeading>
      <p className="text-ink-muted mb-6">
        8 rounds. Each round: 1 km run → workout station. Total running: 8 km.
        Workout volume is fixed across all divisions — only weights and vest requirements differ.
      </p>
      <div className="overflow-x-auto rounded-xl border border-wire">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="w-8 px-4 py-3 text-left text-ink-muted font-medium">#</th>
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Station</th>
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Distance / Reps</th>
              <th className="hidden px-4 py-3 text-left text-ink-muted font-medium sm:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {HYROX_STATIONS.map((s, i) => (
              <tr key={s.order} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className="px-4 py-3 text-mint font-bold">{s.order}</td>
                <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                <td className="px-4 py-3 text-ink">{s.distance}</td>
                <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Pro division distances and weights may vary — confirm with the official HYROX race guide.
      </p>
    </section>
  )
}

// ─── Deka race format ─────────────────────────────────────────────────────────

function DekaRaceFormat() {
  return (
    <section>
      <SectionHeading>Race Format</SectionHeading>
      <p className="text-ink-muted mb-6">
        10 rounds. Each round: 500 m run → workout station. Total running: 5 km.
        All results are globally comparable — every Deka Fit event uses the same format.
      </p>
      <div className="overflow-x-auto rounded-xl border border-wire">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="w-8 px-4 py-3 text-left text-ink-muted font-medium">#</th>
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Station</th>
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Distance / Reps</th>
            </tr>
          </thead>
          <tbody>
            {DEKA_STATIONS.map((s, i) => (
              <tr key={s.order} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className="px-4 py-3 text-mint font-bold">{s.order}</td>
                <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                <td className="px-4 py-3 text-ink">{s.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Ironman race distances ────────────────────────────────────────────────────

function IronmanDistances({ discipline }: { discipline: string }) {
  const d = IRONMAN_DISTANCES[discipline]
  if (!d) return null
  return (
    <section>
      <SectionHeading>Race Distances</SectionHeading>
      <div className="overflow-x-auto rounded-xl border border-wire">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Leg</th>
              <th className="px-4 py-3 text-left text-ink-muted font-medium">Distance</th>
            </tr>
          </thead>
          <tbody>
            {[
              { leg: 'Swim', dist: d.swim },
              { leg: 'Bike', dist: d.bike },
              { leg: 'Run',  dist: d.run  },
              { leg: 'Total', dist: d.total },
            ].map((row, i) => (
              <tr key={row.leg} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className={`px-4 py-3 font-medium ${row.leg === 'Total' ? 'text-mint' : 'text-ink'}`}>{row.leg}</td>
                <td className="px-4 py-3 text-ink">{row.dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Event categories ─────────────────────────────────────────────────────────

function EventCategoriesSection({ categories, discipline }: { categories: EventCategory[]; discipline: string }) {
  if (categories.length > 0) {
    return (
      <section>
        <SectionHeading>Event Categories</SectionHeading>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="card flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{cat.name}</h3>
                  {cat.is_sold_out && <Badge variant="danger">Sold Out</Badge>}
                </div>
                {cat.distance_label && (
                  <p className="text-sm text-ink-muted">{cat.distance_label}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-ink-muted mt-1">
                  {cat.cutoff_minutes !== null && (
                    <span>Cutoff: {Math.floor(cat.cutoff_minutes / 60)}h {cat.cutoff_minutes % 60 > 0 ? `${cat.cutoff_minutes % 60}m` : ''}</span>
                  )}
                  {cat.max_participants !== null && (
                    <span>Max {cat.max_participants.toLocaleString()} participants</span>
                  )}
                </div>
              </div>
              {cat.entry_fee !== null && (
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-ink">${cat.entry_fee.toLocaleString('en-AU', { minimumFractionDigits: 0 })}</div>
                  <div className="text-xs text-ink-muted">AUD</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (discipline === 'HYROX') {
    return (
      <section>
        <SectionHeading>Event Categories</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'Open Individual',  desc: 'No weight vest. Standard distances. The entry-level division — great for first-timers and recreational athletes.', tag: 'Most Popular', variant: 'brand' as const },
            { name: 'Pro Individual',   desc: 'Weight vest required (10 kg men / 6 kg women). Shorter station distances. For competitive athletes.', tag: 'Competitive', variant: 'warning' as const },
            { name: 'Doubles',          desc: 'Two athletes alternate stations and share running laps. Ideal for training partners.', tag: 'Team of 2', variant: 'success' as const },
            { name: 'Relay',            desc: 'Teams of up to four split all exercises. The most social format — perfect for groups and corporate teams.', tag: 'Team of 4', variant: 'success' as const },
          ].map((cat) => (
            <div key={cat.name} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-ink">{cat.name}</h3>
                <Badge variant={cat.variant}>{cat.tag}</Badge>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (discipline === 'Spartan Race') {
    return (
      <section>
        <SectionHeading>Race Types</SectionHeading>
        <p className="text-ink-muted mb-6 text-sm">
          Most Spartan events offer multiple race formats on the same weekend. Distances are approximate — actual course length depends on terrain.
        </p>
        <div className="overflow-x-auto rounded-xl border border-wire">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire bg-panel">
                <th className="px-4 py-3 text-left text-ink-muted font-medium">Format</th>
                <th className="px-4 py-3 text-left text-ink-muted font-medium">Distance</th>
                <th className="px-4 py-3 text-left text-ink-muted font-medium">Obstacles</th>
                <th className="hidden px-4 py-3 text-left text-ink-muted font-medium sm:table-cell">Level</th>
              </tr>
            </thead>
            <tbody>
              {SPARTAN_FORMATS.map((f, i) => (
                <tr key={f.name} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                  <td className="px-4 py-3 text-ink font-medium">{f.name}</td>
                  <td className="px-4 py-3 text-ink">{f.distance}</td>
                  <td className="px-4 py-3 text-ink">{f.obstacles}</td>
                  <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{f.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Check the event registration page to confirm which formats are available at this specific event.
        </p>
      </section>
    )
  }

  return null
}

// ─── Who should enter ─────────────────────────────────────────────────────────

function HYROXWhoShouldEnter() {
  return (
    <section>
      <SectionHeading>Who Should Enter?</SectionHeading>
      <div className="space-y-4">
        {[
          { title: 'Beginner',    cta: 'Target finish: 90–120 min', desc: "Can run 5 km and has 3–6 months of gym training. HYROX Open is well within reach with a 12–16 week prep block." },
          { title: 'Intermediate', cta: 'Target finish: 75–90 min', desc: "Regular gym-goer with solid cardio. Focus on your running pace between stations — that's where most athletes lose time." },
          { title: 'Competitive', cta: 'Target finish: Sub-75 min (Open) / Sub-60 min (Pro)', desc: 'CrossFit, triathlon or elite running background. Consider the Pro division if targeting a top-10 age-group result.' },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-ink mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SpartanWhoShouldEnter() {
  return (
    <section>
      <SectionHeading>Who Should Enter?</SectionHeading>
      <div className="space-y-4">
        {[
          { title: 'First-timers', desc: "The Spartan Sprint (~5 km) is designed as an accessible entry point. You need basic running fitness and a willingness to get muddy — no prior obstacle experience required.", cta: 'Start with: Spartan Sprint' },
          { title: 'Intermediate', desc: "If you've completed a Sprint and want more challenge, the Super (~10 km) is the natural next step. Comfortable with 10 km trail runs and basic strength training.", cta: 'Aim for: Spartan Super or Trifecta' },
          { title: 'Experienced',  desc: 'The Beast and Ultra formats demand serious endurance base and obstacle proficiency. Expect significant elevation gain and time on feet of 4–12+ hours.', cta: 'Push for: Spartan Beast or Ultra' },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-ink mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function IronmanWhoShouldEnter({ discipline }: { discipline: string }) {
  return (
    <section>
      <SectionHeading>Who Should Enter?</SectionHeading>
      <div className="space-y-4">
        {[
          {
            title: 'Beginners',
            desc: `${discipline} is a serious long-course commitment. Athletes new to triathlon should start with a sprint or Olympic-distance event first. A minimum of ${discipline === 'Ironman' ? '12–18 months' : '6–12 months'} of structured triathlon training is recommended.`,
            cta: `Minimum base: ${discipline === 'Ironman' ? '12–18 months' : '6–12 months'} triathlon training`,
          },
          {
            title: 'Intermediate',
            desc: "Solid swim, bike and run base across all three disciplines. You've completed Olympic-distance triathlon and can comfortably train 10–15 hours per week.",
            cta: 'Build a 20–24 week specific training block',
          },
          {
            title: 'Experienced',
            desc: `You've completed a ${discipline === 'Ironman 70.3' ? 'full IRONMAN or multiple 70.3s' : 'prior full IRONMAN'} and are targeting a competitive finish or World Champs qualification.`,
            cta: 'Focus: race-specific pacing and nutrition strategy',
          },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-ink mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RunningWhoShouldEnter({ discipline }: { discipline: string }) {
  const isTrail = discipline === 'Trail Running'
  return (
    <section>
      <SectionHeading>Who Should Enter?</SectionHeading>
      <div className="space-y-4">
        {[
          {
            title: 'Beginner',
            desc: isTrail
              ? 'Trail running events typically offer shorter distances (10–15 km) that are suitable for runners with a solid road running base who want their first off-road experience.'
              : 'If you can run 30 km in training, you have the base to finish a marathon. Allow 16–20 weeks of structured marathon-specific training before race day.',
            cta: isTrail ? 'Start with a 10–15 km trail event' : 'Target finish: 4:30–6:00',
          },
          {
            title: 'Intermediate',
            desc: isTrail
              ? 'Comfortable on technical terrain and can run 20+ km on trails. Look for 25–50 km events with moderate elevation gain.'
              : "You've completed a half marathon and have 3–4 days of running per week. Focus on your long run progression and race-day pacing strategy.",
            cta: isTrail ? 'Target distance: 25–50 km' : 'Target finish: 3:30–4:30',
          },
          {
            title: 'Experienced',
            desc: isTrail
              ? 'Ultra trail events (50 km+) require serious endurance base, mandatory gear, nutrition strategy and experience navigating night sections.'
              : 'Targeting a personal best or Boston Qualifier. Focus on tempo runs, threshold work and negative-split race execution.',
            cta: isTrail ? 'Tackle an ultra: 50–100 km+' : 'Target finish: Sub-3:30',
          },
        ].map((level) => (
          <div key={level.title} className="card flex gap-4">
            <CheckCircle className="h-5 w-5 text-mint mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-ink mb-1">{level.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{level.desc}</p>
              <p className="mt-2 text-xs font-medium text-mint">{level.cta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Registration information ─────────────────────────────────────────────────

function RegistrationSection({ event }: { event: EventRow }) {
  const hasAnyRegData =
    event.registration_opens_date ||
    event.registration_deadline ||
    event.registration_status ||
    event.ballot_required ||
    event.early_bird_closes_date ||
    event.waitlist_open ||
    event.registration_url

  if (!hasAnyRegData) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function daysFrom(dateStr: string): number {
    const d = new Date(dateStr + 'T00:00:00')
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const opensIn = event.registration_opens_date ? daysFrom(event.registration_opens_date) : null
  const closesIn = event.registration_deadline ? daysFrom(event.registration_deadline) : null
  const earlyBirdDays = event.early_bird_closes_date ? daysFrom(event.early_bird_closes_date) : null
  const ballotOpensDays = event.ballot_opens_date ? daysFrom(event.ballot_opens_date) : null
  const ballotClosesDays = event.ballot_closes_date ? daysFrom(event.ballot_closes_date) : null
  const isBallotActive = ballotOpensDays !== null && ballotOpensDays <= 0 && (ballotClosesDays === null || ballotClosesDays > 0)

  const regCta = event.ballot_apply_url ?? event.registration_url
  const ctaLabel = event.ballot_required ? 'Apply for Ballot' : event.waitlist_open ? 'Join Waitlist' : 'Register Now'

  return (
    <section>
      <SectionHeading>Registration</SectionHeading>
      <div className="space-y-4">

        {/* Status badge */}
        {event.registration_status && (
          <RegistrationStatusBadge status={event.registration_status} />
        )}

        {/* ── Ballot section ──────────────────────────────────── */}
        {event.ballot_required && (
          <div className="card space-y-4 border-mint/20 bg-mint/5">
            <div className="flex items-start gap-3">
              <BallotIcon className="h-5 w-5 shrink-0 text-mint mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink">Ballot Entry</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  This event uses a ballot (lottery) system. Athletes apply during the ballot window and places are allocated randomly.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {event.ballot_opens_date && (
                <div className="rounded-lg border border-wire bg-canvas px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Ballot Opens</div>
                  <div className="mt-1 font-medium text-ink">{formatDate(event.ballot_opens_date)}</div>
                  {ballotOpensDays !== null && ballotOpensDays > 0 && (
                    <div className="mt-0.5 text-xs text-ink-subtle">In {ballotOpensDays} day{ballotOpensDays !== 1 ? 's' : ''}</div>
                  )}
                  {ballotOpensDays !== null && ballotOpensDays <= 0 && (
                    <div className="mt-0.5 text-xs text-mint">Now open</div>
                  )}
                </div>
              )}
              {event.ballot_closes_date && (
                <div className={`rounded-lg border px-4 py-3 ${ballotClosesDays !== null && ballotClosesDays <= 7 && ballotClosesDays > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-wire bg-canvas'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Ballot Closes</div>
                  <div className="mt-1 font-medium text-ink">{formatDate(event.ballot_closes_date)}</div>
                  {ballotClosesDays !== null && ballotClosesDays > 0 && (
                    <div className={`mt-0.5 text-xs ${ballotClosesDays <= 7 ? 'text-amber-400' : 'text-ink-subtle'}`}>
                      {ballotClosesDays === 1 ? 'Closes tomorrow' : `Closes in ${ballotClosesDays} days`}
                    </div>
                  )}
                </div>
              )}
              {event.ballot_results_date && (
                <div className="rounded-lg border border-wire bg-canvas px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Results Announced</div>
                  <div className="mt-1 font-medium text-ink">{formatDate(event.ballot_results_date)}</div>
                </div>
              )}
            </div>
            {isBallotActive && event.ballot_apply_url && (
              <a
                href={event.ballot_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                <Globe className="h-4 w-4" /> Apply for Ballot
              </a>
            )}
          </div>
        )}

        {/* ── Early bird section ──────────────────────────────── */}
        {event.early_bird_closes_date && earlyBirdDays !== null && earlyBirdDays > 0 && (
          <div className="card space-y-3 border-mint/20 bg-mint/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <EarlyBirdIcon className="h-5 w-5 shrink-0 text-mint mt-0.5" />
                <div>
                  <h3 className="font-semibold text-ink">
                    Early Bird{' '}
                    <span className={earlyBirdDays <= 7 ? 'text-amber-400' : 'text-mint'}>
                      closes in {earlyBirdDays} day{earlyBirdDays !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-muted">{formatDate(event.early_bird_closes_date)}</p>
                </div>
              </div>
              {event.early_bird_price_from != null && (
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-mint">
                    ${event.early_bird_price_from.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                  </div>
                  {event.entry_fee_from != null && event.entry_fee_from > event.early_bird_price_from && (
                    <div className="text-xs text-ink-muted line-through">
                      ${event.entry_fee_from.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex text-sm"
              >
                <Globe className="h-4 w-4" /> Register at Early Bird Rate
              </a>
            )}
          </div>
        )}

        {/* ── Waitlist section ────────────────────────────────── */}
        {event.waitlist_open && (
          <div className="card space-y-3 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <WaitlistIcon className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink">Waitlist Available</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Registration is currently full. Join the waitlist to be notified if a spot becomes available.
                </p>
              </div>
            </div>
            {event.waitlist_url && (
              <a
                href={event.waitlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex text-sm"
              >
                Join Waitlist
              </a>
            )}
          </div>
        )}

        {/* ── Standard opens / closes dates ──────────────────── */}
        {(event.registration_opens_date || event.registration_deadline) && (
          <div className="card space-y-4 text-sm">
            {event.registration_opens_date && (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-0.5">Registrations Open</div>
                  <div className="font-medium text-ink">{formatDate(event.registration_opens_date)}</div>
                </div>
                {opensIn !== null && (
                  <div className={`shrink-0 text-right text-xs font-medium ${opensIn > 0 ? 'text-ink-subtle' : 'text-mint'}`}>
                    {opensIn > 0 ? `Opens in ${opensIn} day${opensIn !== 1 ? 's' : ''}` : opensIn === 0 ? 'Opens today' : 'Now open'}
                  </div>
                )}
              </div>
            )}
            {event.registration_deadline && (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-0.5">Registrations Close</div>
                  <div className="font-medium text-ink">{formatDate(event.registration_deadline)}</div>
                </div>
                {closesIn !== null && (
                  <div className={`shrink-0 text-right text-xs font-medium ${
                    closesIn < 0 ? 'text-ink-subtle' :
                    closesIn <= 7 ? 'text-amber-400' : 'text-ink-subtle'
                  }`}>
                    {closesIn < 0 ? 'Closed' : closesIn === 0 ? 'Closes today!' : `Closes in ${closesIn} day${closesIn !== 1 ? 's' : ''}`}
                  </div>
                )}
              </div>
            )}
            {regCta && (
              <a href={regCta} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                <Globe className="h-4 w-4" /> {ctaLabel}
              </a>
            )}
          </div>
        )}

        {/* Platform */}
        {event.registration_platform && (
          <p className="text-xs text-ink-muted">
            Registration via <span className="font-medium text-ink">{event.registration_platform}</span>
          </p>
        )}

        <p className="text-xs text-ink-muted border-t border-wire pt-4">
          Always verify registration details on the{' '}
          {event.website_url ? (
            <a href={event.website_url} target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">
              official event website
            </a>
          ) : (
            'official event website'
          )}
          {' '}before committing.
        </p>
      </div>
    </section>
  )
}

// ─── Registration policies ────────────────────────────────────────────────────

function RegistrationPoliciesSection({ event }: { event: EventRow }) {
  const hasPolicies =
    event.transfer_available != null ||
    event.deferral_available != null ||
    event.refund_available != null ||
    event.qualification_required ||
    event.is_qualifier ||
    event.min_age != null ||
    event.max_age != null

  if (!hasPolicies) return null

  return (
    <section>
      <SectionHeading>Policies &amp; Requirements</SectionHeading>
      <div className="space-y-3">

        {/* Qualification required */}
        {event.qualification_required && (
          <div className="card flex items-start gap-3 border-amber-500/20 bg-amber-500/5">
            <QualIcon className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-ink">Qualification Required</h3>
              {event.qualification_notes && (
                <p className="mt-1 text-sm text-ink-muted">{event.qualification_notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Qualifier for a championship */}
        {event.is_qualifier && event.qualifier_for && (
          <div className="card flex items-start gap-3 border-mint/20 bg-mint/5">
            <TrophyIcon className="h-5 w-5 shrink-0 text-mint mt-0.5" />
            <div>
              <h3 className="font-semibold text-ink">Championship Qualifier</h3>
              <p className="mt-1 text-sm text-ink-muted">
                This event awards qualification spots for <span className="font-medium text-ink">{event.qualifier_for}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Transfer / deferral / refund */}
        {(event.transfer_available != null || event.deferral_available != null || event.refund_available != null) && (
          <div className="card space-y-3 text-sm">
            <h3 className="font-semibold text-ink">Cancellation &amp; Transfer</h3>
            <div className="space-y-2">
              <PolicyRow
                label="Transfer"
                available={event.transfer_available}
                deadline={event.transfer_deadline}
              />
              <PolicyRow
                label="Deferral"
                available={event.deferral_available}
                deadline={event.deferral_deadline}
              />
              <PolicyRow
                label="Refund"
                available={event.refund_available}
                deadline={event.refund_deadline}
              />
            </div>
            {event.policies_url && (
              <a href={event.policies_url} target="_blank" rel="noopener noreferrer" className="text-xs text-mint hover:underline">
                Full policies &amp; conditions →
              </a>
            )}
          </div>
        )}

        {/* Age requirements */}
        {(event.min_age != null || event.max_age != null) && (
          <div className="card flex items-center justify-between gap-4 text-sm">
            <span className="text-ink-muted">Age requirements</span>
            <span className="font-medium text-ink">
              {event.min_age != null && event.max_age != null
                ? `${event.min_age}–${event.max_age} years`
                : event.min_age != null
                ? `${event.min_age}+ years`
                : `Under ${event.max_age} years`}
            </span>
          </div>
        )}

        {/* Capacity */}
        {event.total_capacity != null && (
          <div className="card flex items-center justify-between gap-4 text-sm">
            <span className="text-ink-muted">Total capacity</span>
            <span className="font-medium text-ink">{event.total_capacity.toLocaleString()} participants</span>
          </div>
        )}
      </div>
    </section>
  )
}

function PolicyRow({
  label,
  available,
  deadline,
}: {
  label: string
  available: boolean | null
  deadline: string | null
}) {
  if (available === null) return null
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span className={`font-medium ${available ? 'text-green-400' : 'text-red-400'}`}>
        {available
          ? deadline ? `Yes — until ${formatDate(deadline)}` : 'Available'
          : 'Not available'}
      </span>
    </div>
  )
}

// ─── Inline icons (avoid extra lucide imports) ────────────────────────────────

function BallotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="4" y="2" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function EarlyBirdIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WaitlistIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 10h12M4 6h12M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function QualIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M10 2l2.4 5.1 5.6.5-4.1 3.8 1.3 5.5L10 14l-5.2 2.9 1.3-5.5L2 7.6l5.6-.5L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M6 3h8v6a4 4 0 0 1-8 0V3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6H3a2 2 0 0 0 2 2h1M14 6h3a2 2 0 0 1-2 2h-1M10 13v3M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// ─── Entry fees ───────────────────────────────────────────────────────────────

function EntryFeesSection({ event, categories }: { event: EventRow; categories: EventCategory[] }) {
  const currency = event.entry_fee_currency ?? 'AUD'
  const fmt = (n: number) =>
    `${currency} $${n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const categoriesWithFees = categories.filter((c) => c.entry_fee !== null)

  if (categoriesWithFees.length > 0) {
    return (
      <section>
        <SectionHeading>Entry Fees</SectionHeading>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire bg-panel">
                <th className="px-5 py-3 text-left text-ink-muted font-medium">Category</th>
                <th className="px-5 py-3 text-left text-ink-muted font-medium">Fee</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                  <td className="px-5 py-3.5 text-ink font-medium">{cat.name}</td>
                  <td className="px-5 py-3.5 text-ink">
                    {cat.entry_fee !== null ? fmt(cat.entry_fee) : '—'}
                    {cat.is_sold_out && <span className="ml-2 text-xs text-red-400">Sold out</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">Check the official website for current pricing.</p>
      </section>
    )
  }

  if (event.entry_fee_from !== null || event.entry_fee_to !== null) {
    const rangeStr =
      event.entry_fee_from !== null && event.entry_fee_to !== null
        ? `${fmt(event.entry_fee_from)} – ${fmt(event.entry_fee_to)}`
        : event.entry_fee_from !== null
        ? `From ${fmt(event.entry_fee_from)}`
        : `Up to ${fmt(event.entry_fee_to!)}`

    return (
      <section>
        <SectionHeading>Entry Fees</SectionHeading>
        <div className="card">
          <div className="text-2xl font-bold text-ink">{rangeStr}</div>
          <p className="mt-1.5 text-sm text-ink-muted">Entry fee range across all categories.</p>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Fees may increase as the event approaches. Check the official website for current pricing.
        </p>
      </section>
    )
  }

  type Fee = { category: string; price: string }
  const disciplineEstimates: Record<string, Fee[]> = {
    'CrossFit': [
      { category: 'Individual (RX)',     price: '~AUD $80–180' },
      { category: 'Individual (Scaled)', price: '~AUD $60–150' },
      { category: 'Masters divisions',   price: '~AUD $60–150' },
      { category: 'Team (3–5)',          price: '~AUD $200–400 per team' },
    ],
    'HYROX': [
      { category: 'Open Individual', price: '~AUD $175–195' },
      { category: 'Pro Individual',  price: '~AUD $175–195' },
      { category: 'Open Doubles',    price: '~AUD $300–340 per team' },
      { category: 'Open Relay',      price: '~AUD $440–480 per team' },
    ],
    'Spartan Race': [
      { category: 'Spartan Sprint',  price: '~AUD $80–130' },
      { category: 'Spartan Super',   price: '~AUD $100–150' },
      { category: 'Spartan Beast',   price: '~AUD $130–180' },
      { category: 'Trifecta Bundle', price: '~AUD $250–350' },
    ],
    'Ironman': [
      { category: 'Full IRONMAN',  price: '~AUD $800–1,100' },
      { category: 'Relay team (3)', price: '~AUD $400–600 per team' },
    ],
    'Ironman 70.3': [
      { category: 'IRONMAN 70.3', price: '~AUD $350–550' },
      { category: 'Relay team (3)', price: '~AUD $250–400 per team' },
    ],
    'Marathon': [
      { category: 'Full Marathon', price: '~AUD $80–150' },
      { category: 'Half Marathon', price: '~AUD $60–100' },
    ],
    'Trail Running': [
      { category: 'Short (10–21 km)', price: '~AUD $60–120' },
      { category: 'Long (42–100 km)', price: '~AUD $150–350' },
    ],
    'Deka Fit': [
      { category: 'Deka Fit Individual', price: '~AUD $100–140' },
    ],
  }

  const rows = disciplineEstimates[event.discipline]
  if (!rows) return null

  return (
    <section>
      <SectionHeading>Entry Fees</SectionHeading>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wire bg-panel">
              <th className="px-5 py-3 text-left text-ink-muted font-medium">Category</th>
              <th className="px-5 py-3 text-left text-ink-muted font-medium">Approx. Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((fee, i) => (
              <tr key={fee.category} className={`border-b border-wire last:border-0 ${i % 2 === 0 ? '' : 'bg-panel/40'}`}>
                <td className="px-5 py-3.5 text-ink font-medium">{fee.category}</td>
                <td className="px-5 py-3.5 text-ink">{fee.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Prices are approximate based on typical early-bird rates. Fees increase as the event approaches — check the official website for current pricing.
      </p>
    </section>
  )
}

// ─── Difficulty rating ────────────────────────────────────────────────────────

function DifficultySection({ difficulty }: { difficulty: number }) {
  const levels: Record<number, { label: string; desc: string; color: string }> = {
    1: { label: 'Beginner Friendly', desc: 'Suitable for first-time participants with basic fitness. No prior experience required.', color: 'text-green-400' },
    2: { label: 'Moderate', desc: 'Some training required. Most recreational athletes with a consistent gym or running routine can complete this.', color: 'text-mint' },
    3: { label: 'Challenging', desc: 'A solid training base is required. Expect to push your limits. 3–4 months of focused prep recommended.', color: 'text-amber-400' },
    4: { label: 'Hard', desc: 'For experienced athletes with a strong base in the discipline. Not for beginners.', color: 'text-orange-400' },
    5: { label: 'Elite / Extreme', desc: 'Serious competition-level fitness required. Multi-year training background assumed.', color: 'text-red-400' },
  }

  const cfg = levels[Math.min(5, Math.max(1, Math.round(difficulty)))]
  if (!cfg) return null

  return (
    <section>
      <SectionHeading>Difficulty</SectionHeading>
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5" aria-label={`Difficulty: ${difficulty} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-3 w-3 rounded-full ${n <= difficulty ? 'bg-mint' : 'bg-wire'}`}
              />
            ))}
          </div>
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">{cfg.desc}</p>
      </div>
    </section>
  )
}

// ─── What's included ──────────────────────────────────────────────────────────

function WhatsIncludedSection({ items }: { items: string[] }) {
  return (
    <section>
      <SectionHeading>What&apos;s Included</SectionHeading>
      <div className="card">
        <ul className="grid gap-x-6 gap-y-2.5 text-sm text-ink-muted sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-mint mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Venue details ────────────────────────────────────────────────────────────

function VenueSection({ event, venue }: { event: EventRow; venue: string | null }) {
  const mapsUrl =
    event.latitude !== null && event.longitude !== null
      ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [event.venue_address ?? venue ?? event.city, event.country].filter(Boolean).join(', '),
        )}`

  const location = [event.city, event.region, event.country].filter(Boolean).join(', ')

  return (
    <section>
      <SectionHeading>Venue &amp; Location</SectionHeading>
      <div className="card space-y-3">
        {venue && <h3 className="font-semibold text-ink">{venue}</h3>}
        {event.venue_address && (
          <p className="text-sm text-ink-muted">{event.venue_address}</p>
        )}
        {location && <p className="text-sm text-ink-muted">{location}</p>}
        {!venue && !event.venue_address && (
          <p className="text-sm text-ink-muted">
            Venue details will be confirmed closer to the event. Check the official website for the most up-to-date information.
          </p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex"
        >
          <MapPin className="h-4 w-4" /> Open in Google Maps
        </a>
      </div>
    </section>
  )
}

// ─── Race weekend resources ───────────────────────────────────────────────────

function RaceWeekendResourcesSection({ event }: { event: EventRow }) {
  const resources = [
    event.athlete_guide_url && {
      label: 'Athlete Guide',
      href: event.athlete_guide_url,
      icon: <BookOpen className="h-4 w-4 shrink-0" />,
      desc: 'Official information guide — bib collection, schedule, mandatory gear',
    },
    event.course_map_url && {
      label: 'Course Map',
      href: event.course_map_url,
      icon: <Map className="h-4 w-4 shrink-0" />,
      desc: 'Route map, aid stations and key landmarks',
    },
    event.gpx_file_url && {
      label: 'GPX File',
      href: event.gpx_file_url,
      icon: <Download className="h-4 w-4 shrink-0" />,
      desc: 'Download the course to your GPS device or training app',
    },
    event.results_url && {
      label: 'Past Results',
      href: event.results_url,
      icon: <ChevronRight className="h-4 w-4 shrink-0" />,
      desc: 'Finish times from previous editions — use for pacing strategy',
    },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode; desc: string }[]

  if (resources.length === 0) return null

  return (
    <section>
      <SectionHeading>Race Weekend Resources</SectionHeading>
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-start gap-4 transition-colors hover:border-mint/40 group"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint transition-colors group-hover:bg-mint/20">
              {r.icon}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-ink group-hover:text-mint transition-colors">{r.label} →</div>
              <div className="mt-0.5 text-xs text-ink-muted leading-relaxed">{r.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── Travel & logistics ───────────────────────────────────────────────────────

function TravelLogisticsSection({ event, isTBC }: { event: EventRow; isTBC: boolean }) {
  const month = new Date(event.start_date + 'T00:00:00').getMonth() + 1
  const monthName = MONTH_NAMES[month - 1]
  const cityData = event.city ? CITY_DATA[event.city] : undefined
  const climate = !isTBC && cityData ? cityData.climate[month] : undefined
  const isIndoor = ['HYROX', 'CrossFit', 'Deka Fit'].includes(event.discipline)

  const hasTransportCard = event.transport_notes || cityData || event.cbd_to_venue_public_transport_time || event.cbd_to_venue_uber_time
  const hasParkingCard = event.parking_notes || event.parking_url
  const hasSpectatorCard = event.spectator_notes || event.spectator_info_url
  const hasAnything = hasTransportCard || hasParkingCard || hasSpectatorCard || event.accommodation_notes || climate

  if (!hasAnything) return null

  return (
    <section>
      <SectionHeading>Travel &amp; Logistics</SectionHeading>
      <div className="space-y-4">

        {/* ── Getting There ──────────────────────────────────────────────────── */}
        {hasTransportCard && (
          <div className="card space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Train className="h-4 w-4 text-mint shrink-0" />
              Getting There
            </div>

            {/* Event-specific transport notes take priority */}
            {event.transport_notes && (
              <p className="text-sm text-ink-muted leading-relaxed">{event.transport_notes}</p>
            )}

            {/* Travel time estimates */}
            {(event.cbd_to_venue_public_transport_time || event.cbd_to_venue_uber_time) && (
              <div className="grid gap-2 sm:grid-cols-2">
                {event.cbd_to_venue_public_transport_time && (
                  <div className="rounded-lg border border-wire bg-canvas px-4 py-3 text-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Public Transport</div>
                    <div className="font-medium text-ink">{event.cbd_to_venue_public_transport_time}</div>
                    <div className="text-xs text-ink-subtle">from CBD</div>
                    {event.public_transport_url && (
                      <a href={event.public_transport_url} target="_blank" rel="noopener noreferrer"
                        className="mt-1.5 inline-block text-xs text-mint hover:underline">
                        Transport info →
                      </a>
                    )}
                  </div>
                )}
                {event.cbd_to_venue_uber_time && (
                  <div className="rounded-lg border border-wire bg-canvas px-4 py-3 text-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Rideshare</div>
                    <div className="font-medium text-ink">{event.cbd_to_venue_uber_time}</div>
                    {event.cbd_to_venue_uber_price_aud && (
                      <div className="text-xs text-ink-subtle">{event.cbd_to_venue_uber_price_aud} approx.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Generic city transport as fallback when no event-specific data */}
            {!event.transport_notes && !event.cbd_to_venue_public_transport_time && cityData && (
              <div className="space-y-2 text-sm text-ink-muted">
                <div>
                  <span className="font-medium text-ink">Nearest airport — </span>
                  {cityData.airport}.
                </div>
                <div>
                  <span className="font-medium text-ink">Public transport — </span>
                  {cityData.transport}
                </div>
              </div>
            )}

            {/* Airport info as supplement when we have specific data but also have city data */}
            {event.transport_notes && cityData && (
              <div className="border-t border-wire pt-3 text-xs text-ink-muted">
                <span className="font-medium text-ink-subtle">Nearest airport — </span>
                {cityData.airport}.
              </div>
            )}
          </div>
        )}

        {/* ── Parking ───────────────────────────────────────────────────────── */}
        {hasParkingCard && (
          <div className="card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-mint shrink-0" />
              Parking
            </div>
            {event.parking_notes && (
              <p className="text-sm text-ink-muted leading-relaxed">{event.parking_notes}</p>
            )}
            {event.parking_url && (
              <a href={event.parking_url} target="_blank" rel="noopener noreferrer"
                className="inline-block text-sm text-mint hover:underline">
                Official parking information →
              </a>
            )}
          </div>
        )}

        {/* ── Spectators ────────────────────────────────────────────────────── */}
        {hasSpectatorCard && (
          <div className="card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Users className="h-4 w-4 text-mint shrink-0" />
              Spectator Information
            </div>
            {event.spectator_notes && (
              <p className="text-sm text-ink-muted leading-relaxed">{event.spectator_notes}</p>
            )}
            {event.spectator_info_url && (
              <a href={event.spectator_info_url} target="_blank" rel="noopener noreferrer"
                className="inline-block text-sm text-mint hover:underline">
                Full spectator guide →
              </a>
            )}
          </div>
        )}

        {/* ── Accommodation ─────────────────────────────────────────────────── */}
        {event.accommodation_notes ? (
          <div className="card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Users className="h-4 w-4 text-mint shrink-0" />
              Accommodation
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">{event.accommodation_notes}</p>
          </div>
        ) : (
          <div className="card space-y-2 border-mint/20 bg-mint/5">
            <p className="text-xs font-semibold uppercase tracking-widest text-mint">Accommodation Tip</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Book accommodation as soon as your registration is confirmed. Hotels near major race venues fill months in advance — particularly for multi-day events and IRONMAN weekends. Check whether your event has an official athlete block rate before searching independently.
            </p>
          </div>
        )}

        {/* ── Climate ───────────────────────────────────────────────────────── */}
        {climate && (
          <div className="card space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Thermometer className="h-4 w-4 text-mint shrink-0" />
              {monthName} in {event.city}
            </div>
            <p className="text-sm text-ink-muted">{climate}</p>
          </div>
        )}

        {/* ── Race day arrival timing ────────────────────────────────────────── */}
        <div className="card space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Clock className="h-4 w-4 text-mint shrink-0" />
            Race Day Arrival
          </div>
          <p className="text-sm text-ink-muted">
            Plan to arrive at least{' '}
            <span className="font-medium text-ink">{isIndoor ? '90 minutes' : '2 hours'} before your wave start</span>.
            {isIndoor
              ? ' Indoor venues are typically easy to navigate, but entry queues can form during peak wave windows.'
              : ' Outdoor events often use large sites with multiple entry gates — download the venue map in advance.'}
          </p>
        </div>

      </div>
    </section>
  )
}

// ─── Race weekend tips ────────────────────────────────────────────────────────

function WeekendTipsSection() {
  return (
    <section>
      <SectionHeading>Race Weekend Tips</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: <Clock className="h-4 w-4" />, title: 'Arrival', body: 'Arrive at least 90 minutes before your start time. Allow time for bag drop, warm-up and reaching your start corral. Late arrivals risk losing their slot.' },
          { icon: <Train className="h-4 w-4" />, title: 'Public Transport', body: "Where available, public transport is strongly recommended over driving on event days. Check the venue's transport page for specific routes and services." },
          { icon: <MapPin className="h-4 w-4" />, title: 'Parking', body: 'Parking fills quickly at large events. Book in advance if available, or use ride-share services to avoid the stress of finding a space close to the venue.' },
          { icon: <Users className="h-4 w-4" />, title: 'Spectators', body: 'Check whether spectators need tickets. Indoor events like HYROX and Deka Fit typically offer free spectator entry; outdoor events may have different policies.' },
        ].map((tip) => (
          <div key={tip.title} className="card space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-mint">
              {tip.icon} {tip.title}
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>
      <div className="card mt-4">
        <h3 className="font-semibold text-ink mb-3">What to Bring</h3>
        <ul className="grid gap-x-6 gap-y-2 text-sm text-ink-muted sm:grid-cols-2">
          {[
            'Confirmation email or event app entry',
            'Appropriate footwear for the discipline',
            'Race outfit you can move freely in',
            'Water bottle (refill stations on site at most events)',
            'Recovery snack for post-race',
            'Any personal sports nutrition you rely on',
            'Foam roller or resistance band for warm-up',
            'Sunscreen and hat for outdoor events',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-mint mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

function FaqSection({ discipline }: { discipline: string }) {
  type Faq = { q: string; a: string }
  const faqs: Record<string, Faq[]> = {
    'CrossFit': [
      { q: 'What is a CrossFit throwdown?', a: "A CrossFit throwdown is a local or regional competition held at a CrossFit affiliate box or external venue. Athletes complete a series of WODs over one or two days, scored for time, load or reps. Unlike sanctional events, throwdowns are community-organised and the format varies by event." },
      { q: 'What is the CrossFit Open?', a: 'The CrossFit Open is an annual online qualifier held each February–March. Athletes complete three or four workouts over consecutive weeks and submit their scores online. It is the first stage of the CrossFit Games season and the largest online fitness competition in the world — open to all fitness levels.' },
      { q: 'What divisions are available at CrossFit competitions?', a: 'Most CrossFit competitions offer RX (prescribed), Scaled (reduced weights/modifications), and Masters divisions by age group (35+, 40+, 45+, 50+, 55+, 60+). Many events also include Team categories and Adaptive divisions.' },
      { q: 'What does RX mean?', a: 'RX means "as prescribed" — the athlete completes every movement at the specified weight and standard without modifications. Scaled divisions allow athletes to reduce weights or substitute movements.' },
      { q: 'Do I need to be a CrossFit member to compete?', a: "No — most CrossFit competitions are open to all athletes regardless of gym affiliation. A CrossFit membership is not required to register." },
    ],
    'HYROX': [
      { q: 'What exactly is HYROX?', a: "HYROX is a standardised global fitness race: 8 × 1 km runs alternating with 8 workout stations — SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmer's Carry, Sandbag Lunges and Wall Balls. Because the format never changes, every finish time is globally comparable." },
      { q: 'Do I need prior experience to enter?', a: 'No. The Open division is designed for recreational athletes of all fitness levels. If you can run 5 km and have a few months of gym training, you have the base fitness to complete HYROX.' },
      { q: 'What is the difference between Open and Pro?', a: "Pro athletes must wear a weight vest (10 kg men / 6 kg women) for the entire race and some stations have shorter distances. Pro is self-seeded — you don't need to qualify, but expect a harder race." },
      { q: 'Can I race with a friend or team?', a: 'Yes. Doubles pairs two athletes who alternate stations and running. Relay allows teams of up to four. Both formats are available at most HYROX events.' },
      { q: 'What should I specifically train for?', a: "Prioritise your running — 8 km of running between heavy stations is harder than it sounds. Then train the specific movements: SkiErg/Row for pulling endurance, Sled work for leg drive, Wall Balls for shoulder stamina, and Sandbag Lunges for single-leg strength." },
    ],
    'Spartan Race': [
      { q: 'What happens if I fail an obstacle?', a: 'Athletes who fail an obstacle must complete a 30-burpee penalty before moving on. There are no skips or bypasses in the competitive waves — burpees are mandatory.' },
      { q: 'What should I wear for a Spartan Race?', a: "Wear clothes you're happy to destroy. Expect mud, water, barbed wire and rope burns. Trail shoes are essential. Many athletes wear compression gear to protect their skin." },
      { q: 'Is the Trifecta worth it?', a: 'The Spartan Trifecta — completing a Sprint, Super and Beast in one calendar year — is one of the most popular goals in obstacle racing. You receive a unique Trifecta medal for completing all three.' },
      { q: 'Are there cut-off times?', a: "Most Spartan events have a course cut-off. Athletes who don't reach a checkpoint by the cut-off time may be pulled from the course. Check your specific event details." },
    ],
    'Ironman': [
      { q: 'What is the time limit for an IRONMAN?', a: 'IRONMAN has a 17-hour cut-off from the race start. Individual cut-offs also apply to each leg: typically 2:20 swim, ~10:30 combined swim+bike, and midnight for the run finish.' },
      { q: 'Do I need to qualify for an IRONMAN?', a: 'No qualifying is required to enter most IRONMAN events — registration is first-come, first-served or via ballot. Qualification is only required for Kona (IRONMAN World Championship).' },
      { q: 'How long should I train for?', a: 'Most first-timers follow a 20–30 week specific training plan. You need a solid base in all three disciplines before starting structured IRONMAN prep.' },
      { q: 'What should I eat on race day?', a: 'IRONMAN is too long to race on pre-race fuelling alone. Most athletes consume 60–90+ grams of carbohydrate per hour on the bike and run. Practice your nutrition strategy in training — never try anything new on race day.' },
    ],
    'Ironman 70.3': [
      { q: 'What is the time limit for an IRONMAN 70.3?', a: 'IRONMAN 70.3 has an 8-hour 30-minute cut-off. Individual cut-offs apply to the swim (~1:10) and bike (~5:30 combined). Check your specific event for exact cut-off times.' },
      { q: 'Is 70.3 a good first triathlon?', a: 'Not typically — a sprint or Olympic-distance triathlon first is strongly recommended. IRONMAN 70.3 is best approached after completing shorter-distance events and building 6–12 months of structured training.' },
      { q: 'Does a 70.3 qualify me for the 70.3 World Championship?', a: 'Yes. IRONMAN 70.3 events distribute World Championship slots across age groups. Slots are awarded by roll-down at the post-race awards ceremony.' },
      { q: 'How do I prepare for the open water swim?', a: 'Practice in open water before race day. Pool fitness translates, but sighting, mass starts and wetsuit swimming require specific adaptation. Aim for at least 4–6 open water sessions during your build.' },
    ],
    'Marathon': [
      { q: 'How long does it take to train for a marathon?', a: 'Most first-timers need 16–20 weeks of structured training with a running base of at least 30–40 km per week before starting. Experienced runners may use a 12–16 week peak block.' },
      { q: 'What is a good first marathon time?', a: 'Finishing is a great time. Most first-time marathoners aim for 4:00–5:30. Focus on completing the distance comfortably before chasing a specific time goal.' },
      { q: 'How do I avoid hitting the wall?', a: 'The wall (glycogen depletion around 30–32 km) is caused by starting too fast and under-fuelling. Start conservatively, take gels or sports drink every 30–45 minutes from early in the race, and practise your nutrition strategy in long runs.' },
    ],
    'Trail Running': [
      { q: 'What makes trail running different from road running?', a: 'Trail running involves unpredictable terrain — rocks, roots, mud, elevation change — which demands more from ankles, hips and core than road running. Pace is less relevant than time on feet, and navigation awareness is often required.' },
      { q: 'What shoes should I use for trail running?', a: 'Trail-specific shoes with lugged outsoles are essential for grip on loose or wet terrain. The level of cushioning and protection you need depends on the course surface and distance.' },
      { q: 'What is mandatory gear?', a: 'Longer trail and ultra events typically require a minimum pack with water capacity, emergency blanket, whistle, first aid kit and sometimes a mobile phone. Check the specific event rulebook well in advance.' },
    ],
    'Deka Fit': [
      { q: 'What is Deka Fit?', a: 'Deka Fit is an indoor fitness race: 10 × 500 m runs alternating with 10 workout stations. The format is standardised globally, making all results directly comparable.' },
      { q: 'How does Deka Fit compare to HYROX?', a: "Both are indoor fitness races with a standardised run-station format. Deka has 10 stations (versus HYROX's 8), shorter run intervals (500 m vs 1 km), and includes Box Jumps and Battle Ropes not found in HYROX. Total running is 5 km versus HYROX's 8 km." },
      { q: 'Do I need prior experience?', a: 'No. Deka Fit is open to athletes of all fitness levels. If you can run 5 km and have a gym training base, you have the foundation to complete the event.' },
    ],
  }

  const rows = faqs[discipline]
  if (!rows) return null

  return (
    <section>
      <SectionHeading>Frequently Asked Questions</SectionHeading>
      <div className="space-y-4">
        {rows.map((faq) => (
          <div key={faq.q} className="card">
            <h3 className="font-semibold text-ink mb-2">{faq.q}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Quick facts sidebar ──────────────────────────────────────────────────────

function QuickFactsSidebar({ discipline }: { discipline: string }) {
  type Fact = { label: string; value: string }
  const facts: Record<string, Fact[]> = {
    'CrossFit': [
      { label: 'Format',        value: 'Multiple WODs (workouts of the day)' },
      { label: 'Scoring',       value: 'Time, load, or reps' },
      { label: 'Divisions',     value: 'RX, Scaled, Masters, Team' },
      { label: 'Duration',      value: '1–2 days' },
      { label: 'Spectators',    value: 'Free entry at most events' },
    ],
    'HYROX': [
      { label: 'Total running', value: '8 km' },
      { label: 'Stations',      value: '8 workout stations' },
      { label: 'Format',        value: 'Run → Station × 8' },
      { label: 'Divisions',     value: 'Open, Pro, Doubles, Relay' },
      { label: 'Min. age',      value: '16 years' },
      { label: 'Timing',        value: 'Chip timed, global ranking' },
      { label: 'Spectators',    value: 'Free, all welcome' },
    ],
    'Spartan Race': [
      { label: 'Formats',       value: 'Sprint, Super, Beast, Ultra, Stadion' },
      { label: 'Distances',     value: '5 km – 50+ km' },
      { label: 'Obstacles',     value: '20–60+ per race' },
      { label: 'Penalty',       value: '30 burpees per failed obstacle' },
      { label: 'Timing',        value: 'Chip timed' },
      { label: 'Min. age',      value: '14 years (Sprint), 18 (Ultra)' },
    ],
    'Ironman': [
      { label: 'Swim',          value: '3.86 km' },
      { label: 'Bike',          value: '180.25 km' },
      { label: 'Run',           value: '42.2 km (marathon)' },
      { label: 'Total',         value: '226.3 km' },
      { label: 'Cut-off',       value: '17 hours' },
      { label: 'Kona slots',    value: 'Yes — by age group' },
    ],
    'Ironman 70.3': [
      { label: 'Swim',          value: '1.93 km' },
      { label: 'Bike',          value: '90.12 km' },
      { label: 'Run',           value: '21.1 km (half marathon)' },
      { label: 'Total',         value: '113.0 km' },
      { label: 'Cut-off',       value: '8 hr 30 min' },
      { label: 'Worlds slots',  value: 'Yes — 70.3 World Champs' },
    ],
    'Marathon': [
      { label: 'Distance',      value: '42.195 km' },
      { label: 'Average finish', value: '4:00–4:30 (recreational)' },
      { label: 'Qualifying',    value: 'Most open to all — check event' },
    ],
    'Trail Running': [
      { label: 'Distances',     value: 'Varies — 10 km to 100+ km' },
      { label: 'Terrain',       value: 'Off-road, natural surface' },
      { label: 'Mandatory gear', value: 'Required for longer events' },
      { label: 'Poles',         value: 'Allowed at most events (check)' },
    ],
    'Deka Fit': [
      { label: 'Total running', value: '5 km' },
      { label: 'Stations',      value: '10 workout stations' },
      { label: 'Format',        value: 'Run → Station × 10' },
      { label: 'Timing',        value: 'Chip timed, global ranking' },
      { label: 'Min. age',      value: '16 years' },
      { label: 'Spectators',    value: 'Free, all welcome' },
    ],
  }

  const rows = facts[discipline]
  if (!rows) return null

  return (
    <div className="card space-y-3 text-sm">
      <h2 className="font-semibold text-ink">Quick Facts</h2>
      {rows.map((fact) => (
        <div key={fact.label} className="flex justify-between gap-4">
          <span className="text-ink-muted">{fact.label}</span>
          <span className="text-ink text-right">{fact.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Registration status badge ────────────────────────────────────────────────

const REG_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open:          { label: 'Registration Open',   color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   dot: 'bg-green-400' },
  closing_soon:  { label: 'Closing Soon',         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: 'bg-amber-400' },
  sold_out:      { label: 'Sold Out',             color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   dot: 'bg-red-400'   },
  waitlist_only: { label: 'Waitlist Available',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: 'bg-amber-400' },
  coming_soon:   { label: 'Registration Opening Soon', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', dot: 'bg-slate-400' },
  ballot_open:   { label: 'Ballot Open',          color: '#00D9A6', bg: 'rgba(0,217,166,0.12)',   dot: 'bg-emerald-400' },
  ballot_closed: { label: 'Ballot Closed',        color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', dot: 'bg-slate-400' },
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const cfg = REG_STATUS_CONFIG[status]
  if (!cfg) return null
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </div>
  )
}

// ─── Conversion CTAs ──────────────────────────────────────────────────────────

function ConversionCTAsSection({
  event,
  isSaved,
  saveCount,
  hasUser,
}: {
  event: EventRow
  isSaved: boolean
  saveCount: number
  hasUser: boolean
}) {
  const isCurrentlyOpen = ['open', 'closing_soon', 'ballot_open', 'waitlist_only'].includes(event.registration_status ?? '')

  const remindLabel = isCurrentlyOpen
    ? 'Notify me next year'
    : event.ballot_required
    ? 'Remind me when the ballot opens'
    : 'Notify me when registrations open'

  const remindDesc = isCurrentlyOpen
    ? "Registration is open now — but if you miss it, we'll remind you when next year's edition opens."
    : event.ballot_required
    ? "We'll send you one email when the ballot window opens. No spam, no pressure."
    : "We'll send you one email the moment registrations open. No spam, no pressure."

  return (
    <section className="border-t border-wire bg-panel">
      <div className="container-page py-16 md:py-20">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold text-ink md:text-3xl">
            Build your season
          </h2>
          <p className="mt-3 text-ink-muted max-w-xl mx-auto">
            Save this event to My Season, grab the full APAC calendar, or get notified when registrations open.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">

          {/* Save */}
          <div className="card flex flex-col items-center gap-5 p-8 text-center">
            <span className="text-4xl" aria-hidden>❤️</span>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-ink">Build My Season</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Build your season one event at a time. Save events, track registration dates and keep your entire season organised in one place.
              </p>
            </div>
            <div className="mt-auto w-full space-y-2">
              {hasUser ? (
                <SaveButton eventId={event.id} initialSaved={isSaved} />
              ) : (
                <>
                  <Link
                    href={`/signup?next=/events/${event.slug}`}
                    className="btn-primary w-full justify-center"
                  >
                    <Heart className="h-4 w-4" /> Build My Season
                  </Link>
                  <p className="text-xs text-ink-muted">Create your free account in less than 30 seconds.</p>
                </>
              )}
              {saveCount > 0 && (
                <p className="text-xs text-ink-muted">
                  Join {saveCount.toLocaleString()} athlete{saveCount !== 1 ? 's' : ''} planning their season with RaceRadarHQ.
                </p>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="card flex flex-col items-center gap-5 p-8 text-center">
            <span className="text-4xl" aria-hidden>📅</span>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-ink">Get the 2026 APAC Race Calendar</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Every {event.discipline} event across Australia, New Zealand and Asia — one calendar, delivered to your inbox.
              </p>
            </div>
            <div className="mt-auto w-full">
              <CalendarCtaInline discipline={event.discipline} />
            </div>
          </div>

          {/* Reminder */}
          <div className="card flex flex-col items-center gap-5 p-8 text-center">
            <span className="text-4xl" aria-hidden>🔔</span>
            <div className="space-y-2">
              <h3 className="font-heading text-lg font-bold text-ink">{remindLabel}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{remindDesc}</p>
            </div>
            <div className="mt-auto w-full">
              <ReminderSignup slug={event.slug} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
