"use client"

import { useState } from "react"
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
  placeholder = "Type here",
  onSend,
  onAttach,
  disabled,
  className,
}: ChatInputBarProps) {
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
        "flex items-center gap-2 p-4 bg-white border-t border-[#e5f5f8] rounded-t-[20px]",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 w-11 h-11 rounded-full hover:bg-[#e5f5f8]"
        onClick={onAttach}
        disabled={disabled}
        aria-label="Attach file"
      >
        <PlusCircle className="w-6 h-6 text-[#16a1bd]" />
      </Button>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-12 rounded-full bg-[#fcfeff] border-[#e5f5f8] text-sm font-medium placeholder:text-[#404647]"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="shrink-0 w-11 h-11 rounded-full bg-[#16a1bd] hover:bg-[#128197] text-white"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}
