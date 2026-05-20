"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BRAND, BRAND_ASSETS } from "@/lib/brand"

type BrandLogoVariant = "full" | "icon"
type BrandLogoSize = "default" | "large"

const LOGO_DIMENSIONS: Record<
  BrandLogoSize,
  Record<BrandLogoVariant, { width: number; height: number; style: CSSProperties }>
> = {
  default: {
    full: {
      width: 140,
      height: 48,
      style: { width: "auto", height: "clamp(32px, 4vw, 48px)", maxWidth: 160 },
    },
    icon: {
      width: 40,
      height: 40,
      style: { width: 40, height: 40 },
    },
  },
  large: {
    full: {
      width: 280,
      height: 96,
      style: { width: "auto", height: "clamp(64px, 8vw, 96px)", maxWidth: "100%" },
    },
    icon: {
      width: 80,
      height: 80,
      style: { width: 80, height: 80 },
    },
  },
}

type BrandLogoProps = {
  variant?: BrandLogoVariant
  size?: BrandLogoSize
  href?: string
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogo({
  variant = "full",
  size = "default",
  href,
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "icon" ? BRAND_ASSETS.logoIcon : BRAND_ASSETS.logoFull
  const dims = LOGO_DIMENSIONS[size][variant]

  const image = (
    <Image
      src={src}
      alt={BRAND.name}
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn("h-auto w-auto object-contain mx-auto", imageClassName)}
      style={dims.style}
    />
  )

  const wrapperClass = cn("inline-flex items-center justify-center shrink-0", className)

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {image}
      </Link>
    )
  }

  return <div className={wrapperClass}>{image}</div>
}
