"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { MedicalReport } from "@/types/medical-report"

type MedicalReportViewerProps = {
  report: MedicalReport
}

export async function generateMedicalReportBlob(report: MedicalReport): Promise<Blob> {
  const [{ pdf }, { default: MedicalReportPDF }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/MedicalReportPDF"),
  ])

  return pdf(<MedicalReportPDF report={report} />).toBlob()
}

export function MedicalReportViewer({ report }: MedicalReportViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    const renderPdf = async () => {
      try {
        setRenderError(null)
        setPdfUrl(null)
        const blob = await generateMedicalReportBlob(report)
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPdfUrl(objectUrl)
      } catch (err) {
        if (cancelled) return
        console.error("Render PDF error:", err)
        setRenderError("Không thể hiển thị PDF báo cáo y khoa")
      }
    }

    renderPdf()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [report])

  if (renderError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {renderError}
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Đang tạo PDF...
      </div>
    )
  }

  return (
    <iframe
      src={pdfUrl}
      title="Medical Report"
      className="h-full w-full rounded-xl border border-[#dce9ee] bg-white"
    />
  )
}
