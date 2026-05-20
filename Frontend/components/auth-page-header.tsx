import { BrandLogo } from "@/components/brand-logo"

type AuthPageHeaderProps = {
  title: string
  description?: string
}

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="flex w-full flex-col items-center text-center space-y-4 sm:space-y-4 md:space-y-3">
      <BrandLogo variant="full" size="large" priority className="w-full" />
      <div className="space-y-2 sm:space-y-2 md:space-y-1.5 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-[24px] lg:text-[26px] font-bold text-slate-800">
          {title}
        </h1>
        {description ? (
          <p className="text-base sm:text-lg md:text-[15px] lg:text-base text-slate-600 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
