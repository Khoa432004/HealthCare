/**
 * Ported 1:1 from ysalus-source/.../CircularCountdown.tsx
 */

interface Props {
  isLoading?: boolean
  progressSeconds?: number | null
  totalSeconds?: number | null
  unitLabel?: string | null
  value: number | string
}

export const CircularCountdown = ({
  isLoading = false,
  progressSeconds,
  totalSeconds,
  unitLabel = "s",
  value,
}: Props) => {
  const radius = 160
  const circumference = 2 * Math.PI * radius
  const normalizedTotalSeconds = Math.max(totalSeconds ?? 1, 1)
  const normalizedProgressSeconds = Math.max(progressSeconds ?? 0, 0)
  const progress =
    Math.max(Math.min(normalizedProgressSeconds, normalizedTotalSeconds), 0) /
    normalizedTotalSeconds
  const strokeDashoffset = circumference * (1 - progress)
  const shouldShowProgressRing =
    typeof progressSeconds === "number" && typeof totalSeconds === "number"
  const shouldShowValue = String(value).trim().length > 0

  return (
    <div className="relative flex size-[220px] items-center justify-center sm:size-[260px] md:size-[320px] lg:size-[360px]">
      <svg
        viewBox="0 0 360 360"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="180"
          cy="180"
          r={radius}
          fill="none"
          stroke="#D7F1FA"
          strokeWidth="22"
        />
        <circle
          cx="180"
          cy="180"
          r={radius}
          fill="none"
          stroke="#2AA8C8"
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            shouldShowProgressRing ? strokeDashoffset : circumference
          }
        />
        {isLoading ? (
          <circle
            cx="180"
            cy="180"
            r={radius}
            fill="none"
            stroke="#2AA8C8"
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.22} ${circumference}`}
            className="origin-center animate-spin"
          />
        ) : null}
      </svg>

      {shouldShowValue ? (
        <div className="flex items-end justify-center gap-2 text-[#101828]">
          <span className="text-[88px] leading-none font-semibold sm:text-[108px] md:text-[132px] lg:text-[146px]">
            {value}
          </span>
          {unitLabel ? (
            <span className="pb-4 text-[28px] font-semibold leading-none sm:pb-5 sm:text-[36px] md:pb-6 md:text-[44px] lg:text-[48px]">
              {unitLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
