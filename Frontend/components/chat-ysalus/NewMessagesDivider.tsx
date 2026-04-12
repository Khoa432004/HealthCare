"use client"

export function NewMessagesDivider() {
  return (
    <div className="my-3 flex w-full shrink-0 items-center gap-3 px-1" role="separator" aria-label="Tin nhắn mới">
      <div className="h-px flex-1 bg-brand-4/35" />
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-brand-7">Tin nhắn mới</span>
      <div className="h-px flex-1 bg-brand-4/35" />
    </div>
  )
}
