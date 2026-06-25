import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RaceRadar HQ — Every Major Fitness Event Across Asia Pacific',
    template: '%s | RaceRadar HQ',
  },
  description:
    'Discover HYROX, Spartan, Ironman, Triathlon, obstacle races, trail runs and endurance events across Asia Pacific. One platform to find, plan and travel to every race.',
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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
