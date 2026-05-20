import { BRAND } from "@/lib/brand"

/** Exact path → short page name (shown before "| iMed" in the browser tab). */
const EXACT_TITLES: Record<string, string> = {
  "/": "Trang chủ",
  "/login": "Đăng nhập",
  "/signup": "Đăng ký",
  "/signup/doctor": "Đăng ký bác sĩ",
  "/signup/patient": "Đăng ký bệnh nhân",
  "/signup/clinic-admin": "Đăng ký quản trị phòng khám",
  "/forgot-password": "Quên mật khẩu",
  "/verify-otp": "Xác thực OTP",
  "/reset-password": "Đặt lại mật khẩu",
  "/doctor-dashboard": "Dashboard",
  "/calendar": "Lịch hẹn",
  "/monitoring": "Theo dõi bệnh nhân",
  "/doctor-chat": "Tin nhắn",
  "/reports": "Báo cáo",
  "/my-profile": "Hồ sơ của tôi",
  "/settings": "Cài đặt",
  "/doctor-dashboard/package-program": "Gói khám",
  "/patient-dashboard": "Dashboard",
  "/patient-calendar": "Lịch hẹn",
  "/patient-calendar/booking": "Đặt lịch khám",
  "/patient-chat": "Tin nhắn",
  "/patient-emr": "Hồ sơ bệnh án",
  "/patient-profile": "Hồ sơ cá nhân",
  "/health-tracking": "Chỉ số sức khỏe",
  "/patient-medical-examination-history": "Lịch sử khám",
  "/patient-payment-history": "Lịch sử thanh toán",
  "/admin-dashboard": "Quản trị",
  "/payment-result": "Kết quả thanh toán",
}

/** Longest-prefix wins for nested routes. */
const PREFIX_TITLES: [string, string][] = [
  ["/calendar/appointment/", "Chi tiết lịch hẹn"],
  ["/patient-calendar/appointment/", "Chi tiết lịch hẹn"],
  ["/patient-medical-examination-history/", "Chi tiết lần khám"],
  ["/prescription/", "Đơn thuốc"],
  ["/video-call/", "Tư vấn trực tuyến"],
]

export function getPageTitle(pathname: string): string {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/"
  if (EXACT_TITLES[path]) return EXACT_TITLES[path]

  for (const [prefix, title] of PREFIX_TITLES) {
    if (path.startsWith(prefix)) return title
  }

  return BRAND.name
}

export function formatDocumentTitle(pageTitle: string): string {
  if (pageTitle === BRAND.name) {
    return `${BRAND.name} — ${BRAND.tagline}`
  }
  return `${pageTitle} | ${BRAND.name}`
}
