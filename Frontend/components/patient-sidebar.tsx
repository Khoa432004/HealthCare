"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Activity,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/patient-dashboard", hasSubmenu: false },
  { icon: Calendar, label: "My Calendar", href: "/patient-calendar", hasSubmenu: false },
  { icon: Activity, label: "Health Tracking", href: "/health-tracking", hasSubmenu: true },
  { icon: FileText, label: "Medical Records", href: "/medical-records", hasSubmenu: true },
  { icon: MessageSquare, label: "Chats", href: "/chats", hasSubmenu: false },
  { icon: HelpCircle, label: "Help Centre", href: "/help", hasSubmenu: false },
]

export function PatientSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white m-4 flex flex-col rounded-3xl shadow-xl">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <span className="text-xl font-bold text-[#16a1bd]">YSALUS</span>
        </div>
      </div>

      <div className="flex-1 py-4 px-2">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/patient-dashboard" && (pathname === "/patient-profile" || pathname === "/settings"))

          return (
            <div key={index} className="max-w-full">
              <Link href={item.href} className="block">
                <Button
                  variant="ghost"
                  className={`w-full justify-start mb-1 rounded-lg max-w-full text-sm ${
                    isActive ? "bg-[#e5f5f8] text-[#0b0c0c] font-bold hover:bg-[#e5f5f8]" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.hasSubmenu && <ChevronDown className="w-4 h-4 ml-1" />}
                </Button>
              </Link>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">@ 2025 YSalus All rights reserved</p>
      </div>
    </div>
  )
}