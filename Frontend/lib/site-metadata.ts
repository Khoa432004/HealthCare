import type { Metadata } from "next"
import { BRAND, BRAND_ASSETS } from "@/lib/brand"

export function buildRootMetadata(): Metadata {
  return {
    title: {
      default: `${BRAND.name} — ${BRAND.tagline}`,
      template: `%s | ${BRAND.name}`,
    },
    description: BRAND.tagline,
    applicationName: BRAND.name,
    icons: {
      icon: [{ url: BRAND_ASSETS.logoIcon, type: "image/png" }],
      apple: [{ url: BRAND_ASSETS.logoIcon, type: "image/png" }],
      shortcut: [BRAND_ASSETS.logoIcon],
    },
    openGraph: {
      title: BRAND.name,
      description: BRAND.tagline,
      siteName: BRAND.name,
      images: [{ url: BRAND_ASSETS.logoFull, alt: BRAND.name }],
    },
  }
}
