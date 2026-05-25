"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  BadgeCheck,
  DollarSign,
  Timer,
  TrendingDown,
  ShoppingCart,
  Eye,
  ArrowRight,
} from 'lucide-react'
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

function formatDate(date: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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
    label: 'Đang hoạt động',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    cardBorder: 'border-l-emerald-500',
    progressColor: 'bg-emerald-500',
  },
  expired: {
    label: 'Đã hết hạn',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    icon: XCircle,
    iconColor: 'text-gray-400',
    cardBorder: 'border-l-gray-300',
    progressColor: 'bg-gray-300',
  },
  pending: {
    label: 'Chờ xử lý',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
    iconColor: 'text-amber-500',
    cardBorder: 'border-l-amber-400',
    progressColor: 'bg-amber-400',
  },
  expiring: {
    label: 'Sắp hết hạn',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    cardBorder: 'border-l-orange-400',
    progressColor: 'bg-orange-400',
  },
} as const

function getStatusKey(pkg: PurchasedPackage): keyof typeof STATUS_CONFIG {
  if (pkg.status === 'active' && isExpiringSoon(pkg)) return 'expiring'
  return pkg.status as keyof typeof STATUS_CONFIG
}

// ─────────────────────────────────────────────
// Summary stats
// ─────────────────────────────────────────────
function SummaryStats({ packages }: { packages: PurchasedPackage[] }) {
  const active = packages.filter(p => p.status === 'active' && !isExpiringSoon(p)).length
  const expiring = packages.filter(p => isExpiringSoon(p)).length
  const expired = packages.filter(p => p.status === 'expired').length
  const pending = packages.filter(p => p.status === 'pending').length

  const stats = [
    {
      label: 'Đang hoạt động',
      value: active,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      label: 'Sắp hết hạn',
      value: expiring,
      icon: AlertTriangle,
      gradient: 'from-orange-400 to-amber-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
    },
    {
      label: 'Đã hết hạn',
      value: expired,
      icon: XCircle,
      gradient: 'from-gray-400 to-gray-500',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
    },
    {
      label: 'Chờ xử lý',
      value: pending,
      icon: Clock,
      gradient: 'from-amber-400 to-yellow-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.bg} rounded-2xl p-4 flex items-center gap-4 border border-white shadow-sm`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <s.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Package card
// ─────────────────────────────────────────────
function PackageCard({
  pkg,
  onViewDetail,
}: {
  pkg: PurchasedPackage
  onViewDetail: (pkg: PurchasedPackage) => void
}) {
  const sk = getStatusKey(pkg)
  const cfg = STATUS_CONFIG[sk]
  const StatusIcon = cfg.icon
  const remaining = pkg.remainingDays || calcRemainingDays(pkg.expirationDate)
  const progress = progressPercent(pkg)
  const expiring = isExpiringSoon(pkg)

  return (
    <Card
      className={`overflow-hidden border border-gray-100 border-l-4 ${cfg.cardBorder} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-white group`}
    >
      <CardContent className="p-0">
        {/* Top section */}
        <div className="p-5">
          {/* Doctor row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pkg.doctorName ?? 'doctor'}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#007A94] to-[#005F75] text-white text-sm font-semibold">
                  {pkg.doctorName?.charAt(0) ?? 'B'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {pkg.doctorName || 'Bác sĩ'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pkg.doctorSpecialty || '—'}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Package name */}
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-base group-hover:text-[#007A94] transition-colors">
            {pkg.packageName || 'Gói khám'}
          </h3>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {formatCurrency(pkg.priceVnd)} · {pkg.durationDays} ngày
          </p>

          {/* Progress bar (only active/expiring) */}
          {(pkg.status === 'active') && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Thời gian còn lại</span>
                <span className={`font-semibold ${expiring ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {remaining} ngày
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cfg.progressColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {expiring && (
                <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Sắp hết hạn trong {remaining} ngày!
                </p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <CalendarCheck className="w-3.5 h-3.5 text-[#007A94]" />
                <span className="text-xs font-medium">Ngày mua</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{formatDate(pkg.purchaseDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <CalendarX className="w-3.5 h-3.5 text-[#007A94]" />
                <span className="text-xs font-medium">Hết hạn</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{formatDate(pkg.expirationDate)}</p>
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="px-5 pb-5 pt-0">
          <Button
            onClick={() => onViewDetail(pkg)}
            className="w-full bg-[#007A94] hover:bg-[#006080] text-white text-sm font-medium rounded-xl h-10 transition-all duration-200 group-hover:shadow-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Detail dialog
// ─────────────────────────────────────────────
function PackageDetailDialog({
  pkg,
  open,
  onClose,
}: {
  pkg: PurchasedPackage | null
  open: boolean
  onClose: () => void
}) {
  if (!pkg) return null

  const sk = getStatusKey(pkg)
  const cfg = STATUS_CONFIG[sk]
  const StatusIcon = cfg.icon
  const remaining = pkg.remainingDays || calcRemainingDays(pkg.expirationDate)
  const progress = progressPercent(pkg)
  const expiring = isExpiringSoon(pkg)

  // Timeline events
  const timeline = [
    {
      label: 'Mua gói',
      date: pkg.purchaseDate,
      icon: ShoppingCart,
      color: 'bg-[#007A94]',
      done: true,
    },
    {
      label: 'Gói được kích hoạt',
      date: pkg.purchaseDate,
      icon: BadgeCheck,
      color: 'bg-emerald-500',
      done: pkg.status === 'active' || pkg.status === 'expired',
    },
    {
      label: 'Hết hạn',
      date: pkg.expirationDate,
      icon: pkg.status === 'expired' ? CalendarX : Calendar,
      color: pkg.status === 'expired' ? 'bg-gray-400' : 'bg-orange-400',
      done: pkg.status === 'expired',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[min(94vw,580px)] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-[#007A94] to-[#005F75] p-6 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Chi tiết gói khám</DialogTitle>
          </DialogHeader>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${cfg.badge} mb-4`}
          >
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>

          <h2 className="text-xl font-bold text-white mb-1 leading-tight">
            {pkg.packageName || 'Gói khám'}
          </h2>

          {/* Doctor info */}
          <div className="flex items-center gap-3 mt-4">
            <Avatar className="w-10 h-10 ring-2 ring-white/30">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pkg.doctorName ?? 'doctor'}`} />
              <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                {pkg.doctorName?.charAt(0) ?? 'B'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm">{pkg.doctorName || 'Bác sĩ'}</p>
              <p className="text-white/70 text-xs">{pkg.doctorSpecialty || '—'}</p>
            </div>
          </div>

          {/* Progress bar (active only) */}
          {pkg.status === 'active' && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/80 mb-2">
                <span>Thời gian sử dụng</span>
                <span className="font-semibold text-white">{remaining}/{pkg.durationDays} ngày còn lại</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${expiring ? 'bg-orange-300' : 'bg-emerald-300'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-1.5">{progress}% thời gian còn lại</p>
            </div>
          )}

          {pkg.status === 'expired' && (
            <div className="mt-4 bg-white/10 rounded-xl p-3">
              <p className="text-white/80 text-xs">
                Gói đã hết hạn vào <span className="font-semibold text-white">{formatDate(pkg.expirationDate)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Warning if expiring */}
          {expiring && (
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Sắp hết hạn!</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Gói của bạn sẽ hết hạn trong <strong>{remaining} ngày</strong>. Hãy mua gia hạn để tiếp tục sử dụng.
                </p>
              </div>
            </div>
          )}

          {/* Key info grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#007A94]" />
              Thông tin gói
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ngày bắt đầu', value: formatDate(pkg.purchaseDate), icon: CalendarCheck },
                { label: 'Ngày kết thúc', value: formatDate(pkg.expirationDate), icon: CalendarX },
                { label: 'Thời hạn', value: `${pkg.durationDays} ngày`, icon: Timer },
                { label: 'Giá trị', value: formatCurrency(pkg.priceVnd), icon: DollarSign },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <item.icon className="w-3.5 h-3.5 text-[#007A94]" />
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining days highlight */}
          {pkg.status === 'active' && (
            <div className={`rounded-xl p-4 border ${expiring ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expiring ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                    <Clock className={`w-6 h-6 ${expiring ? 'text-orange-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${expiring ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {remaining}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">ngày còn lại</p>
                  </div>
                </div>
                <StatusIcon className={`w-10 h-10 ${cfg.iconColor} opacity-30`} />
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#007A94]" />
              Lịch sử gói
            </h3>
            <div className="relative">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4 mb-4 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${event.done ? event.color : 'bg-gray-100'}`}>
                      <event.icon className={`w-4 h-4 ${event.done ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 min-h-[1.5rem] ${event.done ? 'bg-[#007A94]/30' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-4">
                    <p className={`text-sm font-semibold ${event.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {event.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {pkg.status === 'active' && (
              <Button
                className="flex-1 bg-[#007A94] hover:bg-[#006080] text-white rounded-xl h-11 font-semibold"
                onClick={onClose}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Sử dụng gói
              </Button>
            )}
            {(pkg.status === 'expired' || expiring) && (
              <Link href="/patient-package" className="flex-1">
                <Button
                  variant={pkg.status === 'expired' ? 'default' : 'outline'}
                  className={`w-full rounded-xl h-11 font-semibold ${pkg.status === 'expired' ? 'bg-[#007A94] hover:bg-[#006080] text-white' : 'border-[#007A94] text-[#007A94] hover:bg-[#007A94]/5'}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {pkg.status === 'expired' ? 'Mua gói mới' : 'Gia hạn gói'}
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              className="rounded-xl h-11 px-6 border-gray-200"
              onClick={onClose}
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────
type FilterTab = 'all' | 'active' | 'expiring' | 'expired' | 'pending'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'expiring', label: 'Sắp hết hạn' },
  { key: 'expired', label: 'Đã hết hạn' },
  { key: 'pending', label: 'Chờ xử lý' },
]

// ─────────────────────────────────────────────
// Skeleton loading
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-1.5" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
      <div className="h-2 bg-gray-100 rounded mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-14 bg-gray-50 rounded-xl" />
        <div className="h-14 bg-gray-50 rounded-xl" />
      </div>
      <div className="h-10 bg-gray-100 rounded-xl" />
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
  const [selectedPkg, setSelectedPkg] = useState<PurchasedPackage | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleViewDetail = (pkg: PurchasedPackage) => {
    setSelectedPkg(pkg)
    setDetailOpen(true)
  }

  const filtered = useMemo(() => {
    if (!packages) return []
    switch (activeFilter) {
      case 'active':
        return packages.filter(p => p.status === 'active' && !isExpiringSoon(p))
      case 'expiring':
        return packages.filter(p => isExpiringSoon(p))
      case 'expired':
        return packages.filter(p => p.status === 'expired')
      case 'pending':
        return packages.filter(p => p.status === 'pending')
      default:
        return packages
    }
  }, [packages, activeFilter])

  const tabCounts: Record<FilterTab, number> = useMemo(() => ({
    all: packages?.length ?? 0,
    active: packages?.filter(p => p.status === 'active' && !isExpiringSoon(p)).length ?? 0,
    expiring: packages?.filter(p => isExpiringSoon(p)).length ?? 0,
    expired: packages?.filter(p => p.status === 'expired').length ?? 0,
    pending: packages?.filter(p => p.status === 'pending').length ?? 0,
  }), [packages])

  // Loading skeleton
  if (loading) {
    return (
      <div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-200" />
              <div>
                <div className="h-7 w-8 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // Empty state
  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#007A94]/10 to-[#007A94]/5 flex items-center justify-center mb-5">
          <Package className="w-10 h-10 text-[#007A94]/50" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có gói khám nào</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
          Bạn chưa mua gói khám nào. Hãy chọn bác sĩ và gói khám phù hợp để bắt đầu.
        </p>
        <Link href="/patient-package">
          <Button className="bg-[#007A94] hover:bg-[#006080] text-white rounded-xl h-11 px-6 font-semibold">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Mua gói khám ngay
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Summary stats */}
      <SummaryStats packages={packages} />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1 mb-6 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const count = tabCounts[tab.key]
          const isActive = activeFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#007A94] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Không có gói nào trong danh mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id || pkg.packageId}
              pkg={pkg}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <PackageDetailDialog
        pkg={selectedPkg}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
