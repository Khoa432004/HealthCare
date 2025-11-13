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
    <aside className="w-56 h-screen bg-white flex flex-col" style={{ borderRadius: '20px', margin: '12px', marginRight: '0', height: 'calc(100vh - 24px)' }}>
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="text-lg font-bold" style={{ color: '#00a8cc' }}>YSALUS</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left text-sm",
                isActive 
                  ? "text-gray-900 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
              style={isActive ? { backgroundColor: '#d0eef5' } : {}}
                >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">© 2025 YSalus All rights reserved</p>
      </div>
    </aside>
  )
}
