"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Eye, Loader2, Package, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import {
  adminExamPackageRequestsService,
  type ExamPackageChangeRow,
  type ExamPackageRequestDetail,
  type ExamPackageRow,
  type PendingExamPackageRequestItem,
} from "@/services/admin-exam-package-requests.service"

function summarizePkg(p: ExamPackageRow | null | undefined): string {
  if (!p) return "—"
  return `${p.packageName} · ${p.durationDays} days · ${Number(p.priceVnd).toLocaleString()} VND · ${p.applicable ? "Available" : "Hidden"}`
}

function changeBadgeVariant(t: ExamPackageChangeRow["changeType"]) {
  if (t === "ADDED") return "default" as const
  if (t === "MODIFIED") return "secondary" as const
  return "destructive" as const
}

function isStaleRequestError(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes("not pending approval") || m.includes("not found")
}

export function ExamPackageRequestsTable() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [items, setItems] = useState<PendingExamPackageRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ExamPackageRequestDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejectRow, setRejectRow] = useState<PendingExamPackageRequestItem | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await adminExamPackageRequestsService.listPending()
      setItems(list)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("loadRequestsFailed", "Could not load pending requests.")
      toast({
        title: t("error"),
        description: msg,
        variant: "destructive",
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [toast, t])

  useEffect(() => {
    load()
  }, [load])

  const openReview = async (requestId: string) => {
    setReviewId(requestId)
    setDetail(null)
    setReviewOpen(true)
    setDetailLoading(true)
    try {
      const d = await adminExamPackageRequestsService.getPendingDetail(requestId)
      setDetail({
        ...d,
        changes: Array.isArray(d.changes) ? d.changes : [],
        unchangedPublishedCount: d.unchangedPublishedCount ?? 0,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("loadProposalFailed", "Could not load proposal.")
      toast({ title: t("error"), description: msg, variant: "destructive" })
      setReviewOpen(false)
      setReviewId(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!reviewId) return
    setApproving(true)
    try {
      await adminExamPackageRequestsService.approve(reviewId)
      toast({
        title: t("approved"),
        description: t("approveRequestSuccess", "These packages are now published for the doctor."),
      })
      setReviewOpen(false)
      setReviewId(null)
      setDetail(null)
      await load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("approveFailed", "Approve failed.")
      toast({ title: t("error"), description: msg, variant: "destructive" })
      if (isStaleRequestError(msg)) {
        setReviewOpen(false)
        setReviewId(null)
        setDetail(null)
        await load()
      }
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectRow) return
    setRejecting(true)
    try {
      await adminExamPackageRequestsService.reject(rejectRow.requestId, rejectNote)
      toast({
        title: t("rejected"),
        description: t("rejectRequestSuccess", "The doctor was notified in-app. Published packages were not changed."),
      })
      setRejectRow(null)
      setRejectNote("")
      await load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("rejectFailed", "Reject failed.")
      toast({ title: t("error"), description: msg, variant: "destructive" })
      if (isStaleRequestError(msg)) {
        setRejectRow(null)
        setRejectNote("")
        await load()
      }
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#007A94]" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t("examPackageRequests")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("examPackageRequestsDesc", "Review the proposed package list before approving. Approving replaces the doctor's published packages.")}
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </Button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">{t("noPendingRequests")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("doctor")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("submitted")}</TableHead>
                <TableHead className="text-center">{t("lines")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.requestId}>
                  <TableCell className="font-medium">{row.doctorName}</TableCell>
                  <TableCell className="text-muted-foreground">{row.doctorEmail}</TableCell>
                  <TableCell className="text-sm">{new Date(row.submittedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-center">{row.packageLineCount}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="bg-[#007A94] hover:bg-[#006884]"
                      onClick={() => openReview(row.requestId)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {t("review")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setRejectRow(row)
                        setRejectNote("")
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      {t("reject")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={reviewOpen} onOpenChange={(open) => !open && (setReviewOpen(false), setDetail(null), setReviewId(null))}>
        <DialogContent className="w-[min(96vw,1400px)] max-w-[min(96vw,1400px)] sm:max-w-[min(96vw,1400px)] max-h-[92vh] overflow-y-auto overflow-x-hidden gap-4">
          <DialogHeader>
            <DialogTitle>{t("reviewChangesOnly", "Review changes only")}</DialogTitle>
            <DialogDescription>
              {t("reviewChangesDesc", "Compared with this doctor's currently published packages: new lines, edits to existing ids, and published packages omitted from the proposal (removed). Packages kept as-is are not listed. Approving still stores the doctor's full submitted list as the new catalog.")}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">{detail.doctorName}</span>
                <span className="text-muted-foreground"> · {detail.doctorEmail}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {t("submitted")} {new Date(detail.submittedAt).toLocaleString()}
              </div>
              {detail.unchangedPublishedCount > 0 && (
                <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
                  {detail.unchangedPublishedCount} {t("packagesUnchangedOmitted", "published package(s) unchanged (same id and fields) — omitted here.")}
                </p>
              )}
              {detail.changes.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4">
                  {t("noFieldDifferences", "No field differences vs published rows — only order may differ. You can still approve to apply the submitted ordering.")}
                </p>
              ) : (
                <div className="w-full min-w-0 [&_[data-slot=table-container]]:overflow-x-visible">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px] align-top whitespace-normal">{t("type")}</TableHead>
                        <TableHead className="w-[42%] align-top whitespace-normal">{t("beforePublished")}</TableHead>
                        <TableHead className="align-top whitespace-normal">{t("afterProposal")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.changes.map((row, i) => (
                        <TableRow key={`${detail.requestId}-chg-${i}`}>
                          <TableCell className="align-top">
                            <Badge variant={changeBadgeVariant(row.changeType)} className="whitespace-normal text-center">
                              {row.changeType}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top text-sm min-w-0 break-words whitespace-normal">
                            {row.changeType === "ADDED" ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="block">{summarizePkg(row.previous)}</span>
                            )}
                            {row.previous?.packageId ? (
                              <div className="text-[10px] font-mono text-muted-foreground mt-1 break-all">
                                id: {row.previous.packageId}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="align-top text-sm min-w-0 break-words whitespace-normal">
                            {row.changeType === "REMOVED" ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="block">{summarizePkg(row.proposed)}</span>
                            )}
                            {row.proposed?.packageId && row.changeType !== "ADDED" ? (
                              <div className="text-[10px] font-mono text-muted-foreground mt-1 break-all">
                                id: {row.proposed.packageId}
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={approving || detailLoading || !detail}
              title={detail && detail.changes.length === 0 ? t("noRowLevelDiff", "No row-level diff; approval still applies full list") : undefined}
              onClick={() => void handleApprove()}
            >
              {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {t("approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectRow} onOpenChange={(open) => !open && setRejectRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectRequest", "Reject request")}</DialogTitle>
            <DialogDescription>
              {t("rejectRequestNote", "Optional note. The doctor's published packages stay unchanged.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">{t("note")}</Label>
            <Textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder={t("reasonOptional")}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setRejectRow(null)} disabled={rejecting}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
