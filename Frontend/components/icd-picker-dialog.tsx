"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

export interface IcdChapter {
  id: string
  codeFrom: string
  codeTo: string
  titleVi: string
  titleEn: string
}

export interface IcdDiseaseItem {
  icdCode: string
  diseaseName: string
}

interface IcdPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: IcdDiseaseItem) => void
  disabled?: boolean
}

export function IcdPickerDialog({
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: IcdPickerDialogProps) {
  const [lang, setLang] = useState<"vi" | "en">("vi")
  const [searchQuery, setSearchQuery] = useState("")
  const [chapters, setChapters] = useState<IcdChapter[]>([])
  const [codes, setCodes] = useState<IcdDiseaseItem[]>([])
  const [currentChapter, setCurrentChapter] = useState<IcdChapter | null>(null)
  const [selectedItem, setSelectedItem] = useState<IcdDiseaseItem | null>(null)
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [searchResults, setSearchResults] = useState<IcdDiseaseItem[]>([])
  const [searching, setSearching] = useState(false)
  const [chaptersError, setChaptersError] = useState(false)

  const loadChapters = useCallback(async () => {
    try {
      setLoadingChapters(true)
      setChaptersError(false)
      const data = await apiClient.get<IcdChapter[] | null>(API_ENDPOINTS.ICD.CHAPTERS)
      setChapters(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Load ICD chapters failed", e)
      setChapters([])
      setChaptersError(true)
    } finally {
      setLoadingChapters(false)
    }
  }, [])

  const loadCodesByRange = useCallback(async (from: string, to: string) => {
    try {
      setLoadingCodes(true)
      const data = await apiClient.get<IcdDiseaseItem[] | null>(
        API_ENDPOINTS.ICD.CODES_BY_RANGE(from, to)
      )
      setCodes(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Load ICD codes by range failed", e)
      setCodes([])
    } finally {
      setLoadingCodes(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadChapters().catch(() => {
        setChapters([])
        setChaptersError(true)
      })
      setCurrentChapter(null)
      setCodes([])
      setSelectedItem(null)
      setSearchQuery("")
      setSearchResults([])
    }
  }, [open, loadChapters])

  const handleChapterClick = (chapter: IcdChapter) => {
    setCurrentChapter(chapter)
    loadCodesByRange(chapter.codeFrom, chapter.codeTo)
    setSelectedItem(null)
  }

  const handleBack = () => {
    setCurrentChapter(null)
    setCodes([])
    setSelectedItem(null)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      return
    }
    try {
      setSearching(true)
      const data = await apiClient.get<IcdDiseaseItem[] | null>(
        API_ENDPOINTS.ICD.SEARCH(q)
      )
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("ICD search failed", e)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [searchQuery])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const t = setTimeout(handleSearch, 300)
    return () => clearTimeout(t)
  }, [searchQuery, handleSearch])

  const isChapterList = !currentChapter && !searchQuery.trim()
  const isCodeList = currentChapter || searchQuery.trim()
  const canAdd = selectedItem && isCodeList

  const filteredChapters =
    isChapterList && searchQuery.trim()
      ? chapters.filter(
          (c) =>
            c.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.codeFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.codeTo.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : chapters

  const listToShow =
    isChapterList && searchQuery.trim()
      ? filteredChapters
      : isChapterList
        ? chapters
        : searchQuery.trim()
          ? searchResults
          : codes

  const handleAdd = () => {
    if (selectedItem && canAdd) {
      onSelect(selectedItem)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0"
        showCloseButton={true}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">ICD-10</DialogTitle>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded text-sm font-medium ${
                  lang === "en" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                En
              </button>
              <button
                type="button"
                onClick={() => setLang("vi")}
                className={`px-2 py-1 rounded text-sm font-medium ${
                  lang === "vi" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                Vi
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 border-b">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[280px] px-2">
          {currentChapter && (
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-primary hover:underline mb-2 px-2"
            >
              ← Quay lại danh sách chương
            </button>
          )}
          {loadingChapters && isChapterList && (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          )}
          {chaptersError && isChapterList && !loadingChapters && (
            <div className="py-8 text-center space-y-3">
              <p className="text-muted-foreground">Không tải được danh sách chương ICD. Vui lòng thử lại.</p>
              <Button variant="outline" size="sm" onClick={() => loadChapters()}>
                Thử lại
              </Button>
            </div>
          )}
          {loadingCodes && currentChapter && !searchQuery && (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          )}
          {searching && searchQuery && (
            <div className="py-8 text-center text-muted-foreground">Đang tìm...</div>
          )}
          {!loadingChapters && !loadingCodes && !searching && !chaptersError && (
            <ul className="space-y-0">
              {isChapterList &&
                filteredChapters.map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => handleChapterClick(ch)}
                      className="w-full flex items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-muted text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground shrink-0">
                          {ch.id}:
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          ({ch.codeFrom}-{ch.codeTo})
                        </span>
                        <span className="flex-1 min-w-0">
                          {lang === "vi" ? ch.titleVi : ch.titleEn}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              {isCodeList &&
                Array.isArray(listToShow) &&
                listToShow.map((item: IcdDiseaseItem) => {
                  const isSelected =
                    selectedItem?.icdCode === item.icdCode &&
                    selectedItem?.diseaseName === item.diseaseName
                  return (
                    <li key={`${item.icdCode}-${item.diseaseName}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={`w-full flex items-center justify-between gap-2 py-3 px-3 rounded-lg text-left ${
                          isSelected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted"
                        }`}
                      >
                        <span className="font-medium shrink-0">{item.icdCode}</span>
                        <span className="flex-1 min-w-0 truncate">{item.diseaseName}</span>
                      </button>
                    </li>
                  )
                })}
              {listToShow.length === 0 && !loadingChapters && !loadingCodes && !searching && !chaptersError && (
                <li className="py-8 text-center text-muted-foreground">
                  Không tìm thấy kết quả.
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={!canAdd || disabled}
            className="min-w-[100px]"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
