"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PlusCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatInputBarProps {
  placeholder?: string
  onSend?: (text: string) => void
  onAttach?: () => void
  disabled?: boolean
  className?: string
}

export function ChatInputBar({
  placeholder,
  onSend,
  onAttach,
  disabled,
  className,
}: ChatInputBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 p-4 bg-white border-t border-[#E8F5F1] rounded-t-[20px]",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 w-11 h-11 rounded-full hover:bg-[#E8F5F1]"
        onClick={onAttach}
        disabled={disabled}
        aria-label={t("attachFile")}
      >
        <PlusCircle className="w-6 h-6 text-[#007A94]" />
      </Button>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? t("typeHere")}
        disabled={disabled}
        className="flex-1 h-12 rounded-full bg-[#fcfeff] border-[#E8F5F1] text-sm font-medium placeholder:text-[#404647]"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="shrink-0 w-11 h-11 rounded-full bg-[#007A94] hover:bg-[#006884] text-white"
        disabled={disabled || !value.trim()}
        aria-label={t("sendMessageLabel")}
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}
