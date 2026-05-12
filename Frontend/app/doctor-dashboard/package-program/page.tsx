"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, User, LogOut, Loader2, Save, Plus, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"
import DoctorSidebar from "@/components/doctor-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { NotificationBell } from "@/components/notification-bell"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/services/auth.service"
import {
  doctorExamPackageService,
  type DoctorExamPackageRow,
  type ExamPackageWorkspace,
} from "@/services/doctor-exam-package.service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type DraftLine = DoctorExamPackageRow & { clientId: string }

function newClientId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `draft-${Date.now()}-${Math.random()}`
}

function newEmptyDraftLine(): DraftLine {
  return {
    clientId: newClientId(),
    packageId: null,
    packageName: "",
    durationMinutes: 30,
    priceVnd: 0,
    applicable: false,
  }
}

/** New edits always start from published (approved) packages — each submit creates another pending request. */
function baselineDraftFromApproved(approved: DoctorExamPackageRow[]): DraftLine[] {
  if (approved.length === 0) return [newEmptyDraftLine()]
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
  /** Snapshot when the page loaded or after a successful submit — used to restore draft. */
  const [initialDraftSnapshot, setInitialDraftSnapshot] = useState<DraftLine[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set())
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
      setSelectedForDelete(new Set())
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
    setEditLines((prev) => {
      const next = [...prev, row]
      return next
    })
    setSelectedClientId(row.clientId)
  }

  const toggleDeleteSelect = (clientId: string, checked: boolean | "indeterminate") => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev)
      if (checked === true) {
        next.add(clientId)
      } else {
        next.delete(clientId)
      }
      return next
    })
  }

  const handleDeleteSelected = () => {
    if (selectedForDelete.size === 0) return
    setEditLines((prev) => prev.filter((row) => !selectedForDelete.has(row.clientId)))
    if (selectedClientId && selectedForDelete.has(selectedClientId)) {
      setSelectedClientId(null)
    }
    setSelectedForDelete(new Set())
    toast({
      title: "Draft updated",
      description: "Selected packages were removed from draft. Click Save to send approval request to admin.",
    })
  }

  /** Same state as when you first opened the page (or right after a successful submit). */
  const restoreDraftToInitial = (options?: { showToast?: boolean }) => {
    if (initialDraftSnapshot.length === 0) return
    setEditLines(cloneDraft(initialDraftSnapshot))
    setSelectedClientId(null)
    setSelectedForDelete(new Set())
    if (options?.showToast !== false) {
      toast({
        title: "Draft restored",
        description: "All edits were discarded. The list matches when you opened this page.",
      })
    }
  }

  const handleDraftRowClick = (clientId: string) => {
    if (selectedClientId === clientId) {
      restoreDraftToInitial({ showToast: false })
      return
    }
    setSelectedClientId(clientId)
  }

  const validateLines = (): string | null => {
    if (editLines.length === 0) return "Add at least one exam package."
    for (let i = 0; i < editLines.length; i++) {
      const row = editLines[i]
      if (!row.packageName || !row.packageName.trim()) return `Package #${i + 1}: name is required.`
      if (row.durationMinutes < 1 || row.durationMinutes > 24 * 60) return `Package "${row.packageName}": invalid duration.`
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
        durationMinutes: row.durationMinutes,
        priceVnd: row.priceVnd,
        applicable: row.applicable,
      }))
      const updated = await doctorExamPackageService.submitPackages(payload)
      setWorkspace(updated)
      const nextBaseline = baselineDraftFromApproved(updated.approvedPackages)
      setEditLines(nextBaseline)
      setInitialDraftSnapshot(cloneDraft(nextBaseline))
      setSelectedClientId(null)
      setSelectedForDelete(new Set())
      toast({
        title: "Success",
        description:
          "Request submitted. You can send another request anytime; each appears in the queue until an admin approves it.",
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
        <header className="bg-white py-3 px-6 rounded-2xl mb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-700" />
              <h1 className="text-lg font-semibold text-gray-900">Package Program</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/clean-female-doctor.png" />
                      <AvatarFallback className="text-xs">
                        {userInfo ? getInitials(userInfo.fullName) : "DR"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-xs font-medium">{userInfo?.fullName || "Doctor"}</p>
                      <p className="text-[10px] text-gray-500">Bác sĩ</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/my-profile">
                      <User className="mr-2 h-3.5 w-3.5" />
                      <span className="text-sm">My Profile</span>
                    </Link>
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

        <div className="flex-1 max-w-5xl mx-auto w-full">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-[#00a8cc]" />
                Exam packages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingCount > 0 && workspace && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Pending approval ({pendingCount})</Label>
                  <div className="space-y-2">
                    {workspace.pendingSubmissions.map((req) => (
                      <Alert key={req.requestId} className="border-amber-200 bg-amber-50/80">
                        <AlertTitle className="text-sm">
                          Submitted {new Date(req.submittedAt).toLocaleString()}
                        </AlertTitle>
                        <AlertDescription className="mt-2 space-y-1 text-xs">
                          {req.packages.map((p, i) => (
                            <div key={`${req.requestId}-${i}`} className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-amber-100/80 pb-1 last:border-0">
                              <span className="font-medium">{p.packageName || "(unnamed)"}</span>
                              <span>{p.durationMinutes} min</span>
                              <span>{p.priceVnd.toLocaleString()} VND</span>
                              <span>{p.applicable ? "Available" : "Hidden"}</span>
                            </div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {workspace && workspace.approvedPackages.length > 0 && (
                    <div className="rounded-xl border bg-white/80 p-3">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Published in database (live)
                      </Label>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {workspace.approvedPackages.map((p) => (
                          <li
                            key={p.packageId ?? p.packageName}
                            className="flex justify-between gap-2 border-b border-dashed last:border-0 pb-1.5 last:pb-0"
                          >
                            <span className="font-medium truncate">{p.packageName}</span>
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {p.durationMinutes} min · {p.priceVnd.toLocaleString()} VND
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Draft (next request)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleDeleteSelected}
                            disabled={selectedForDelete.size === 0 || saving || loading}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete selected ({selectedForDelete.size})
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={handleAddPackage} className="gap-1">
                            <Plus className="w-3.5 h-3.5" />
                            Add package
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Published: {workspace?.approvedPackages.length ?? 0} · Lines in draft: {editLines.length}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Tick checkbox to mark delete. Select a row to edit. Click the same row again to discard all draft
                        edits and go back to this initial list.
                      </p>
                      <ScrollArea className="h-[min(420px,50vh)] rounded-xl border bg-white">
                        <div className="p-1 space-y-1">
                          {editLines.map((row) => (
                            <div
                              key={row.clientId}
                              className={cn(
                                "w-full rounded-lg px-3 py-2.5 text-sm transition-colors border border-transparent",
                                selectedClientId === row.clientId
                                  ? "bg-[#d0eef5] border-[#00a8cc]/30 font-medium"
                                  : "hover:bg-gray-50",
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={selectedForDelete.has(row.clientId)}
                                  onCheckedChange={(checked) => toggleDeleteSelect(row.clientId, checked)}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Select ${row.packageName || "package"} for deletion`}
                                  className="mt-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDraftRowClick(row.clientId)}
                                  className="flex-1 text-left"
                                >
                                  <div className="truncate">{row.packageName?.trim() || "(Untitled package)"}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {row.durationMinutes} min · {row.priceVnd.toLocaleString()} VND
                                    {row.applicable ? " · On" : " · Off"}
                                  </div>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      {selectedRow ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="pkg-name">Package name</Label>
                            <Input
                              id="pkg-name"
                              value={selectedRow.packageName}
                              onChange={(e) => updateSelected({ packageName: e.target.value })}
                              placeholder="e.g. Annual check-up bundle"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="pkg-dur">Duration (minutes)</Label>
                              <Input
                                id="pkg-dur"
                                type="number"
                                min={1}
                                max={1440}
                                value={selectedRow.durationMinutes}
                                onChange={(e) =>
                                  updateSelected({
                                    durationMinutes: Math.max(1, Number(e.target.value) || 1),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pkg-price">Price (VND)</Label>
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
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="pkg-app"
                              checked={selectedRow.applicable}
                              onCheckedChange={(v) => updateSelected({ applicable: v })}
                            />
                            <Label htmlFor="pkg-app" className="cursor-pointer">
                              Available for patients
                            </Label>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedRow.packageId
                              ? "Includes reference id from published row."
                              : "New row — server assigns id after approval."}
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          Select a package on the left to edit, or add a package.
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          type="button"
                          className="bg-[#00a8cc] hover:bg-[#0096b8]"
                          onClick={handleSave}
                          disabled={saving || loading || editLines.length === 0}
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save &amp; request approval
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => restoreDraftToInitial({ showToast: true })}
                          disabled={initialDraftSnapshot.length === 0}
                          className="gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore draft
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
