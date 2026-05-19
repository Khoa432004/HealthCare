import { MetricType } from "../../ysalus-metrics/types"
import { METRIC_SEVERITY_STYLE } from "../utils/metricSeverity"

type DotShape = "filled" | "hollow" | "half"

/**
 * Legend swatch. Renders the dot in one of three shapes to mirror what the
 * chart draws:
 *  - filled: solid disc
 *  - hollow: ring (white fill, colored stroke)
 *  - half  : left half filled, full colored stroke — BG "before meal"
 */
function LegendDot({
  color,
  label,
  shape = "filled",
}: {
  color: string
  label: string
  shape?: DotShape
}) {
  const size = 14
  const r = 6
  const c = size / 2

  const swatch =
    shape === "half" ? (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="white" stroke={color} strokeWidth={2} />
        <path
          d={`M ${c} ${c - r} A ${r} ${r} 0 0 0 ${c} ${c + r} Z`}
          fill={color}
        />
      </svg>
    ) : (
      <span
        className="size-3.5 rounded-full"
        style={{
          backgroundColor: shape === "hollow" ? "white" : color,
          border: `2px solid ${color}`,
        }}
      />
    )

  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700">
      {swatch}
      {label}
    </span>
  )
}

export function MetricsTrackerStatusLegend({
  metricType,
}: {
  metricType: MetricType | null
}) {
  const isBloodPressure = metricType === MetricType.BloodPressure
  const isBloodSugar = metricType === MetricType.BloodSugar

  return (
    <div className="mt-4 w-full min-w-0 max-w-full border-t border-[#DDEAF0] bg-white pt-3 sm:pt-4 max-lg:sticky max-lg:left-0 max-lg:z-[1] lg:mt-5 lg:pt-4">
      <div className="flex items-center gap-x-4 gap-y-2 sm:gap-x-6 max-lg:w-full max-lg:flex-nowrap max-lg:justify-start max-lg:overflow-x-auto max-lg:overscroll-x-contain max-lg:pb-1 [-webkit-overflow-scrolling:touch] lg:flex-wrap lg:justify-center lg:gap-x-10 lg:gap-y-3 lg:overflow-visible lg:pb-0">
        {isBloodPressure ? (
          <>
            <LegendDot color="#D7D7D7" label="Tâm thu" />
            <LegendDot color="#D7D7D7" label="Tâm trương" shape="hollow" />
          </>
        ) : null}

        {isBloodSugar ? (
          <>
            <LegendDot color="#D7D7D7" label="Trước ăn" shape="half" />
            <LegendDot color="#D7D7D7" label="Sau ăn" shape="filled" />
            <LegendDot color="#D7D7D7" label="Bình thường" shape="hollow" />
          </>
        ) : null}

        {(["low", "normal", "upper", "high"] as const).map((severity) => (
          <LegendDot
            key={severity}
            color={METRIC_SEVERITY_STYLE[severity].color}
            label={METRIC_SEVERITY_STYLE[severity].label}
          />
        ))}
      </div>
    </div>
  )
}
