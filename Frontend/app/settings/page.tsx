"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DoctorSidebar from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Search, Calendar, Users, ExternalLink, Pencil, Plus, LayoutDashboard, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/loading-spinner"
import { authService } from "@/services/auth.service"

function SettingsPageContent() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("10 mins")
  const [selectedClinic, setSelectedClinic] = useState("Clinic 1")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const user = authService.getUserInfo()
    setUserInfo(user)
  }, [])

  // Helper function to get initials from fullName
  const getInitials = (name: string): string => {
    if (!name) return 'DR'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      authService.clearAuthData()
      router.push('/login')
    }
  }

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls for settings data
        await new Promise(resolve => setTimeout(resolve, 600))
      } catch (error) {
        console.error('Error loading settings data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const durations = ["10 mins", "15 mins", "20 mins", "30 mins", "1 hour"]
  const clinics = ["Clinic 1", "Clinic 2", "Clinic 3"]
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const vouchers = [
    {
      code: "DRHOALT10",
      dateRange: "06/07/2025 - 30/08/2025",
      used: "02/10 voucher used",
      applicableFor: "Monitoring packages",
    },
    {
      code: "DRHOALT08_MCT",
      dateRange: "06/07/2025 - 30/08/2025",
      used: "02/10 voucher used",
      applicableFor: "Monitoring packages",
    },
    {
      code: "DRHOALT09_MTV",
      dateRange: "06/07/2025 - 30/08/2025",
      used: "02/10 voucher used",
      applicableFor: "Monitoring packages",
    },
    {
      code: "DRHOALT10",
      dateRange: "06/07/2025 - 30/08/2025",
      used: "02/10 voucher used",
      applicableFor: "Monitoring packages",
    },
    {
      code: "DRHOALT10",
      dateRange: "06/07/2025 - 30/08/2025",
      used: "02/10 voucher used",
      applicableFor: "Monitoring packages",
    },
  ]

  const packages = [
    { name: "TRIAL PACKAGE", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
    { name: "1 MONTH", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
    { name: "3 MONTHS", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
    { name: "5 MONTHS", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
    { name: "6 MONTHS", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
    { name: "9 MONTHS", valid: "30/08/2025", duration: "7 days", cost: "300000 đ", tags: ["A0", "B1", "C2"] },
  ]

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#e5f5f8' }}>
      <DoctorSidebar />

      <div className="flex-1 flex flex-col overflow-y-auto" style={{ paddingTop: '16px' }}>
        {/* Header */}
        <header className="bg-white py-4 mx-4 mb-4" style={{ borderRadius: '16px', paddingLeft: '32px', paddingRight: '24px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  type="search"
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback>{userInfo ? getInitials(userInfo.fullName) : 'DR'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userInfo?.fullName || 'Doctor'}</p>
                      <p className="text-xs text-gray-500">Bác sĩ</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/my-profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="vouchers" className="w-full">
            <TabsList className="glass border-white/50 shadow-soft-md rounded-none w-full justify-start h-auto p-0 mb-6">
              <TabsTrigger
                value="appointments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#16a1bd] data-[state=active]:bg-transparent data-[state=active]:text-[#16a1bd] px-4 py-3 transition-all duration-300"
              >
                Appointments
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#16a1bd] data-[state=active]:bg-transparent data-[state=active]:text-[#16a1bd] px-4 py-3 transition-all duration-300"
              >
                Package Programs
              </TabsTrigger>
              <TabsTrigger
                value="vouchers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#16a1bd] data-[state=active]:bg-transparent data-[state=active]:text-[#16a1bd] px-4 py-3 transition-all duration-300"
              >
                Vouchers
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#16a1bd] data-[state=active]:bg-transparent data-[state=active]:text-[#16a1bd] px-4 py-3 transition-all duration-300"
              >
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Vouchers Tab */}
            <TabsContent value="vouchers" className="mt-0">
              <div className="flex justify-end mb-6">
                <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
                  <DialogTrigger asChild>
                    <Button className="glass border-2 border-[#16a1bd] text-[#16a1bd] hover:gradient-primary hover:text-white transition-smooth">
                      Add voucher <Plus className="w-4 h-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>ADD VOUCHER</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="promotion-code">
                            Promotion code <span className="text-red-500">*</span>
                          </Label>
                          <Input id="promotion-code" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="voucher-count">
                            Available number of vouchers <span className="text-red-500">*</span>
                          </Label>
                          <Input id="voucher-count" type="number" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">
                            Start date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="start-date" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">
                            End date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Applicable For <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="appointments" defaultChecked />
                            <label htmlFor="appointments" className="text-sm font-medium leading-none">
                              Appointments
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="monitoring" defaultChecked />
                            <label htmlFor="monitoring" className="text-sm font-medium leading-none">
                              Monitoring packages
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-[#16a1bd] hover:bg-[#138a9f]" onClick={() => setIsAddVoucherOpen(false)}>
                        Add
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {vouchers.map((voucher, index) => (
                  <Card key={index} className="p-6 glass rounded-3xl shadow-soft-lg border-white/50 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#16a1bd]">{voucher.code}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50">
                          Edit <Pencil className="w-4 h-4 ml-1" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50">
                          Share <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{voucher.dateRange}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{voucher.used}</span>
                      </div>
                      <p>Applicable for: {voucher.applicableFor}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Package Programs Tab */}
            <TabsContent value="packages" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                {packages.map((pkg, index) => (
                  <Card key={index} className="p-6 glass rounded-3xl shadow-soft-lg border-white/50 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#16a1bd]">{pkg.name}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50">
                          Edit <Pencil className="w-4 h-4 ml-1" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#16a1bd] hover:bg-white/50">
                          Share <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>Valid: {pkg.valid}</p>
                      <p>Package duration: {pkg.duration}</p>
                      <p>Total package cost: {pkg.cost}</p>
                    </div>
                    <div className="flex gap-2">
                      {pkg.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 glass rounded-3xl shadow-soft-lg border-white/50 hover-lift">
                  <h3 className="text-lg font-semibold mb-4">Session duration</h3>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((duration) => (
                      <Button
                        key={duration}
                        variant={selectedDuration === duration ? "default" : "outline"}
                        className={
                          selectedDuration === duration
                            ? "bg-[#16a1bd] hover:bg-[#138a9f] text-white"
                            : "border-gray-300 hover:bg-gray-50"
                        }
                        onClick={() => setSelectedDuration(duration)}
                      >
                        {duration}
                      </Button>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4">Appointment cost</h3>
                  <div className="relative">
                    <Input type="text" placeholder="Enter cost per 1 day (e.g. 300,000)" className="pr-16" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">VND</span>
                  </div>

                  <Button className="mt-6 bg-[#16a1bd] hover:bg-[#138a9f]">Save</Button>
                </Card>

                <Card className="p-6 glass rounded-3xl shadow-soft-lg border-white/50 hover-lift">
                  <h3 className="text-lg font-semibold mb-4">Working days and hours</h3>

                  <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    {clinics.map((clinic) => (
                      <Button
                        key={clinic}
                        variant="ghost"
                        className={
                          selectedClinic === clinic
                            ? "bg-[#16a1bd] text-white hover:bg-[#138a9f] flex-1"
                            : "hover:bg-gray-200 flex-1"
                        }
                        onClick={() => setSelectedClinic(clinic)}
                      >
                        {clinic}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {weekDays.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <Switch defaultChecked className="data-[state=checked]:bg-[#16a1bd]" />
                        <span className="w-24 text-sm font-medium">{day}</span>
                        <Input type="time" defaultValue="08:00" className="w-28" />
                        <span className="text-gray-500">-</span>
                        <Input type="time" defaultValue="17:00" className="w-28" />
                        <Button size="icon" variant="ghost" className="text-[#16a1bd]">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6 bg-[#16a1bd] hover:bg-[#138a9f]">Save</Button>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Card className="p-6 glass rounded-3xl shadow-soft-lg border-white/50 hover-lift">
                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                <p className="text-gray-500">Notification settings will be available soon.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard allowedRoles={['DOCTOR', 'ADMIN', 'CLINIC_ADMIN']}>
      <SettingsPageContent />
    </AuthGuard>
  )
}
