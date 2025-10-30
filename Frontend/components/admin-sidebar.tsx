"use client"

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
    <aside className="w-64 h-screen bg-white flex flex-col" style={{ borderRadius: '24px', margin: '16px', marginRight: '0', height: 'calc(100vh - 32px)' }}>
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div className="text-xl font-bold" style={{ color: '#00a8cc' }}>YSALUS</div>
        </div>
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
            style={activeTab === item.id ? { backgroundColor: '#d0eef5' } : {}}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">© 2025 YSalus All rights reserved</p>
      </div>
    </aside>
  )
}
