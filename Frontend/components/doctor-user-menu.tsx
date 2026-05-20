"use client"

import { useRouter } from "next/navigation"
import { User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/services/auth.service"

type DoctorUserMenuProps = {
  userInfo?: { fullName?: string } | null
  avatarSrc?: string
  triggerClassName?: string
}

function getInitials(name: string): string {
  if (!name) return "DR"
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function DoctorUserMenu({
  userInfo,
  avatarSrc = "/clean-female-doctor.png",
  triggerClassName,
}: DoctorUserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch {
      authService.clearAuthData()
      router.push("/login")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={
            triggerClassName ??
            "flex items-center gap-2 h-9 px-2 hover:bg-gray-100 rounded-xl"
          }
        >
          <Avatar className="w-7 h-7">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="text-xs">
              {getInitials(userInfo?.fullName || "")}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">
              {userInfo?.fullName || "Doctor"}
            </p>
            <p className="text-[10px] text-gray-500">Bác sĩ</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md border-gray-100">
        <DropdownMenuItem onClick={() => router.push("/my-profile")}>
          <User className="mr-2 h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span className="text-sm">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
