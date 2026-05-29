"use client"

import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { authService } from "@/services/auth.service"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/user-utils"

type AdminUserMenuProps = {
  userInfo?: { fullName?: string; role?: string } | null
  roleLabel?: string
}

export function AdminUserMenu({ userInfo, roleLabel }: AdminUserMenuProps) {
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
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              {getInitials(userInfo?.fullName, "AD")}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">{userInfo?.fullName || t("admin")}</p>
            <p className="text-xs text-gray-500">{roleLabel || t("admin")}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{t("profile")}</span>
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
