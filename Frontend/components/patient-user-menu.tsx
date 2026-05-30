"use client"

import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { authService } from "@/services/auth.service"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/user-utils"

type PatientUserMenuProps = {
  userInfo?: { fullName?: string } | null
  avatarSrc?: string
  triggerClassName?: string
  contentClassName?: string
  showRoleLabel?: boolean
}

export function PatientUserMenu({
  userInfo,
  avatarSrc = "/placeholder-user.jpg",
  triggerClassName,
  contentClassName = "w-56",
  showRoleLabel = true,
}: PatientUserMenuProps) {
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
          className={triggerClassName ?? "flex items-center gap-2 h-9 px-2"}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="text-xs">
              {getInitials(userInfo?.fullName, "PT")}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium">{userInfo?.fullName || t("patient")}</p>
            {showRoleLabel ? (
              <p className="text-xs text-gray-500">{t("patient")}</p>
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        <DropdownMenuItem onClick={() => router.push("/patient-profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>{t("myProfile")}</span>
        </DropdownMenuItem>
        <LanguageSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
