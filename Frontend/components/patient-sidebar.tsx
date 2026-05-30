"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  ShoppingBag,
  Activity,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND, BRAND_COLORS } from "@/lib/brand"
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded"

const sidebarItemKeys = [
  { icon: LayoutDashboard, labelKey: "dashboard", href: "/patient-dashboard" },
  { icon: Calendar, labelKey: "myCalendar", href: "/patient-calendar" },
  { icon: FileText, labelKey: "ehr", href: "/patient-emr" },
  { icon: Activity, labelKey: "metrics", href: "/health-tracking" },
  { icon: ShoppingBag, labelKey: "package", href: "/patient-purchased-packages" },
  { icon: MessageSquare, labelKey: "chat", href: "/patient-chat" },
] as const

const PACKAGE_RELATED_PATHS = ["/patient-purchased-packages", "/patient-package"]
const EHR_RELATED_PATHS = [
  "/patient-emr",
  "/patient-medical-examination-history",
  "/patient-payment-history",
]

export function PatientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const { isExpanded } = useSidebarExpanded("patient")

  return (
    <aside
      className={cn(
        "h-screen bg-white flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isExpanded ? "w-64" : "w-[72px]"
      )}
      style={{
        borderRadius: "20px",
        margin: "12px",
        marginRight: "0",
        height: "calc(100vh - 24px)",
      }}
    >
      <div className="flex-shrink-0 p-3 pb-2">
        <div className="flex w-full justify-center items-center">
          {isExpanded ? (
            <BrandLogo
              variant="full"
              size="large"
              href="/patient-dashboard"
              className="w-full px-1"
            />
          ) : (
            <BrandLogo
              variant="icon"
              size="large"
              href="/patient-dashboard"
              className="w-full"
            />
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {sidebarItemKeys.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/patient-dashboard" &&
              (pathname === "/patient-profile" || pathname === "/settings")) ||
            (item.href === "/patient-purchased-packages" &&
              PACKAGE_RELATED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) ||
            (item.href === "/patient-emr" &&
              EHR_RELATED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) ||
            (item.href !== "/patient-dashboard" && pathname.startsWith(item.href + "/"))

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center rounded-xl transition-all text-sm",
                isExpanded
                  ? "gap-2.5 px-3 py-2.5 text-left"
                  : "justify-center px-0 py-2.5",
                isActive ? "text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-50"
              )}
              style={isActive ? { backgroundColor: BRAND_COLORS.surfaceActive } : {}}
              title={!isExpanded ? t(item.labelKey) : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-[var(--imed-teal)]"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {t(item.labelKey)}
              </span>
            </button>
          )
        })}
      </nav>

      <div
        className={cn(
          "p-3 border-t border-gray-100 flex-shrink-0 transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden p-0 border-0"
        )}
      >
        <p className="text-[10px] text-gray-400 text-center">{BRAND.copyright}</p>
      </div>
    </aside>
  )
}
