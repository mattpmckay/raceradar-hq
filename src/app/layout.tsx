import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'RaceRadar — Motorsport Intelligence',
    template: '%s | RaceRadar',
  },
  description:
    'Discover race events, track days, championships and motorsport opportunities across Australia and beyond.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raceradar.com.au',
  ),
  openGraph: {
    siteName: 'RaceRadar',
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
