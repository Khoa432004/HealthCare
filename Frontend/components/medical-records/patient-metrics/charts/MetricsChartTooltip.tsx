import type { MetricSeverityLevel } from "../types"
import { METRIC_SEVERITY_STYLE } from "../utils/metricSeverity"

const TOOLTIP_BRAND_ACCENT = "#007A94"

export type MetricsChartTooltipModel = {
  title: string
  indicatorLabel: string
  valueLabel?: string | null
  /** Localized severity word for pill (e.g. "Bình thường"). */
  statusLabel?: string | null
  severity?: MetricSeverityLevel | null
  detailLines: string[]
}

type Props = MetricsChartTooltipModel & {
  anchorX: number
  anchorY: number
}

export function MetricsChartTooltip({
  anchorX,
  anchorY,
  title,
  indicatorLabel,
  valueLabel,
  statusLabel,
  severity,
  detailLines,
}: Props) {
  const accentColor =
    severity != null
      ? METRIC_SEVERITY_STYLE[severity].color
      : TOOLTIP_BRAND_ACCENT

  return (
    <div
      className="pointer-events-none fixed z-[100] max-w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-white text-left shadow-md ring-1 ring-[#C5E8E0]"
      style={{ left: anchorX + 12, top: anchorY + 12 }}
      role="tooltip"
    >
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      <div className="px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          {title}
        </p>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-gray-900">
          {indicatorLabel}
        </p>

        {valueLabel ? (
          <p className="mt-2 text-lg font-bold tabular-nums leading-tight text-[#007A94]">
            {valueLabel}
          </p>
        ) : null}

        {statusLabel && severity ? (
          <span className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-[#F8FCFD] px-2.5 py-1 text-[11px] font-semibold text-gray-800">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: METRIC_SEVERITY_STYLE[severity].color,
              }}
              aria-hidden
            />
            {statusLabel}
          </span>
        ) : null}

        {detailLines.length > 0 ? (
          <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-xs leading-relaxed text-gray-600">
            {detailLines.map((line, index) => (
              <li key={`${index}-${line.slice(0, 32)}`}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
