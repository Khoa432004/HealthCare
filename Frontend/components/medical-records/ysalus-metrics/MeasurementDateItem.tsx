"use client"

import { MeasurementItem } from "./MeasurementItem"
import type { MetricDetail } from "./types"

interface Props {
  date: string
  metricDetails: MetricDetail[]
}

export const MeasurementDateItem = ({ date, metricDetails }: Props) => {
  return (
    <div className="flex flex-col xl:flex-row items-start gap-4">
      <span className="text-sm text-gray-500">{date}</span>
      <div className="w-full flex-1 flex flex-col xl:grid xl:grid-cols-2 gap-2">
        {metricDetails?.map((metricDetail) => (
          <MeasurementItem
            metricDetail={metricDetail}
            key={`${metricDetail.id}`}
            className="xl:col-span-1 w-full"
          />
        ))}
      </div>
    </div>
  )
}
