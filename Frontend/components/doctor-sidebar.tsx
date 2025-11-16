"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  // Activity,
  // FileText,
  // MessageSquare,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/doctor-dashboard" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  // { icon: Activity, label: "Monitoring", href: "/monitoring" },
  // { icon: FileText, label: "EMR", href: "/emr" },
  // { icon: MessageSquare, label: "Chats", href: "/chats" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: HelpCircle, label: "Help Centre", href: "/help" },
]

const SIDEBAR_STATE_KEY = "doctor-sidebar-expanded"

export default function DoctorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
    if (savedState !== null) {
      setIsExpanded(savedState === "true")
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(isExpanded))
  }, [isExpanded])

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <aside 
      className={cn(
        "h-screen bg-white flex flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "w-56" : "w-20"
      )} 
      style={{ borderRadius: '20px', margin: '12px', marginRight: '0', height: 'calc(100vh - 24px)' }}
    >
      <div className="p-4 flex-shrink-0 flex items-center justify-between">
        <div className={cn("flex items-center gap-2 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="text-lg font-bold whitespace-nowrap" style={{ color: '#00a8cc' }}>YSALUS</div>
        </div>
        <div className={cn("flex items-center", !isExpanded && "justify-center w-full")}>
          {isExpanded ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md mb-2">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          )}
        </div>
      </div>

      {!isExpanded && (
        <div className="px-2 pb-2 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

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
                "w-full flex items-center gap-2.5 rounded-lg transition-all text-left text-sm",
                isExpanded ? "px-3 py-2.5" : "px-2.5 py-2.5 justify-center",
                isActive 
                  ? "text-gray-900 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
              style={isActive ? { backgroundColor: '#d0eef5' } : {}}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className={cn(
                "transition-opacity duration-300 whitespace-nowrap",
                isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className={cn(
        "p-3 border-t border-gray-100 flex-shrink-0 transition-opacity duration-300",
        isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      )}>
        <p className="text-[10px] text-gray-400 text-center">© 2025 YSalus All rights reserved</p>
      </div>
    </aside>
  )
}

