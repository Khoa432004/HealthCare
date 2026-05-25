"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, MapPin, Star, Clock, MessageSquare } from "lucide-react";
import { PatientSidebar } from "@/components/patient-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { patientExamPackageService } from "@/services/patient-exam-package.service";
import { NotificationBell } from "@/components/notification-bell";
import { AuthGuard } from "@/components/auth-guard";
import { API_BASE_URL } from "@/lib/api-config";

function PatientPackageContent() {
  const router = useRouter();
  const [step, setStep] = useState<"doctors" | "packages" | "detail">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null);

  // Load initial doctors
  useEffect(() => {
    loadDoctors("");
  }, []);

  // Load user info
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserInfo({ fullName: user.fullName || "User", role: user.role || "" });
    }
  }, []);

  const loadDoctors = async (query: string) => {
    setLoading(true);
    try {
      const data = await patientExamPackageService.getAllDoctors(query);
      setDoctors(data || []);
    } catch (error) {
      console.error("Error loading doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    try {
      const pkgs = await patientExamPackageService.getDoctorExamPackages(doctor.id);
      setPackages(pkgs || []);
      setStep("packages");
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = async (pkg: any) => {
    setSelectedPackage(pkg);
    setStep("detail");
  };

  const handleBack = () => {
    if (step === "detail") {
      setStep("packages");
      setSelectedPackage(null);
    } else if (step === "packages") {
      setStep("doctors");
      setSelectedDoctor(null);
      setPackages([]);
    }
  };

  // Render step 1: Choose Doctor
  if (step === "doctors") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <PatientSidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Buy Package</h1>
                <p className="text-sm text-gray-600">Buy Package / Choose a doctor</p>
              </div>
              <NotificationBell />
            </div>

            {/* Main Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-7xl mx-auto">
                {/* Search Section */}
                <Card className="mb-6 border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Search doctors by name or specialty..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            loadDoctors(e.target.value);
                          }}
                          className="bg-gray-50"
                        />
                      </div>
                      <Button variant="outline" size="icon">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Loading doctors...
                    </div>
                  ) : doctors && doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <Card
                        key={doctor.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-sm"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <CardContent className="p-6">
                          {/* Doctor Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                              />
                              <AvatarFallback className="bg-[#007A94] text-white text-lg">
                                {doctor.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {doctor.title} {doctor.name}
                              </h3>
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                              {doctor.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="text-sm text-gray-700">
                                    {doctor.rating} ({doctor.reviews} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Doctor Info */}
                          <div className="space-y-2 mb-4 text-sm text-gray-600">
                            {doctor.clinic && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#007A94]" />
                                <span>{doctor.clinic}</span>
                              </div>
                            )}
                            {doctor.experience && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#007A94]" />
                                <span>{doctor.experience}</span>
                              </div>
                            )}
                          </div>

                          <Button className="w-full bg-[#007A94] hover:bg-[#005F75]">
                            View Packages
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No doctors found
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  // Render step 2: Choose Package
  if (step === "packages") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          <PatientSidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Buy Package</h1>
                    <p className="text-sm text-gray-600">Choose a doctor / Choose a package</p>
                  </div>
                </div>
                <NotificationBell />
              </div>
            </div>

            {/* Main Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 max-w-7xl mx-auto">
                {/* Selected Doctor Info */}
                {selectedDoctor && (
                  <Card className="mb-8 border-0 shadow-sm bg-gradient-to-r from-[#007A94]/5 to-transparent">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.name}`}
                          />
                          <AvatarFallback className="bg-[#007A94] text-white text-xl">
                            {selectedDoctor.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {selectedDoctor.title} {selectedDoctor.name}
                          </h3>
                          <p className="text-gray-600 mb-2">{selectedDoctor.specialty}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {selectedDoctor.clinic && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-[#007A94]" />
                                {selectedDoctor.clinic}
                              </span>
                            )}
                            {selectedDoctor.experience && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-[#007A94]" />
                                {selectedDoctor.experience}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Packages List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Loading packages...
                    </div>
                  ) : packages && packages.length > 0 ? (
                    packages.map((pkg) => (
                      <Card
                        key={pkg.packageId}
                        className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm group"
                      >
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {pkg.packageName}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-4">
                              <span className="text-3xl font-bold text-[#007A94]">
                                {(pkg.priceVnd / 1000000).toFixed(1)}
                              </span>
                              <span className="text-gray-600">million VND</span>
                            </div>
                          </div>

                          {/* Package Info */}
                          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-3 text-sm">
                              <Clock className="w-4 h-4 text-[#007A94]" />
                              <span>{pkg.durationDays} days validity</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <MessageSquare className="w-4 h-4 text-[#007A94]" />
                              <span>12 messages</span>
                            </div>
                            {pkg.applicable && (
                              <Badge className="bg-green-100 text-green-800 border-0">
                                Available for purchase
                              </Badge>
                            )}
                          </div>

                          <Button
                            onClick={() => handlePackageSelect(pkg)}
                            className="w-full bg-[#007A94] hover:bg-[#005F75]"
                          >
                            Select Package
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No packages available for this doctor
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  // Render step 3: Package Detail
  if (step === "detail" && selectedPackage && selectedDoctor) {
    return (
      <PackageDetailView
        doctor={selectedDoctor}
        package={selectedPackage}
        onBack={handleBack}
        onPurchaseSuccess={() => {
          // Handle successful purchase
          alert("Package purchased successfully!");
          router.push("/patient-emr");
        }}
      />
    );
  }

  return null;
}

interface PackageDetailProps {
  doctor: any;
  package: any;
  onBack: () => void;
  onPurchaseSuccess: () => void;
}

function PackageDetailView({
  doctor,
  package: pkg,
  onBack,
  onPurchaseSuccess,
}: PackageDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Get access token - backend will extract patientId from JWT token
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      // Calculate order amount and info
      const orderTotal = pkg.priceVnd; // in VND
      const orderInfo = `Thanh toan goi kham - ${pkg.packageName} - Bac si ${doctor.name}`;

      // Store pending package purchase data in localStorage
      // Backend will extract patientId from JWT token, similar to booking calendar
      const pendingPackagePurchase = {
        doctorId: doctor.id,
        packageId: pkg.packageId,
        packageName: pkg.packageName,
        priceVnd: pkg.priceVnd,
        durationDays: pkg.durationDays,
        purchaseDate: new Date().toISOString(),
      };

      localStorage.setItem("pendingPackagePurchase", JSON.stringify(pendingPackagePurchase));

      // Redirect to VNPay payment gateway
      // VNPay will redirect back to /payment-result after payment, which now handles both appointment and package purchases
      const submitUrl = `/api/v1/vnpay/submitOrder?orderTotal=${orderTotal}&orderInfo=${encodeURIComponent(orderInfo)}`;
      const paymentUrl = `${API_BASE_URL}${submitUrl}`;

      window.location.href = paymentUrl;
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
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
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Package Details</h1>
                  <p className="text-sm text-gray-600">Review and complete your purchase</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* Main Content with proper scrolling */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Package Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {pkg.packageName}
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Examination package from{" "}
                        <span className="font-semibold text-gray-900">
                          {doctor.title} {doctor.name}
                        </span>
                      </p>

                      {/* Doctor Info */}
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Doctor Information</h3>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                            />
                            <AvatarFallback className="bg-[#007A94] text-white">
                              {doctor.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {doctor.title} {doctor.name}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
                            {doctor.clinic && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {doctor.clinic}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Package Details */}
                      <h3 className="font-semibold text-gray-900 mb-4">Package Details</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold text-gray-900">
                            {pkg.durationDays} days
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Messages included</span>
                          <span className="font-semibold text-gray-900">12 messages</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Online consultations</span>
                          <span className="font-semibold text-gray-900">4 sessions</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Response time</span>
                          <span className="font-semibold text-gray-900">Within 12 hours</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Call from doctor</span>
                          <span className="font-semibold text-gray-900">40 minutes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Included Equipment */}
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Included Equipment</h3>
                      <div className="flex gap-4">
                        <div className="flex-1 border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-2xl mb-2">📱</div>
                          <p className="text-sm text-gray-600">Smartwatch</p>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-2xl mb-2">💊</div>
                          <p className="text-sm text-gray-600">Supplements</p>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-2xl mb-2">📊</div>
                          <p className="text-sm text-gray-600">Monitoring Kit</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Summary - Fixed sidebar */}
                <div>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-6">Order Summary</h3>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Service fee</span>
                          <span className="text-gray-900">
                            {(pkg.priceVnd / 1000000).toFixed(1)}M đ
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Supplementary fee</span>
                          <span className="text-gray-900">0 đ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-gray-900">0 đ</span>
                        </div>
                      </div>

                      {/* Deposit Section */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Deposit: 2,000,000 đ
                        </p>
                        <p className="text-xs text-amber-700">
                          Remaining payment due at the start of the package
                        </p>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total cost</span>
                          <span className="text-2xl font-bold text-[#007A94]">
                            {(pkg.priceVnd / 1000000).toFixed(1)}M đ
                          </span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}

                      {/* Payment Methods */}
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Payment method
                        </p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 selected:border-[#007A94]">
                            <input type="radio" name="payment" defaultChecked />
                            <span className="flex items-center gap-2">
                              <span className="text-lg">💳</span>
                              <span className="text-sm text-gray-900">MoMo Wallet</span>
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="payment" />
                            <span className="flex items-center gap-2">
                              <span className="text-lg">🏦</span>
                              <span className="text-sm text-gray-900">VNPAY</span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-2 mb-6">
                        <input
                          type="checkbox"
                          id="terms"
                          defaultChecked
                          className="mt-1"
                        />
                        <label
                          htmlFor="terms"
                          className="text-xs text-gray-600"
                        >
                          I accept the terms and conditions and privacy policy of the PHI Health Care platform
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-[#007A94] hover:bg-[#005F75] mb-3"
                      >
                        {isProcessing ? "Processing..." : "Confirm And Pay"}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={onBack}>
                        Back
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientPackagePage() {
  return (
    <AuthGuard>
      <PatientPackageContent />
    </AuthGuard>
  );
}
