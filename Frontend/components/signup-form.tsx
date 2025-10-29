"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, XIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export function SignUpForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    // Personal information - matches /api/auth/register/personal-info
    fullName: "",
    phone: "",
    identityCard: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",

    // Professional information - matches /api/auth/register/professional-info
    userId: 9, // This would come from personal info registration response
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    title: "DOCTOR",
    currentProvince: "",
    clinicHospital: "",
    careForAdults: true,
    careForChildren: true,
    specialties: ["ENDOCRINOLOGY"],
    treatmentConditions: ["HEART FAILURE", "HYPERTENSION", "CARDIOMYOPATHY"],
    practicingCertificationId: "",
    languages: ["ENGLISH", "VIETNAMESE"],
    workFromYear: 2002,
    workToYear: 2019,
    workClinicHospital: "",
    workLocation: "",
    workSpecialties: ["ENDOCRINOLOGY"],
    educationalInstitution: "",
    graduationYear: 2015,
    specialty: "",
    department: "",
    termsAccepted: false,
    dataProtectionAccepted: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    if (!currentArray.includes(value)) {
      handleInputChange(field, [...currentArray, value])
    }
  }

  const removeTag = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    handleInputChange(
      field,
      currentArray.filter((item) => item !== value),
    )
  }

  const TagInput = ({
    field,
    placeholder,
    suggestions,
  }: { field: string; placeholder: string; suggestions: string[] }) => {
    const tags = formData[field as keyof typeof formData] as string[]

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(field, tag)}
                className="hover:bg-teal-200 rounded-full p-0.5"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <Select onValueChange={(value) => addTag(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {suggestions.map((suggestion) => (
              <SelectItem key={suggestion} value={suggestion}>
                {suggestion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    
    try {
      if (currentStep === 1) {
        const personalInfoData = {
          fullName: formData.fullName,
          phone: formData.phone,
          identityCard: formData.identityCard,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          zipCode: formData.zipCode,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
        }

        console.log("Submitting personal info:", personalInfoData)
        // Here you would make the API call to /api/auth/register/personal-info
        // const response = await fetch('/api/auth/register/personal-info', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(personalInfoData)
        // })

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setCurrentStep(2)
      } else {
        const professionalInfoData = {
          userId: formData.userId,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          title: formData.title,
          currentProvince: formData.currentProvince,
          clinicHospital: formData.clinicHospital,
          careForAdults: formData.careForAdults,
          careForChildren: formData.careForChildren,
          specialties: formData.specialties,
          treatmentConditions: formData.treatmentConditions,
          practicingCertificationId: formData.practicingCertificationId,
          languages: formData.languages,
          workFromYear: formData.workFromYear,
          workToYear: formData.workToYear,
          workClinicHospital: formData.workClinicHospital,
          workLocation: formData.workLocation,
          workSpecialties: formData.workSpecialties,
          educationalInstitution: formData.educationalInstitution,
          graduationYear: formData.graduationYear,
          specialty: formData.specialty,
          department: formData.department,
        }

        console.log("Submitting professional info:", professionalInfoData)
        // Here you would make the API call to /api/auth/register/professional-info
        // const response = await fetch('/api/auth/register/professional-info', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(professionalInfoData)
        // })

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        // Redirect to login or success page
        console.log("Registration completed successfully")
        // window.location.href = "/login"
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-soft-xl rounded-3xl">
      <CardContent className="p-6 sm:p-8 lg:p-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 sm:mb-10">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className={`flex items-center space-x-3 ${currentStep === 1 ? "text-blue-600" : "text-slate-400"}`}>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  currentStep === 1 
                    ? "border-blue-600 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-soft-md" 
                    : "border-slate-300 bg-slate-100"
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold">STEP 1</div>
                <div className="text-sm">Personal Information</div>
              </div>
            </div>

            <div className="w-6 sm:w-12 h-px bg-slate-300"></div>

            <div className={`flex items-center space-x-3 ${currentStep === 2 ? "text-blue-600" : "text-slate-400"}`}>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  currentStep === 2 
                    ? "border-blue-600 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-soft-md" 
                    : "border-slate-300 bg-slate-100"
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold">STEP 2</div>
                <div className="text-sm">Professional Information</div>
              </div>
            </div>
          </div>
        </div>

        <div className="block sm:hidden text-center mb-6">
          <div className="text-sm font-medium text-gray-600">
            Step {currentStep} of 2: {currentStep === 1 ? "Personal Profile" : "Professional Profile"}
          </div>
        </div>

        {currentStep === 1 ? (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Personal information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. Pham Linh"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="identityCard" className="text-sm font-medium">
                    Identity Card
                  </Label>
                  <Input
                    id="identityCard"
                    placeholder="123416789"
                    value={formData.identityCard}
                    onChange={(e) => handleInputChange("identityCard", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="FEMALE" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of birth
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="dateOfBirth"
                      placeholder="1987-05-01"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone number
                  </Label>
                  <div className="flex mt-1">
                    <Select defaultValue="vn">
                      <SelectTrigger className="w-16 sm:w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vn">🇻🇳</SelectItem>
                        <SelectItem value="us">🇺🇸</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1 ml-2"
                      placeholder="0903422256"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="pham.linh@hospital.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Vietnam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="USA">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    State / Province
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Ho Chi Minh City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                      <SelectItem value="Hanoi">Hanoi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Ho Chi Minh City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                      <SelectItem value="Hanoi">Hanoi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    placeholder="3000"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Full Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Nguyen Hue Street, Ho Chi Minh City, Vietnam"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine1" className="text-sm font-medium">
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Nguyen Hue Street"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2" className="text-sm font-medium">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    placeholder="District 1"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Professional information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="dr_pham_linh123"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="securePassword123"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                      DOCTOR
                      <button type="button" className="ml-1 hover:bg-teal-200 rounded-full p-0.5">
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="currentProvince" className="text-sm font-medium">
                    Current Province
                  </Label>
                  <Select
                    value={formData.currentProvince}
                    onValueChange={(value) => handleInputChange("currentProvince", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Thua Thien - Hue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thua Thien - Hue">Thua Thien - Hue</SelectItem>
                      <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="clinicHospital" className="text-sm font-medium">
                  Clinic / Hospital
                </Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-1">
                  <Select
                    value={formData.clinicHospital}
                    onValueChange={(value) => handleInputChange("clinicHospital", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Phong Kham Tam An" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phong Kham Tam An">Phong Kham Tam An</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-transparent w-full sm:w-auto"
                  >
                    Add workplace
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium">Medical care for</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adults"
                      checked={formData.careForAdults}
                      onCheckedChange={(checked) => handleInputChange("careForAdults", checked)}
                    />
                    <Label htmlFor="adults" className="text-sm">
                      Adults
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="children"
                      checked={formData.careForChildren}
                      onCheckedChange={(checked) => handleInputChange("careForChildren", checked)}
                    />
                    <Label htmlFor="children" className="text-sm">
                      Children
                    </Label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium">Specialties</Label>
                <div className="mt-1">
                  <TagInput
                    field="specialties"
                    placeholder="Add specialty"
                    suggestions={["ENDOCRINOLOGY", "CARDIOLOGY", "NEUROLOGY", "PEDIATRICS"]}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium">Treatment of conditions</Label>
                <div className="mt-1">
                  <TagInput
                    field="treatmentConditions"
                    placeholder="Add condition"
                    suggestions={["HEART FAILURE", "HYPERTENSION", "CARDIOMYOPATHY", "DIABETES"]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div>
                  <Label htmlFor="practicingCertificationId" className="text-sm font-medium">
                    Practicing Certification ID
                  </Label>
                  <Input
                    id="practicingCertificationId"
                    placeholder="Certification ID"
                    value={formData.practicingCertificationId}
                    onChange={(e) => handleInputChange("practicingCertificationId", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Languages</Label>
                  <div className="mt-1">
                    <TagInput
                      field="languages"
                      placeholder="Add language"
                      suggestions={["ENGLISH", "VIETNAMESE", "FRENCH", "SPANISH"]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Work experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="workFromYear" className="text-sm font-medium">
                    From year
                  </Label>
                  <Select
                    value={formData.workFromYear}
                    onValueChange={(value) => handleInputChange("workFromYear", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="2002" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workToYear" className="text-sm font-medium">
                    To year
                  </Label>
                  <Select value={formData.workToYear} onValueChange={(value) => handleInputChange("workToYear", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="2010" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workClinicHospital" className="text-sm font-medium">
                    Work Clinic / Hospital
                  </Label>
                  <Select
                    value={formData.workClinicHospital}
                    onValueChange={(value) => handleInputChange("workClinicHospital", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Phong Kham Tam An" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phong Kham Tam An">Phong Kham Tam An</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workLocation" className="text-sm font-medium">
                    Clinic / hospital location
                  </Label>
                  <Input
                    id="workLocation"
                    placeholder="Phòng Khám Tâm An"
                    value={formData.workLocation}
                    onChange={(e) => handleInputChange("workLocation", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-2 sm:space-y-0">
                <div className="flex-1 sm:mr-4">
                  <Label className="text-sm font-medium">Specialties</Label>
                  <div className="mt-1">
                    <TagInput
                      field="workSpecialties"
                      placeholder="Add specialty"
                      suggestions={["ENDOCRINOLOGY", "CARDIOLOGY", "NEUROLOGY", "PEDIATRICS"]}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-transparent w-full sm:w-auto"
                >
                  Add workplace
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Education</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="educationalInstitution" className="text-sm font-medium">
                    Educational Institution
                  </Label>
                  <Select
                    value={formData.educationalInstitution}
                    onValueChange={(value) => handleInputChange("educationalInstitution", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Ho Chi Minh City University of Medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ho Chi Minh City University of Medicine">
                        Ho Chi Minh City University of Medicine
                      </SelectItem>
                      <SelectItem value="Hanoi Medical University">Hanoi Medical University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="graduationYear" className="text-sm font-medium">
                    Year of graduation
                  </Label>
                  <Select
                    value={formData.graduationYear}
                    onValueChange={(value) => handleInputChange("graduationYear", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="2015" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <div>
                  <Label htmlFor="specialty" className="text-sm font-medium">
                    Specialty
                  </Label>
                  <Input
                    id="specialty"
                    placeholder="Cardiology Residency"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange("specialty", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="Cardiology"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange("termsAccepted", checked)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  By clicking Sign Up, I confirm that I have read, understood and accepted all the Terms of Use,
                  Application Using Policy and Privacy Policy of Bác Sỹ Ơi platform
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="dataProtection"
                  checked={formData.dataProtectionAccepted}
                  onCheckedChange={(checked) => handleInputChange("dataProtectionAccepted", checked)}
                  className="mt-0.5"
                />
                <Label htmlFor="dataProtection" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  I confirm that I have read, understood and follow all instructions about personal data protection
                  under the government decree No. 13/2023/NĐ-CP.
                </Label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)} 
                disabled={isLoading}
                className="px-6 sm:px-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!formData.termsAccepted || !formData.dataProtectionAccepted || isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Finishing...</span>
                  </div>
                ) : (
                  "Finish registration"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
