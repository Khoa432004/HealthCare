"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientExamPackageService.getMyPackages();
      setPackages(data || []);
    } catch (error: any) {
      console.error("Error loading packages:", error);
      setError(error?.message || "Failed to load packages. Please try again later.");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePackage = (packageId: string) => {
    // Navigate to use the package
    router.push(`/patient-package?activePackage=${packageId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <PatientSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Packages</h1>
                  <p className="text-sm text-gray-600">Manage your purchased packages</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-7xl mx-auto">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Error: {error}</p>
                  <Button
                    onClick={loadPackages}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-8 flex gap-3">
                <Link href="/patient-package">
                  <Button className="bg-[#007A94] hover:bg-[#005F75]">
                    Buy New Package
                  </Button>
                </Link>
              </div>

              {/* Packages List */}
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
