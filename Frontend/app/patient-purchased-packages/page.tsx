"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, LogOut, User, ShoppingCart } from "lucide-react";
import { PatientSidebar } from "@/components/patient-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PurchasedPackagesList } from "@/components/purchased-packages-list";
import { patientExamPackageService } from "@/services/patient-exam-package.service";
import { NotificationBell } from "@/components/notification-bell";
import { AuthGuard } from "@/components/auth-guard";
import { PageHeaderTitleRow } from "@/components/page-header-title-row";
import { authService } from "@/services/auth.service";

function PurchasedPackagesContent() {
  const router = useRouter();
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

  const getInitials = (name: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientExamPackageService.getMyPackages();
      setPackages(data || []);
    } catch (err: any) {
      console.error("Error loading packages:", err);
      setError(err?.message || "Không thể tải danh sách gói. Vui lòng thử lại.");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch {
      authService.clearAuthData();
      router.push("/login");
    }
  };

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
              title="My Packages"
              titleClassName="text-lg"
            />

            <div className="flex items-center space-x-3">
              {/* Buy Package CTA */}
              <Button
                onClick={() => router.push("/patient-package")}
                className="h-9 px-4 bg-gradient-to-r from-[#007A94] to-[#0CC8C8] hover:from-[#006080] hover:to-[#00AAAA] text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Package
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback className="text-xs">
                        {userInfo ? getInitials(userInfo.fullName) : "PT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">{userInfo?.fullName || "Patient"}</p>
                      <p className="text-[10px] text-gray-500">Bệnh nhân</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/patient-profile")}>
                    <User className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                Thử lại
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
