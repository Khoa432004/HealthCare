"use client"

import { LayoutDashboard, Users, Bell, BarChart3, FileText, Settings, LogOut, RefreshCw, XCircle, DollarSign, Stethoscope, MessageSquare, Package } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand-logo"
import { BRAND, BRAND_COLORS } from "@/lib/brand"

interface AdminSidebarProps {
  activeTab:
    | "overview"
    | "users"
    | "statistics"
    | "notifications"
    | "refunds"
    | "cancellations"
    | "revenue"
    | "doctors"
    | "chats"
    | "exam-packages"
  setActiveTab: (
    tab:
      | "overview"
      | "users"
      | "statistics"
      | "notifications"
      | "refunds"
      | "cancellations"
      | "revenue"
      | "doctors"
      | "chats"
      | "exam-packages",
  ) => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { t } = useTranslation()
  const menuItems = [
    { id: "overview" as const, icon: LayoutDashboard, label: t("overview") },
    { id: "users" as const, icon: Users, label: t("userManagement") },
    { id: "exam-packages" as const, icon: Package, label: t("examPackages") },
    { id: "chats" as const, icon: MessageSquare, label: t("chats") },
    { id: "statistics" as const, icon: BarChart3, label: t("statistics") },
    { id: "notifications" as const, icon: Bell, label: t("notifications") },
    { id: "refunds" as const, icon: RefreshCw, label: t("refunds") },
    { id: "cancellations" as const, icon: XCircle, label: t("cancellations") },
    { id: "revenue" as const, icon: DollarSign, label: t("revenue") },
    { id: "doctors" as const, icon: Stethoscope, label: t("doctors") },
  ]

  return (
    <aside className="w-64 h-screen bg-white flex flex-col" style={{ borderRadius: '24px', margin: '16px', marginRight: '0', height: 'calc(100vh - 32px)' }}>
      <div className="p-6 flex-shrink-0 flex justify-center">
        <BrandLogo variant="full" size="large" className="w-full px-1" />
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              activeTab === item.id 
                ? "text-gray-900 font-semibold" 
                : "text-gray-600 hover:bg-gray-50",
            )}
            style={activeTab === item.id ? { backgroundColor: BRAND_COLORS.surfaceActive } : {}}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">{BRAND.copyright}</p>
      </div>
    </aside>
  )
}
