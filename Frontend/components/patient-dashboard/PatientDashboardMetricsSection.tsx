"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type {
  PatientDashboardMetricCard,
  PatientDashboardTrendPoint,
} from "@/services/dashboard.service"
import { Badge } from "@/components/ui/badge"
import {
  METRIC_ICON_MAP,
  METRIC_TONE_MAP,
} from "@/components/patient-dashboard/constants"
import { Activity } from "lucide-react"

type Props = {
  metricCards: PatientDashboardMetricCard[]
  glucoseTrend: PatientDashboardTrendPoint[]
}

function MetricCard({ item }: { item: PatientDashboardMetricCard }) {
  const Icon = METRIC_ICON_MAP[item.name] ?? Activity
  const tone = METRIC_TONE_MAP[item.status] ?? METRIC_TONE_MAP.Normal

  return (
    <div className={`rounded-xl border p-3 bg-white min-h-[108px] ${tone}`}>
      <div className="flex items-start justify-between">
        <Icon className="w-4 h-4" />
        <Badge className="bg-white/90 text-[10px] text-gray-700 border-0 h-5">
          {item.status}
        </Badge>
      </div>
      <p className="mt-2 text-[11px] font-medium opacity-90">{item.name}</p>
      <div className="mt-1 flex items-end gap-1">
        <span className="text-lg font-semibold leading-none">{item.value}</span>
        <span className="text-[10px] opacity-80 mb-0.5">{item.unit}</span>
      </div>
      <p className="mt-1 text-[10px] opacity-80">{item.deltaText}</p>
    </div>
  )
}

export function PatientDashboardMetricsSection({
  metricCards,
  glucoseTrend,
}: Props) {
  const glucoseMetric = metricCards.find((m) => m.name === "Blood Glucose")
  const highlightMetrics = metricCards.filter(
    (m) => m.name === "Blood Pressure" || m.name === "Heart Rate"
  )
  const gridMetrics = metricCards.filter(
    (m) => !["Blood Pressure", "Heart Rate"].includes(m.name)
  )

  const glucoseAverage =
    glucoseTrend.length > 0
      ? Math.round(
          glucoseTrend.reduce((sum, p) => sum + Number(p.value), 0) /
            glucoseTrend.length
        )
      : glucoseMetric?.value ?? 0

  return (
    <section className="rounded-xl border border-[#c8dbe2] bg-[#d5e5eb] p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[#0f172a]">Latest Measurements</h3>
        <Link
          href="/health-tracking"
          className="text-[11px] text-[#007A94] inline-flex items-center gap-1 hover:underline"
        >
          See details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {gridMetrics.length > 0 ? (
          gridMetrics.map((item) => <MetricCard key={item.name} item={item} />)
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-[#b6ccd4] bg-white p-4 text-center text-xs text-gray-500">
            No measurement data available
          </div>
        )}
      </div>

      {highlightMetrics.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {highlightMetrics.map((item) => (
            <MetricCard key={item.name} item={item} />
          ))}
        </div>
      ) : null}

      <div className="mt-3 rounded-xl border border-[#cfe0e7] bg-[#f2f8fa] p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#0f172a]">Blood Glucose</p>
            <p className="text-[10px] text-gray-500">Last 30 days</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-[#0f172a] leading-none">
              {glucoseAverage}
              <span className="text-xs font-medium text-gray-500"> mg/dL</span>
            </p>
            <p className="text-[10px] text-gray-500">Average</p>
          </div>
        </div>

        {glucoseTrend.length > 0 ? (
          <div className="h-28 rounded-lg bg-white border border-[#e8f1f4] px-2 py-1.5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={glucoseTrend}
                margin={{ top: 6, right: 6, left: -26, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin - 12", "dataMax + 12"]} />
                <Tooltip
                  cursor={{ stroke: "#d5e5eb", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#d6edf2",
                    fontSize: 11,
                  }}
                  formatter={(value: number) => [`${value} mg/dL`, "Blood Glucose"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#007A94"
                  strokeWidth={2}
                  dot={{
                    r: 2.8,
                    strokeWidth: 1.5,
                    fill: "#007A94",
                    stroke: "#ffffff",
                  }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-28 rounded-lg bg-white border border-dashed border-[#b6ccd4] flex items-center justify-center text-xs text-gray-500">
            No glucose trend data
          </div>
        )}
      </div>
    </section>
  )
}
