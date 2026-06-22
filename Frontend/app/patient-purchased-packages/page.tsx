"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Package, ShoppingCart } from "lucide-react";
import { PatientSidebar } from "@/components/patient-sidebar";
import { PatientUserMenu } from "@/components/patient-user-menu";
import { Button } from "@/components/ui/button";
import { PurchasedPackagesList } from "@/components/purchased-packages-list";
import { patientExamPackageService } from "@/services/patient-exam-package.service";
import { NotificationBell } from "@/components/notification-bell";
import { AuthGuard } from "@/components/auth-guard";
import { PageHeaderTitleRow } from "@/components/page-header-title-row";
import { authService } from "@/services/auth.service";

function PurchasedPackagesContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null);

  useEffect(() => {
    const user = authService.getUserInfo();
    if (user) {
      setUserInfo({ fullName: user.fullName || "Patient", role: user.role || "PATIENT" });
    }
  }, []);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientExamPackageService.getMyPackages();
      setPackages(data || []);
    } catch (err: any) {
      console.error("Error loading packages:", err);
      setError(err?.message || t("packagesLoadFailed"));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <PatientSidebar />

      {/* Main content — overflow-y-auto enables full-page scroll like dashboard */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: "12px" }}>
        {/* ── Header — same style as dashboard ── */}
        <header
          className="bg-white py-3 mx-3 mb-3 flex-shrink-0"
          style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
        >
          <div className="flex items-center justify-between">
            <PageHeaderTitleRow
              role="patient"
              icon={Package}
              title={t("myPackages")}
              titleClassName="text-lg"
            />

            <div className="flex items-center space-x-3">
              {/* Buy Package CTA */}
              <Button
                onClick={() => router.push("/patient-package")}
                className="h-9 px-4 bg-gradient-to-r from-[#007A94] to-[#0CC8C8] hover:from-[#006080] hover:to-[#00AAAA] text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {t("buyPackage")}
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <PatientUserMenu
                userInfo={userInfo}
                triggerClassName="flex items-center gap-2 h-9 px-2"
                contentClassName="w-48"
              />
            </div>
          </div>
        </header>

        {/* ── Main content area ── */}
        <div className="flex-1 px-3 pb-4">
          {/* Error banner */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <p className="text-red-800 text-sm font-medium">⚠️ {error}</p>
              <Button
                onClick={() => loadPackages()}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg ml-4"
              >
                {t("tryAgain")}
              </Button>
            </div>
          )}

          <PurchasedPackagesList packages={packages} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function PurchasedPackagesPage() {
  return (
    <AuthGuard>
      <PurchasedPackagesContent />
    </AuthGuard>
  );
}
