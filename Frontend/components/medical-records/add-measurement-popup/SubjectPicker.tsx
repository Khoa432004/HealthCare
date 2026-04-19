/**
 * Ported 1:1 from ysalus-source/.../SubjectPicker.tsx
 * i18n inlined to Vietnamese (ysalus used programKey/tagKey; HealthCare ports
 * use programLabel/tagLabel since the strings are already translated).
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { SearchIcon } from "../ysalus-metrics/icons"
import type { MeasurementContextFormValues, SubjectOption } from "./types"

interface Props {
  subjects: SubjectOption[]
}

export const SubjectPicker = ({ subjects }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { formState, register, setValue, watch } =
    useFormContext<MeasurementContextFormValues>()

  const selectedSubjectId = watch("profileId")
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? null

  const filteredSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return subjects
    }

    return subjects.filter((subject) =>
      `${subject.name} ${subject.readableId} ${subject.programLabel}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query, subjects])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  const handleSelectSubject = (profileId: string) => {
    setValue("profileId", profileId, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-full items-center justify-between rounded-[16px] border border-[#D8EAF0] bg-white px-4 text-left text-[16px] font-medium text-[#1A1D21] shadow-[0_4px_10px_rgba(18,129,151,0.06)] md:h-[62px] md:rounded-[18px] md:px-6 md:text-[17px]"
      >
        <span className="text-[#98A2B3]">
          {isOpen ? query || "Tìm kiếm bệnh nhân" : ""}
        </span>
        <SearchIcon className="size-5 text-[#6B7280]" />
      </button>

      <input type="hidden" {...register("profileId")} />

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-[16px] border border-[#D9EAF1] bg-white p-3 shadow-[0_14px_32px_rgba(16,24,40,0.14)] md:left-2 md:right-2 md:top-[58px]">
          <div className="mb-3 flex h-12 items-center gap-3 rounded-[14px] border border-[#D9EAF1] bg-white px-4 md:h-[54px] md:px-5">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm bệnh nhân"
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[16px] font-medium text-[#101828] outline-hidden md:text-[18px]"
            />
            <SearchIcon className="size-5 text-[#6B7280]" />
          </div>

          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-[#F4FBFD] md:gap-4 md:px-4"
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold md:size-11 ${subject.avatarClassName}`}
                >
                  {subject.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <p className="truncate text-[16px] font-semibold text-[#1A1D21] md:text-[17px]">
                      {subject.name}
                    </p>
                    {subject.tagLabel && (
                      <span className="rounded-full border border-[#F3B244] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#E09016]">
                        {subject.tagLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[14px] text-[#7A858D] md:text-[15px]">
                    {subject.readableId} • {subject.programLabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!isOpen && selectedSubject ? (
        <div className="mt-4 flex items-start gap-3 px-1 md:mt-5 md:items-center md:gap-4">
          <div
            className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold md:size-11 ${selectedSubject.avatarClassName}`}
          >
            {selectedSubject.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-[#22262A] md:text-[17px]">
              {selectedSubject.name}
            </p>
            <p className="mt-1 text-[14px] text-[#7C878F] md:text-[15px]">
              {selectedSubject.readableId} • {selectedSubject.programLabel}
            </p>
          </div>
        </div>
      ) : null}

      {formState.errors.profileId?.message ? (
        <p className="mt-3 text-sm text-red-500">
          {formState.errors.profileId.message}
        </p>
      ) : null}
    </div>
  )
}
