"use client"

import Link from "next/link"
import { LayoutDashboard, Users, Bell, BarChart3, FileText, Settings, LogOut, RefreshCw, XCircle, DollarSign, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  activeTab: "overview" | "users" | "statistics" | "notifications" | "refunds" | "cancellations" | "revenue" | "doctors"
  setActiveTab: (tab: "overview" | "users" | "statistics" | "notifications" | "refunds" | "cancellations" | "revenue" | "doctors") => void
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    { id: "overview" as const, icon: LayoutDashboard, label: "Overview" },
    { id: "users" as const, icon: Users, label: "User Management" },
    { id: "statistics" as const, icon: BarChart3, label: "Statistics" },
    { id: "notifications" as const, icon: Bell, label: "Notifications" },
    { id: "refunds" as const, icon: RefreshCw, label: "Refunds" },
    { id: "cancellations" as const, icon: XCircle, label: "Cancellations" },
    { id: "revenue" as const, icon: DollarSign, label: "Revenue" },
    { id: "doctors" as const, icon: Stethoscope, label: "Doctors" },
  ]

  return (
    <aside className="w-64 h-screen glass border-r border-white/50 flex flex-col shadow-soft-lg">
      <div className="p-6 border-b border-white/50 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 hover-lift">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">YSALUS</div>
          <span className="w-2.5 h-2.5 bg-[#fe2f2f] rounded-full pulse-soft shadow-soft"></span>
        </Link>
        <p className="text-xs text-gray-500 mt-2 font-medium">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-smooth",
              activeTab === item.id 
                ? "gradient-primary text-white shadow-soft-md hover:shadow-soft-lg" 
                : "text-gray-700 hover:bg-white/50 glass",
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/50 space-y-2 flex-shrink-0">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-white/50 transition-smooth glass">
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-smooth glass">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  )
}
