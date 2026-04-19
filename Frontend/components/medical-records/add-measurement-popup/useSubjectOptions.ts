/**
 * Simplified port of ysalus-source/.../useSubjectOptionsQuery.ts
 *
 * In ysalus-web the popup supports doctors picking a patient from a GraphQL
 * query plus patients measuring themselves. HealthCare currently only needs
 * the patient-side flow from the medical-records tab, so this hook returns a
 * single SubjectOption derived from the logged-in patient (or the explicit
 * patientId/patientName passed in by the caller).
 */

import { useMemo } from "react"

import { getUserInfo } from "@/lib/user-utils"
import type { SubjectOption } from "./types"

const SUBJECT_AVATAR_CLASS_NAMES = [
  "bg-[#FFE2DE] text-[#F26F63]",
  "bg-[#DCEEFF] text-[#2A80D8]",
  "bg-[#E6F8ED] text-[#1B8E5F]",
  "bg-[#FFF3D6] text-[#D18A00]",
  "bg-[#F0E8FF] text-[#7A52CC]",
]

const getSubjectInitials = (name?: string | null) => {
  const normalizedName = name?.trim() ?? ""
  if (!normalizedName) return "NA"

  const parts = normalizedName.split(/\s+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())

  return initials.join("") || normalizedName.slice(0, 2).toUpperCase()
}

interface UseSubjectOptionsParams {
  patientId?: string
  patientName?: string
  readableId?: string
}

export const useSubjectOptions = ({
  patientId,
  patientName,
  readableId,
}: UseSubjectOptionsParams = {}): SubjectOption[] => {
  return useMemo(() => {
    const fallbackUser = getUserInfo()
    const resolvedId = patientId ?? fallbackUser?.id ?? ""
    const resolvedName =
      patientName?.trim() || fallbackUser?.fullName?.trim() || "Bệnh nhân"

    if (!resolvedId) return []

    return [
      {
        id: resolvedId,
        name: resolvedName,
        readableId: readableId ?? resolvedId,
        programLabel: "Theo dõi sức khoẻ",
        initials: getSubjectInitials(resolvedName),
        avatarClassName: SUBJECT_AVATAR_CLASS_NAMES[1],
      },
    ]
  }, [patientId, patientName, readableId])
}
