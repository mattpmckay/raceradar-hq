import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — HYROX Pink | RaceRadar HQ' }

export default function HyroxPreview() {
  return <PreviewHomepage currentSlug="hyrox" />
}
