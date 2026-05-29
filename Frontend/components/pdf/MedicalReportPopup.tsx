"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { fetchMedicalReportForPdf } from "@/lib/medical-report-pdf-data"
import type { MedicalReport } from "@/types/medical-report"
import {
  MedicalReportViewer,
  generateMedicalReportBlob,
} from "@/components/pdf/MedicalReportViewer"

type MedicalReportPopupProps = {
  appointmentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MedicalReportPopup({
  appointmentId,
  open,
  onOpenChange,
}: MedicalReportPopupProps) {
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !appointmentId) {
      setReport(null)
      setError(null)
      return
    }

    let cancelled = false

    const loadReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchMedicalReportForPdf(appointmentId)
        if (!cancelled) setReport(data)
      } catch (err) {
        if (!cancelled) {
          setReport(null)
          setError(
            err instanceof Error ? err.message : "Không thể tải báo cáo y khoa"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReport()

    return () => {
      cancelled = true
    }
  }, [open, appointmentId])

  const handleDownload = async () => {
    if (!report) return
    try {
      setDownloading(true)
      const blob = await generateMedicalReportBlob(report)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `MedicalReport_${format(new Date(report.date), "dd-MM-yyyy")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Tải xuống hoàn tất")
    } catch (err) {
      console.error("Download PDF error:", err)
      toast.error("Không thể tải xuống PDF")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[90vh] max-h-[90vh] w-[min(960px,calc(100vw-2rem))] max-w-[min(960px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(960px,calc(100vw-2rem))]"
      >
        <DialogHeader className="shrink-0 border-b border-[#e6eef2] px-5 py-4">
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Medical Report
            </DialogTitle>
            {report ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-[#f8fbfc] p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang tải Medical Report...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-red-600">
              {error}
            </div>
          ) : report ? (
            <MedicalReportViewer report={report} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
