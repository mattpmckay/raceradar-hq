import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — Electric Orange | RaceRadar HQ' }

export default function OrangePreview() {
  return <PreviewHomepage currentSlug="orange" />
}
