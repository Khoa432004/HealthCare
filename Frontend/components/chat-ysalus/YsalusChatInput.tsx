"use client"

import { useRef, useState } from "react"
import { CirclePlus, Send, X, FileText } from "lucide-react"
import { YsalusChatButton } from "./YsalusChatButton"

interface YsalusChatInputProps {
  isMultiple?: boolean
  className?: string
  onSend: (content: string) => void
}

export function YsalusChatInput({ isMultiple = true, className, onSend }: YsalusChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [content, setContent] = useState("")

  const handleFileClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isMultiple) {
      const files = e.target.files
      if (files) {
        setSelectedFiles((prev) => [...prev, ...Array.from(files)])
      }
    } else {
      const file = e.target.files?.[0]
      if (file) {
        setSelectedFiles([file])
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (isMultiple) {
      const files = e.dataTransfer.files
      if (files) {
        setSelectedFiles((prev) => [...prev, ...Array.from(files)])
      }
    } else {
      const file = e.dataTransfer.files?.[0]
      if (file) {
        setSelectedFiles([file])
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleFileDelete = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`w-full min-h-min relative flex flex-col p-4 overflow-hidden transition ${className ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute flex items-center inset-0 w-[99%] h-[90%] m-auto border-2 border-dashed border-brand-4 bg-gray-100 z-10 rounded-xl transition-opacity duration-200 z-10 ${
          dragActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="w-full text-sm text-brand-6 text-center font-medium">Drop files here to upload</span>
      </div>
      <div className={`flex flex-wrap gap-3 ${selectedFiles.length > 0 ? "mb-4" : ""}`}>
        {selectedFiles.map((file: File, index: number) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden group"
          >
            {file.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full flex flex-col gap-1 items-center justify-center p-2">
                <FileText className="size-5 text-gray-600" />
                <span className="w-full text-xs text-gray-600 text-center truncate">{file.name}</span>
              </div>
            )}
            <div
              className="absolute top-1 right-1 p-1 rounded border border-indicator bg-white shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => handleFileDelete(index)}
            >
              <X className="size-5 text-error-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <CirclePlus className="size-8 text-gray-500 cursor-pointer" onClick={handleFileClick} />
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <input
          type="text"
          value={content}
          placeholder="Message..."
          className="flex-1 placeholder:text-gray-400 focus:outline-none py-2 px-4 text-sm"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend(content)
              setContent("")
            }
          }}
        />
        <YsalusChatButton
          endIcon={<Send className="size-3 text-white" />}
          onClick={() => {
            onSend(content)
            setContent("")
          }}
        >
          Send
        </YsalusChatButton>
      </div>
    </div>
  )
}
