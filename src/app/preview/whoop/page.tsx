import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — WHOOP Mint | RaceRadar HQ' }

export default function WhoopPreview() {
  return <PreviewHomepage currentSlug="whoop" />
}
