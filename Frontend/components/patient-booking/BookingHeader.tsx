"use client"

import { useRouter } from "next/navigation"
import { Calendar, LogOut, Search, User } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getInitials } from "./utils"

type Props = {
  userName?: string
  onLogout: () => void
}

export function BookingHeader({ userName, onLogout }: Props) {
  const router = useRouter()

  return (
    <header
      className="bg-white py-4 mx-4 mb-4 shrink-0"
      style={{ borderRadius: "16px", paddingLeft: "32px", paddingRight: "24px" }}
    >
      <div className="flex items-center justify-between">
        <PageHeaderTitleRow role="patient" icon={Calendar} title="Book Appointment" />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="search" placeholder="Search..." className="pl-10 bg-gray-50 border-gray-200" />
          </div>

          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>{getInitials(userName ?? "Patient")}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{userName || "Patient"}</p>
                  <p className="text-xs text-gray-500">Bệnh nhân</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/patient-profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
