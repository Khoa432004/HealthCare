"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function PatientSignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone || !formData.gender || 
          !formData.dateOfBirth || !formData.address || !formData.password || !formData.confirmPassword) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc")
        setIsLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Email không đúng định dạng")
        setIsLoading(false)
        return
      }

      // Validate phone number (Vietnamese phone: 10 digits starting with 0)
      const phoneRegex = /^0[0-9]{9}$/
      if (!phoneRegex.test(formData.phone)) {
        setError("Số điện thoại phải có 10 số và bắt đầu bằng 0")
        setIsLoading(false)
        return
      }

      // Validate full name
      if (formData.fullName.length < 2 || formData.fullName.length > 100) {
        setError("Họ và tên phải có từ 2 đến 100 ký tự")
        setIsLoading(false)
        return
      }

      // Validate date of birth
      const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
      if (!dateRegex.test(formData.dateOfBirth)) {
        setError("Ngày sinh phải đúng định dạng YYYY-MM-DD")
        setIsLoading(false)
        return
      }

      const inputDate = new Date(formData.dateOfBirth)
      const today = new Date()
      if (inputDate > today) {
        setError("Ngày sinh không thể là ngày trong tương lai")
        setIsLoading(false)
        return
      }

      // Validate address
      if (formData.address.length < 5 || formData.address.length > 200) {
        setError("Địa chỉ phải có từ 5 đến 200 ký tự")
        setIsLoading(false)
        return
      }

      // Validate password
      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự")
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu không khớp")
        setIsLoading(false)
        return
      }

      // Check terms acceptance
      if (!formData.termsAccepted) {
        setError("Vui lòng đồng ý với các điều khoản và chính sách")
        setIsLoading(false)
        return
      }

      // Prepare registration data
      const registrationData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: "PATIENT",
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
      }

      const response = await authService.register(registrationData as any)
      setSuccess(true)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setError(error.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center relative overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-2xl">
            <Card className="bg-[rgba(255,255,255,0.68)] backdrop-blur-sm border border-white/50 shadow-soft-xl rounded-3xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                {/* Back link */}
                <div className="mb-6">
                  <Link href="/signup" className="text-[#16a1bd] hover:text-[#0d6171] font-semibold text-sm">
                    ← Quay lại chọn vai trò
                  </Link>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0b0c0c] mb-2">Đăng ký tài khoản Bệnh nhân</h1>
                <p className="text-sm text-gray-600 mb-6">Điền thông tin để tạo tài khoản</p>

                {/* Success Alert */}
                {success && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-800">
                      Đăng kí thành công! Đang chuyển hướng đến trang đăng nhập...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nguyenvana@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Số điện thoại <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex mt-1">
                        <div className="flex items-center justify-center w-16 sm:w-20 bg-gradient-to-r from-[#01D2D5] via-[#06B4CC] to-[#16A1BD] border border-r-0 border-gray-300 rounded-l-md px-3">
                          <span className="text-xl">🇻🇳</span>
                        </div>
                        <Input
                          className="flex-1 ml-0 rounded-l-none"
                          placeholder="0903422256"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Giới tính <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="MALE">Nam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                        Ngày sinh <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Địa chỉ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        Mật khẩu <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ít nhất 6 ký tự"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="pt-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Tôi đồng ý với các{" "}
                        <Link href="/terms" className="text-[#16a1bd] hover:underline">
                          Điều khoản & Chính sách sử dụng
                        </Link>{" "}
                        của nền tảng Bác Sỹ Ơi
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <Link
                      href="/login"
                      className="text-center text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Đã có tài khoản? Đăng nhập
                    </Link>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#0D6171] hover:bg-[#0a4d5a] text-white px-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        "Đăng ký"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

