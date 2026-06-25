import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'RaceRadar HQ — Find Fitness Races & Endurance Events',
    template: '%s | RaceRadar HQ',
  },
  description:
    'Discover HYROX, Spartan, Tough Mudder, obstacle races, trail runs and endurance events across Australia.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au',
  ),
  openGraph: {
    siteName: 'RaceRadar HQ',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
