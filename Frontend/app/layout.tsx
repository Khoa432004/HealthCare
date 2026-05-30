import type { Metadata, Viewport } from "next"
import { AppProviders } from "@/components/app-providers"
import { buildRootMetadata } from "@/lib/site-metadata"
import "./globals.css"

export const metadata: Metadata = buildRootMetadata()

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#007A94",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
        />
      </head>
      <body className="font-outfit" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
