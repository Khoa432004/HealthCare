"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { formatDocumentTitle, getPageTitle } from "@/lib/page-titles"

/** Syncs `document.title` when navigating between client routes. */
export function DocumentTitle() {
  const pathname = usePathname()

  useEffect(() => {
    document.title = formatDocumentTitle(getPageTitle(pathname))
  }, [pathname])

  return null
}
