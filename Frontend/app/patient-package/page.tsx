"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  Clock,
  MessageSquare,
  ChevronRight,
  SlidersHorizontal,
  Video,
  UserCheck,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Calendar,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ClipboardList,
  AlertCircle,
  Lock as LockIcon
} from "lucide-react";
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
import { PageHeaderTitleRow } from "@/components/page-header-title-row";
import { authService } from "@/services/auth.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DoctorWithPackages {
  id: string;
  name: string;
  title?: string;
  specialty: string;
  clinic?: string;
  experience?: string;
  rating?: number;
  reviews?: number;
  packages: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Package Detail / Review Screen
// ─────────────────────────────────────────────────────────────────────────────
interface PackageDetailProps {
  doctor: DoctorWithPackages;
  pkg: any;
  onBack: () => void;
  userInfo: { fullName: string; role: string } | null;
  handleLogout: () => Promise<void>;
  getInitials: (name: string) => string;
}

const parseSpecialtyTags = (specialtyStr: string): string[] => {
  if (!specialtyStr) return [];
  const cleaned = specialtyStr.replace(/[{}]/g, "").replace(/"/g, "");
  return cleaned.split(",").map((item: string) => item.trim());
};

function PackageDetailView({
  doctor,
  pkg,
  onBack,
  userInfo,
  handleLogout,
  getInitials,
}: PackageDetailProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const orderTotal = pkg.priceVnd;
      const orderInfo = `Thanh toan goi kham - ${pkg.packageName} - Bac si ${doctor.name}`;

      const pendingPackagePurchase = {
        doctorId: doctor.id,
        packageId: pkg.packageId,
        packageName: pkg.packageName,
        priceVnd: pkg.priceVnd,
        durationDays: pkg.durationDays,
        purchaseDate: new Date().toISOString(),
      };

      localStorage.setItem("pendingPackagePurchase", JSON.stringify(pendingPackagePurchase));

      const submitUrl = `/api/v1/vnpay/submitOrder?orderTotal=${orderTotal}&orderInfo=${encodeURIComponent(orderInfo)}`;
      const paymentUrl = `${API_BASE_URL}${submitUrl}`;

      window.location.href = paymentUrl;
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const formatPrice = (amount: number) =>
    amount > 0 ? Number(amount).toLocaleString("vi-VN") + " đ" : "0 đ";
  const [extraDays, setExtraDays] = useState<number>(0);
  const [extraMins, setExtraMins] = useState<number>(0);
  const [extraSessions, setExtraSessions] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("VNPAY");
  const [isConfirmedPolicy, setIsConfirmedPolicy] = useState<boolean>(false);
  const [isAgreedShareData, setIsAgreedShareData] = useState<boolean>(false);
  return (
    <>
      {/* Main Content — rendered inside the parent's flex column */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left column ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* "You are buying" banner */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">You are buying</p>
                    <h2 className="text-xl font-bold text-gray-900">{pkg.packageName}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Buy date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    <span className="font-normal text-gray-500">Buy date </span>
                    <strong>{formatDate()}</strong>
                  </p>
                </div>
              </div>

              {/* Patient & Doctor cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Patient */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Patient</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-semibold">
                        {userInfo ? getInitials(userInfo.fullName) : "PT"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {userInfo?.fullName || "Patient"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Bệnh nhân</p>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Doctor</h3>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                      />
                      <AvatarFallback className="bg-teal-600 text-white text-sm font-semibold">
                        {doctor.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{doctor.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {parseSpecialtyTags(doctor.specialty || "").join(" • ")}
                      </p>
                      {doctor.clinic && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>🏥</span>
                          <span className="truncate">{doctor.clinic}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package information */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Package information</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2">
                    {/* Row 1 */}
                    <div className="flex items-start gap-3 p-4 border-b border-r border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{pkg.durationDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Start date</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate()}</p>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-start gap-3 p-4 border-b border-r border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">End date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatDate(pkg.durationDays || 7)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Response time</p>
                        <p className="text-sm font-bold text-gray-900"> within 24 hours</p>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-start gap-3 p-4 border-b border-r border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Messages</p>
                        <p className="text-sm font-bold text-gray-900">10</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Call (from doctor)</p>
                        <p className="text-sm font-bold text-gray-900">30 minutes</p>
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div className="flex items-start gap-3 p-4 border-b border-r border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Monitoring frequency</p>
                        <p className="text-sm font-bold text-gray-900">3 times per day</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Video className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Online consultation sessions</p>
                        <p className="text-sm font-bold text-gray-900">1</p>
                      </div>
                    </div>

                    {/* Row 5 */}
                    <div className="flex items-start gap-3 p-4 border-r border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Offline sessions</p>
                        <p className="text-sm font-bold text-gray-900">0</p>
                      </div>
                    </div>
                    <div className="p-4" />
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Add-ons</h3>
                <div className="space-y-3">

                  {/* 1. Extra days */}
                  <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Extra days</p>
                        <p className="text-xs text-gray-400">+35,000 đ/day</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Nút giảm: Chỉ cho bấm nếu số lượng đang lớn hơn 0 */}
                      <button
                        onClick={() => setExtraDays(prev => Math.max(0, prev - 1))}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition text-base leading-none select-none
            ${extraDays > 0
                            ? "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                        disabled={extraDays === 0}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-center select-none">{extraDays}</span>
                      {/* Nút tăng */}
                      <button
                        onClick={() => setExtraDays(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition text-gray-500 hover:text-teal-600 text-base leading-none select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 2. Extra call minutes */}
                  <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Extra call minutes</p>
                        <p className="text-xs text-gray-400">+3,000 đ/min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExtraMins(prev => Math.max(0, prev - 1))}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition text-base leading-none select-none
            ${extraMins > 0
                            ? "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                        disabled={extraMins === 0}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-center select-none">{extraMins}</span>
                      <button
                        onClick={() => setExtraMins(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition text-gray-500 hover:text-teal-600 text-base leading-none select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 3. Extra online consultation */}
                  <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                        <Video className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Extra online consultation</p>
                        <p className="text-xs text-gray-400">+50,000 đ/session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExtraSessions(prev => Math.max(0, prev - 1))}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition text-base leading-none select-none
            ${extraSessions > 0
                            ? "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                        disabled={extraSessions === 0}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-center select-none">{extraSessions}</span>
                      <button
                        onClick={() => setExtraSessions(prev => prev + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 transition text-gray-500 hover:text-teal-600 text-base leading-none select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Right column: Checkout ───────────────────────────── */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Checkout</h3>
                </div>

                <div className="p-5 space-y-4">
                  {/* Promotion Code */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Promotion Code</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Code"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 placeholder:text-gray-300"
                      />
                      <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="space-y-2.5 pt-1 border-t border-gray-100">
                    <div className="flex justify-between text-sm pt-3">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium text-gray-900">{formatPrice(pkg.priceVnd)}</span>
                    </div>

                    {/* Supplementary fee */}
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <span className="text-gray-400 text-xs">∨</span>
                          Supplementary fee
                        </span>
                        <span className="font-medium text-gray-900">0 đ</span>
                      </div>
                      <div className="pl-4 space-y-1 mt-1.5">
                        {["Extra days", "Call minutes", "Online consultation", "Offline consultation"].map(
                          (label) => (
                            <div key={label} className="flex justify-between text-xs text-gray-400">
                              <span>{label}</span>
                              <span>0 đ</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-teal-600 font-medium">Discount</span>
                      <span className="text-teal-600 font-medium">-0 đ</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        Application fee
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-flex items-center justify-center text-[9px] font-bold">
                          i
                        </span>
                      </span>
                      <span>0 đ</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Tax included, where applicable</span>
                      <span>0 đ</span>
                    </div>
                    <p className="text-xs text-gray-400">Includes tax + platform fee</p>
                  </div>

                  {/* Deposit Box */}
                  <div className="border border-yellow-300 bg-yellow-50 rounded-xl p-3">
                    <p className="text-sm font-bold text-gray-900">
                      Deposit: {formatPrice(pkg.priceVnd)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Remaining balance due when the package starts
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Total cost</span>
                    <span className="text-lg font-bold text-red-500">{formatPrice(pkg.priceVnd)}</span>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-3">Phương thức thanh toán</p>
                    <div className="space-y-2.5">

                      {/* 1. Lựa chọn MOMO */}
                      <label
                        className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-200 select-none ${paymentMethod === "MOMO"
                          ? "border-teal-500 bg-teal-50/20 ring-1 ring-teal-500"
                          : "border-gray-100 bg-white hover:bg-gray-50/80 hover:border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Khung chứa Logo MoMo chính thức */}
                          <div className="w-10 h-10 rounded-xl bg-[#A50064] flex items-center justify-center p-1.5 shadow-sm shrink-0">
                            <img
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX_lhzXKH3YCLQx-PMJFQfjFp6q0MINsHA9Q&s"
                              alt="MoMo Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">Ví điện tử MoMo</span>
                            <span className="text-[11px] text-gray-400">Thanh toán qua ứng dụng MoMo</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="pkgPayment"
                          checked={paymentMethod === "MOMO"}
                          onChange={() => setPaymentMethod("MOMO")}
                          className="accent-teal-600 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      {/* 2. Lựa chọn VNPAY */}
                      <label
                        className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-200 select-none${paymentMethod === "VNPAY"
                          ? "border-teal-500 bg-teal-50/20 ring-1 ring-teal-500"
                          : "border-gray-100 bg-white hover:bg-gray-50/80 hover:border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Khung chứa Logo VNPAY chính thức */}
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                            <img
                              src="https://dsvn.vn/images/logo-dvtt-VNP.png"
                              alt="VNPAY Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">Cổng thanh toán VNPAY</span>
                            <span className="text-[11px] text-gray-400">Hỗ trợ ứng dụng ngân hàng & Thẻ ATM</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="pkgPayment"
                          checked={paymentMethod === "VNPAY"}
                          onChange={() => setPaymentMethod("VNPAY")}
                          className="accent-teal-600 w-4 h-4 cursor-pointer"
                        />
                      </label>

                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    {/* Khu vực Checkbox Điều khoản */}
                    <div className="space-y-3 pt-1">
                      {/* 1. Checkbox Privacy Policy */}
                      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={isConfirmedPolicy}
                          onChange={(e) => setIsConfirmedPolicy(e.target.checked)}
                          className="mt-0.5 accent-teal-600 h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 leading-normal group-hover:text-gray-800 transition-colors">
                          Tôi xác nhận đã đọc và đồng ý với{" "}
                          <span
                            onClick={(e) => {
                              e.preventDefault(); // Ngăn hành động tick checkbox khi click vào chữ link công ty
                              // Thêm hàm mở Modal hoặc Link điều khoản tại đây nếu cần
                            }}
                            className="text-teal-600 underline hover:text-teal-700 font-medium cursor-pointer mx-0.5"
                          >
                            Chính sách bảo mật & Điều khoản sử dụng
                          </span>
                        </span>
                      </label>

                      {/* 2. Checkbox Share Medical Data */}
                      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={isAgreedShareData}
                          onChange={(e) => setIsAgreedShareData(e.target.checked)}
                          className="mt-0.5 accent-teal-600 h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                        <span className="text-xs text-gray-600 leading-normal group-hover:text-gray-800 transition-colors">
                          Tôi đồng ý chia sẻ dữ liệu y tế cá nhân của mình cho Bác sĩ / Phòng khám phụ trách gói dịch vụ này
                        </span>
                      </label>
                    </div>

                    {/* Hiển thị thông báo Lỗi của hệ thống nếu có */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-xs font-medium text-red-800">{error}</p>
                      </div>
                    )}

                    {/* Nút bấm Thanh toán - Tự động khóa thông minh */}
                    <Button
                      onClick={handlePayment}
                      // Logic khóa nút: Nếu đang xử lý HOẶC 1 trong 2 checkbox chưa được tích thì sẽ disabled
                      disabled={isProcessing || !isConfirmedPolicy || !isAgreedShareData}
                      className="w-full h-11 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2
      disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none disabled:cursor-not-allowed
      bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-700/10"
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : !isConfirmedPolicy || !isAgreedShareData ? (
                        <>
                          <LockIcon className="w-4 h-4 opacity-70" />
                          <span>Vui lòng đồng ý điều khoản</span>
                        </>
                      ) : (
                        "Xác nhận và Thanh toán"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main listing screen (doctors + their packages)
// ─────────────────────────────────────────────────────────────────────────────
function PatientPackageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctorsWithPackages, setDoctorsWithPackages] = useState<DoctorWithPackages[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSurveyBanner, setShowSurveyBanner] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{ fullName: string; role: string } | null>(null);

  // Detail view state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithPackages | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null);

  // Load user info
  useEffect(() => {
    const user = authService.getUserInfo();
    if (user) {
      setUserInfo({
        fullName: user.fullName || "Patient",
        role: user.role || "PATIENT",
      });
    }
  }, []);

  // Load doctors and their packages on mount
  useEffect(() => {
    loadDoctorsWithPackages("");
  }, []);

  const loadDoctorsWithPackages = async (query: string) => {
    setLoading(true);
    try {
      const doctors = await patientExamPackageService.getAllDoctors(query);

      const doctorPromises = doctors.map(async (doctor) => {
        const packages = await patientExamPackageService.getDoctorExamPackages(doctor.id);
        return { ...doctor, packages: packages || [] };
      });

      const doctorsData = await Promise.all(doctorPromises);
      setDoctorsWithPackages(doctorsData);

      const uniqueSpecialties = Array.from(
        new Set(doctorsData.map((d) => d.specialty).filter(Boolean))
      ) as string[];
      setSpecialties(uniqueSpecialties);
    } catch (error) {
      console.error("Error loading doctors with packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadDoctorsWithPackages(query);
  };

  const filteredDoctors = doctorsWithPackages.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // When user clicks "Select" → show detail/review screen
  const handlePackageSelect = (doctor: DoctorWithPackages, pkg: any) => {
    setSelectedDoctor(doctor);
    setSelectedPkg(pkg);
  };

  // Go back from detail to listing
  const handleBackToList = () => {
    setSelectedDoctor(null);
    setSelectedPkg(null);
  };

  // User details helper functions
  const getInitials = (name: string): string => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      authService.clearAuthData();
      router.push("/login");
    }
  };

  // ── Single stable layout wrapper to prevent hydration/removeChild errors ────
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#E8F5F1" }}>
      <PatientSidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: "12px" }}>
        {selectedDoctor && selectedPkg ? (
          <>
            {/* Header for Package Detail view */}
            <header
              className="bg-white py-3 mx-3 mb-3 shrink-0"
              style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackToList}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition mr-1"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-900" />
                  </button>
                  <PageHeaderTitleRow
                    role="patient"
                    icon={ClipboardList}
                    title="Package Details"
                    titleClassName="text-lg"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <NotificationBell />
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

            <PackageDetailView
              doctor={selectedDoctor}
              pkg={selectedPkg}
              onBack={handleBackToList}
              userInfo={userInfo}
              handleLogout={handleLogout}
              getInitials={getInitials}
            />
          </>
        ) : (
          <>
            {/* Header */}
            <header
              className="bg-white py-3 mx-3 mb-3 shrink-0"
              style={{ borderRadius: "14px", paddingLeft: "24px", paddingRight: "20px" }}
            >
              <div className="flex items-center justify-between">
                <PageHeaderTitleRow
                  role="patient"
                  icon={ClipboardList}
                  title="Buy Package"
                  titleClassName="text-lg"
                />

                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <NotificationBell />

                  {/* User Menu */}
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

            {/* Main Content */}
            <ScrollArea className="flex-1 w-full">
              <div className="p-6 max-w-7xl mx-auto">
                {/* Survey Banner */}
                {showSurveyBanner && (
                  <Card className="mb-6 border-0 bg-gradient-to-r from-blue-50 to-teal-50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Chưa Biết Chọn Gói Phù Hợp?
                          </h3>
                          <p className="text-sm text-gray-600">
                            Which package is best suited for you? Take the quick survey then system will
                            recommend you the packages that are right for you.
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSurveyBanner(false)}
                          >
                            Skip
                          </Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                            Explore now
                          </Button>
                        </div>
                        <button
                          onClick={() => setShowSurveyBanner(false)}
                          className="p-1 hover:bg-white/50 rounded transition"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Search and Filter */}
                <Card className="mb-8 overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-2xl">
                  <CardContent className="p-6">
                    {/* Thanh Tìm Kiếm Hiện Đại */}
                    <div className="relative flex items-center mb-5">
                      <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none transition-colors group-focus-within:text-teal-600" />
                      <Input
                        placeholder="Search doctors by name, specialty, or hospital..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-11 pr-4 h-12 bg-gray-50/70 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-500/20 rounded-xl transition-all placeholder:text-gray-400 text-sm"
                      />
                    </div>

                    {/* Danh Sách Bộ Lọc Chuyên Khoa */}
                    {specialties.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 px-0.5">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Filter by Specialty Group</span>
                        </div>

                        {/* Vùng chứa các Badge chính */}
                        <div className="flex flex-wrap gap-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                          {/* Nút "All Catalogue" */}
                          <Badge
                            variant="outline"
                            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border select-none h-auto flex items-center
                    ${selectedSpecialty === null
                                ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-600/20"
                                : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            onClick={() => setSelectedSpecialty(null)}
                          >
                            All Catalogue
                          </Badge>

                          {/* Danh sách các nhóm chuyên khoa */}
                          {specialties.map((specialtyStr) => {
                            const isSelected = selectedSpecialty === specialtyStr;
                            const subSpecialties = parseSpecialtyTags(specialtyStr);

                            return (
                              <div
                                key={specialtyStr}
                                onClick={() => setSelectedSpecialty(isSelected ? null : specialtyStr)}
                                className={`cursor-pointer px-3 py-1.5 rounded-xl border transition-all duration-200 select-none flex items-center gap-1.5 text-xs font-medium
                        ${isSelected
                                    ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm shadow-teal-600/5 ring-1 ring-teal-500"
                                    : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-teal-50/30 hover:border-teal-200 hover:text-teal-600"
                                  }`}
                              >
                                <div className="flex items-center gap-1">
                                  {subSpecialties.map((sub, idx) => (
                                    <span key={idx} className="flex items-center">
                                      <span>{sub}</span>
                                      {idx < subSpecialties.length - 1 && (
                                        <span
                                          className={`mx-1 opacity-40 ${isSelected ? "text-teal-400" : "text-gray-300"
                                            }`}
                                        >
                                          •
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Specialists count & sort */}
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Our Specialists ({filteredDoctors.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort:</span>
                    <select className="text-sm border border-gray-200 rounded px-3 py-1 bg-white">
                      <option>Relative</option>
                      <option>Most Popular</option>
                      <option>Lowest Price</option>
                      <option>Highest Rating</option>
                    </select>
                  </div>
                </div>

                {/* Doctors with Packages */}
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">
                      Loading doctors and packages...
                    </div>
                  ) : filteredDoctors && filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <Card key={doctor.id} className="border-0 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                          {/* Doctor Info Header */}
                          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                            <Avatar className="w-20 h-20 flex-shrink-0">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                              />
                              <AvatarFallback className="bg-teal-600 text-white text-lg">
                                {doctor.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {doctor.title} {doctor.name}
                                </h3>
                                {doctor.rating && (
                                  <Badge className="bg-amber-100 text-amber-800 border-0">
                                    Most Popular
                                  </Badge>
                                )}
                              </div>
                              {doctor.specialty && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {parseSpecialtyTags(doctor.specialty).map((spec: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100/80 select-none tracking-wide"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                {doctor.clinic && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-teal-600" />
                                    {doctor.clinic}
                                  </span>
                                )}
                                {doctor.experience && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-teal-600" />
                                    {doctor.experience}
                                  </span>
                                )}
                                {doctor.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    {doctor.rating} ({doctor.reviews} reviews)
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" className="text-teal-600">
                              View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>

                          {/* Packages Grid */}
                          {doctor.packages && doctor.packages.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              {doctor.packages.map((pkg: any) => (
                                <div
                                  key={pkg.packageId}
                                  className="group relative flex flex-col justify-between overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-4px_rgba(0,0,0,0.06)] hover:border-teal-500/30 transition-all duration-300"
                                >
                                  {/* Thanh accent line gradient xuất hiện mượt mà khi hover */}
                                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                  {/* 1. Phần Nội dung chính (Body) */}
                                  <div className="p-6 pb-4">
                                    {/* Header của gói */}
                                    <div className="flex items-center gap-3 mb-5">
                                      <div className="p-2 bg-teal-50 rounded-xl text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white duration-300">
                                        <Calendar className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                          Gói tư vấn
                                        </span>
                                        <p className="text-sm font-bold text-gray-800">
                                          {pkg.durationDays} ngày
                                        </p>
                                      </div>
                                    </div>

                                    {/* Phần hiển thị Giá cả */}
                                    <div className="mb-5 pt-3 border-t border-gray-50">
                                      <p className="text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                                        Giá dịch vụ
                                      </p>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-gray-900 tracking-tight transition-colors group-hover:text-teal-600 duration-200">
                                          {Number(pkg.priceVnd).toLocaleString("vi-VN")}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400 align-baseline">
                                          đ
                                        </span>
                                      </div>
                                    </div>

                                    {/* Khu vực Các tính năng đi kèm (Features) */}
                                    <div className="space-y-3.5 bg-gray-50/60 rounded-2xl p-4 border border-gray-100/50">
                                      <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-teal-50 border border-teal-100/40 rounded-lg text-teal-600 flex-shrink-0 mt-0.5">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                          <span className="text-[11px] text-gray-400 block font-medium">
                                            Trao đổi tin nhắn
                                          </span>
                                          <p className="text-xs font-semibold text-gray-700">
                                            3 cuộc trao đổi
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-teal-50 border border-teal-100/40 rounded-lg text-teal-600 flex-shrink-0 mt-0.5">
                                          <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                          <span className="text-[11px] text-gray-400 block font-medium">
                                            Thời gian phản hồi
                                          </span>
                                          <p className="text-xs font-semibold text-gray-700">
                                            Trong 12 giờ
                                          </p>
                                        </div>
                                      </div>

                                      {/* Trạng thái Kênh tương tác Online/Offline */}
                                      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-200/50">
                                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                          <Video className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                          <span className="text-[11px] font-semibold text-gray-700">
                                            1 Online
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-100 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                          <UserCheck className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                          <span className="text-[11px] font-medium text-gray-400">
                                            0 Offline
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 2. Phần Chân thẻ (Footer với CTA & Highlights) */}
                                  <div className="p-6 pt-2 mt-auto border-t border-gray-50 bg-gradient-to-b from-transparent to-gray-50/30">
                                    {pkg.deviceName && (
                                      <div className="mb-4">
                                        <Badge
                                          variant="outline"
                                          className="bg-teal-50/50 text-teal-700 border-teal-100/80 hover:bg-teal-100/60 font-medium text-[11px] px-2.5 py-0.5 rounded-md"
                                        >
                                          ⚡️ {pkg.deviceName}
                                        </Badge>
                                      </div>
                                    )}

                                    {/* Nút hành động chính */}
                                    <Button
                                      onClick={() => handlePackageSelect(doctor, pkg)}
                                      className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-teal-700/10 hover:shadow-md hover:shadow-teal-700/20 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                                    >
                                      <span>Chọn gói dịch vụ</span>
                                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                    </Button>

                                    {/* Quyền lợi cốt lõi dưới cùng */}
                                    <div className="mt-4 space-y-2.5 pt-3 border-t border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                        <span className="text-[11px] font-medium text-gray-500">
                                          Tư vấn chuyên sâu cùng bác sĩ
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                        <span className="text-[11px] font-medium text-gray-500">
                                          Hỗ trợ theo dõi sức khỏe liên tục
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              No packages available for this doctor
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">No doctors found</div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PatientPackagePage() {
  return (
    <AuthGuard>
      <PatientPackageContent />
    </AuthGuard>
  );
}
