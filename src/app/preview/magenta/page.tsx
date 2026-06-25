import { PreviewHomepage } from '../_components/PreviewHomepage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Preview — Neon Magenta | RaceRadar HQ' }

export default function MagentaPreview() {
  return <PreviewHomepage currentSlug="magenta" />
}
