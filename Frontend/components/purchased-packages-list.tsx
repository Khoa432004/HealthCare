"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { patientExamPackageService } from '@/services/patient-exam-package.service'
import {
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Stethoscope,
  DollarSign,
  Timer,
  ShoppingCart,
  Phone,
  Building2,
  MapPin,
  User,
  Activity,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface PurchasedPackage {
  id: string
  packageId: string
  packageName: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  durationDays: number
  priceVnd: number
  purchaseDate: string
  expirationDate: string
  status: 'active' | 'expired' | 'pending'
  remainingDays: number
  messagesRemaining: number
  sessionsRemaining: number
}

export interface DoctorInfo {
  doctorId: string
  doctorName: string
  specialty: string
  clinic?: string
  province?: string
  title?: string
  rating?: number
  avatarUrl?: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function calcRemainingDays(expirationDate: string): number {
  if (!expirationDate) return 0
  const diff = new Date(expirationDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function isExpiringSoon(pkg: PurchasedPackage): boolean {
  return pkg.status === 'active' && (pkg.remainingDays || calcRemainingDays(pkg.expirationDate)) <= 7
}

function formatDateShort(date: string): string {
  if (!date) return '—'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

function progressPercent(pkg: PurchasedPackage): number {
  if (!pkg.durationDays || pkg.durationDays === 0) return 0
  const remaining = pkg.remainingDays || calcRemainingDays(pkg.expirationDate)
  return Math.min(100, Math.max(0, Math.round((remaining / pkg.durationDays) * 100)))
}

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    cardBorder: 'border-gray-200',
    progressColor: 'bg-gradient-to-r from-[#0CC8C8] to-[#007A94]',
    iconBg: 'from-[#0CC8C8] to-[#007A94]',
  },
  expired: {
    label: 'Archive',
    badge: 'bg-gray-100 text-gray-500 border-gray-200',
    dot: 'bg-gray-400',
    icon: XCircle,
    iconColor: 'text-gray-400',
    cardBorder: 'border-gray-200',
    progressColor: 'bg-gray-300',
    iconBg: 'from-gray-300 to-gray-400',
  },
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
    iconColor: 'text-amber-500',
    cardBorder: 'border-amber-200',
    progressColor: 'bg-amber-400',
    iconBg: 'from-amber-400 to-orange-400',
  },
  expiring: {
    label: 'Active',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    cardBorder: 'border-orange-200',
    progressColor: 'bg-gradient-to-r from-orange-400 to-red-400',
    iconBg: 'from-orange-400 to-amber-400',
  },
} as const

function getStatusKey(pkg: PurchasedPackage): keyof typeof STATUS_CONFIG {
  if (pkg.status === 'active' && isExpiringSoon(pkg)) return 'expiring'
  return pkg.status as keyof typeof STATUS_CONFIG
}

// ─────────────────────────────────────────────
// Service In Use Banner — matches reference image
// ─────────────────────────────────────────────
function ServiceInUseBanner({
  pkg,
  doctorInfo,
  familyMode,
  onToggleFamilyMode,
}: {
  pkg: PurchasedPackage
  doctorInfo?: DoctorInfo | null
  familyMode: boolean
  onToggleFamilyMode: () => void
}) {
  const remaining = pkg.remainingDays || calcRemainingDays(pkg.expirationDate)
  const progress = progressPercent(pkg)
  const sk = getStatusKey(pkg)
  const cfg = STATUS_CONFIG[sk]
  const expiring = isExpiringSoon(pkg)

  const displayName = doctorInfo?.doctorName || pkg.doctorName || 'Bác sĩ'
  const initials = displayName
    .split(' ')
    .slice(-2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const stats = [
    {
      icon: Phone,
      label: 'Call (From Doctor)',
      value: `${pkg.messagesRemaining ?? 0} Mins`,
    },
    {
      icon: CalendarCheck,
      label: 'Appointments',
      value: `${pkg.sessionsRemaining ?? 0} sessions`,
    },
    {
      icon: Calendar,
      label: 'Start date',
      value: formatDateShort(pkg.purchaseDate),
    },
    {
      icon: CalendarX,
      label: 'End date',
      value: formatDateShort(pkg.expirationDate),
    },
    {
      icon: Clock,
      label: 'Duration',
      value: `${pkg.durationDays} days`,
    },
  ]

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Top bar: title + tabs */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-600">Service in use</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Nếu hàm tồn tại và chế độ family đang tắt (!familyMode), thì tiến hành gọi hàm
              if (onToggleFamilyMode && !familyMode) {
                onToggleFamilyMode();
              }
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${!familyMode
              ? 'bg-white border-[#0CC8C8] text-[#007A94] shadow-sm'
              : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
          >
            My Package
          </button>
          <button
            onClick={onToggleFamilyMode}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${familyMode
              ? 'bg-white border-[#0CC8C8] text-[#007A94] shadow-sm'
              : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
          >
            My Family
          </button>
        </div>
      </div>

      {/* Inner card */}
      <div className="p-4 mx-4 my-3 rounded-xl border border-gray-100 bg-gray-50/40">
        {/* Package name row + progress */}
        <div className="flex items-center gap-3 mb-1">
          {/* Calendar icon */}
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <CalendarCheck className="w-[18px] h-[18px] text-white" />
          </div>

          {/* Name + progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-gray-900 text-sm">{pkg.packageName || 'Service Package'}</p>
            </div>
            {/* Progress bar */}
            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${cfg.progressColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {cfg.label}
              </span>
              <span className="text-[11px] text-gray-400">{remaining} days left</span>
            </div>
          </div>

          {/* Doctor avatar(s) */}
          <div className="flex-shrink-0 ml-2">
            <div className="flex -space-x-2">
              <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={doctorInfo?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=0CC8C8&textColor=ffffff`}
                />
                <AvatarFallback className="bg-[#0CC8C8] text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(displayName) + '2'}`}
                />
                <AvatarFallback className="bg-[#007A94] text-white text-xs font-bold">DR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-3" />

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <stat.icon className="w-4 h-4 text-[#0CC8C8]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium leading-tight">{stat.label}</p>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
          {/* Doctor name stat */}
          {displayName && (
            <div className="flex items-center gap-2.5 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Stethoscope className="w-4 h-4 text-[#0CC8C8]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium leading-tight">Doctor</p>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{displayName}</p>
              </div>
            </div>
          )}
          {/* Clinic stat — from fetched doctor info */}
          {doctorInfo?.clinic && (
            <div className="flex items-center gap-2.5 min-w-fit">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Building2 className="w-4 h-4 text-[#0CC8C8]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium leading-tight">Clinic</p>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{doctorInfo.clinic}</p>
              </div>
            </div>
          )}
        </div>

        {/* Expiring warning */}
        {expiring && (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <p className="text-xs text-orange-700 font-medium">
              Package expires in <strong>{remaining} days</strong> — renew soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Package Card — click to select (no dialog)
// ─────────────────────────────────────────────
function PackageCard({
  pkg,
  doctorInfo,
  isSelected,
  onSelect,
}: {
  pkg: PurchasedPackage
  doctorInfo?: DoctorInfo | null
  isSelected: boolean
  onSelect: (pkg: PurchasedPackage) => void
}) {
  const sk = getStatusKey(pkg)
  const cfg = STATUS_CONFIG[sk]
  const remaining = pkg.remainingDays || calcRemainingDays(pkg.expirationDate)

  const displayName = doctorInfo?.doctorName || pkg.doctorName || 'Bác sĩ'
  const clinicName = doctorInfo?.clinic || '—'
  const provinceName = doctorInfo?.province || '—'
  const specialtyName = doctorInfo?.specialty || pkg.doctorSpecialty || '—'

  const initials = displayName
    .split(' ')
    .slice(-2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
  const formatSpecialtyText = (str: string) => {
    if (!str || str === '—') return '';
    const cleaned = str.replace(/[{}]/g, "").replace(/"/g, "");
    // Thay dấu phẩy thành dấu gạch đứng hoặc dấu chấm giữa cho đẹp
    return cleaned.split(",").map(item => item.trim()).join(" • ");
  };

  const cleanSpecialty = formatSpecialtyText(specialtyName);
  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`
        relative bg-white rounded-2xl border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 select-none
        ${isSelected
          ? 'border-[#0CC8C8] shadow-[0_0_0_3px_rgba(12,200,200,0.1)] shadow-md'
          : 'border-gray-200 hover:border-[#0CC8C8]/40'
        }
      `}
    >
      {/* Selected top stripe */}
      {/* {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#0CC8C8] to-[#007A94]" />
      )}   */}

      <div className="p-5">
        {/* Header: icon + name + status */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Package className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{pkg.packageName || 'Service Package'}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
              {pkg.status === 'active' && (
                <span className="text-[10px] text-gray-400">{remaining} days left</span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* Details */}
        <div className="space-y-3">
          {/* Doctor */}
          <div className="flex items-center gap-3.5 p-3 bg-gray-50/50 rounded-xl border border-gray-100/70">
            {/* Khu vực Avatar Bác sĩ với Badge Ống nghe tinh tế ở góc */}
            <div className="relative flex-shrink-0 group">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage
                  src={doctorInfo?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=0CC8C8&textColor=ffffff`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-teal-500 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Mini-badge icon ống nghe bo góc đè lên avatar cực kỳ chuyên nghiệp */}
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm border border-white">
                <Stethoscope className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Khu vực Thông tin chữ */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Bác sĩ phụ trách
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-800 truncate tracking-tight">
                {displayName}
              </p>

              {cleanSpecialty && (
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
                  Chuyên khoa: <span className="text-gray-500 font-semibold">{cleanSpecialty}</span>
                </p>
              )}
            </div>
          </div>

          {/* Clinic */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#F0FBFF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-[#007A94]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Clinic</p>
              <p className="text-xs font-semibold text-gray-700">{clinicName}</p>
            </div>
          </div>

          {/* Province */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#F0FBFF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#007A94]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Province</p>
              <p className="text-xs font-semibold text-gray-700">{provinceName}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-5 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#F0FBFF] flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-3.5 h-3.5 text-[#007A94]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Start date</p>
                <p className="text-xs font-semibold text-gray-800">{formatDateShort(pkg.purchaseDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#F0FBFF] flex items-center justify-center flex-shrink-0">
                <CalendarX className="w-3.5 h-3.5 text-[#007A94]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">End date</p>
                <p className="text-xs font-semibold text-gray-800">{formatDateShort(pkg.expirationDate)}</p>
              </div>
            </div>
          </div>

          {/* Patient row */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Patient</p>
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="bg-gray-200 text-gray-500 text-[8px] font-bold">US</AvatarFallback>
                </Avatar>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-semibold">
                  Child
                </span>
              </div>
            </div>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-[#0CC8C8] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────
type FilterTab = 'all' | 'active' | 'expiring' | 'expired' | 'pending'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'expiring', label: 'Up coming' },
  { key: 'expired', label: 'Archive' },
]

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-px bg-gray-100 mb-4" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gray-100" />
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded w-12 mb-1.5" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-28" />
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="p-4 mx-4 my-3 rounded-xl border border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gray-200" />
          <div className="flex-1">
            <div className="h-3.5 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-1.5 bg-gray-100 rounded-full" />
          </div>
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 ring-2 ring-white" />
            <div className="w-9 h-9 rounded-full bg-gray-200 ring-2 ring-white" />
          </div>
        </div>
        <div className="h-px bg-gray-200 my-3" />
        <div className="flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100" />
              <div>
                <div className="h-2 bg-gray-100 rounded w-14 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────
interface PurchasedPackagesListProps {
  packages: PurchasedPackage[]
  loading?: boolean
  onUsePackage?: (packageId: string) => void
}

export function PurchasedPackagesList({
  packages,
  loading,
  onUsePackage,
}: PurchasedPackagesListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [familyMode, setFamilyMode] = useState(false)
  // doctorInfoMap: doctorId → DoctorInfo fetched from API
  const [doctorInfoMap, setDoctorInfoMap] = useState<Record<string, DoctorInfo>>({})

  // Default selected: first active package, or first package
  const defaultSelected = useMemo(() => {
    if (!packages || packages.length === 0) return null
    return (
      packages.find(p => p.status === 'active' && !isExpiringSoon(p)) ||
      packages.find(p => p.status === 'active') ||
      packages[0]
    )
  }, [packages])

  const [selectedPkg, setSelectedPkg] = useState<PurchasedPackage | null>(null)

  // Sync defaultSelected into state when packages first load
  const resolvedSelected = selectedPkg ?? defaultSelected

  // Fetch doctor details for all unique doctorIds in packages
  useEffect(() => {
    if (!packages || packages.length === 0) return
    const uniqueIds = [...new Set(packages.map(p => p.doctorId).filter(Boolean))]
    uniqueIds.forEach(async (doctorId) => {
      if (doctorInfoMap[doctorId]) return // already fetched
      try {
        const raw = await patientExamPackageService.getDoctorDetail(doctorId)
        // Normalize various possible field shapes from backend
        const info: DoctorInfo = {
          doctorId,
          doctorName: raw?.fullName || raw?.doctorName || raw?.name || raw?.doctor_name || '',
          specialty: raw?.specialty || raw?.specialization || raw?.doctorSpecialty || '',
          clinic: raw?.clinicName || raw?.clinic || raw?.hospitalName || raw?.hospital || '',
          province: raw?.province || raw?.city || raw?.location || '',
          title: raw?.title || '',
          rating: raw?.rating ?? undefined,
          avatarUrl: raw?.avatarUrl || raw?.avatar || raw?.profileImage || '',
        }
        setDoctorInfoMap(prev => ({ ...prev, [doctorId]: info }))
      } catch {
        // silently ignore per-doctor fetch failures
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages])

  const filtered = useMemo(() => {
    if (!packages) return []
    switch (activeFilter) {
      case 'active': return packages.filter(p => p.status === 'active' && !isExpiringSoon(p))
      case 'expiring': return packages.filter(p => isExpiringSoon(p))
      case 'expired': return packages.filter(p => p.status === 'expired')
      case 'pending': return packages.filter(p => p.status === 'pending')
      default: return packages
    }
  }, [packages, activeFilter])

  const tabCounts: Record<FilterTab, number> = useMemo(() => ({
    all: packages?.length ?? 0,
    active: packages?.filter(p => p.status === 'active' && !isExpiringSoon(p)).length ?? 0,
    expiring: packages?.filter(p => isExpiringSoon(p)).length ?? 0,
    expired: packages?.filter(p => p.status === 'expired').length ?? 0,
    pending: packages?.filter(p => p.status === 'pending').length ?? 0,
  }), [packages])

  // ── Loading ──
  if (loading) {
    return (
      <div>
        <SkeletonBanner />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // ── Empty ──
  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0CC8C8]/10 to-[#007A94]/10 flex items-center justify-center mb-5">
          <Package className="w-10 h-10 text-[#007A94]/40" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No service packages yet</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
          You haven't purchased any packages. Choose a doctor and a suitable plan to get started.
        </p>
        <Link href="/patient-package">
          <Button className="bg-gradient-to-r from-[#007A94] to-[#0CC8C8] hover:from-[#006080] hover:to-[#00AAAA] text-white rounded-xl h-11 px-6 font-semibold shadow-sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy a Package
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* ── Service in use banner ── */}
      {resolvedSelected && (
        <ServiceInUseBanner
          pkg={resolvedSelected}
          doctorInfo={doctorInfoMap[resolvedSelected.doctorId] ?? null}
          familyMode={familyMode}
          onToggleFamilyMode={() => setFamilyMode(f => !f)}
        />
      )}

      {/* ── Section header + filter tabs ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-600">All service packages</h2>
        <div className="flex items-center gap-1 bg-white rounded-full border border-gray-200 shadow-sm px-1.5 py-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const count = tabCounts[tab.key]
            const isActive = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`
                  px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? 'bg-white border border-[#0CC8C8] text-[#007A94] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
                {count > 0 && !isActive && (
                  <span className="ml-1 text-[10px] text-gray-400">({count})</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium text-sm">No packages in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id || pkg.packageId}
              pkg={pkg}
              doctorInfo={doctorInfoMap[pkg.doctorId] ?? null}
              isSelected={resolvedSelected?.id === pkg.id}
              onSelect={(p) => setSelectedPkg(p)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
