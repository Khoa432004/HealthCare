import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/signup/patient',
  '/signup/doctor',
  '/signup/clinic-admin',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
]

// Define role-based routes
const roleBasedRoutes = {
  ADMIN: ['/admin-dashboard', '/settings'],
  CLINIC_ADMIN: ['/admin-dashboard', '/settings'],
  DOCTOR: ['/doctor-dashboard', '/calendar', '/my-profile', '/settings'],
  PATIENT: [
    '/patient-dashboard',
    '/patient-calendar',
    '/patient-profile',
    '/my-profile',
    '/settings',
    '/patient-emr',
    '/patient-medical-examination-history'
  ],
}

// Helper function to check if a path matches a route pattern
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (path === route) return true
    // Prefix match for nested routes (e.g., /patient-calendar/booking matches /patient-calendar)
    if (path.startsWith(route + '/')) return true
    return false
  })
}

// Helper function to get all allowed routes for a role
function getAllowedRoutesForRole(role: string): string[] {
  const upperRole = role.toUpperCase()
  return roleBasedRoutes[upperRole as keyof typeof roleBasedRoutes] || []
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  const isPublicRoute = matchesRoute(pathname, publicRoutes)

  // Get token from cookies or headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Get user role from cookies
  const userRole = request.cookies.get('user_role')?.value

  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is already logged in and tries to access login/signup, redirect to dashboard
    if (token && userRole && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
      const dashboardRoute = getDashboardRouteForRole(userRole)
      return NextResponse.redirect(new URL(dashboardRoute, request.url))
    }
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (!token) {
    // User is not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  if (userRole) {
    const allowedRoutes = getAllowedRoutesForRole(userRole)
    const hasAccess = matchesRoute(pathname, allowedRoutes)

    if (!hasAccess) {
      // User doesn't have permission to access this route
      // Redirect to their appropriate dashboard
      const dashboardRoute = getDashboardRouteForRole(userRole)
      return NextResponse.redirect(new URL(dashboardRoute, request.url))
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Helper function to get dashboard route based on role
function getDashboardRouteForRole(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: '/admin-dashboard',
    CLINIC_ADMIN: '/admin-dashboard',
    DOCTOR: '/doctor-dashboard',
    PATIENT: '/patient-dashboard',
  }

  return roleMap[role.toUpperCase()] || '/patient-dashboard'
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

