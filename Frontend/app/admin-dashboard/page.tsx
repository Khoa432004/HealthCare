"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminMetricsCards } from "@/components/admin-metrics-cards"
import { UserManagementTable } from "@/components/user-management-table"
import { NotificationManagement } from "@/components/notification-management"
import { BusinessReports } from "@/components/business-reports"
import { RefundManagement } from "@/components/refund-management"
import { CancellationManagement } from "@/components/cancellation-management"
import { RevenueManagement } from "@/components/revenue-management"
import { DoctorManagement } from "@/components/doctor-management"
import { Input } from "@/components/ui/input"
import { Search, Bell, Shield, LayoutDashboard, Users, BarChart3, Settings, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/services/auth.service"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "statistics" | "notifications" | "refunds" | "cancellations" | "revenue" | "doctors">("overview")

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local data and redirect anyway
      authService.clearAuthData()
      router.push('/login')
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e5f5f8] to [#e5f5f8]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="glass border-b border-white/50 px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl shadow-soft-md">
                <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-[#16a1bd] to-[#16a1bd] bg-clip-text text-transparent">Admin Panel</h1>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input placeholder="Search..." className="pl-12 bg-white/70 border-white/50 hover:bg-white transition-all" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/50 transition-smooth">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full pulse-soft shadow-soft"></span>
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl hover:bg-white/50 transition-smooth">
                    <Avatar className="w-9 h-9 ring-2 ring-white shadow-soft">
                      <AvatarImage src="/professional-doctor-avatar.png" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">AD</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-700">Admin User</p>
                      <p className="text-xs text-gray-500">System Administrator</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass border-white/50 shadow-soft-lg">
                  <div className="px-3 py-3 border-b border-white/50">
                    <p className="font-semibold text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500 font-medium">System Administrator</p>
                  </div>
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-3 px-3 py-2 hover:bg-white/50 transition-smooth">
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-white/50" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-smooth cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
              </div>
              <AdminMetricsCards />
              <div className="grid lg:grid-cols-2 gap-6">
                <BusinessReports />
                <NotificationManagement />
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">User Management</h1>
                <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
              </div>
              <UserManagementTable />
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Statistics & Analytics</h1>
                <p className="text-gray-600">Comprehensive analytics and performance metrics.</p>
              </div>
              <BusinessReports />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Notification Management</h1>
                <p className="text-gray-600">Create and manage system notifications.</p>
              </div>
              <NotificationManagement />
            </div>
          )}

          {activeTab === "refunds" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Refund Management</h1>
                <p className="text-gray-600">Process and manage refund requests.</p>
              </div>
              <RefundManagement />
            </div>
          )}

          {activeTab === "cancellations" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Cancellation Management</h1>
                <p className="text-gray-600">Handle appointment cancellations and rescheduling.</p>
              </div>
              <CancellationManagement />
            </div>
          )}

          {activeTab === "revenue" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Revenue Management</h1>
                <p className="text-gray-600">Track and manage revenue streams.</p>
              </div>
              <RevenueManagement />
            </div>
          )}

          {activeTab === "doctors" && (
            <div className="space-y-7">
              <div className="glass rounded-3xl p-6 shadow-soft-lg">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1d2939] to-[#1d2939] bg-clip-text text-transparent mb-2">Doctor Management</h1>
                <p className="text-gray-600">Manage doctors and salary payments.</p>
              </div>
              <DoctorManagement />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
