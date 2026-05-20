/** iMed brand tokens — single source for logos, colors, and copy. */
export const BRAND = {
  name: "iMed",
  tagline: "Hệ thống quản lý khám bệnh",
  copyright: `© ${new Date().getFullYear()} iMed. All rights reserved.`,
} as const

export const BRAND_ASSETS = {
  logoFull: "/assets/images/iMed_full_text-removebg-preview.png",
  logoIcon: "/assets/images/iMed_logo-removebg-preview.png",
} as const

/** Primary teal + accent green from official iMed logo */
export const BRAND_COLORS = {
  teal: "#007A94",
  tealDark: "#006884",
  tealDarker: "#005566",
  tealLight: "#3BA3B8",
  tealMuted: "#B7D9E4",
  green: "#28B463",
  greenDark: "#1F9D55",
  surface: "#E8F5F1",
  surfaceActive: "#D4EDE8",
  surfaceCard: "#EDF7F4",
} as const
