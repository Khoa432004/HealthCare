import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Calendar, MessageSquare, Phone } from 'lucide-react'

interface PurchasedPackage {
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

interface PurchasedPackageCardProps {
  package: PurchasedPackage
  onUsePackage?: (packageId: string) => void
}

export function PurchasedPackageCard({ package: pkg, onUsePackage }: PurchasedPackageCardProps) {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }

  const statusLabel = {
    active: 'Active',
    expired: 'Expired',
    pending: 'Pending',
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="w-14 h-14">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pkg.doctorName}`}
              />
              <AvatarFallback className="bg-[#007A94] text-white">
                {pkg.doctorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{pkg.doctorName}</h3>
              <p className="text-sm text-gray-600">{pkg.doctorSpecialty}</p>
            </div>
          </div>
          <Badge className={statusColor[pkg.status]}>
            {statusLabel[pkg.status]}
          </Badge>
        </div>

        {/* Package Name */}
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{pkg.packageName}</h4>

        {/* Status Info */}
        {pkg.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 font-semibold mb-2">Package Active</p>
            <div className="space-y-1 text-sm text-green-700">
              <p>📅 Expires in <span className="font-semibold">{pkg.remainingDays} days</span></p>
              <p>💬 {pkg.messagesRemaining} messages remaining</p>
              <p>📞 {pkg.sessionsRemaining} sessions remaining</p>
            </div>
          </div>
        )}

        {pkg.status === 'expired' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">Package expired on {new Date(pkg.expirationDate).toLocaleDateString()}</p>
          </div>
        )}

        {/* Package Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#007A94]" />
              <span className="text-gray-600">Purchase</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(pkg.purchaseDate).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#007A94]" />
              <span className="text-gray-600">Expiration</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(pkg.expirationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {pkg.status === 'active' && (
          <Button
            onClick={() => onUsePackage?.(pkg.id)}
            className="w-full bg-[#007A94] hover:bg-[#005F75]"
          >
            Use This Package
          </Button>
        )}

        {pkg.status === 'expired' && (
          <Button variant="outline" className="w-full">
            Buy Another Package
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface PurchasedPackagesListProps {
  packages: PurchasedPackage[]
  loading?: boolean
  onUsePackage?: (packageId: string) => void
}

export function PurchasedPackagesList({ packages, loading, onUsePackage }: PurchasedPackagesListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading your packages...</p>
      </div>
    )
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-semibold mb-2">No packages yet</p>
        <p className="text-sm text-gray-500">Start by purchasing a package from your favorite doctor.</p>
      </div>
    )
  }

  // Separate by status
  const activePackages = packages.filter(p => p.status === 'active')
  const otherPackages = packages.filter(p => p.status !== 'active')

  return (
    <div className="space-y-6">
      {/* Active Packages */}
      {activePackages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePackages.map(pkg => (
              <PurchasedPackageCard
                key={pkg.id}
                package={pkg}
                onUsePackage={onUsePackage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Packages */}
      {otherPackages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPackages.map(pkg => (
              <PurchasedPackageCard
                key={pkg.id}
                package={pkg}
                onUsePackage={onUsePackage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ShoppingBag(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
