"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, User, LogOut, Loader2, Save, Plus, RotateCcw, Trash2, Pencil, Calendar, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import DoctorSidebar from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { authService } from "@/services/auth.service"
import {
  doctorExamPackageService,
  type DoctorExamPackageRow,
  type ExamPackageWorkspace,
} from "@/services/doctor-exam-package.service"
import { useToast } from "@/hooks/use-toast"

type DraftLine = DoctorExamPackageRow & { clientId: string }

function newClientId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `draft-${Date.now()}-${Math.random()}`
}

function newEmptyDraftLine(): DraftLine {
  return {
    clientId: newClientId(),
    packageId: null,
    packageName: "",
    durationDays: 7,
    priceVnd: 0,
    applicable: true,
  }
}

function baselineDraftFromApproved(approved: DoctorExamPackageRow[]): DraftLine[] {
  if (approved.length === 0) return []
  return approved.map((p) => ({
    ...p,
    clientId: newClientId(),
  }))
}

function cloneDraft(lines: DraftLine[]): DraftLine[] {
  return JSON.parse(JSON.stringify(lines)) as DraftLine[]
}

function PackageProgramContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<{ fullName: string } | null>(null)
  const [workspace, setWorkspace] = useState<ExamPackageWorkspace | null>(null)
  const [editLines, setEditLines] = useState<DraftLine[]>([])
  const [initialDraftSnapshot, setInitialDraftSnapshot] = useState<DraftLine[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = authService.getUserInfo()
    if (user) setUserInfo({ fullName: user.fullName || "Doctor" })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const w = await doctorExamPackageService.getWorkspace()
      setWorkspace(w)
      const baseline = baselineDraftFromApproved(w.approvedPackages)
      setEditLines(baseline)
      setInitialDraftSnapshot(cloneDraft(baseline))
      setSelectedClientId(null)
      setIsModalOpen(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not load exam packages."
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const getInitials = (name: string): string => {
    if (!name) return "DR"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch {
      authService.clearAuthData()
      router.push("/login")
    }
  }

  const selectedRow = selectedClientId ? editLines.find((r) => r.clientId === selectedClientId) ?? null : null

  const updateSelected = (patch: Partial<DoctorExamPackageRow>) => {
    if (!selectedClientId) return
    setEditLines((prev) =>
      prev.map((row) => (row.clientId === selectedClientId ? { ...row, ...patch } : row)),
    )
  }

  const handleAddPackage = () => {
    const row: DraftLine = newEmptyDraftLine()
    setEditLines((prev) => [...prev, row])
    setSelectedClientId(row.clientId)
    setIsModalOpen(true)
  }

  const handleDeletePackage = (clientId: string) => {
    setEditLines((prev) => prev.filter((row) => row.clientId !== clientId))
    if (selectedClientId === clientId) {
      setSelectedClientId(null)
    }
    toast({
      title: "Draft updated",
      description: "Package removed from draft list. Click Save to send approval request to admin.",
    })
  }

  const restoreDraftToInitial = (options?: { showToast?: boolean }) => {
    if (initialDraftSnapshot.length === 0) return
    setEditLines(cloneDraft(initialDraftSnapshot))
    setSelectedClientId(null)
    setIsModalOpen(false)
    if (options?.showToast !== false) {
      toast({
        title: "Draft restored",
        description: "All edits were discarded. The list matches when you opened this page.",
      })
    }
  }

  const validateLines = (): string | null => {
    if (editLines.length === 0) return "Add at least one exam package."
    for (let i = 0; i < editLines.length; i++) {
      const row = editLines[i]
      if (!row.packageName || !row.packageName.trim()) return `Package #${i + 1}: name is required.`
      if (row.durationDays < 1 || row.durationDays > 3650) return `Package "${row.packageName}": invalid duration.`
      if (row.priceVnd < 0) return `Package "${row.packageName}": price cannot be negative.`
    }
    return null
  }

  const handleSave = async () => {
    const err = validateLines()
    if (err) {
      toast({ title: "Validation", description: err, variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const payload = editLines.map(({ clientId: _c, ...row }) => ({
        packageId: row.packageId,
        packageName: row.packageName.trim(),
        durationDays: row.durationDays,
        priceVnd: row.priceVnd,
        applicable: row.applicable,
      }))
      const updated = await doctorExamPackageService.submitPackages(payload)
      setWorkspace(updated)
      const nextBaseline = baselineDraftFromApproved(updated.approvedPackages)
      setEditLines(nextBaseline)
      setInitialDraftSnapshot(cloneDraft(nextBaseline))
      setSelectedClientId(null)
      setIsModalOpen(false)
      toast({
        title: "Success",
        description: "Request submitted. Admin will review the changes shortly.",
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submit failed. Please try again."
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const pendingCount = workspace?.pendingSubmissions?.length ?? 0

  return (
    <div className="flex h-screen bg-[#e5f5f8]">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto pt-3 px-3 pb-3">
        <header className="bg-white py-3 px-6 rounded-2xl mb-3 shadow-sm border border-white/80">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-700" />
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Configure Monitoring Packages</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 hover:bg-gray-100 rounded-xl">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="text-xs">
                        {userInfo ? getInitials(userInfo.fullName) : "DR"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-gray-800">{userInfo?.fullName || "Doctor"}</p>
                      <p className="text-[10px] text-gray-500">Doctor</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md border-gray-100">
                  <DropdownMenuItem asChild>
                    <Link href="/my-profile" className="cursor-pointer">
                      <User className="mr-2 h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-6xl w-full mx-auto space-y-6 pb-8">
          {pendingCount > 0 && workspace && (
            <Alert className="border-amber-200 bg-amber-50/80 rounded-2xl shadow-sm">
              <AlertTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending approval requests ({pendingCount})
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                {workspace.pendingSubmissions.map((req) => (
                  <div key={req.requestId} className="text-xs text-amber-700">
                    <p className="font-medium mb-1">
                      Submitted at {new Date(req.submittedAt).toLocaleString()}:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 border-l-2 border-amber-300">
                      {req.packages.map((p, i) => (
                        <div key={`${req.requestId}-${i}`} className="bg-white/50 p-2 rounded-lg">
                          <span className="font-bold block text-gray-800">{p.packageName}</span>
                          <span className="text-gray-600">{p.durationDays} days · {p.priceVnd.toLocaleString("vi-VN")} đ</span>
                          <span className="inline-block ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold uppercase">
                            {p.applicable ? "Available" : "Hidden"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-white/80">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Draft under modification</h2>
              <p className="text-xs text-gray-500 font-medium">
                Submit changes for admin approval to officially apply them.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => restoreDraftToInitial({ showToast: true })}
                disabled={initialDraftSnapshot.length === 0 && editLines.length === 0}
                className="rounded-xl h-9 text-xs border-[#0d8fae]/30 text-[#0d8fae] hover:bg-[#0d8fae]/10 gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore draft
              </Button>
              <Button
                type="button"
                className="rounded-xl h-9 text-xs bg-[#0d8fae] hover:bg-[#0b7d99] text-white gap-1 font-semibold"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save &amp; submit for approval
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#0d8fae]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editLines.map((row) => (
                <Card
                  key={row.clientId}
                  className="p-6 rounded-3xl border border-[#d0eef5] bg-[#eef9fb]/80 hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0d8fae] tracking-tight uppercase truncate max-w-[200px]" title={row.packageName || "Untitled package"}>
                        {row.packageName || "Untitled package"}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#0d8fae] hover:bg-[#d0eef5]/60 rounded-xl h-8 px-2.5 text-xs font-semibold gap-1"
                          onClick={() => {
                            setSelectedClientId(row.clientId)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl h-8 px-2"
                          onClick={() => handleDeletePackage(row.clientId)}
                          title="Delete package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Switch
                          checked={row.applicable}
                          onCheckedChange={(checked) => {
                            setEditLines((prev) =>
                              prev.map((p) =>
                                p.clientId === row.clientId ? { ...p, applicable: checked } : p
                              )
                            )
                          }}
                          aria-label={`Toggle active state for ${row.packageName}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5 text-sm text-gray-600 mb-6 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Valid until:</span>
                        <span className="text-gray-800">31/12/2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Package duration:</span>
                        <span className="text-gray-800 font-semibold">{row.durationDays} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Package price:</span>
                        <span className="text-[#0d8fae] font-bold text-base">
                          {Number(row.priceVnd).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#d0eef5]">
                    <div className="flex gap-1">
                      <span className="px-2.5 py-0.5 bg-white/60 rounded-full text-[10px] font-semibold text-gray-600 border border-[#d0eef5]/30">
                        A0
                      </span>
                      <span className="px-2.5 py-0.5 bg-white/60 rounded-full text-[10px] font-semibold text-gray-600 border border-[#d0eef5]/30">
                        B1
                      </span>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                        alt="Patient 1"
                      />
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                        alt="Patient 2"
                      />
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                        alt="Patient 3"
                      />
                      <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-[#d0eef5] text-[9px] font-bold text-gray-500">
                        +9
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <button
                type="button"
                onClick={handleAddPackage}
                className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-[#0d8fae]/30 hover:border-[#0d8fae]/60 bg-white/50 hover:bg-white hover:shadow-sm transition-all duration-300 min-h-[220px] text-gray-500 hover:text-[#0d8fae] gap-2 cursor-pointer"
              >
                <Plus className="w-8 h-8 text-[#0d8fae]" />
                <span className="font-bold text-sm">Add new package</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && (setIsModalOpen(false), setSelectedClientId(null))}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl bg-white border border-[#d0eef5]">
          <DialogHeader>
            <DialogTitle className="text-[#0d8fae] font-bold text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0d8fae]" />
              {selectedRow?.packageId ? "Edit Monitoring Package" : "Create New Monitoring Package"}
            </DialogTitle>
          </DialogHeader>

          {selectedRow && (
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="pkg-name" className="text-sm font-semibold text-gray-700">Package Name</Label>
                <Input
                  id="pkg-name"
                  value={selectedRow.packageName}
                  onChange={(e) => updateSelected({ packageName: e.target.value })}
                  placeholder="e.g. 1-month monitoring package"
                  className="rounded-xl border-gray-200 focus:border-[#0d8fae] focus:ring-1 focus:ring-[#0d8fae]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pkg-dur" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Duration (days)
                  </Label>
                  <Input
                    id="pkg-dur"
                    type="number"
                    min={1}
                    max={3650}
                    value={selectedRow.durationDays}
                    onChange={(e) =>
                      updateSelected({
                        durationDays: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="rounded-xl border-gray-200 focus:border-[#0d8fae] focus:ring-1 focus:ring-[#0d8fae]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pkg-price" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Price (VND)
                  </Label>
                  <Input
                    id="pkg-price"
                    type="number"
                    min={0}
                    value={selectedRow.priceVnd}
                    onChange={(e) =>
                      updateSelected({
                        priceVnd: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                      })
                    }
                    className="rounded-xl border-gray-200 focus:border-[#0d8fae] focus:ring-1 focus:ring-[#0d8fae]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              className="w-full bg-[#0d8fae] hover:bg-[#0b7d99] text-white rounded-xl font-semibold text-sm h-10 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DoctorPackageProgramPage() {
  return (
    <AuthGuard allowedRoles={["DOCTOR"]}>
      <PackageProgramContent />
    </AuthGuard>
  )
}
