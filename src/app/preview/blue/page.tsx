import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — Electric Blue | RaceRadar HQ' }

export default function BluePreview() {
  return <PreviewHomepage currentSlug="blue" />
}
