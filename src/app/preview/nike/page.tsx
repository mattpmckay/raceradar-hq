import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — Nike Volt | RaceRadar HQ' }

export default function NikePreview() {
  return <PreviewHomepage currentSlug="nike" />
}
