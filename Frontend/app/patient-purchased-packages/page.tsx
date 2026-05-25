"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { PatientSidebar } from "@/components/patient-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PurchasedPackagesList } from "@/components/purchased-packages-list";
import { patientExamPackageService } from "@/services/patient-exam-package.service";
import { NotificationBell } from "@/components/notification-bell";
import { AuthGuard } from "@/components/auth-guard";

function PurchasedPackagesContent() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPackages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleUsePackage = (packageId: string) => {
    router.push(`/patient-package?activePackage=${packageId}`);
  };

  return (
    <div className="min-h-screen bg-[#E8F5F1]">
      <div className="flex h-screen">
        <PatientSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gói khám của tôi</h1>
                  <p className="text-xs text-gray-500 mt-0.5">Theo dõi và quản lý các gói khám đã mua</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPackages(true)}
                  disabled={refreshing}
                  className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                  Làm mới
                </Button>
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-7xl mx-auto">
              {/* Error state */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
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

              {/* Packages list */}
              <PurchasedPackagesList
                packages={packages}
                loading={loading}
                onUsePackage={handleUsePackage}
              />
            </div>
          </ScrollArea>
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
