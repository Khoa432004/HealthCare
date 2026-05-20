import type { TimelinePoint } from "./metricsTrackerChart.utils"

type Props = {
  timeline: TimelinePoint[]
  leftWidth: number
  rightWidth?: number
  onSelectDate: (date: Date) => void
}

export function MetricsTrackerTimelineAxis({
  timeline,
  leftWidth,
  rightWidth = 0,
  onSelectDate,
}: Props) {
  return (
    <div
      className="grid w-full min-w-0 items-center"
      style={{
        gridTemplateColumns: `${leftWidth}px repeat(${timeline.length}, minmax(0, 1fr)) ${rightWidth}px`,
      }}
    >
      <span className="min-w-0" />
      {timeline.map((point) => (
        <button
          key={point.key}
          type="button"
          onClick={() => onSelectDate(point.date)}
          className={`min-w-0 justify-self-center flex h-11 w-11 max-w-full items-center justify-center rounded-full text-sm font-semibold transition sm:h-8 sm:w-8 lg:text-base ${
            point.isSelected
              ? "bg-[#007A94] text-white"
              : "text-gray-950 hover:bg-[#E9F7FA]"
          }`}
        >
          {point.label}
        </button>
      ))}
      <span className="min-w-0" />
    </div>
  )
}
