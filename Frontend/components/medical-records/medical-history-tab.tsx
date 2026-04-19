"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarIcon,
  ClipboardCheck,
  Eye,
  FileText,
  Search,
  Stethoscope,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface HistoryItem {
  id: string
  patientId: string
  doctor: string
  date: string
  reason: string
  clinic: string
  diagnosis?: string
  notes?: string
  completedAt?: string
}

interface Props {
  patientId: string
}

export function MedicalHistoryTab({ patientId }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false
    const fetchHistory = async () => {
      if (!patientId) return
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.get<HistoryItem[]>(
          API_ENDPOINTS.PATIENTS.GET_MEDICAL_HISTORY(patientId)
        )
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error("Failed to load medical history", err)
        if (!cancelled) setError("Không thể tải lịch sử khám.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchHistory()
    return () => {
      cancelled = true
    }
  }, [patientId])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) =>
        i.doctor?.toLowerCase().includes(q) ||
        i.clinic?.toLowerCase().includes(q) ||
        i.reason?.toLowerCase().includes(q) ||
        i.diagnosis?.toLowerCase().includes(q)
    )
  }, [items, search])

  const handleViewDetail = (id: string) => {
    router.push(`/patient-medical-examination-history/${id}`)
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-soft-md border-white/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {loading
                  ? "Đang tải..."
                  : `${filtered.length} lần khám đã hoàn thành`}
              </span>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9 bg-gray-50 border-gray-200"
                placeholder="Tìm theo bác sĩ, cơ sở, chẩn đoán..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <Card className="border-red-100 bg-red-50/40">
          <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Không có lần khám nào phù hợp.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const date =
              typeof item.date === "string" ? new Date(item.date) : item.date
            return (
              <Card
                key={item.id}
                className="shadow-soft hover:shadow-soft-md transition-smooth border-white/60"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">
                            {date instanceof Date && !isNaN(date.getTime())
                              ? date.toLocaleDateString("vi-VN")
                              : "--"}
                          </span>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          Đã hoàn thành
                        </Badge>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">
                            {item.doctor || "Bác sĩ phụ trách"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.clinic || "Chưa cập nhật cơ sở"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <InfoRow label="Lý do khám" value={item.reason} />
                        <InfoRow
                          label="Chẩn đoán"
                          value={item.diagnosis || "--"}
                        />
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 lg:w-44">
                      <Button
                        className="flex-1 gradient-primary text-white border-0 shadow-soft"
                        onClick={() => handleViewDetail(item.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-xs uppercase tracking-wide text-gray-400 whitespace-nowrap mt-0.5">
        {label}:
      </span>
      <span className="text-gray-700 truncate">{value || "--"}</span>
    </div>
  )
}
