"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
  BarChart3,
  HelpCircle,
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/doctor-dashboard" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Activity, label: "Monitoring", href: "/monitoring" },
  { icon: FileText, label: "EMR", href: "/emr" },
  { icon: MessageSquare, label: "Chats", href: "/chats" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: HelpCircle, label: "Help Centre", href: "/help" },
]

export default function DoctorSidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/doctor-dashboard" && (pathname === "/my-profile" || pathname === "/settings"))

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                isActive 
                  ? "text-gray-900 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
              style={isActive ? { backgroundColor: '#d0eef5' } : {}}
                >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">© 2025 YSalus All rights reserved</p>
      </div>
    </aside>
  )
}
