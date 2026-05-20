import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
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
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
