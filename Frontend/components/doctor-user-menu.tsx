"use client"

import { useRouter } from "next/navigation"
import { User, Settings, LogOut } from "lucide-react"
import { useTranslation } from "react-i18next"
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
import { LanguageSwitcher } from "@/components/language-switcher"
import { getInitials } from "@/lib/user-utils"

type DoctorUserMenuProps = {
  userInfo?: { fullName?: string } | null
  avatarSrc?: string
  triggerClassName?: string
}

export function DoctorUserMenu({
  userInfo,
  avatarSrc = "/clean-female-doctor.png",
  triggerClassName,
}: DoctorUserMenuProps) {
  const router = useRouter()
  const { t } = useTranslation()

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
              {getInitials(userInfo?.fullName, "DR")}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-800">
              {userInfo?.fullName || t("doctor")}
            </p>
            <p className="text-[10px] text-gray-500">{t("doctor")}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-md border-gray-100">
        <DropdownMenuItem onClick={() => router.push("/my-profile")}>
          <User className="mr-2 h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">{t("myProfile")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">{t("settings")}</span>
        </DropdownMenuItem>
        <LanguageSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span className="text-sm">{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
