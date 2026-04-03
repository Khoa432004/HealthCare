'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MedicalReportTab from '@/components/medical-report-tab'

type Props = {
  appointmentId: string
  onClose: () => void
  /** Sau khi hoàn thành báo cáo thành công (ví dụ đóng panel, vẫn ở trong cuộc gọi) */
  onReportCompleted?: () => void
}

export function VideoCallMedicalReportPanel({ appointmentId, onClose, onReportCompleted }: Props) {
  return (
    <div className="flex h-auto max-h-[min(70vh,520px)] w-full max-w-[min(100vw-2rem,450px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl md:h-full md:max-h-none">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="font-semibold text-gray-900">Medical Report</div>
        <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Đóng">
          <X className="size-5" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MedicalReportTab
          appointmentId={appointmentId}
          appointmentStatus="IN_PROCESS"
          embedded
          onReportCompleted={onReportCompleted}
        />
      </div>
    </div>
  )
}
