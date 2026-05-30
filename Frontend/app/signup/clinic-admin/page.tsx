"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLanguageBar } from "@/components/auth-language-bar"

export default function ClinicAdminSignUpPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-[#b7e2eb] relative overflow-hidden">
      <AuthLanguageBar />
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full hidden lg:block"></div>
      <div className="absolute top-32 right-32 w-12 h-12 bg-white/30 rounded-full hidden lg:block"></div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="mb-8">
              <Link href="/signup" className="text-[#007A94] hover:text-[#005566] font-semibold">
                ← {t("back")}
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-[#0b0c0c] mb-8">{t("clinicAdminRegistration")}</h1>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("fullNameField")}</label>
                  <Input placeholder={t("enterFullName")} className="h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("email")}</label>
                  <Input type="email" placeholder={t("enterEmail")} className="h-12" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("clinicName")}</label>
                <Input placeholder={t("enterClinicName", "Enter clinic name")} className="h-12" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("phoneNumber")}</label>
                  <Input placeholder={t("enterPhoneNumber", "Enter phone number")} className="h-12" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("clinicLicenseNumber")}</label>
                  <Input placeholder={t("enterLicenseNumber", "Enter license number")} className="h-12" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t("password")}</label>
                <Input type="password" placeholder={t("createPasswordPlaceholder", "Create a password")} className="h-12" />
              </div>

              <Button className="w-full h-12 bg-[#007A94] hover:bg-[#005566] text-white rounded-xl font-semibold">
                {t("createAccount")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
