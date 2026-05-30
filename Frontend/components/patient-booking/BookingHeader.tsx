"use client"

import { Calendar, Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NotificationBell } from "@/components/notification-bell"
import { PageHeaderTitleRow } from "@/components/page-header-title-row"
import { PatientUserMenu } from "@/components/patient-user-menu"
import { Input } from "@/components/ui/input"

type Props = {
  userName?: string
}

export function BookingHeader({ userName }: Props) {
  const { t } = useTranslation()

  return (
    <header
      className="bg-white py-4 mx-4 mb-4 shrink-0"
      style={{ borderRadius: "16px", paddingLeft: "32px", paddingRight: "24px" }}
    >
      <div className="flex items-center justify-between">
        <PageHeaderTitleRow role="patient" icon={Calendar} title={t("bookAppointment")} />

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder={`${t("search")}...`}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          <NotificationBell />

          <PatientUserMenu userInfo={userName ? { fullName: userName } : null} />
        </div>
      </div>
    </header>
  )
}
