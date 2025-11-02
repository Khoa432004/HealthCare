'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { LoadingSpinner } from '@/components/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requireAuth?: boolean
}

/**
 * AuthGuard Component
 * Protects routes from unauthorized access on the client side
 * 
 * @param children - The content to render if authorized
 * @param allowedRoles - Array of roles that are allowed to access this route
 * @param requireAuth - Whether authentication is required (default: true)
 */
export function AuthGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // If auth is not required, allow access
      if (!requireAuth) {
        setIsAuthorized(true)
        setIsChecking(false)
        return
      }

      // Check if user is authenticated
      const isAuthenticated = authService.isAuthenticated()
      
      if (!isAuthenticated) {
        // Store the current path to redirect back after login
        const redirectUrl = `${pathname}`
        router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }

      // Check role-based access if roles are specified
      if (allowedRoles.length > 0) {
        const userRole = authService.getUserRole()
        
        if (!userRole || !allowedRoles.includes(userRole.toUpperCase())) {
          // User doesn't have the required role
          const dashboardRoute = authService.getDashboardRoute(userRole || 'PATIENT')
          router.replace(dashboardRoute)
          return
        }
      }

      // User is authorized
      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router, allowedRoles, requireAuth])

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // Render children if authorized
  return isAuthorized ? <>{children}</> : null
}

/**
 * Hook to use authentication guard in components
 */
export function useAuthGuard(allowedRoles?: string[]) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated()
    
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = authService.getUserRole()
      
      if (!userRole || !allowedRoles.includes(userRole.toUpperCase())) {
        const dashboardRoute = authService.getDashboardRoute(userRole || 'PATIENT')
        router.replace(dashboardRoute)
      }
    }
  }, [pathname, router, allowedRoles])
}

